/**
 * Deterministic token naming when the Claude API is unavailable.
 * Uses frequency, luminance, hue, and font-size hierarchy.
 */

import type { RawExtraction, RawColor, RawTypography, RawSpacing, RawRadius } from "@/lib/services/css-parser";
import type { ExtractionResult, ColorToken, TypographyToken, SpacingToken, RadiusToken } from "@/lib/types/extraction";
import type { ConsistencyReport, ConsistencyMetric } from "@/lib/types/consistency";
import { hexToRgb, rgbToHsl, luminance } from "@/lib/utils/color-utils";
import { toPixels } from "@/lib/services/css-parser";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function nameTokensHeuristic(
  raw: RawExtraction,
  url: string,
): ExtractionResult {
  return {
    url,
    timestamp: new Date().toISOString(),
    colors: nameColors(raw.colors),
    typography: nameTypography(raw.typography),
    spacing: nameSpacing(raw.spacing),
    radius: nameRadius(raw.radius),
  };
}

export function scoreConsistencyHeuristic(
  result: ExtractionResult,
): ConsistencyReport {
  const metrics: ConsistencyMetric[] = [
    scoreColors(result),
    scoreTypography(result),
    scoreSpacing(result),
    scoreRadius(result),
  ];

  const overallScore = Math.round(
    metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length,
  );

  return {
    overallScore,
    grade: gradeFromScore(overallScore),
    metrics,
    topIssues: metrics.flatMap((m) => m.issues).slice(0, 5),
    recommendations: metrics.map((m) => m.recommendation).filter(Boolean),
  };
}

// ---------------------------------------------------------------------------
// Color naming
// ---------------------------------------------------------------------------

function nameColors(rawColors: RawColor[]): ColorToken[] {
  if (rawColors.length === 0) return [];

  const named: ColorToken[] = [];
  const usedNames = new Set<string>();

  // Separate into chromatic vs neutral
  const chromatic: RawColor[] = [];
  const neutrals: RawColor[] = [];

  for (const c of rawColors) {
    const { r, g, b } = hexToRgb(c.hex);
    const { s } = rgbToHsl(r, g, b);
    if (s <= 10) {
      neutrals.push(c);
    } else {
      chromatic.push(c);
    }
  }

  // Sort chromatic by count desc
  chromatic.sort((a, b) => b.count - a.count);

  // Name chromatic colors
  const chromaticNames = ["primary", "secondary", "accent"];
  const semanticHues: { hueMin: number; hueMax: number; name: string }[] = [
    { hueMin: 0, hueMax: 15, name: "error" },
    { hueMin: 345, hueMax: 360, name: "error" },
    { hueMin: 100, hueMax: 160, name: "success" },
    { hueMin: 30, hueMax: 50, name: "warning" },
    { hueMin: 200, hueMax: 250, name: "info" },
  ];

  for (let i = 0; i < chromatic.length; i++) {
    const c = chromatic[i];
    const { r, g, b } = hexToRgb(c.hex);
    const { h } = rgbToHsl(r, g, b);
    let name: string;

    if (i < chromaticNames.length) {
      name = chromaticNames[i];
    } else {
      // Try semantic name by hue
      const semantic = semanticHues.find(
        (s) => h >= s.hueMin && h <= s.hueMax && !usedNames.has(s.name),
      );
      name = semantic?.name ?? `chromatic-${i + 1}`;
    }

    if (usedNames.has(name)) name = `${name}-${i + 1}`;
    usedNames.add(name);

    named.push({
      name,
      hex: c.hex,
      rgb: { r, g, b },
      usage: describeUsage(c.properties),
      count: c.count,
    });
  }

  // Name neutrals by lightness
  neutrals.sort((a, b) => {
    const la = luminance(...Object.values(hexToRgb(a.hex)) as [number, number, number]);
    const lb = luminance(...Object.values(hexToRgb(b.hex)) as [number, number, number]);
    return lb - la;
  });

  const neutralNames = ["white", "neutral-100", "neutral-200", "neutral-300", "neutral-400", "neutral-500", "neutral-600", "neutral-700", "neutral-800", "neutral-900", "black"];

  for (let i = 0; i < neutrals.length; i++) {
    const c = neutrals[i];
    const { r, g, b } = hexToRgb(c.hex);
    const lum = luminance(r, g, b);

    let name: string;
    if (lum > 0.95) {
      name = "white";
    } else if (lum < 0.01) {
      name = "black";
    } else {
      // Map luminance to neutral scale
      const idx = Math.min(Math.floor((1 - lum) * 9) + 1, 9);
      name = `neutral-${idx}00`;
    }

    if (usedNames.has(name)) name = `${name}-alt`;
    if (usedNames.has(name)) name = `neutral-${i + 1}`;
    usedNames.add(name);

    named.push({
      name,
      hex: c.hex,
      rgb: { r, g, b },
      usage: describeUsage(c.properties),
      count: c.count,
    });
  }

  return named;
}

function describeUsage(properties: string[]): string {
  const descriptions: string[] = [];
  if (properties.some((p) => p === "color")) descriptions.push("Text color");
  if (properties.some((p) => p.startsWith("background"))) descriptions.push("Background");
  if (properties.some((p) => p.startsWith("border"))) descriptions.push("Border");
  if (properties.some((p) => p.includes("shadow"))) descriptions.push("Shadow");
  if (properties.some((p) => p === "fill" || p === "stroke")) descriptions.push("SVG");
  return descriptions.join(", ") || "General";
}

// ---------------------------------------------------------------------------
// Typography naming
// ---------------------------------------------------------------------------

function nameTypography(rawTypo: RawTypography[]): TypographyToken[] {
  if (rawTypo.length === 0) return [];

  // Sort by pixel size descending
  const sorted = [...rawTypo].sort(
    (a, b) => toPixels(b.fontSize) - toPixels(a.fontSize),
  );

  const names = [
    "heading-1", "heading-2", "heading-3", "heading-4",
    "body", "body-small", "caption", "code",
  ];

  return sorted.slice(0, 8).map((t, i) => ({
    name: names[i] ?? `text-${i + 1}`,
    fontFamily: t.fontFamily,
    fontSize: t.fontSize,
    fontWeight: t.fontWeight,
    lineHeight: t.lineHeight,
    letterSpacing: t.letterSpacing,
    usage: i < 4 ? "Heading text" : i < 6 ? "Body text" : "Small text",
  }));
}

// ---------------------------------------------------------------------------
// Spacing naming
// ---------------------------------------------------------------------------

const SCALE_NAMES = ["xs", "sm", "md", "base", "lg", "xl", "2xl", "3xl", "4xl"];

function nameSpacing(rawSpacing: RawSpacing[]): SpacingToken[] {
  if (rawSpacing.length === 0) return [];

  // Deduplicate by pixels, take up to 9
  const unique = deduplicateByPixels(rawSpacing);
  const top = unique.slice(0, SCALE_NAMES.length);

  return top.map((s, i) => ({
    name: SCALE_NAMES[i] ?? `space-${i + 1}`,
    value: s.value,
    pixels: s.pixels,
    usage: i < 2 ? "Tight spacing" : i < 5 ? "Standard spacing" : "Large spacing",
  }));
}

// ---------------------------------------------------------------------------
// Radius naming
// ---------------------------------------------------------------------------

function nameRadius(rawRadius: RawRadius[]): RadiusToken[] {
  if (rawRadius.length === 0) return [];

  const unique = deduplicateByPixels(rawRadius);
  const radiusNames = ["sm", "base", "md", "lg", "xl", "full"];
  const top = unique.slice(0, radiusNames.length);

  return top.map((r, i) => ({
    name: r.pixels >= 9000 ? "full" : radiusNames[i] ?? `radius-${i + 1}`,
    value: r.value,
    pixels: r.pixels,
    usage: r.pixels >= 9000 ? "Pill shapes, circles" : i < 2 ? "Subtle rounding" : "Cards, containers",
  }));
}

// ---------------------------------------------------------------------------
// Consistency scoring
// ---------------------------------------------------------------------------

function scoreColors(result: ExtractionResult): ConsistencyMetric {
  const total = result.colors.reduce((s, c) => s + c.count, 0);
  const unique = result.colors.length;
  const issues: string[] = [];

  if (unique > 15) issues.push(`${unique} unique colors detected — consider consolidating`);
  const singleUse = result.colors.filter((c) => c.count === 1).length;
  if (singleUse > 2) issues.push(`${singleUse} colors used only once — likely one-offs`);

  // Check for near-duplicates
  const nearDupes = countNearDuplicateColors(result.colors);
  if (nearDupes > 0) issues.push(`${nearDupes} near-duplicate color pairs detected`);

  const score = Math.max(0, Math.min(100, 100 - unique * 2 - singleUse * 3 - nearDupes * 5));

  return {
    category: "Colors",
    score,
    total,
    unique,
    issues,
    recommendation: unique > 12
      ? "Consolidate to 10-12 intentional colors with semantic naming."
      : "Color palette is reasonably sized.",
  };
}

function scoreTypography(result: ExtractionResult): ConsistencyMetric {
  const unique = result.typography.length;
  const issues: string[] = [];

  if (unique > 8) issues.push(`${unique} font sizes — consider a stricter type scale`);

  const score = Math.max(0, Math.min(100, 100 - Math.max(0, unique - 6) * 8));

  return {
    category: "Typography",
    score,
    total: unique,
    unique,
    issues,
    recommendation: unique > 8
      ? "Adopt a strict modular type scale (e.g., 12, 14, 16, 20, 24, 30, 36px)."
      : "Typography scale is well-contained.",
  };
}

function scoreSpacing(result: ExtractionResult): ConsistencyMetric {
  const unique = result.spacing.length;
  const issues: string[] = [];

  // Check 4px grid adherence
  const offGrid = result.spacing.filter((s) => s.pixels % 4 !== 0).length;
  if (offGrid > 0) issues.push(`${offGrid} spacing values fall outside a 4px grid`);

  const score = Math.max(0, Math.min(100, 100 - offGrid * 8 - Math.max(0, unique - 8) * 5));

  return {
    category: "Spacing",
    score,
    total: unique,
    unique,
    issues,
    recommendation: offGrid > 0
      ? "Align all spacing to a 4px (0.25rem) base grid."
      : "Spacing follows a consistent grid.",
  };
}

function scoreRadius(result: ExtractionResult): ConsistencyMetric {
  const unique = result.radius.length;
  const issues: string[] = [];

  if (unique > 5) issues.push(`${unique} border-radius values — simplify to 3-4 tokens`);

  const score = Math.max(0, Math.min(100, 100 - Math.max(0, unique - 4) * 10));

  return {
    category: "Border Radius",
    score,
    total: unique,
    unique,
    issues,
    recommendation: unique > 4
      ? "Define 3-4 radius tokens (sm, md, lg, full) and use them consistently."
      : "Border radius tokens are well-contained.",
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countNearDuplicateColors(colors: ColorToken[]): number {
  let count = 0;
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const a = hexToRgb(colors[i].hex);
      const b = hexToRgb(colors[j].hex);
      const dist = Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
      if (dist < 20 && dist > 0) count++;
    }
  }
  return count;
}

function deduplicateByPixels<T extends { pixels: number; count: number }>(
  items: T[],
): T[] {
  const seen = new Map<number, T>();
  for (const item of items) {
    const rounded = Math.round(item.pixels);
    const existing = seen.get(rounded);
    if (!existing || item.count > existing.count) {
      seen.set(rounded, item);
    }
  }
  return [...seen.values()].sort((a, b) => a.pixels - b.pixels);
}

function gradeFromScore(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B+";
  if (score >= 70) return "B";
  if (score >= 60) return "C+";
  if (score >= 50) return "C";
  if (score >= 40) return "D";
  return "F";
}

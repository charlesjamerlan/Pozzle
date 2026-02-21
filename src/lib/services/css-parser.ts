/**
 * Pure-function CSS token parser.
 * Extracts raw (unnamed) tokens from CSS text via regex.
 */

import { parseColorString } from "@/lib/utils/color-utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RawColor {
  hex: string; // normalised to 6-digit hex
  count: number;
  properties: string[]; // which CSS properties it appeared in
}

export interface RawTypography {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing: string;
  count: number;
}

export interface RawSpacing {
  value: string; // original value, e.g. "1rem"
  pixels: number;
  count: number;
}

export interface RawRadius {
  value: string;
  pixels: number;
  count: number;
}

export interface RawExtraction {
  colors: RawColor[];
  typography: RawTypography[];
  spacing: RawSpacing[];
  radius: RawRadius[];
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

export function parseCss(cssText: string): RawExtraction {
  return {
    colors: extractColors(cssText),
    typography: extractTypography(cssText),
    spacing: extractSpacing(cssText),
    radius: extractRadius(cssText),
  };
}

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const COLOR_PROPERTIES = [
  "color",
  "background-color",
  "background",
  "border-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "border",
  "outline-color",
  "box-shadow",
  "text-shadow",
  "fill",
  "stroke",
  "text-decoration-color",
  "accent-color",
  "caret-color",
];

function extractColors(css: string): RawColor[] {
  const map = new Map<string, { count: number; properties: Set<string> }>();

  for (const prop of COLOR_PROPERTIES) {
    // Match "property: value;" patterns
    const propRegex = new RegExp(
      `${escapeRegex(prop)}\\s*:\\s*([^;}{]+)`,
      "gi",
    );
    let m: RegExpExecArray | null;
    while ((m = propRegex.exec(css)) !== null) {
      const valuePart = m[1].trim();
      const foundColors = extractColorValues(valuePart);
      for (const hex of foundColors) {
        const existing = map.get(hex);
        if (existing) {
          existing.count++;
          existing.properties.add(prop);
        } else {
          map.set(hex, { count: 1, properties: new Set([prop]) });
        }
      }
    }
  }

  return Array.from(map.entries())
    .map(([hex, { count, properties }]) => ({
      hex,
      count,
      properties: Array.from(properties),
    }))
    .sort((a, b) => b.count - a.count);
}

/** Pull all color-like values from a CSS value string */
function extractColorValues(value: string): string[] {
  const results: string[] = [];

  // hex colors: #RGB, #RRGGBB, #RRGGBBAA
  const hexRegex = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
  let m: RegExpExecArray | null;
  while ((m = hexRegex.exec(value)) !== null) {
    const parsed = parseColorString(m[0]);
    if (parsed) results.push(parsed);
  }

  // rgb/rgba
  const rgbRegex = /rgba?\s*\(\s*[\d.]+%?\s*[,\s]\s*[\d.]+%?\s*[,\s]\s*[\d.]+%?\s*(?:[,/]\s*[\d.]+%?\s*)?\)/gi;
  while ((m = rgbRegex.exec(value)) !== null) {
    const parsed = parseColorString(m[0]);
    if (parsed) results.push(parsed);
  }

  // hsl/hsla
  const hslRegex = /hsla?\s*\(\s*[\d.]+(?:deg)?\s*[,\s]\s*[\d.]+%\s*[,\s]\s*[\d.]+%\s*(?:[,/]\s*[\d.]+%?\s*)?\)/gi;
  while ((m = hslRegex.exec(value)) !== null) {
    const parsed = parseColorString(m[0]);
    if (parsed) results.push(parsed);
  }

  // Named CSS colors (common ones)
  const namedColors: Record<string, string> = {
    black: "#000000", white: "#FFFFFF", red: "#FF0000", green: "#008000",
    blue: "#0000FF", yellow: "#FFFF00", orange: "#FFA500", purple: "#800080",
    pink: "#FFC0CB", gray: "#808080", grey: "#808080", transparent: "",
    inherit: "", currentcolor: "", initial: "", unset: "",
  };
  const lower = value.toLowerCase().trim();
  if (namedColors[lower] !== undefined && namedColors[lower] !== "") {
    results.push(namedColors[lower]);
  }

  return results;
}

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

function extractTypography(css: string): RawTypography[] {
  // ---- Step 1: Parse per-rule-block typography combos ----
  // Split CSS into declaration blocks and extract co-occurring font properties.
  const blockRegex = /\{([^}]+)\}/g;
  let blockMatch: RegExpExecArray | null;

  interface FontCombo {
    family: string | null;
    size: string | null;
    weight: number | null;
    lineHeight: string | null;
    letterSpacing: string | null;
  }

  const combos: FontCombo[] = [];

  while ((blockMatch = blockRegex.exec(css)) !== null) {
    const block = blockMatch[1];
    const combo: FontCombo = {
      family: null,
      size: null,
      weight: null,
      lineHeight: null,
      letterSpacing: null,
    };

    // Extract individual properties from this block
    const familyMatch = block.match(/font-family\s*:\s*([^;]+)/i);
    if (familyMatch) {
      combo.family = familyMatch[1].split(",")[0].replace(/["']/g, "").trim();
    }

    const sizeMatch = block.match(/font-size\s*:\s*([^;]+)/i);
    if (sizeMatch) {
      const v = sizeMatch[1].trim();
      if (!v.startsWith("var(")) combo.size = v;
    }

    const weightMatch = block.match(/font-weight\s*:\s*([^;]+)/i);
    if (weightMatch) {
      combo.weight = parseFontWeight(weightMatch[1].trim());
    }

    const lhMatch = block.match(/line-height\s*:\s*([^;]+)/i);
    if (lhMatch) {
      const v = lhMatch[1].trim();
      if (v !== "normal") combo.lineHeight = v;
    }

    const lsMatch = block.match(/letter-spacing\s*:\s*([^;]+)/i);
    if (lsMatch) {
      const v = lsMatch[1].trim();
      if (v !== "normal") combo.letterSpacing = v;
    }

    // Parse font shorthand (e.g. "font: 700 16px/24px UberMoveText")
    const fontShort = block.match(/(?:^|;)\s*font\s*:\s*([^;]+)/i);
    if (fontShort) {
      const val = fontShort[1].trim();
      // Extract weight
      const wMatch = val.match(/\b(\d{3})\b/);
      if (wMatch) {
        const w = parseInt(wMatch[1], 10);
        if (w >= 100 && w <= 900 && !combo.weight) combo.weight = w;
      }
      if (/\bbold\b/i.test(val) && !combo.weight) combo.weight = 700;
      // Extract size/line-height
      const slMatch = val.match(/([\d.]+(?:px|rem|em))\s*(?:\/([\d.]+(?:px|rem|em|%)?))?\s/);
      if (slMatch) {
        if (!combo.size) combo.size = slMatch[1];
        if (slMatch[2] && !combo.lineHeight) combo.lineHeight = slMatch[2];
      }
      // Extract family (last comma-separated segment)
      const familyPart = val.match(/(?:[\d.]+(?:px|rem|em)(?:\s*\/\s*[\d.]+(?:px|rem|em|%)?)?)\s+(.+)$/);
      if (familyPart && !combo.family) {
        combo.family = familyPart[1].split(",")[0].replace(/["']/g, "").trim();
      }
    }

    if (combo.size) combos.push(combo);
  }

  // ---- Step 2: Build global defaults from frequency ----
  const globalFamilies = new Map<string, number>();
  const globalWeights = new Map<number, number>();
  const globalLineHeights = new Map<string, number>();
  const globalLetterSpacings = new Map<string, number>();

  for (const c of combos) {
    if (c.family) inc(globalFamilies, c.family);
    if (c.weight) inc(globalWeights, c.weight);
    if (c.lineHeight) inc(globalLineHeights, c.lineHeight);
    if (c.letterSpacing) inc(globalLetterSpacings, c.letterSpacing);
  }

  const defaultFamily = topKey(globalFamilies) ?? "sans-serif";
  const defaultWeight = topKey(globalWeights) ?? 400;
  const defaultLineHeight = topKey(globalLineHeights) ?? "1.5";
  const defaultLetterSpacing = topKey(globalLetterSpacings) ?? "0";

  // ---- Step 3: Group by font-size, pick best properties per size ----
  const sizeGroups = new Map<string, FontCombo[]>();
  for (const c of combos) {
    if (!c.size) continue;
    const key = c.size;
    if (!sizeGroups.has(key)) sizeGroups.set(key, []);
    sizeGroups.get(key)!.push(c);
  }

  const results: RawTypography[] = [];

  for (const [size, group] of sizeGroups) {
    // For each property, pick the most common value within this size's group
    const fams = new Map<string, number>();
    const wts = new Map<number, number>();
    const lhs = new Map<string, number>();
    const lss = new Map<string, number>();

    for (const c of group) {
      if (c.family) inc(fams, c.family);
      if (c.weight) inc(wts, c.weight);
      if (c.lineHeight) inc(lhs, c.lineHeight);
      if (c.letterSpacing) inc(lss, c.letterSpacing);
    }

    results.push({
      fontFamily: topKey(fams) ?? defaultFamily,
      fontSize: size,
      fontWeight: topKey(wts) ?? defaultWeight,
      lineHeight: topKey(lhs) ?? defaultLineHeight,
      letterSpacing: topKey(lss) ?? defaultLetterSpacing,
      count: group.length,
    });
  }

  // Sort by pixel size descending
  results.sort((a, b) => toPixels(b.fontSize) - toPixels(a.fontSize));
  return results;
}

/** Return the key with the highest count in a Map */
function topKey<K>(map: Map<K, number>): K | null {
  let best: K | null = null;
  let bestCount = 0;
  for (const [key, count] of map) {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }
  return best;
}

function parseFontWeight(v: string): number | null {
  const n = parseInt(v, 10);
  if (!isNaN(n) && n >= 100 && n <= 900) return n;
  const map: Record<string, number> = {
    normal: 400, bold: 700, lighter: 300, bolder: 700,
  };
  return map[v.toLowerCase()] ?? null;
}

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

const SPACING_PROPERTIES = [
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "gap", "row-gap", "column-gap",
];

function extractSpacing(css: string): RawSpacing[] {
  const map = new Map<string, number>();

  for (const prop of SPACING_PROPERTIES) {
    matchProp(css, prop, (v) => {
      // Shorthands have multiple values — split them
      const parts = v.trim().split(/\s+/);
      for (const part of parts) {
        const px = toPixels(part);
        if (px > 0 && px <= 256 && !part.startsWith("var(")) {
          inc(map, part);
        }
      }
    });
  }

  return [...map.entries()]
    .map(([value, count]) => ({ value, pixels: toPixels(value), count }))
    .sort((a, b) => a.pixels - b.pixels);
}

// ---------------------------------------------------------------------------
// Border Radius
// ---------------------------------------------------------------------------

function extractRadius(css: string): RawRadius[] {
  const map = new Map<string, number>();

  matchProp(css, "border-radius", (v) => {
    // Split shorthand — may have / for elliptical, take first part
    const mainPart = v.split("/")[0].trim();
    const parts = mainPart.split(/\s+/);
    for (const part of parts) {
      const px = toPixels(part);
      if (px >= 0 && !part.startsWith("var(")) {
        inc(map, part);
      }
    }
  });

  for (const corner of ["border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius"]) {
    matchProp(css, corner, (v) => {
      const px = toPixels(v.trim());
      if (px >= 0 && !v.trim().startsWith("var(")) inc(map, v.trim());
    });
  }

  return [...map.entries()]
    .map(([value, count]) => ({ value, pixels: toPixels(value), count }))
    .sort((a, b) => a.pixels - b.pixels);
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function matchProp(css: string, property: string, cb: (value: string) => void) {
  const regex = new RegExp(`${escapeRegex(property)}\\s*:\\s*([^;}{]+)`, "gi");
  let m: RegExpExecArray | null;
  while ((m = regex.exec(css)) !== null) {
    cb(m[1]);
  }
}

function inc<K>(map: Map<K, number>, key: K) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Convert a CSS length value to pixels (approximate). */
export function toPixels(value: string): number {
  const n = parseFloat(value);
  if (isNaN(n)) return 0;
  if (value.endsWith("px")) return n;
  if (value.endsWith("rem")) return n * 16;
  if (value.endsWith("em")) return n * 16;
  if (value.endsWith("pt")) return n * (4 / 3);
  if (value.endsWith("%")) return 0; // can't convert without context
  // unitless — assume px
  return n;
}

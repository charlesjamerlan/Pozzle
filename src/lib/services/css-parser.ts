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
  const families = new Map<string, number>();
  const sizes = new Map<string, number>();
  const weights = new Map<number, number>();
  const lineHeights = new Map<string, number>();
  const letterSpacings = new Map<string, number>();

  matchProp(css, "font-family", (v) => {
    const clean = v.split(",")[0].replace(/["']/g, "").trim();
    if (clean) inc(families, clean);
  });

  matchProp(css, "font-size", (v) => {
    const clean = v.trim();
    if (clean && !clean.startsWith("var(")) inc(sizes, clean);
  });

  matchProp(css, "font-weight", (v) => {
    const n = parseFontWeight(v.trim());
    if (n) inc(weights, n);
  });

  matchProp(css, "line-height", (v) => {
    const clean = v.trim();
    if (clean && clean !== "normal") inc(lineHeights, clean);
  });

  matchProp(css, "letter-spacing", (v) => {
    const clean = v.trim();
    if (clean && clean !== "normal") inc(letterSpacings, clean);
  });

  // Parse `font` shorthand
  const fontShorthand = /font\s*:\s*([^;}{]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = fontShorthand.exec(css)) !== null) {
    const parts = m[1].trim().split(/\s+/);
    for (const p of parts) {
      if (/^\d+$/.test(p)) {
        const w = parseInt(p, 10);
        if (w >= 100 && w <= 900) inc(weights, w);
      } else if (/^\d/.test(p) && /(?:px|rem|em|%)/.test(p)) {
        const sizeLine = p.split("/");
        inc(sizes, sizeLine[0]);
        if (sizeLine[1]) inc(lineHeights, sizeLine[1]);
      }
    }
  }

  // Combine into unique font styles grouped by size
  const primaryFamily = [...families.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "sans-serif";
  const sortedSizes = [...sizes.entries()].sort((a, b) => toPixels(b[0]) - toPixels(a[0]));
  const defaultWeight = [...weights.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 400;
  const defaultLineHeight = [...lineHeights.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "1.5";
  const defaultLetterSpacing = [...letterSpacings.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "0";

  return sortedSizes.map(([fontSize, count]) => ({
    fontFamily: primaryFamily,
    fontSize,
    fontWeight: defaultWeight,
    lineHeight: defaultLineHeight,
    letterSpacing: defaultLetterSpacing,
    count,
  }));
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

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    case b: h = ((r - g) / d + 4) / 6; break;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = luminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = luminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function shouldUseWhiteText(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  return luminance(r, g, b) < 0.179;
}

// ---------------------------------------------------------------------------
// New in Phase 2 — color format conversions for CSS parser
// ---------------------------------------------------------------------------

/** Convert r,g,b (0-255) to 6-digit hex string with leading #. */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

/** Convert HSL (h: 0-360, s: 0-100, l: 0-100) to {r, g, b} (0-255). */
export function hslToRgb(
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}

/**
 * Parse any CSS color string to a normalised 6-digit uppercase hex (#RRGGBB).
 * Returns null for values it cannot parse (e.g. var(), inherit, transparent).
 */
export function parseColorString(raw: string): string | null {
  const s = raw.trim().toLowerCase();

  // #RGB → #RRGGBB
  if (/^#[0-9a-f]{3}$/i.test(s)) {
    const [, r, g, b] = s.match(/^#(.)(.)(.)$/)!;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  // #RGBA → #RRGGBB (drop alpha)
  if (/^#[0-9a-f]{4}$/i.test(s)) {
    const [, r, g, b] = s.match(/^#(.)(.)(.).$/)!;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  // #RRGGBB
  if (/^#[0-9a-f]{6}$/i.test(s)) {
    return s.toUpperCase();
  }

  // #RRGGBBAA → #RRGGBB (drop alpha)
  if (/^#[0-9a-f]{8}$/i.test(s)) {
    return s.slice(0, 7).toUpperCase();
  }

  // rgb(r, g, b) / rgba(r, g, b, a)
  const rgbMatch = s.match(
    /rgba?\s*\(\s*([\d.]+)%?\s*[,\s]\s*([\d.]+)%?\s*[,\s]\s*([\d.]+)%?\s*(?:[,/]\s*[\d.]+%?\s*)?\)/,
  );
  if (rgbMatch) {
    return rgbToHex(
      parseFloat(rgbMatch[1]),
      parseFloat(rgbMatch[2]),
      parseFloat(rgbMatch[3]),
    );
  }

  // hsl(h, s%, l%) / hsla(h, s%, l%, a)
  const hslMatch = s.match(
    /hsla?\s*\(\s*([\d.]+)(?:deg)?\s*[,\s]\s*([\d.]+)%\s*[,\s]\s*([\d.]+)%\s*(?:[,/]\s*[\d.]+%?\s*)?\)/,
  );
  if (hslMatch) {
    const { r, g, b } = hslToRgb(
      parseFloat(hslMatch[1]),
      parseFloat(hslMatch[2]),
      parseFloat(hslMatch[3]),
    );
    return rgbToHex(r, g, b);
  }

  return null;
}

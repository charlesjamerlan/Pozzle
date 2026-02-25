import type { ExtractionResult } from "@/lib/types/extraction";

interface DTCGToken {
  $type: string;
  $value: string | number | Record<string, string | number>;
  $description: string;
}

interface DTCGGroup {
  [key: string]: DTCGToken | DTCGGroup;
}

export function generateDTCGTokens(result: ExtractionResult): string {
  const tokens: DTCGGroup = {};

  // Colors
  const color: DTCGGroup = {};
  result.colors.forEach((c) => {
    color[c.name] = {
      $type: "color",
      $value: c.hex,
      $description: c.usage,
    };
  });
  tokens.color = color;

  // Typography
  const typography: DTCGGroup = {};
  result.typography.forEach((t) => {
    typography[t.name] = {
      $type: "typography",
      $value: {
        fontFamily: t.fontFamily,
        fontSize: t.fontSize,
        fontWeight: t.fontWeight,
        lineHeight: t.lineHeight,
        letterSpacing: t.letterSpacing,
      },
      $description: t.usage,
    };
  });
  tokens.typography = typography;

  // Spacing
  const spacing: DTCGGroup = {};
  result.spacing.forEach((s) => {
    spacing[s.name] = {
      $type: "dimension",
      $value: s.value,
      $description: s.usage,
    };
  });
  tokens.spacing = spacing;

  // Border Radius
  const borderRadius: DTCGGroup = {};
  result.radius.forEach((r) => {
    borderRadius[r.name] = {
      $type: "dimension",
      $value: r.value,
      $description: r.usage,
    };
  });
  tokens.borderRadius = borderRadius;

  return JSON.stringify(tokens, null, 2);
}

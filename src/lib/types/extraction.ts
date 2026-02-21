export interface ColorToken {
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  usage: string;
  count: number;
}

export interface TypographyToken {
  name: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing: string;
  usage: string;
}

export interface SpacingToken {
  name: string;
  value: string;
  pixels: number;
  usage: string;
}

export interface RadiusToken {
  name: string;
  value: string;
  pixels: number;
  usage: string;
}

export interface ExtractionResult {
  url: string;
  timestamp: string;
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  radius: RadiusToken[];
}

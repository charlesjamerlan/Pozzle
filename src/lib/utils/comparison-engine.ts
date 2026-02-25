/**
 * Comparison engine — pure utility for diffing two ExtractionResults.
 * No React. All diff logic lives here.
 */

import type {
  ExtractionResult,
  ColorToken,
  TypographyToken,
  SpacingToken,
  RadiusToken,
} from "@/lib/types/extraction";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DiffStatus = "added" | "removed" | "changed" | "unchanged";

export interface DiffEntry<T> {
  status: DiffStatus;
  name: string;
  a: T | null;
  b: T | null;
}

export interface TokenDiff {
  colors: DiffEntry<ColorToken>[];
  typography: DiffEntry<TypographyToken>[];
  spacing: DiffEntry<SpacingToken>[];
  radius: DiffEntry<RadiusToken>[];
}

export interface DriftScore {
  overall: number;
  byCategory: {
    colors: number;
    typography: number;
    spacing: number;
    radius: number;
  };
  counts: {
    added: number;
    removed: number;
    changed: number;
    unchanged: number;
    totalA: number;
    totalB: number;
  };
}

export interface ComparisonResult {
  diff: TokenDiff;
  drift: DriftScore;
}

// ---------------------------------------------------------------------------
// Sort priority: removed → changed → added → unchanged
// ---------------------------------------------------------------------------

const STATUS_ORDER: Record<DiffStatus, number> = {
  removed: 0,
  changed: 1,
  added: 2,
  unchanged: 3,
};

function sortEntries<T>(entries: DiffEntry<T>[]): DiffEntry<T>[] {
  return entries.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
}

// ---------------------------------------------------------------------------
// Generic matching helpers
// ---------------------------------------------------------------------------

function matchByName<T extends { name: string }>(
  aList: T[],
  bList: T[],
  isChanged: (a: T, b: T) => boolean,
): DiffEntry<T>[] {
  const entries: DiffEntry<T>[] = [];
  const aMap = new Map<string, T>();
  const bMap = new Map<string, T>();

  for (const item of aList) aMap.set(item.name.toLowerCase(), item);
  for (const item of bList) bMap.set(item.name.toLowerCase(), item);

  // Check items from A
  for (const [key, aItem] of aMap) {
    const bItem = bMap.get(key);
    if (!bItem) {
      entries.push({ status: "removed", name: aItem.name, a: aItem, b: null });
    } else if (isChanged(aItem, bItem)) {
      entries.push({ status: "changed", name: aItem.name, a: aItem, b: bItem });
    } else {
      entries.push({ status: "unchanged", name: aItem.name, a: aItem, b: bItem });
    }
  }

  // Items only in B (added)
  for (const [key, bItem] of bMap) {
    if (!aMap.has(key)) {
      entries.push({ status: "added", name: bItem.name, a: null, b: bItem });
    }
  }

  return sortEntries(entries);
}

// ---------------------------------------------------------------------------
// Color matching — match by name, fallback by hex
// ---------------------------------------------------------------------------

function matchColors(
  aList: ColorToken[],
  bList: ColorToken[],
): DiffEntry<ColorToken>[] {
  const entries: DiffEntry<ColorToken>[] = [];
  const matchedBNames = new Set<string>();
  const matchedBHexes = new Set<string>();

  const bByName = new Map<string, ColorToken>();
  const bByHex = new Map<string, ColorToken>();
  for (const c of bList) {
    bByName.set(c.name.toLowerCase(), c);
    bByHex.set(c.hex.toUpperCase(), c);
  }

  for (const aItem of aList) {
    const nameKey = aItem.name.toLowerCase();
    const bByNameMatch = bByName.get(nameKey);

    if (bByNameMatch) {
      matchedBNames.add(nameKey);
      const changed = aItem.hex.toUpperCase() !== bByNameMatch.hex.toUpperCase();
      entries.push({
        status: changed ? "changed" : "unchanged",
        name: aItem.name,
        a: aItem,
        b: bByNameMatch,
      });
    } else {
      // Fallback: match by hex (handles AI namer variance)
      const hexKey = aItem.hex.toUpperCase();
      const bByHexMatch = bByHex.get(hexKey);
      if (bByHexMatch && !matchedBNames.has(bByHexMatch.name.toLowerCase())) {
        matchedBHexes.add(bByHexMatch.name.toLowerCase());
        entries.push({
          status: "unchanged",
          name: aItem.name,
          a: aItem,
          b: bByHexMatch,
        });
      } else {
        entries.push({ status: "removed", name: aItem.name, a: aItem, b: null });
      }
    }
  }

  // Items only in B (added)
  for (const bItem of bList) {
    const nameKey = bItem.name.toLowerCase();
    if (!matchedBNames.has(nameKey) && !matchedBHexes.has(nameKey)) {
      entries.push({ status: "added", name: bItem.name, a: null, b: bItem });
    }
  }

  return sortEntries(entries);
}

// ---------------------------------------------------------------------------
// Changed detection callbacks
// ---------------------------------------------------------------------------

function isColorChanged(a: ColorToken, b: ColorToken): boolean {
  return a.hex.toUpperCase() !== b.hex.toUpperCase();
}

function isTypographyChanged(a: TypographyToken, b: TypographyToken): boolean {
  return (
    a.fontSize !== b.fontSize ||
    a.fontWeight !== b.fontWeight ||
    a.fontFamily !== b.fontFamily ||
    a.lineHeight !== b.lineHeight ||
    a.letterSpacing !== b.letterSpacing
  );
}

function isSpacingChanged(a: SpacingToken, b: SpacingToken): boolean {
  return a.pixels !== b.pixels;
}

function isRadiusChanged(a: RadiusToken, b: RadiusToken): boolean {
  return a.pixels !== b.pixels;
}

// ---------------------------------------------------------------------------
// Drift score calculation
// ---------------------------------------------------------------------------

function categoryDriftScore<T>(entries: DiffEntry<T>[]): number {
  const totalA = entries.filter((e) => e.a !== null).length;
  const totalB = entries.filter((e) => e.b !== null).length;
  const max = Math.max(totalA, totalB);
  if (max === 0) return 100;

  const diffs = entries.filter(
    (e) => e.status === "added" || e.status === "removed" || e.status === "changed",
  ).length;

  return Math.round(100 - (diffs / max) * 100);
}

function computeDriftScore(diff: TokenDiff): DriftScore {
  const allEntries = [
    ...diff.colors,
    ...diff.typography,
    ...diff.spacing,
    ...diff.radius,
  ];

  const counts = {
    added: allEntries.filter((e) => e.status === "added").length,
    removed: allEntries.filter((e) => e.status === "removed").length,
    changed: allEntries.filter((e) => e.status === "changed").length,
    unchanged: allEntries.filter((e) => e.status === "unchanged").length,
    totalA: allEntries.filter((e) => e.a !== null).length,
    totalB: allEntries.filter((e) => e.b !== null).length,
  };

  const byCategory = {
    colors: categoryDriftScore(diff.colors),
    typography: categoryDriftScore(diff.typography),
    spacing: categoryDriftScore(diff.spacing),
    radius: categoryDriftScore(diff.radius),
  };

  const overall = Math.round(
    (byCategory.colors + byCategory.typography + byCategory.spacing + byCategory.radius) / 4,
  );

  return { overall, byCategory, counts };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function compareExtractions(
  a: ExtractionResult,
  b: ExtractionResult,
): ComparisonResult {
  const diff: TokenDiff = {
    colors: matchColors(a.colors, b.colors),
    typography: matchByName(a.typography, b.typography, isTypographyChanged),
    spacing: matchByName(a.spacing, b.spacing, isSpacingChanged),
    radius: matchByName(a.radius, b.radius, isRadiusChanged),
  };

  // Also use the generic isColorChanged for name-matched colors
  // (matchColors handles this internally with hex comparison)

  const drift = computeDriftScore(diff);

  return { diff, drift };
}

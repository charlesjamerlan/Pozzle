import type { ConsistencyReport } from "@/lib/types/consistency";

export const mockConsistencyReport: ConsistencyReport = {
  overallScore: 72,
  grade: "C+",
  metrics: [
    {
      category: "Colors",
      score: 68,
      total: 24,
      unique: 18,
      issues: [
        "6 near-duplicate color values detected (e.g., #374151 and #3B4252 differ by only 3%)",
        "3 colors used only once — likely inconsistent one-offs",
        "No dark mode color counterparts defined for primary palette",
      ],
      recommendation:
        "Consolidate near-duplicate colors into a single token and remove one-off values. Define a consistent palette with no more than 12 base colors.",
    },
    {
      category: "Typography",
      score: 75,
      total: 12,
      unique: 8,
      issues: [
        "4 font-size values outside the defined type scale (e.g., 13px, 15px, 17px)",
        "Mixed font-weight usage: both 500 and 600 used for similar emphasis levels",
      ],
      recommendation:
        "Adopt a strict typographic scale (e.g., 12, 14, 16, 18, 20, 24, 30, 36px) and limit font-weights to 400, 600, and 700.",
    },
    {
      category: "Spacing",
      score: 80,
      total: 15,
      unique: 8,
      issues: [
        "7 spacing values fall outside the 4px base grid (e.g., 5px, 10px, 18px)",
        "Inconsistent use of rem and px units across components",
      ],
      recommendation:
        "Align all spacing to a 4px (0.25rem) base grid and standardize on rem units for responsive consistency.",
    },
    {
      category: "Border Radius",
      score: 65,
      total: 8,
      unique: 6,
      issues: [
        "3 different radius values used for similar card-like components (4px, 6px, 8px)",
        "Inconsistent rounding on buttons: some use 4px, others use 9999px",
        "No clear hierarchy between small, medium, and large radius values",
      ],
      recommendation:
        "Define 3-4 radius tokens (sm, md, lg, full) and enforce consistent usage across component categories.",
    },
  ],
  topIssues: [
    "Near-duplicate color values suggest a lack of a centralized palette — 6 colors can be consolidated",
    "Typography scale has 4 off-scale values creating visual inconsistency across pages",
    "Spacing values don't consistently follow a 4px grid, leading to misaligned layouts",
    "Border radius varies across similar components, reducing visual cohesion",
    "Mixed CSS units (px vs rem) make responsive scaling unpredictable",
  ],
  recommendations: [
    "Create a single source of truth for design tokens and reference it in all components to eliminate drift",
    "Audit and consolidate the color palette to 10-12 intentional values with clear semantic naming",
    "Enforce a 4px spacing grid and a modular type scale as part of your code review process",
    "Adopt a CSS variable strategy (e.g., --radius-sm, --radius-md) so updates propagate globally",
  ],
};

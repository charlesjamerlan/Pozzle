/**
 * Claude AI service for intelligent token naming and consistency analysis.
 * Falls back to heuristic on any failure.
 */

import Anthropic from "@anthropic-ai/sdk";
import { config } from "@/lib/config";
import type { RawExtraction } from "@/lib/services/css-parser";
import type { ExtractionResult } from "@/lib/types/extraction";
import type { ConsistencyReport } from "@/lib/types/consistency";
import { nameTokensHeuristic, scoreConsistencyHeuristic } from "@/lib/services/heuristic-namer";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function nameTokensWithClaude(
  raw: RawExtraction,
  url: string,
): Promise<ExtractionResult> {
  if (!config.anthropic.enabled) {
    return nameTokensHeuristic(raw, url);
  }

  try {
    const client = new Anthropic({ apiKey: config.anthropic.apiKey });

    const response = await client.messages.create({
      model: config.anthropic.model,
      max_tokens: 4096,
      system: NAMING_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildNamingUserPrompt(raw, url),
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed = parseJsonFromResponse<ExtractionResult>(text);
    if (parsed && parsed.colors && parsed.typography) {
      return { ...parsed, url, timestamp: new Date().toISOString() };
    }

    console.warn("[Claude] Could not parse naming response, falling back to heuristic");
    return nameTokensHeuristic(raw, url);
  } catch (err) {
    console.error("[Claude] Naming failed:", err);
    return nameTokensHeuristic(raw, url);
  }
}

export async function analyzeConsistencyWithClaude(
  result: ExtractionResult,
): Promise<ConsistencyReport> {
  if (!config.anthropic.enabled) {
    return scoreConsistencyHeuristic(result);
  }

  try {
    const client = new Anthropic({ apiKey: config.anthropic.apiKey });

    const response = await client.messages.create({
      model: config.anthropic.model,
      max_tokens: 4096,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildAnalysisUserPrompt(result),
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed = parseJsonFromResponse<ConsistencyReport>(text);
    if (parsed && typeof parsed.overallScore === "number" && parsed.metrics) {
      return parsed;
    }

    console.warn("[Claude] Could not parse analysis response, falling back to heuristic");
    return scoreConsistencyHeuristic(result);
  } catch (err) {
    console.error("[Claude] Analysis failed:", err);
    return scoreConsistencyHeuristic(result);
  }
}

// ---------------------------------------------------------------------------
// System prompts
// ---------------------------------------------------------------------------

const NAMING_SYSTEM_PROMPT = `You are a design systems expert. Given raw CSS token data extracted from a website, assign semantic names and usage descriptions to each token.

Rules:
- Colors: use names like primary, secondary, accent, neutral-100..neutral-900, success, warning, error, info, background, surface, border, text-primary, text-secondary
- Typography: use names like heading-1..heading-4, body, body-small, caption, code, overline
- Spacing: use names like xs, sm, md, base, lg, xl, 2xl, 3xl
- Radius: use names like sm, base, md, lg, xl, full

Return ONLY valid JSON matching the ExtractionResult schema. No markdown fences, no explanation.

Schema:
{
  "url": string,
  "timestamp": string,
  "colors": [{ "name": string, "hex": string, "rgb": { "r": number, "g": number, "b": number }, "usage": string, "count": number }],
  "typography": [{ "name": string, "fontFamily": string, "fontSize": string, "fontWeight": number, "lineHeight": string, "letterSpacing": string, "usage": string }],
  "spacing": [{ "name": string, "value": string, "pixels": number, "usage": string }],
  "radius": [{ "name": string, "value": string, "pixels": number, "usage": string }]
}`;

const ANALYSIS_SYSTEM_PROMPT = `You are a design systems auditor. Given a set of named design tokens from a website, analyze their consistency and provide actionable recommendations.

Score each category 0-100 based on:
- Number of unique values vs reasonable targets (colors: ~12, typography: ~8, spacing: ~8, radius: ~5)
- Presence of near-duplicates
- Adherence to standard scales (4px grid, modular type scale)
- Semantic coverage (does the palette have proper semantic colors?)

Return ONLY valid JSON matching the ConsistencyReport schema. No markdown fences, no explanation.

Schema:
{
  "overallScore": number,
  "grade": string,
  "metrics": [{
    "category": string,
    "score": number,
    "total": number,
    "unique": number,
    "issues": string[],
    "recommendation": string
  }],
  "topIssues": string[],
  "recommendations": string[]
}`;

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function buildNamingUserPrompt(raw: RawExtraction, url: string): string {
  // Limit data to prevent token overflow
  const colors = raw.colors.slice(0, 30);
  const typography = raw.typography.slice(0, 12);
  const spacing = raw.spacing.slice(0, 12);
  const radius = raw.radius.slice(0, 8);

  return `Website: ${url}

Raw extracted tokens:

COLORS (${colors.length}):
${colors.map((c) => `  ${c.hex} — used ${c.count}x in [${c.properties.join(", ")}]`).join("\n")}

TYPOGRAPHY (${typography.length}):
${typography.map((t) => `  ${t.fontFamily} ${t.fontSize} w${t.fontWeight} lh:${t.lineHeight} ls:${t.letterSpacing} — ${t.count}x`).join("\n")}

SPACING (${spacing.length}):
${spacing.map((s) => `  ${s.value} (${s.pixels}px) — ${s.count}x`).join("\n")}

RADIUS (${radius.length}):
${radius.map((r) => `  ${r.value} (${r.pixels}px) — ${r.count}x`).join("\n")}

Assign semantic names and usage descriptions to each token. Return the complete ExtractionResult JSON.`;
}

function buildAnalysisUserPrompt(result: ExtractionResult): string {
  return `Website: ${result.url}

Named tokens:

COLORS (${result.colors.length}):
${result.colors.map((c) => `  ${c.name}: ${c.hex} — ${c.usage} (${c.count}x)`).join("\n")}

TYPOGRAPHY (${result.typography.length}):
${result.typography.map((t) => `  ${t.name}: ${t.fontFamily} ${t.fontSize}/${t.lineHeight} w${t.fontWeight}`).join("\n")}

SPACING (${result.spacing.length}):
${result.spacing.map((s) => `  ${s.name}: ${s.value} (${s.pixels}px)`).join("\n")}

RADIUS (${result.radius.length}):
${result.radius.map((r) => `  ${r.name}: ${r.value} (${r.pixels}px)`).join("\n")}

Analyze consistency and return the ConsistencyReport JSON.`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseJsonFromResponse<T>(text: string): T | null {
  try {
    // Try direct parse first
    return JSON.parse(text) as T;
  } catch {
    // Try to extract JSON from markdown fences
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      try {
        return JSON.parse(fenceMatch[1]) as T;
      } catch {
        return null;
      }
    }
    // Try to find JSON object in text
    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try {
        return JSON.parse(braceMatch[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

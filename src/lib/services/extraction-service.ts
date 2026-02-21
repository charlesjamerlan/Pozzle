import { config } from "@/lib/config";
import { crawlUrl } from "@/lib/services/crawl-service";
import { parseCss } from "@/lib/services/css-parser";
import { nameTokensHeuristic, scoreConsistencyHeuristic } from "@/lib/services/heuristic-namer";
import { nameTokensWithClaude, analyzeConsistencyWithClaude } from "@/lib/services/claude-service";
import { mockExtractionResult } from "@/lib/mock-data/extraction-results";
import { mockConsistencyReport } from "@/lib/mock-data/consistency-metrics";
import type { ExtractionResult } from "@/lib/types/extraction";
import type { ConsistencyReport } from "@/lib/types/consistency";

export async function extractTokens(url: string): Promise<{
  extraction: ExtractionResult;
  report: ConsistencyReport;
}> {
  // 1. Crawl
  const crawl = await crawlUrl(url);

  if (!crawl.success || !crawl.cssText.trim()) {
    console.warn("[Extraction] Crawl returned no CSS — using mock data");
    return {
      extraction: { ...mockExtractionResult, url, timestamp: new Date().toISOString() },
      report: mockConsistencyReport,
    };
  }

  // 2. Parse CSS into raw tokens
  const raw = parseCss(crawl.cssText);

  // If parsing yields nothing meaningful, fall back to mock
  if (raw.colors.length === 0 && raw.typography.length === 0) {
    console.warn("[Extraction] No tokens found in CSS — using mock data");
    return {
      extraction: { ...mockExtractionResult, url, timestamp: new Date().toISOString() },
      report: mockConsistencyReport,
    };
  }

  // 3. Name tokens — Claude if available, otherwise heuristic
  let extraction: ExtractionResult;
  if (config.anthropic.enabled) {
    extraction = await nameTokensWithClaude(raw, url);
  } else {
    extraction = nameTokensHeuristic(raw, url);
  }

  // 4. Analyze consistency
  let report: ConsistencyReport;
  if (config.anthropic.enabled) {
    report = await analyzeConsistencyWithClaude(extraction);
  } else {
    report = scoreConsistencyHeuristic(extraction);
  }

  return { extraction, report };
}

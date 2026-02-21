import { mockExtractionResult } from "@/lib/mock-data/extraction-results";
import { mockConsistencyReport } from "@/lib/mock-data/consistency-metrics";
import type { ExtractionResult } from "@/lib/types/extraction";
import type { ConsistencyReport } from "@/lib/types/consistency";

export async function extractTokens(url: string): Promise<{
  extraction: ExtractionResult;
  report: ConsistencyReport;
}> {
  // Simulate 2s delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(`[Mock] Extracting tokens from ${url}`);
  return {
    extraction: { ...mockExtractionResult, url, timestamp: new Date().toISOString() },
    report: mockConsistencyReport,
  };
}

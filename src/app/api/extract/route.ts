import { NextResponse } from "next/server";
import { crawlUrl } from "@/lib/services/crawl-service";
import { extractTokens } from "@/lib/services/extraction-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Crawl the URL
    const crawlResult = await crawlUrl(url);
    if (!crawlResult.success) {
      return NextResponse.json({ error: "Failed to crawl URL" }, { status: 500 });
    }

    // Extract tokens
    const { extraction, report } = await extractTokens(url);

    return NextResponse.json({ extraction, report });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

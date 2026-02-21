import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { extractTokens } from "@/lib/services/extraction-service";
import { saveExtraction } from "@/lib/services/persistence-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Pipeline: crawl → parse → name → analyze (all inside extractTokens)
    const { extraction, report } = await extractTokens(url);

    // Persist if user is authenticated via Supabase
    let savedId: string | null = null;
    if (config.supabase.enabled) {
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          savedId = await saveExtraction(user.id, url, extraction, report);
        }
      } catch {
        // Non-critical — extraction still succeeds
      }
    }

    return NextResponse.json({ extraction, report, savedId });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

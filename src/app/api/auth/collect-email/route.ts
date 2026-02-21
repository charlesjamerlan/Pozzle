import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { collectEmail } from "@/lib/services/email-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Persist to Supabase emails table if configured
    if (config.supabase.enabled && config.supabase.serviceRoleKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const admin = createClient(config.supabase.url, config.supabase.serviceRoleKey);
        await admin.from("emails").upsert({ email }, { onConflict: "email" });
      } catch (err) {
        console.error("[Collect Email] Supabase insert failed:", err);
      }
    }

    // Also run the existing mock/log service
    const result = await collectEmail(email);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

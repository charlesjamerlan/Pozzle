import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Handles the magic link callback — exchanges the code for a session. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/extract";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to extract page on failure
  return NextResponse.redirect(`${origin}/extract`);
}

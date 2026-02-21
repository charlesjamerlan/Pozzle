import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { getUserExtractions } from "@/lib/services/persistence-service";

export async function GET() {
  if (!config.supabase.enabled) {
    return NextResponse.json({ extractions: [] });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const extractions = await getUserExtractions(user.id);
  return NextResponse.json({ extractions });
}

import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { getExtractionById } from "@/lib/services/persistence-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!config.supabase.enabled) {
    return NextResponse.json({ error: "Not configured" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const extraction = await getExtractionById(id);

  if (!extraction) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ extraction });
}

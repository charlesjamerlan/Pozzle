import { type NextRequest, NextResponse } from "next/server";
import { config as appConfig } from "@/lib/config";

export async function middleware(request: NextRequest) {
  // Only run Supabase session refresh when Supabase is configured
  if (!appConfig.supabase.enabled) {
    return NextResponse.next();
  }

  // Dynamic import to avoid loading Supabase code when not configured
  const { updateSession } = await import("@/lib/supabase/middleware");
  return updateSession(request);
}

export const config = {
  matcher: [
    // Run on all routes except static files and _next
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

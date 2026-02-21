import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  // If Supabase is configured, check auth
  if (config.supabase.enabled) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/extract");
    }
  } else {
    // No Supabase — redirect to extract (dashboard requires persistence)
    redirect("/extract");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-serif text-3xl text-text-primary">Dashboard</h1>
          <p className="mt-2 text-text-secondary">Your past extractions</p>
        </div>
        <DashboardClient />
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { ExtractionDetailClient } from "@/components/dashboard/extraction-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ExtractionDetailPage({ params }: Props) {
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
    redirect("/extract");
  }

  const { id } = await params;

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <ExtractionDetailClient id={id} />
    </div>
  );
}

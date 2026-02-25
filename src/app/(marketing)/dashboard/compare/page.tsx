import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { CompareClient } from "@/components/dashboard/compare-client";

interface Props {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export default async function ComparePage({ searchParams }: Props) {
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

  const { a, b } = await searchParams;

  if (!a || !b) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-24">
      <CompareClient idA={a} idB={b} />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResultsPanel } from "@/components/extraction/results-panel";
import type { ExtractionResult } from "@/lib/types/extraction";
import type { ConsistencyReport } from "@/lib/types/consistency";

interface Props {
  id: string;
}

export function ExtractionDetailClient({ id }: Props) {
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [report, setReport] = useState<ConsistencyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/extractions/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setResult(data.extraction.result);
        setReport(data.extraction.report);
      })
      .catch(() => {
        setError("Extraction not found.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-text-secondary text-sm">Loading...</div>
      </div>
    );
  }

  if (error || !result || !report) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-text-secondary">{error ?? "Something went wrong."}</p>
        <Link href="/dashboard" className="text-coral text-sm hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      <ResultsPanel result={result} report={report} />
    </div>
  );
}

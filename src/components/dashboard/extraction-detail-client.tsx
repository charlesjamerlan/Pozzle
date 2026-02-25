"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Globe,
  Calendar,
  RefreshCw,
  Trash2,
  Loader2,
} from "lucide-react";
import { ResultsPanel } from "@/components/extraction/results-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast-provider";
import type { ExtractionResult } from "@/lib/types/extraction";
import type { ConsistencyReport } from "@/lib/types/consistency";

interface Props {
  id: string;
}

export function ExtractionDetailClient({ id }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [url, setUrl] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [report, setReport] = useState<ConsistencyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action states
  const [rerunning, setRerunning] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/extractions/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setUrl(data.extraction.url);
        setCreatedAt(data.extraction.created_at);
        setResult(data.extraction.result);
        setReport(data.extraction.report);
      })
      .catch(() => {
        setError("Extraction not found.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const hostname = url ? new URL(url).hostname : "";

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  const handleRerun = useCallback(async () => {
    if (!url) return;
    setRerunning(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
        setReport(data.report);
        toast("Re-run complete");
      } else {
        toast("Re-run failed");
      }
    } catch {
      toast("Re-run failed");
    } finally {
      setRerunning(false);
    }
  }, [url, toast]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/extractions/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("Extraction deleted");
        router.push("/dashboard");
      } else {
        toast("Failed to delete extraction");
      }
    } catch {
      toast("Failed to delete extraction");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [id, toast, router]);

  // Skeleton loading state
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        {/* Breadcrumb skeleton */}
        <Skeleton className="h-4 w-48" />

        {/* Header skeleton */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-3.5 w-36" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
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

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-text-tertiary">
        <Link
          href="/dashboard"
          className="hover:text-text-primary transition-colors"
        >
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-text-secondary truncate max-w-[200px]">
          {hostname}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {/* Favicon with Globe fallback */}
          <div className="h-10 w-10 rounded-lg bg-surface-elevated border border-border flex items-center justify-center overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={faviconUrl}
              alt=""
              className="h-6 w-6"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                target.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <Globe className="h-5 w-5 text-text-tertiary hidden" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {url}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-text-tertiary mt-0.5">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRerun}
            disabled={rerunning}
          >
            {rerunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {rerunning ? "Running..." : "Re-run"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-text-tertiary hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Results */}
      <ResultsPanel result={result} report={report} />

      {/* Delete confirm dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete extraction?"
        description={`This will permanently delete the extraction for ${url}.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="danger"
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Globe, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ColorDiff } from "@/components/comparison/color-diff";
import { TypographyDiff } from "@/components/comparison/typography-diff";
import { SpacingDiff } from "@/components/comparison/spacing-diff";
import { RadiusDiff } from "@/components/comparison/radius-diff";
import {
  compareExtractions,
  type ComparisonResult,
} from "@/lib/utils/comparison-engine";
import type { ExtractionResult } from "@/lib/types/extraction";

interface CompareClientProps {
  idA: string;
  idB: string;
}

interface ExtractionData {
  url: string;
  created_at: string;
  result: ExtractionResult;
  report: { overallScore: number; grade: string };
}

const tabs = [
  { key: "colors", label: "Colors" },
  { key: "typography", label: "Typography" },
  { key: "spacing", label: "Spacing" },
  { key: "radius", label: "Radius" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export function CompareClient({ idA, idB }: CompareClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("colors");
  const [dataA, setDataA] = useState<ExtractionData | null>(null);
  const [dataB, setDataB] = useState<ExtractionData | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/extractions/${idA}`).then((r) => {
        if (!r.ok) throw new Error("Extraction A not found");
        return r.json();
      }),
      fetch(`/api/extractions/${idB}`).then((r) => {
        if (!r.ok) throw new Error("Extraction B not found");
        return r.json();
      }),
    ])
      .then(([resA, resB]) => {
        const a = resA.extraction as ExtractionData;
        const b = resB.extraction as ExtractionData;
        setDataA(a);
        setDataB(b);
        setComparison(compareExtractions(a.result, b.result));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load extractions");
      })
      .finally(() => setLoading(false));
  }, [idA, idB]);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !dataA || !dataB || !comparison) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-text-secondary">{error ?? "Something went wrong."}</p>
        <Link href="/dashboard" className="text-coral text-sm hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const { drift, diff } = comparison;

  return (
    <div className="flex flex-col gap-8">
      {/* Header: A metadata | Drift gauge | B metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <ExtractionMeta data={dataA} label="A" />

        {/* Drift score gauge */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-5xl font-bold text-text-primary">
            {drift.overall}%
          </span>
          <span className="text-sm text-text-secondary">Similarity</span>
          <div className="flex gap-2 mt-2">
            <Badge
              variant={drift.byCategory.colors >= 80 ? "green" : drift.byCategory.colors >= 50 ? "amber" : "coral"}
            >
              Colors {drift.byCategory.colors}%
            </Badge>
            <Badge
              variant={drift.byCategory.typography >= 80 ? "green" : drift.byCategory.typography >= 50 ? "amber" : "coral"}
            >
              Type {drift.byCategory.typography}%
            </Badge>
          </div>
          <div className="flex gap-2 mt-1">
            <Badge
              variant={drift.byCategory.spacing >= 80 ? "green" : drift.byCategory.spacing >= 50 ? "amber" : "coral"}
            >
              Spacing {drift.byCategory.spacing}%
            </Badge>
            <Badge
              variant={drift.byCategory.radius >= 80 ? "green" : drift.byCategory.radius >= 50 ? "amber" : "coral"}
            >
              Radius {drift.byCategory.radius}%
            </Badge>
          </div>
        </div>

        <ExtractionMeta data={dataB} label="B" />
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
              activeTab === tab.key
                ? "text-text-primary border-b-2 border-coral"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "colors" && <ColorDiff entries={diff.colors} />}
          {activeTab === "typography" && (
            <TypographyDiff entries={diff.typography} />
          )}
          {activeTab === "spacing" && <SpacingDiff entries={diff.spacing} />}
          {activeTab === "radius" && <RadiusDiff entries={diff.radius} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ExtractionMeta({
  data,
  label,
}: {
  data: ExtractionData;
  label: string;
}) {
  let hostname: string;
  try {
    hostname = new URL(data.url).hostname;
  } catch {
    hostname = data.url;
  }
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  const date = new Date(data.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const scoreBadgeVariant =
    data.report.overallScore > 80
      ? "green"
      : data.report.overallScore >= 60
        ? "amber"
        : "coral";

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="text-xs text-text-tertiary font-mono uppercase">
        Extraction {label}
      </span>
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-surface-elevated border border-border flex items-center justify-center overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={faviconUrl}
            alt=""
            className="h-5 w-5"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <Globe className="h-4 w-4 text-text-tertiary hidden" />
        </div>
        <span className="text-sm font-medium text-text-primary truncate max-w-[180px]">
          {hostname}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
        <Calendar className="h-3 w-3" />
        {date}
      </div>
      {data.report.grade && (
        <Badge variant={scoreBadgeVariant as "green" | "amber" | "coral"}>
          {data.report.grade}
        </Badge>
      )}
    </div>
  );
}

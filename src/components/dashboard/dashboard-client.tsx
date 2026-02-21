"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Globe, Calendar, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExtractionSummary {
  id: string;
  url: string;
  created_at: string;
  result: {
    colors: unknown[];
    typography: unknown[];
    spacing: unknown[];
    radius: unknown[];
  };
  report: {
    overallScore: number;
    grade: string;
  };
}

export function DashboardClient() {
  const [extractions, setExtractions] = useState<ExtractionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/extractions")
      .then((res) => res.json())
      .then((data) => {
        setExtractions(data.extractions ?? []);
      })
      .catch(() => {
        setExtractions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-text-secondary text-sm">Loading extractions...</div>
      </div>
    );
  }

  if (extractions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-text-secondary">No extractions yet.</p>
        <Link
          href="/extract"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-coral to-coral-light px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-coral/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Analyze Your First Site
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {extractions.map((ext, index) => {
        const date = new Date(ext.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const tokenCount =
          (ext.result?.colors?.length ?? 0) +
          (ext.result?.typography?.length ?? 0) +
          (ext.result?.spacing?.length ?? 0) +
          (ext.result?.radius?.length ?? 0);

        const scoreBadgeVariant =
          ext.report?.overallScore > 80
            ? "green"
            : ext.report?.overallScore >= 60
              ? "amber"
              : "coral";

        return (
          <motion.div
            key={ext.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Link href={`/dashboard/${ext.id}`}>
              <Card hover className="flex flex-col gap-3 group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe className="h-4 w-4 text-text-tertiary shrink-0" />
                    <span className="text-sm font-medium text-text-primary truncate">
                      {ext.url}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-text-tertiary">
                    <Calendar className="h-3 w-3" />
                    {date}
                  </div>
                  <Badge variant="default">{tokenCount} tokens</Badge>
                  {ext.report?.grade && (
                    <Badge variant={scoreBadgeVariant as "green" | "amber" | "coral"}>
                      {ext.report.grade}
                    </Badge>
                  )}
                </div>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

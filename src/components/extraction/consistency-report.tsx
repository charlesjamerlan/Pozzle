"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { ConsistencyReport as ConsistencyReportType } from "@/lib/types/consistency";

interface ConsistencyReportProps {
  report: ConsistencyReportType;
}

function scoreColor(score: number): string {
  if (score > 80) return "text-accent-green";
  if (score >= 60) return "text-accent-amber";
  return "text-coral";
}

function scoreBarColor(score: number): string {
  if (score > 80) return "bg-accent-green";
  if (score >= 60) return "bg-accent-amber";
  return "bg-coral";
}

function scoreBadgeVariant(score: number): "green" | "amber" | "coral" {
  if (score > 80) return "green";
  if (score >= 60) return "amber";
  return "coral";
}

export function ConsistencyReportView({ report }: ConsistencyReportProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8"
    >
      {/* Overall score */}
      <div className="flex items-center gap-4">
        <span
          className={cn("font-serif text-6xl font-bold", scoreColor(report.overallScore))}
        >
          {report.overallScore}
        </span>
        <Badge variant={scoreBadgeVariant(report.overallScore)} className="text-sm">
          {report.grade}
        </Badge>
      </div>

      {/* Per-category metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report.metrics.map((metric, index) => (
          <motion.div
            key={metric.category}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
          >
            <Card className="h-full">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {metric.category}
                  </h3>
                  <span
                    className={cn(
                      "text-sm font-mono font-bold",
                      scoreColor(metric.score),
                    )}
                  >
                    {metric.score}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.score}%` }}
                    transition={{ delay: index * 0.08 + 0.2, duration: 0.5, ease: "easeOut" }}
                    className={cn("h-full rounded-full", scoreBarColor(metric.score))}
                  />
                </div>

                <p className="text-xs text-text-secondary">
                  {metric.unique} unique of {metric.total} total
                </p>

                {metric.issues.length > 0 && (
                  <ul className="flex flex-col gap-1 mt-1">
                    {metric.issues.map((issue, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary flex items-start gap-1.5"
                      >
                        <span className="text-text-tertiary mt-1 shrink-0">
                          &bull;
                        </span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Top Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-text-primary">
            Top Recommendations
          </h3>
          <ul className="flex flex-col gap-2">
            {report.recommendations.map((rec, i) => (
              <li
                key={i}
                className="text-sm text-text-secondary flex items-start gap-2"
              >
                <span className="text-coral mt-0.5 shrink-0">&bull;</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

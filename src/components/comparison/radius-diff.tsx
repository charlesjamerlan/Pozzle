"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DiffLegend } from "@/components/comparison/diff-legend";
import type { DiffEntry } from "@/lib/utils/comparison-engine";
import type { RadiusToken } from "@/lib/types/extraction";

interface RadiusDiffProps {
  entries: DiffEntry<RadiusToken>[];
}

export function RadiusDiff({ entries }: RadiusDiffProps) {
  return (
    <div className="flex flex-col gap-6">
      <DiffLegend entries={entries} />

      <div className="flex flex-wrap gap-6">
        {entries.map((entry, index) => (
          <RadiusDiffCard key={entry.name} entry={entry} index={index} />
        ))}
      </div>
    </div>
  );
}

function RadiusDiffCard({
  entry,
  index,
}: {
  entry: DiffEntry<RadiusToken>;
  index: number;
}) {
  const { status, a, b } = entry;
  const displayToken = b ?? a;
  if (!displayToken) return null;

  const isChanged = status === "changed" && a && b;
  const opacityClass = status === "unchanged" ? "opacity-40" : "";

  const borderClass =
    status === "added"
      ? "border-accent-green"
      : status === "removed"
        ? "border-coral"
        : "border-coral";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`flex flex-col items-center gap-2 ${opacityClass}`}
    >
      {isChanged ? (
        <div className="flex items-center gap-2">
          <div
            className="w-14 h-14 bg-coral/20 border-2 border-coral/50"
            style={{ borderRadius: a.value }}
          />
          <ArrowRight className="h-3.5 w-3.5 text-accent-amber shrink-0" />
          <div
            className="w-14 h-14 bg-coral/20 border-2 border-coral"
            style={{ borderRadius: b.value }}
          />
        </div>
      ) : (
        <div
          className={`w-16 h-16 bg-coral/20 border-2 ${borderClass}`}
          style={{ borderRadius: displayToken.value }}
        />
      )}

      <span className="text-sm font-medium text-text-primary">{entry.name}</span>

      {isChanged ? (
        <span className="text-xs text-accent-amber font-mono">
          {a.value} → {b.value}
        </span>
      ) : (
        <span className="text-xs text-text-secondary font-mono">
          {displayToken.value}
        </span>
      )}

      {status === "added" && <Badge variant="green">Added</Badge>}
      {status === "removed" && <Badge variant="coral">Removed</Badge>}
    </motion.div>
  );
}

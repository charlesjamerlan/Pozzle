"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { DiffLegend } from "@/components/comparison/diff-legend";
import type { DiffEntry } from "@/lib/utils/comparison-engine";
import type { SpacingToken } from "@/lib/types/extraction";

interface SpacingDiffProps {
  entries: DiffEntry<SpacingToken>[];
}

export function SpacingDiff({ entries }: SpacingDiffProps) {
  // Normalize bar widths across both A and B values
  const maxPx = entries.reduce((max, e) => {
    const aPx = e.a?.pixels ?? 0;
    const bPx = e.b?.pixels ?? 0;
    return Math.max(max, aPx, bPx);
  }, 1);

  return (
    <div className="flex flex-col gap-6">
      <DiffLegend entries={entries} />

      <div className="flex flex-col gap-4">
        {entries.map((entry, index) => (
          <SpacingDiffRow
            key={entry.name}
            entry={entry}
            index={index}
            maxPx={maxPx}
          />
        ))}
      </div>
    </div>
  );
}

function SpacingDiffRow({
  entry,
  index,
  maxPx,
}: {
  entry: DiffEntry<SpacingToken>;
  index: number;
  maxPx: number;
}) {
  const { status, a, b } = entry;
  const displayToken = b ?? a;
  if (!displayToken) return null;

  const isChanged = status === "changed" && a && b;
  const opacityClass = status === "unchanged" ? "opacity-50" : "";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={`flex items-center gap-4 ${opacityClass}`}
    >
      <span className="font-mono text-sm text-text-secondary w-24 shrink-0 text-right">
        {entry.name}
      </span>

      <div className="flex-1 flex flex-col gap-1">
        {isChanged ? (
          <>
            {/* Before bar (A) */}
            <div className="h-3 bg-surface-elevated rounded overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((a.pixels / maxPx) * 100, 100)}%` }}
                transition={{ delay: index * 0.04, duration: 0.5, ease: "easeOut" }}
                className="h-full rounded bg-coral/40"
              />
            </div>
            {/* After bar (B) */}
            <div className="h-3 bg-surface-elevated rounded overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((b.pixels / maxPx) * 100, 100)}%` }}
                transition={{ delay: index * 0.04 + 0.1, duration: 0.5, ease: "easeOut" }}
                className="h-full rounded bg-coral"
              />
            </div>
          </>
        ) : (
          <div className="h-6 bg-surface-elevated rounded overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((displayToken.pixels / maxPx) * 100, 100)}%`,
              }}
              transition={{ delay: index * 0.04, duration: 0.5, ease: "easeOut" }}
              className="h-full rounded bg-coral/80"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isChanged ? (
          <span className="font-mono text-xs text-accent-amber whitespace-nowrap">
            {a.value} → {b.value}
          </span>
        ) : (
          <span className="font-mono text-sm text-text-primary w-16 shrink-0">
            {displayToken.value}
          </span>
        )}
        {status === "added" && <Badge variant="green">Added</Badge>}
        {status === "removed" && <Badge variant="coral">Removed</Badge>}
      </div>
    </motion.div>
  );
}

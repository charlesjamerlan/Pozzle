"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { DiffLegend } from "@/components/comparison/diff-legend";
import type { DiffEntry } from "@/lib/utils/comparison-engine";
import type { TypographyToken } from "@/lib/types/extraction";

interface TypographyDiffProps {
  entries: DiffEntry<TypographyToken>[];
}

const BORDER_COLORS: Record<string, string> = {
  added: "border-l-accent-green",
  removed: "border-l-coral",
  changed: "border-l-accent-amber",
  unchanged: "border-l-border",
};

export function TypographyDiff({ entries }: TypographyDiffProps) {
  return (
    <div className="flex flex-col gap-6">
      <DiffLegend entries={entries} />

      <div className="flex flex-col gap-6">
        {entries.map((entry, index) => (
          <TypographyDiffRow key={entry.name} entry={entry} index={index} />
        ))}
      </div>
    </div>
  );
}

function TypographyDiffRow({
  entry,
  index,
}: {
  entry: DiffEntry<TypographyToken>;
  index: number;
}) {
  const { status, a, b } = entry;
  const displayToken = b ?? a;
  if (!displayToken) return null;

  const isChanged = status === "changed" && a && b;
  const borderClass = BORDER_COLORS[status] ?? "border-l-border";
  const opacityClass = status === "unchanged" ? "opacity-50" : "";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 border-b border-border pb-5 last:border-b-0 border-l-4 pl-4 ${borderClass} ${opacityClass}`}
    >
      {/* Name */}
      <div className="flex items-center gap-2 sm:w-48 shrink-0">
        <span className="text-sm text-text-secondary font-mono truncate">
          {entry.name}
        </span>
      </div>

      {/* Preview */}
      <div className="flex-1 min-w-0">
        {isChanged ? (
          <div className="flex flex-col gap-1">
            <p
              className="text-text-tertiary line-through truncate"
              style={{
                fontSize: a.fontSize,
                fontWeight: a.fontWeight,
                lineHeight: a.lineHeight,
                letterSpacing: a.letterSpacing,
                fontFamily: a.fontFamily,
              }}
            >
              The quick brown fox
            </p>
            <p
              className="text-text-primary truncate"
              style={{
                fontSize: b.fontSize,
                fontWeight: b.fontWeight,
                lineHeight: b.lineHeight,
                letterSpacing: b.letterSpacing,
                fontFamily: b.fontFamily,
              }}
            >
              The quick brown fox
            </p>
          </div>
        ) : (
          <p
            className="text-text-primary truncate"
            style={{
              fontSize: displayToken.fontSize,
              fontWeight: displayToken.fontWeight,
              lineHeight: displayToken.lineHeight,
              letterSpacing: displayToken.letterSpacing,
              fontFamily: displayToken.fontFamily,
            }}
          >
            The quick brown fox
          </p>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        {isChanged ? (
          <>
            <Badge variant={a.fontSize !== b.fontSize ? "amber" : "default"}>
              {b.fontSize}
            </Badge>
            <Badge variant={a.fontWeight !== b.fontWeight ? "amber" : "default"}>
              {b.fontWeight}
            </Badge>
          </>
        ) : (
          <>
            <Badge variant="default">{displayToken.fontSize}</Badge>
            <Badge variant="default">{displayToken.fontWeight}</Badge>
          </>
        )}
        {status === "added" && <Badge variant="green">Added</Badge>}
        {status === "removed" && <Badge variant="coral">Removed</Badge>}
      </div>
    </motion.div>
  );
}

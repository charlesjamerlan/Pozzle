"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { DiffLegend } from "@/components/comparison/diff-legend";
import { shouldUseWhiteText } from "@/lib/utils/color-utils";
import type { DiffEntry } from "@/lib/utils/comparison-engine";
import type { ColorToken } from "@/lib/types/extraction";

interface ColorDiffProps {
  entries: DiffEntry<ColorToken>[];
}

export function ColorDiff({ entries }: ColorDiffProps) {
  return (
    <div className="flex flex-col gap-6">
      <DiffLegend entries={entries} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {entries.map((entry, index) => (
          <ColorDiffCard key={entry.name} entry={entry} index={index} />
        ))}
      </div>
    </div>
  );
}

function ColorDiffCard({
  entry,
  index,
}: {
  entry: DiffEntry<ColorToken>;
  index: number;
}) {
  const { status, a, b } = entry;
  const displayToken = b ?? a;
  if (!displayToken) return null;

  const isChanged = status === "changed" && a && b;
  const swatchHex = isChanged ? undefined : displayToken.hex;
  const useWhite = swatchHex ? shouldUseWhiteText(swatchHex) : true;

  const opacityClass =
    status === "unchanged"
      ? "opacity-40"
      : status === "removed"
        ? "opacity-60"
        : "";

  const ringClass =
    status === "removed"
      ? "ring-2 ring-coral"
      : status === "added"
        ? "ring-2 ring-accent-green"
        : status === "changed"
          ? "ring-2 ring-accent-amber"
          : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className={`flex flex-col gap-2 ${opacityClass}`}
    >
      <div
        className={`relative w-full aspect-square rounded-lg flex items-end p-3 ${ringClass}`}
        style={
          isChanged
            ? {
                background: `linear-gradient(90deg, ${a.hex} 50%, ${b.hex} 50%)`,
              }
            : { backgroundColor: swatchHex }
        }
      >
        <span
          className="text-xs font-mono font-medium"
          style={{ color: useWhite ? "#FFFFFF" : "#111118" }}
        >
          {isChanged ? `${a.hex} → ${b.hex}` : displayToken.hex}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {entry.name}
          </p>
          {isChanged && (
            <p className="text-xs text-text-tertiary">was {a.hex}</p>
          )}
        </div>
        {status === "added" && <Badge variant="green">Added</Badge>}
        {status === "removed" && <Badge variant="coral">Removed</Badge>}
        {status === "changed" && <Badge variant="amber">Changed</Badge>}
      </div>
    </motion.div>
  );
}

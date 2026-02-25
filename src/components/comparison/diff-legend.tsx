"use client";

import type { DiffEntry, DiffStatus } from "@/lib/utils/comparison-engine";

interface DiffLegendProps {
  entries: DiffEntry<unknown>[];
}

const STATUS_CONFIG: Record<DiffStatus, { label: string; dotClass: string }> = {
  added: { label: "Added", dotClass: "bg-accent-green" },
  removed: { label: "Removed", dotClass: "bg-coral" },
  changed: { label: "Changed", dotClass: "bg-accent-amber" },
  unchanged: { label: "Unchanged", dotClass: "bg-text-tertiary" },
};

export function DiffLegend({ entries }: DiffLegendProps) {
  const counts: Record<DiffStatus, number> = {
    added: 0,
    removed: 0,
    changed: 0,
    unchanged: 0,
  };

  for (const entry of entries) {
    counts[entry.status]++;
  }

  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
      {(Object.keys(STATUS_CONFIG) as DiffStatus[]).map((status) => {
        const count = counts[status];
        if (count === 0) return null;
        const { label, dotClass } = STATUS_CONFIG[status];
        return (
          <div key={status} className="flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${dotClass}`} />
            <span>
              {label} ({count})
            </span>
          </div>
        );
      })}
    </div>
  );
}

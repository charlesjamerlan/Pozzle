"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Globe, Calendar, ArrowRight, Trash2, Plus, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast-provider";
import {
  DashboardToolbar,
  type SortField,
  type SortDirection,
  type GradeFilter,
} from "@/components/dashboard/dashboard-toolbar";

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

  // Toolbar state
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ExtractionSummary | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  // Selection state for comparison
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const isSelecting = selected.size > 0;

  const { toast } = useToast();

  const toggleSelection = useCallback(
    (id: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (next.size >= 2) {
            toast("Select at most 2 extractions to compare");
            return prev;
          }
          next.add(id);
        }
        return next;
      });
    },
    [toast],
  );

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

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

  const filtered = useMemo(() => {
    let items = [...extractions];

    // Search by URL
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((e) => e.url.toLowerCase().includes(q));
    }

    // Filter by grade
    if (gradeFilter !== "all") {
      items = items.filter((e) => e.report?.grade === gradeFilter);
    }

    // Sort
    items.sort((a, b) => {
      let cmp: number;
      if (sortField === "date") {
        cmp =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        cmp = (a.report?.overallScore ?? 0) - (b.report?.overallScore ?? 0);
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return items;
  }, [extractions, search, gradeFilter, sortField, sortDirection]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/extractions/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setExtractions((prev) =>
          prev.filter((e) => e.id !== deleteTarget.id),
        );
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(deleteTarget.id);
          return next;
        });
        toast("Extraction deleted");
      } else {
        toast("Failed to delete extraction");
      }
    } catch {
      toast("Failed to delete extraction");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, toast]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setGradeFilter("all");
    setSortField("date");
    setSortDirection("desc");
  }, []);

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex gap-3">
            <div className="h-10 w-64 rounded-lg bg-surface-elevated animate-shimmer" style={{ backgroundImage: "linear-gradient(90deg, transparent 0%, var(--color-border) 50%, transparent 100%)", backgroundSize: "200% 100%" }} />
            <div className="h-10 w-32 rounded-lg bg-surface-elevated animate-shimmer" style={{ backgroundImage: "linear-gradient(90deg, transparent 0%, var(--color-border) 50%, transparent 100%)", backgroundSize: "200% 100%" }} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // No extractions at all
  if (extractions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div className="rounded-full bg-surface-elevated p-4">
          <Globe className="h-8 w-8 text-text-tertiary" />
        </div>
        <p className="text-text-secondary">No extractions yet.</p>
        <Link href="/extract">
          <Button size="md">
            <Plus className="h-4 w-4" />
            Analyze Your First Site
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardToolbar
        search={search}
        onSearchChange={setSearch}
        gradeFilter={gradeFilter}
        onGradeFilterChange={setGradeFilter}
        sortField={sortField}
        onSortFieldChange={setSortField}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
        resultCount={filtered.length}
        totalCount={extractions.length}
        selectedCount={selected.size}
        selectedIds={selectedIds}
        onClearSelection={clearSelection}
      />

      {/* Filtered-empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <p className="text-text-secondary text-sm">
            No results match your filters.
          </p>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((ext, index) => {
              const date = new Date(ext.created_at).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" },
              );
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

              const isSelected = selected.has(ext.id);

              // In selecting mode, card click toggles selection
              if (isSelecting) {
                return (
                  <motion.div
                    key={ext.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03, duration: 0.25 }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleSelection(ext.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleSelection(ext.id);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <Card
                        hover
                        className={`flex flex-col gap-3 group relative transition-all ${
                          isSelected ? "ring-2 ring-coral/60" : ""
                        }`}
                      >
                        {/* Selection checkbox */}
                        <div
                          className={`absolute top-3 left-3 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-coral border-coral"
                              : "border-border bg-surface-elevated"
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>

                        <div className="flex items-start justify-between pl-7">
                          <div className="flex items-center gap-2 min-w-0">
                            <Globe className="h-4 w-4 text-text-tertiary shrink-0" />
                            <span className="text-sm font-medium text-text-primary truncate">
                              {ext.url}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pl-7">
                          <div className="flex items-center gap-1 text-xs text-text-tertiary">
                            <Calendar className="h-3 w-3" />
                            {date}
                          </div>
                          <Badge variant="default">{tokenCount} tokens</Badge>
                          {ext.report?.grade && (
                            <Badge
                              variant={
                                scoreBadgeVariant as
                                  | "green"
                                  | "amber"
                                  | "coral"
                              }
                            >
                              {ext.report.grade}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    </div>
                  </motion.div>
                );
              }

              // Normal mode — Link wraps card, click to select starts selection
              return (
                <motion.div
                  key={ext.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03, duration: 0.25 }}
                >
                  <Link href={`/dashboard/${ext.id}`}>
                    <Card hover className="flex flex-col gap-3 group relative">
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
                          <Badge
                            variant={
                              scoreBadgeVariant as
                                | "green"
                                | "amber"
                                | "coral"
                            }
                          >
                            {ext.report.grade}
                          </Badge>
                        )}
                      </div>

                      {/* Select button — hover-reveal, starts selection mode */}
                      <button
                        type="button"
                        className="absolute top-3 left-3 h-5 w-5 rounded border-2 border-border bg-surface-elevated opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label="Select for comparison"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSelection(ext.id);
                        }}
                      />

                      {/* Delete button — hover-reveal */}
                      <button
                        type="button"
                        className="absolute top-3 right-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-red-400 hover:bg-red-400/10 cursor-pointer"
                        aria-label="Delete extraction"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteTarget(ext);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete extraction?"
        description={
          deleteTarget
            ? `This will permanently delete the extraction for ${deleteTarget.url}.`
            : undefined
        }
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="danger"
      />
    </div>
  );
}

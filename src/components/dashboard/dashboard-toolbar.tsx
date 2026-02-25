"use client";

import { useRouter } from "next/navigation";
import { Search, ArrowUpDown, GitCompareArrows, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type SortField = "date" | "score";
export type SortDirection = "asc" | "desc";
export type GradeFilter = "all" | "A" | "B" | "C" | "D" | "F";

interface DashboardToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  gradeFilter: GradeFilter;
  onGradeFilterChange: (value: GradeFilter) => void;
  sortField: SortField;
  onSortFieldChange: (value: SortField) => void;
  sortDirection: SortDirection;
  onSortDirectionChange: (value: SortDirection) => void;
  resultCount: number;
  totalCount: number;
  selectedCount?: number;
  selectedIds?: string[];
  onClearSelection?: () => void;
}

export function DashboardToolbar({
  search,
  onSearchChange,
  gradeFilter,
  onGradeFilterChange,
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionChange,
  resultCount,
  totalCount,
  selectedCount = 0,
  selectedIds = [],
  onClearSelection,
}: DashboardToolbarProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search by URL..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          <Select
            value={gradeFilter}
            onChange={(e) => onGradeFilterChange(e.target.value as GradeFilter)}
          >
            <option value="all">All grades</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
            <option value="D">Grade D</option>
            <option value="F">Grade F</option>
          </Select>

          <div className="flex items-end gap-1.5">
            <Select
              value={sortField}
              onChange={(e) => onSortFieldChange(e.target.value as SortField)}
            >
              <option value="date">Sort by date</option>
              <option value="score">Sort by score</option>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc")
              }
              className="px-2.5 shrink-0"
              aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-text-tertiary shrink-0">
          {resultCount === totalCount
            ? `${totalCount} extraction${totalCount === 1 ? "" : "s"}`
            : `${resultCount} of ${totalCount}`}
        </p>
      </div>

      {/* Compare selection bar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-surface-elevated border border-border">
          <span className="text-sm text-text-secondary">
            {selectedCount === 2
              ? "2 selected"
              : "1 selected — select 1 more to compare"}
          </span>

          <div className="flex items-center gap-2 ml-auto">
            {selectedCount === 2 && (
              <Button
                size="sm"
                onClick={() => {
                  router.push(
                    `/dashboard/compare?a=${selectedIds[0]}&b=${selectedIds[1]}`,
                  );
                }}
              >
                <GitCompareArrows className="h-3.5 w-3.5" />
                Compare
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-text-tertiary"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

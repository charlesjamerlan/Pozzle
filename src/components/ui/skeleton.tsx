import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-surface-elevated animate-shimmer",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent 0%, var(--color-border) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
      }}
    />
  );
}

/** Matches the extraction card layout used in the dashboard list. */
function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-10 rounded-md" />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonCard };

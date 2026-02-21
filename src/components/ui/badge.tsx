import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "coral" | "green" | "amber";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-elevated text-text-secondary",
  coral: "bg-coral/10 text-coral",
  green: "bg-accent-green/10 text-accent-green",
  amber: "bg-accent-amber/10 text-accent-amber",
};

function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };

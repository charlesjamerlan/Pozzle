import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "coral" | "green" | "amber";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-elevated text-text-secondary border border-border",
  coral: "bg-coral/10 text-coral border border-coral/20",
  green: "bg-accent-green/10 text-accent-green border border-accent-green/20",
  amber: "bg-accent-amber/10 text-accent-amber border border-accent-amber/20",
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

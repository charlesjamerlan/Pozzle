import { type ReactNode, type ElementType } from "react";
import { cn } from "@/lib/utils/cn";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

function GradientText({
  children,
  className,
  as: Component = "span",
}: GradientTextProps) {
  return (
    <Component
      className={cn("gradient-text-coral font-serif italic", className)}
    >
      {children}
    </Component>
  );
}

export { GradientText };
export type { GradientTextProps };

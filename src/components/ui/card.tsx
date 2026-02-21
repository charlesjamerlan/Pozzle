import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  className?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = false, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface border border-border rounded-lg p-6",
          hover && "transition-colors duration-200 hover:border-coral/30",
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

export { Card };
export type { CardProps };

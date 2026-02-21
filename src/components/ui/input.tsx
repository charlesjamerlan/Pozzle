"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...rest }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm text-text-secondary font-medium"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-lg bg-surface border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-200 outline-none",
              "focus:ring-2 focus:ring-coral/40 focus:border-coral/60",
              icon && "pl-10",
              error && "border-red-500 focus:ring-red-500/40 focus:border-red-500/60",
              className,
            )}
            {...rest}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-0.5">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
export type { InputProps };

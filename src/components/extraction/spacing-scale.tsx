"use client";

import { motion } from "motion/react";
import type { SpacingToken } from "@/lib/types/extraction";

interface SpacingScaleProps {
  spacing: SpacingToken[];
}

const MAX_BAR_PX = 64;

export function SpacingScale({ spacing }: SpacingScaleProps) {
  return (
    <div className="flex flex-col gap-4">
      {spacing.map((token, index) => {
        const widthPercent = Math.min((token.pixels / MAX_BAR_PX) * 100, 100);

        return (
          <div key={token.name} className="flex items-center gap-4">
            <span className="font-mono text-sm text-text-secondary w-24 shrink-0 text-right">
              {token.name}
            </span>

            <div className="flex-1 h-6 bg-surface-elevated rounded overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent}%` }}
                transition={{
                  delay: index * 0.06,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                className="h-full rounded bg-coral/80"
              />
            </div>

            <span className="font-mono text-sm text-text-primary w-16 shrink-0">
              {token.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

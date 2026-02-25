"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import type { TypographyToken } from "@/lib/types/extraction";

interface TypeScaleProps {
  typography: TypographyToken[];
}

export function TypeScale({ typography }: TypeScaleProps) {
  return (
    <div className="flex flex-col gap-6">
      {typography.map((token, index) => (
        <motion.div
          key={token.name}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.07, duration: 0.35 }}
          className="group flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 border-b border-border pb-5 last:border-0"
        >
          <div className="flex items-center gap-2 sm:w-48 shrink-0">
            <span className="text-sm text-text-secondary font-mono truncate">
              {token.name}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="text-text-primary truncate"
              style={{
                fontSize: token.fontSize,
                fontWeight: token.fontWeight,
                lineHeight: token.lineHeight,
                letterSpacing: token.letterSpacing,
                fontFamily: token.fontFamily,
              }}
            >
              The quick brown fox
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="default">{token.fontSize}</Badge>
            <Badge variant="default">{token.fontWeight}</Badge>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton
                text={`font-size: ${token.fontSize}; font-weight: ${token.fontWeight}; line-height: ${token.lineHeight};`}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

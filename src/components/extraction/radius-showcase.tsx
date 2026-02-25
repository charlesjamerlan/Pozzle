"use client";

import { motion } from "motion/react";
import { CopyButton } from "@/components/ui/copy-button";
import type { RadiusToken } from "@/lib/types/extraction";

interface RadiusShowcaseProps {
  radius: RadiusToken[];
}

export function RadiusShowcase({ radius }: RadiusShowcaseProps) {
  return (
    <div className="flex flex-wrap gap-6">
      {radius.map((token, index) => (
        <motion.div
          key={token.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.07, duration: 0.3 }}
          className="group flex flex-col items-center gap-2"
        >
          <div
            className="w-16 h-16 bg-coral/20 border-2 border-coral"
            style={{ borderRadius: token.value }}
          />
          <span className="text-sm font-medium text-text-primary">
            {token.name}
          </span>
          <span className="text-xs text-text-secondary font-mono">
            {token.value}
          </span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton text={`--radius-${token.name}: ${token.value};`} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

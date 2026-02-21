"use client";

import { motion } from "motion/react";
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
          className="flex flex-col items-center gap-2"
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
        </motion.div>
      ))}
    </div>
  );
}

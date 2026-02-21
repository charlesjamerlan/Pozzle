"use client";

import { motion } from "motion/react";
import { CopyButton } from "@/components/ui/copy-button";
import { Badge } from "@/components/ui/badge";
import { shouldUseWhiteText } from "@/lib/utils/color-utils";
import type { ColorToken } from "@/lib/types/extraction";

interface ColorGridProps {
  colors: ColorToken[];
}

export function ColorGrid({ colors }: ColorGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {colors.map((color, index) => {
        const useWhite = shouldUseWhiteText(color.hex);

        return (
          <motion.div
            key={color.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="flex flex-col gap-2"
          >
            <div
              className="relative w-full aspect-square rounded-lg flex items-end justify-between p-3 group"
              style={{ backgroundColor: color.hex }}
            >
              <span
                className="text-xs font-mono font-medium"
                style={{ color: useWhite ? "#FFFFFF" : "#111118" }}
              >
                {color.hex}
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton
                  text={color.hex}
                  className={useWhite ? "text-white hover:text-white" : "text-gray-900 hover:text-gray-900"}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {color.name}
                </p>
                <p className="text-xs text-text-tertiary truncate">
                  {color.usage}
                </p>
              </div>
              <Badge variant="default">{color.count}x</Badge>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

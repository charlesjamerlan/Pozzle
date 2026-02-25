"use client";

import { motion } from "motion/react";
import { Download } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";

interface CodeExportProps {
  code: string;
  highlightedCode: string;
  downloadLabel: string;
  onDownload: () => void;
}

export function CodeExport({
  code,
  highlightedCode,
  downloadLabel,
  onDownload,
}: CodeExportProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4"
    >
      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <CopyButton text={code} />
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary hover:bg-surface-elevated cursor-pointer"
        >
          <Download className="h-4 w-4" />
          {downloadLabel}
        </button>
      </div>

      {/* Code block */}
      <div className="relative rounded-lg bg-surface border border-border overflow-hidden">
        <pre className="overflow-x-auto p-5 text-sm leading-relaxed font-mono">
          <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
      </div>
    </motion.div>
  );
}

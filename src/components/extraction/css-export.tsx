"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { Download } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { generateCssVariables } from "@/lib/utils/css-generator";
import { downloadCssFile } from "@/lib/utils/download";
import type { ExtractionResult } from "@/lib/types/extraction";

interface CssExportProps {
  result: ExtractionResult;
}

function highlightCss(css: string): string {
  return css
    .split("\n")
    .map((line) => {
      // Comments
      if (/^\s*\/\*/.test(line) || /^\s*\*/.test(line)) {
        return `<span class="text-text-tertiary">${escapeHtml(line)}</span>`;
      }

      // Property: value lines (e.g.  --color-primary: #FF6B5E;)
      const propMatch = line.match(/^(\s*)(--[\w-]+)(:)(.+)(;?)$/);
      if (propMatch) {
        const [, indent, prop, colon, value, semi] = propMatch;
        return `${escapeHtml(indent)}<span class="text-coral">${escapeHtml(prop)}</span>${escapeHtml(colon)}<span class="text-accent-blue">${escapeHtml(value)}</span>${escapeHtml(semi)}`;
      }

      return escapeHtml(line);
    })
    .join("\n");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function CssExport({ result }: CssExportProps) {
  const cssString = useMemo(() => generateCssVariables(result), [result]);
  const highlightedCss = useMemo(() => highlightCss(cssString), [cssString]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4"
    >
      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <CopyButton text={cssString} />
        <button
          type="button"
          onClick={() => downloadCssFile(cssString)}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary hover:bg-surface-elevated cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Download .css
        </button>
      </div>

      {/* Code block */}
      <div className="relative rounded-lg bg-surface border border-border overflow-hidden">
        <pre className="overflow-x-auto p-5 text-sm leading-relaxed font-mono">
          <code dangerouslySetInnerHTML={{ __html: highlightedCss }} />
        </pre>
      </div>
    </motion.div>
  );
}

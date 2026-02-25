"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils/cn";
import { CodeExport } from "@/components/extraction/code-export";
import { PdfReport } from "@/components/extraction/pdf-report";
import { generateCssVariables } from "@/lib/utils/css-generator";
import { generateTailwindTheme } from "@/lib/utils/tailwind-generator";
import { generateDTCGTokens } from "@/lib/utils/dtcg-generator";
import { highlightCss, highlightJson } from "@/lib/utils/syntax-highlight";
import {
  downloadCssFile,
  downloadJsonFile,
  downloadTextFile,
} from "@/lib/utils/download";
import type { ExtractionResult } from "@/lib/types/extraction";
import type { ConsistencyReport } from "@/lib/types/consistency";

interface ExportPanelProps {
  result: ExtractionResult;
  report: ConsistencyReport;
}

const formats = [
  { key: "css", label: "CSS Variables" },
  { key: "tailwind", label: "Tailwind v4" },
  { key: "dtcg", label: "JSON (DTCG)" },
  { key: "pdf", label: "PDF Report" },
] as const;

type FormatKey = (typeof formats)[number]["key"];

export function ExportPanel({ result, report }: ExportPanelProps) {
  const [activeFormat, setActiveFormat] = useState<FormatKey>("css");

  const cssCode = useMemo(() => generateCssVariables(result), [result]);
  const tailwindCode = useMemo(() => generateTailwindTheme(result), [result]);
  const dtcgCode = useMemo(() => generateDTCGTokens(result), [result]);

  const highlightedCss = useMemo(() => highlightCss(cssCode), [cssCode]);
  const highlightedTailwind = useMemo(
    () => highlightCss(tailwindCode),
    [tailwindCode],
  );
  const highlightedDtcg = useMemo(() => highlightJson(dtcgCode), [dtcgCode]);

  return (
    <div className="flex flex-col gap-6">
      {/* Format switcher */}
      <div className="flex flex-wrap gap-2">
        {formats.map((format) => (
          <button
            key={format.key}
            type="button"
            onClick={() => setActiveFormat(format.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              activeFormat === format.key
                ? "bg-coral text-white"
                : "bg-surface-elevated text-text-secondary hover:text-text-primary",
            )}
          >
            {format.label}
          </button>
        ))}
      </div>

      {/* Format content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFormat}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeFormat === "css" && (
            <CodeExport
              code={cssCode}
              highlightedCode={highlightedCss}
              downloadLabel="Download .css"
              onDownload={() => downloadCssFile(cssCode)}
            />
          )}
          {activeFormat === "tailwind" && (
            <CodeExport
              code={tailwindCode}
              highlightedCode={highlightedTailwind}
              downloadLabel="Download .css"
              onDownload={() =>
                downloadTextFile(
                  tailwindCode,
                  "tailwind-theme.css",
                  "text/css;charset=utf-8",
                )
              }
            />
          )}
          {activeFormat === "dtcg" && (
            <CodeExport
              code={dtcgCode}
              highlightedCode={highlightedDtcg}
              downloadLabel="Download .json"
              onDownload={() => downloadJsonFile(dtcgCode)}
            />
          )}
          {activeFormat === "pdf" && (
            <PdfReport result={result} report={report} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

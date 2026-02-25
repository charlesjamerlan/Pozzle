"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils/cn";
import { ColorGrid } from "@/components/extraction/color-grid";
import { TypeScale } from "@/components/extraction/type-scale";
import { SpacingScale } from "@/components/extraction/spacing-scale";
import { RadiusShowcase } from "@/components/extraction/radius-showcase";
import { ConsistencyReportView } from "@/components/extraction/consistency-report";
import { ExportPanel } from "@/components/extraction/export-panel";
import type { ExtractionResult } from "@/lib/types/extraction";
import type { ConsistencyReport } from "@/lib/types/consistency";

interface ResultsPanelProps {
  result: ExtractionResult;
  report: ConsistencyReport;
}

const tabs = [
  { key: "colors", label: "Colors" },
  { key: "typography", label: "Typography" },
  { key: "spacing", label: "Spacing" },
  { key: "radius", label: "Radius" },
  { key: "report", label: "Report" },
  { key: "export", label: "Export" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export function ResultsPanel({ result, report }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("colors");

  const formattedDate = new Date(result.timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col gap-6 w-full"
    >
      {/* Header info */}
      <div className="text-sm text-text-secondary">
        <span>{result.url}</span>
        <span className="mx-2">&middot;</span>
        <span>{formattedDate}</span>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
              activeTab === tab.key
                ? "text-text-primary border-b-2 border-coral"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "colors" && <ColorGrid colors={result.colors} />}
          {activeTab === "typography" && (
            <TypeScale typography={result.typography} />
          )}
          {activeTab === "spacing" && (
            <SpacingScale spacing={result.spacing} />
          )}
          {activeTab === "radius" && <RadiusShowcase radius={result.radius} />}
          {activeTab === "report" && (
            <ConsistencyReportView report={report} />
          )}
          {activeTab === "export" && <ExportPanel result={result} report={report} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

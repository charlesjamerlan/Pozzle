"use client";

import { motion } from "motion/react";
import { FileDown } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import type { ExtractionResult } from "@/lib/types/extraction";
import type { ConsistencyReport } from "@/lib/types/consistency";

interface PdfReportProps {
  result: ExtractionResult;
  report: ConsistencyReport;
}

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "#22c55e";
  if (grade.startsWith("B")) return "#eab308";
  if (grade.startsWith("C")) return "#f97316";
  return "#ef4444";
}

function buildPrintHtml(result: ExtractionResult, report: ConsistencyReport): string {
  const date = new Date(result.timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const colorSwatches = result.colors
    .map(
      (c) =>
        `<div style="display:inline-flex;flex-direction:column;align-items:center;gap:4px;margin:6px">
          <div style="width:48px;height:48px;border-radius:6px;background:${c.hex};border:1px solid #ddd"></div>
          <span style="font-size:10px;color:#666">${c.hex}</span>
          <span style="font-size:10px">${c.name}</span>
        </div>`,
    )
    .join("");

  const typographyRows = result.typography
    .map(
      (t) =>
        `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;font-family:monospace;font-size:13px">${t.name}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee">${t.fontSize}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee">${t.fontWeight}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee">${t.lineHeight}</td>
        </tr>`,
    )
    .join("");

  const spacingRows = result.spacing
    .map(
      (s) =>
        `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;font-family:monospace;font-size:13px">${s.name}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee">${s.value}</td>
        </tr>`,
    )
    .join("");

  const radiusRows = result.radius
    .map(
      (r) =>
        `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;font-family:monospace;font-size:13px">${r.name}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee">${r.value}</td>
        </tr>`,
    )
    .join("");

  const metricRows = report.metrics
    .map(
      (m) =>
        `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #eee">${m.category}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${m.score}/100</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${m.unique}/${m.total}</td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <title>Pozzle Report — ${result.url}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1a1a2e; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    h2 { font-size: 18px; margin: 32px 0 12px; border-bottom: 2px solid #eee; padding-bottom: 6px; }
    .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
    .grade-badge { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 8px; font-size: 22px; font-weight: 700; color: #fff; }
    .score-row { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .score-label { font-size: 14px; color: #666; }
    .score-value { font-size: 32px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { text-align: left; padding: 8px 12px; background: #f5f5f5; border-bottom: 2px solid #ddd; font-weight: 600; }
    .swatches { display: flex; flex-wrap: wrap; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>Pozzle Design Token Report</h1>
  <p class="meta">${result.url} &mdash; ${date}</p>

  <div class="score-row">
    <div class="grade-badge" style="background:${gradeColor(report.grade)}">${report.grade}</div>
    <div>
      <div class="score-value">${report.overallScore}<span style="font-size:16px;color:#666">/100</span></div>
      <div class="score-label">Consistency Score</div>
    </div>
  </div>

  <h2>Consistency Metrics</h2>
  <table>
    <thead><tr><th>Category</th><th style="text-align:center">Score</th><th style="text-align:center">Unique / Total</th></tr></thead>
    <tbody>${metricRows}</tbody>
  </table>

  <h2>Colors (${result.colors.length})</h2>
  <div class="swatches">${colorSwatches}</div>

  <h2>Typography (${result.typography.length})</h2>
  <table>
    <thead><tr><th>Name</th><th>Size</th><th>Weight</th><th>Line Height</th></tr></thead>
    <tbody>${typographyRows}</tbody>
  </table>

  <h2>Spacing (${result.spacing.length})</h2>
  <table>
    <thead><tr><th>Name</th><th>Value</th></tr></thead>
    <tbody>${spacingRows}</tbody>
  </table>

  <h2>Border Radius (${result.radius.length})</h2>
  <table>
    <thead><tr><th>Name</th><th>Value</th></tr></thead>
    <tbody>${radiusRows}</tbody>
  </table>

  <h2>Top Issues</h2>
  <ul style="padding-left:20px;font-size:14px;line-height:1.8">
    ${report.topIssues.map((i) => `<li>${i}</li>`).join("")}
  </ul>

  <h2>Recommendations</h2>
  <ul style="padding-left:20px;font-size:14px;line-height:1.8">
    ${report.recommendations.map((r) => `<li>${r}</li>`).join("")}
  </ul>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;
}

export function PdfReport({ result, report }: PdfReportProps) {
  const { toast } = useToast();

  const tokenCounts = {
    colors: result.colors.length,
    typography: result.typography.length,
    spacing: result.spacing.length,
    radius: result.radius.length,
    total:
      result.colors.length +
      result.typography.length +
      result.spacing.length +
      result.radius.length,
  };

  const handleDownload = () => {
    const html = buildPrintHtml(result, report);
    const popup = window.open("", "_blank");
    if (!popup) {
      toast("Popup blocked — please allow popups for this site");
      return;
    }
    popup.document.write(html);
    popup.document.close();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6"
    >
      {/* Summary card */}
      <div className="rounded-lg bg-surface border border-border p-6">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-lg text-2xl font-bold text-white"
            style={{ backgroundColor: gradeColor(report.grade) }}
          >
            {report.grade}
          </div>
          <div>
            <p className="text-3xl font-bold text-text-primary">
              {report.overallScore}
              <span className="text-base text-text-tertiary">/100</span>
            </p>
            <p className="text-sm text-text-secondary">Consistency Score</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Colors", count: tokenCounts.colors },
            { label: "Typography", count: tokenCounts.typography },
            { label: "Spacing", count: tokenCounts.spacing },
            { label: "Radius", count: tokenCounts.radius },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-md bg-surface-elevated px-4 py-3 text-center"
            >
              <p className="text-xl font-semibold text-text-primary">
                {item.count}
              </p>
              <p className="text-xs text-text-secondary">{item.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm text-text-secondary text-center">
          {tokenCounts.total} tokens extracted from{" "}
          <span className="text-text-primary">{result.url}</span>
        </p>
      </div>

      {/* Download button */}
      <button
        type="button"
        onClick={handleDownload}
        className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium bg-coral text-white transition-colors hover:bg-coral/90 cursor-pointer"
      >
        <FileDown className="h-4 w-4" />
        Download as PDF
      </button>
    </motion.div>
  );
}

import { saveAs } from "file-saver";

export function downloadCssFile(css: string, filename: string = "design-tokens.css") {
  const blob = new Blob([css], { type: "text/css;charset=utf-8" });
  saveAs(blob, filename);
}

export function downloadJsonFile(json: string, filename: string = "design-tokens.json") {
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  saveAs(blob, filename);
}

export function downloadTextFile(content: string, filename: string, mimeType: string = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  saveAs(blob, filename);
}

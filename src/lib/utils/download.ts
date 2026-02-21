import { saveAs } from "file-saver";

export function downloadCssFile(css: string, filename: string = "design-tokens.css") {
  const blob = new Blob([css], { type: "text/css;charset=utf-8" });
  saveAs(blob, filename);
}

import { config } from "@/lib/config";

export interface CrawlResult {
  success: boolean;
  pages: number;
  cssText: string;
  mode: "browserless" | "lightweight" | "mock";
}

const MAX_CSS_BYTES = 2 * 1024 * 1024; // 2 MB
const TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Public entry
// ---------------------------------------------------------------------------

export async function crawlUrl(url: string): Promise<CrawlResult> {
  // Browserless path — full JS-rendered crawl
  if (config.browserless.enabled) {
    try {
      return await crawlBrowserless(url);
    } catch (err) {
      console.warn("[Browserless] Failed, falling back to lightweight:", err);
    }
  }

  // Lightweight HTTP path
  try {
    return await crawlLightweight(url);
  } catch (err) {
    console.warn("[Lightweight] Crawl failed:", err);
    return { success: false, pages: 0, cssText: "", mode: "lightweight" };
  }
}

// ---------------------------------------------------------------------------
// Lightweight crawl — fetch HTML + resolve & fetch stylesheets
// ---------------------------------------------------------------------------

async function crawlLightweight(url: string): Promise<CrawlResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "PozzleBot/1.0 (+https://pozzle.dev)",
        Accept: "text/html",
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const cssText = await extractCssFromHtml(html, url, controller.signal);

    return {
      success: true,
      pages: 1,
      cssText: cssText.slice(0, MAX_CSS_BYTES),
      mode: "lightweight",
    };
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Browserless crawl — headless Chrome via Browserless /function endpoint
// ---------------------------------------------------------------------------

async function crawlBrowserless(url: string): Promise<CrawlResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS * 2); // longer timeout for browser

  try {
    const fnUrl = `${config.browserless.endpoint}/function?token=${config.browserless.apiKey}`;

    const res = await fetch(fnUrl, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: getBrowserlessCode(),
        context: { url },
      }),
    });

    if (!res.ok) throw new Error(`Browserless HTTP ${res.status}`);

    const data = (await res.json()) as { css?: string };
    const cssText = (data.css ?? "").slice(0, MAX_CSS_BYTES);

    return { success: true, pages: 1, cssText, mode: "browserless" };
  } finally {
    clearTimeout(timer);
  }
}

function getBrowserlessCode(): string {
  return `
    module.exports = async ({ page, context }) => {
      await page.goto(context.url, { waitUntil: 'networkidle0', timeout: 15000 });

      const css = await page.evaluate(() => {
        const sheets = [...document.styleSheets];
        let allCss = '';
        for (const sheet of sheets) {
          try {
            const rules = [...sheet.cssRules];
            allCss += rules.map(r => r.cssText).join('\\n');
          } catch { /* cross-origin sheet, skip */ }
        }
        // Also grab inline <style> tags
        document.querySelectorAll('style').forEach(el => {
          allCss += '\\n' + el.textContent;
        });
        return allCss;
      });

      return { data: { css }, type: 'application/json' };
    };
  `;
}

// ---------------------------------------------------------------------------
// HTML → CSS extraction helpers
// ---------------------------------------------------------------------------

async function extractCssFromHtml(
  html: string,
  baseUrl: string,
  signal: AbortSignal,
): Promise<string> {
  const parts: string[] = [];

  // 1. Inline <style> tags
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match: RegExpExecArray | null;
  while ((match = styleRegex.exec(html)) !== null) {
    parts.push(match[1]);
  }

  // 2. External <link rel="stylesheet"> hrefs
  const linkRegex = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
  const hrefRegex = /href=["']([^"']+)["']/i;
  const hrefs: string[] = [];

  while ((match = linkRegex.exec(html)) !== null) {
    const hrefMatch = hrefRegex.exec(match[0]);
    if (hrefMatch) hrefs.push(hrefMatch[1]);
  }

  // Also match <link href="..." rel="stylesheet"> (href before rel)
  const linkRegex2 = /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']stylesheet["'][^>]*>/gi;
  while ((match = linkRegex2.exec(html)) !== null) {
    if (!hrefs.includes(match[1])) hrefs.push(match[1]);
  }

  // Fetch external stylesheets in parallel (max 10)
  const fetches = hrefs.slice(0, 10).map(async (href) => {
    try {
      const resolved = new URL(href, baseUrl).toString();
      const res = await fetch(resolved, {
        signal,
        headers: { "User-Agent": "PozzleBot/1.0" },
      });
      if (res.ok) return await res.text();
    } catch {
      /* skip unreachable sheets */
    }
    return "";
  });

  const externalCss = await Promise.all(fetches);
  parts.push(...externalCss);

  // 3. Inline style attributes (extract values for token mining)
  const inlineRegex = /style=["']([^"']+)["']/gi;
  while ((match = inlineRegex.exec(html)) !== null) {
    // Wrap in a dummy selector so the CSS parser can handle it
    parts.push(`.__inline { ${match[1]} }`);
  }

  return parts.join("\n");
}

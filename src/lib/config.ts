/** Centralized config — detects which services are available via env vars. */

export const config = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    get enabled() {
      return this.apiKey.length > 0;
    },
    model: "claude-sonnet-4-20250514" as const,
  },

  browserless: {
    apiKey: process.env.BROWSERLESS_API_KEY ?? "",
    get enabled() {
      return this.apiKey.length > 0;
    },
    endpoint: "https://chrome.browserless.io",
  },

  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    secretKey: process.env.SUPABASE_SECRET_KEY ?? "",
    get enabled() {
      return this.url.length > 0 && this.publishableKey.length > 0;
    },
  },
} as const;

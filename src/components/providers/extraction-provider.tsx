"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ExtractionResult } from "@/lib/types/extraction";
import type { ConsistencyReport } from "@/lib/types/consistency";

type ExtractionStep = "email" | "url" | "analyzing" | "results";

interface ExtractionState {
  step: ExtractionStep;
  email: string | null;
  url: string | null;
  result: ExtractionResult | null;
  report: ConsistencyReport | null;
  error: string | null;
}

interface ExtractionContextValue extends ExtractionState {
  submitEmail: (email: string) => void;
  submitUrl: (url: string) => Promise<void>;
  reset: () => void;
}

const ExtractionContext = createContext<ExtractionContextValue | null>(null);

const initialState: ExtractionState = {
  step: "email",
  email: null,
  url: null,
  result: null,
  report: null,
  error: null,
};

export function ExtractionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExtractionState>(initialState);

  const submitEmail = useCallback((email: string) => {
    setState((prev) => ({ ...prev, email, step: "url" }));
  }, []);

  const submitUrl = useCallback(async (url: string) => {
    setState((prev) => ({ ...prev, url, step: "analyzing", error: null }));
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Extraction failed");
      const data = await res.json();
      setState((prev) => ({
        ...prev,
        step: "results",
        result: data.extraction,
        report: data.report,
      }));
    } catch {
      setState((prev) => ({ ...prev, step: "url", error: "Something went wrong. Please try again." }));
    }
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <ExtractionContext.Provider value={{ ...state, submitEmail, submitUrl, reset }}>
      {children}
    </ExtractionContext.Provider>
  );
}

export function useExtractionContext() {
  const context = useContext(ExtractionContext);
  if (!context) throw new Error("useExtractionContext must be used within ExtractionProvider");
  return context;
}

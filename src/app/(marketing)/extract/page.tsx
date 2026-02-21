"use client";

import { AnimatePresence, motion } from "motion/react";
import { ExtractionProvider, useExtractionContext } from "@/components/providers/extraction-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { EmailGate } from "@/components/extraction/email-gate";
import { UrlInput } from "@/components/extraction/url-input";
import { AnalyzingAnimation } from "@/components/extraction/analyzing-animation";
import { ResultsPanel } from "@/components/extraction/results-panel";

function ExtractionFlow() {
  const { step, result, report } = useExtractionContext();

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <AnimatePresence mode="wait">
        {step === "email" && (
          <motion.div
            key="email"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <EmailGate />
          </motion.div>
        )}
        {step === "url" && (
          <motion.div
            key="url"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <UrlInput />
          </motion.div>
        )}
        {step === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AnalyzingAnimation />
          </motion.div>
        )}
        {step === "results" && result && report && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ResultsPanel result={result} report={report} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ExtractPage() {
  return (
    <AuthProvider>
      <ExtractionProvider>
        <ExtractionFlow />
      </ExtractionProvider>
    </AuthProvider>
  );
}

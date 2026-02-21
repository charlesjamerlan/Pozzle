"use client";

import { useState, useRef, type FormEvent, type ClipboardEvent } from "react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { useExtractionContext } from "@/components/providers/extraction-provider";

export function UrlInput() {
  const { email, submitUrl, error } = useExtractionContext();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      await submitUrl(trimmed);
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text/plain").trim();
    if (pasted) {
      setUrl(pasted);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          await submitUrl(pasted);
        } finally {
          setLoading(false);
        }
      }, 400);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center gap-8 w-full max-w-md mx-auto px-4"
    >
      <div className="text-center space-y-3">
        <h2 className="font-serif text-2xl text-text-primary">
          Paste your website URL
        </h2>
        <p className="text-text-secondary text-sm">
          Signed in as{" "}
          <span className="text-coral font-medium">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <Input
          type="url"
          placeholder="https://yoursite.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onPaste={handlePaste}
          error={error ?? undefined}
          required
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full rounded-lg bg-gradient-to-r from-coral to-coral/80 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>
    </motion.div>
  );
}

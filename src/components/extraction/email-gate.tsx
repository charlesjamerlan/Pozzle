"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { useExtractionContext } from "@/components/providers/extraction-provider";

export function EmailGate() {
  const { submitEmail } = useExtractionContext();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);

    // Fire-and-forget email collection
    fetch("/api/auth/collect-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {
      // Silently ignore — fire and forget
    });

    submitEmail(email);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center gap-8 w-full max-w-md mx-auto px-4"
    >
      <div className="text-center space-y-3">
        <h1 className="font-serif text-3xl text-text-primary">
          Let&apos;s analyze your design system
        </h1>
        <p className="text-text-secondary text-base">
          Enter your email to get started — it&apos;s free
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <Input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full rounded-lg bg-gradient-to-r from-coral to-coral/80 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Loading..." : "Continue"}
        </button>
      </form>
    </motion.div>
  );
}

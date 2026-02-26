"use client";

import Link from "next/link";
import { motion } from "motion/react";

function CtaSection() {
  return (
    <section className="relative overflow-hidden py-24">
      {/* Subtle coral gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          background:
            "radial-gradient(ellipse at center, #FF6B5E 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="font-serif text-3xl text-text-primary md:text-5xl md:leading-tight tracking-tight"
        >
          Ready to decode your design system?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary"
        >
          No sign-up required. Paste a URL and get your design tokens in under a
          minute.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="mt-10"
        >
          <Link
            href="/extract"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-coral to-coral-light px-7 py-3 text-base font-medium text-white shadow-[0_0_40px_rgba(255,107,94,0.3)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(255,107,94,0.4)] active:scale-[0.98]"
          >
            Start Free Analysis
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export { CtaSection };

"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { GradientText } from "@/components/ui/gradient-text";

function Hero() {
  return (
    <section className="flex flex-col items-center justify-center px-6 pb-24 pt-32 text-center md:pt-40">
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-4xl font-serif text-5xl leading-tight text-text-primary md:text-7xl md:leading-tight"
      >
        Reverse-engineer any <GradientText>design system</GradientText> in
        seconds
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        className="mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary"
      >
        Paste any URL and Pozzle extracts every color, font, spacing, and radius
        token — then gives you a clean, ready-to-use design system.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
        className="mt-10"
      >
        <Link
          href="/extract"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-coral to-coral-light px-7 py-3 text-base font-medium text-white shadow-lg shadow-coral/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Analyze Your Site Free
        </Link>
      </motion.div>
    </section>
  );
}

export { Hero };

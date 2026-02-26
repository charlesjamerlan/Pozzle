"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { GradientText } from "@/components/ui/gradient-text";

function Hero() {
  const line1 = "Reverse-engineer any";
  const line2 = "in seconds";
  const words1 = line1.split(" ");
  const words2 = line2.split(" ");

  return (
    <section className="relative overflow-hidden flex flex-col items-center justify-center px-6 pb-24 pt-32 text-center md:pt-40">
      {/* Background coral glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(ellipse, #FF6B5E, transparent 70%)" }}
        aria-hidden="true"
      />

      <h1 className="max-w-4xl font-serif text-5xl leading-tight text-text-primary md:text-8xl lg:text-[88px] md:leading-tight tracking-tight">
        {words1.map((word, i) => (
          <motion.span
            key={`w1-${i}`}
            className="inline-block mr-[0.25em]"
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.06 }}
          >
            {word}
          </motion.span>
        ))}{" "}
        <motion.span
          className="inline-block"
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: words1.length * 0.06 }}
        >
          <GradientText>design system</GradientText>
        </motion.span>{" "}
        {words2.map((word, i) => (
          <motion.span
            key={`w2-${i}`}
            className="inline-block mr-[0.25em]"
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: (words1.length + 1 + i) * 0.06 }}
          >
            {word}
          </motion.span>
        ))}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
        className="mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary"
      >
        Paste any URL and Pozzle extracts every color, font, spacing, and radius
        token — then gives you a clean, ready-to-use design system.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.65 }}
        className="mt-10"
      >
        <Link
          href="/extract"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-coral to-coral-light px-7 py-3 text-base font-medium text-white shadow-[0_0_40px_rgba(255,107,94,0.3)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(255,107,94,0.4)] active:scale-[0.98]"
        >
          Analyze Your Site Free
        </Link>
      </motion.div>
    </section>
  );
}

export { Hero };

"use client";

import { motion } from "motion/react";

function SocialProof() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-8"
      >
        <p className="text-sm uppercase tracking-wider text-text-secondary">
          Trusted by design-forward teams
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-8 w-20 rounded-md bg-surface-elevated"
              aria-hidden="true"
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export { SocialProof };

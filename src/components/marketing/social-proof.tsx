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
        className="flex flex-col items-center"
      >
        <div className="w-full max-w-md border-t border-dashed border-border" />
        <p className="mt-8 text-sm uppercase tracking-wider text-text-secondary">
          Trusted by design-forward teams
        </p>
      </motion.div>
    </section>
  );
}

export { SocialProof };

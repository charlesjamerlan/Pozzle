"use client";

import { motion } from "motion/react";

interface Step {
  number: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Paste your URL",
    description: "Drop in any website URL and we'll crawl it instantly.",
  },
  {
    number: 2,
    title: "We extract everything",
    description:
      "Colors, typography, spacing, and border radius — all mapped automatically.",
  },
  {
    number: 3,
    title: "Get your tokens",
    description:
      "Download ready-to-use CSS variables or copy individual values.",
  },
];

function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-16 text-center font-serif text-3xl text-text-primary md:text-4xl"
      >
        How it works
      </motion.h2>

      <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
        {/* Connecting line — horizontal on desktop, vertical on mobile */}
        <div className="absolute left-6 top-6 hidden h-px w-[calc(100%-48px)] border-t border-dashed border-border md:block" />
        <div className="absolute left-6 top-0 h-full w-px border-l border-dashed border-border md:hidden" />

        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              delay: index * 0.15,
            }}
            className="relative flex flex-col items-start gap-4 pl-16 md:items-center md:pl-0 md:text-center"
          >
            {/* Numbered circle */}
            <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full gradient-coral md:relative md:left-auto md:top-auto">
              <span className="text-sm font-semibold text-white">
                {step.number}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-text-primary">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export { HowItWorks };

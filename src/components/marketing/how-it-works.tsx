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
        className="mb-16 text-center font-serif text-4xl text-text-primary md:text-5xl"
      >
        How it works
      </motion.h2>

      <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
        {/* Connecting line — horizontal on desktop */}
        <motion.div
          className="absolute left-6 top-6 hidden h-px w-[calc(100%-48px)] origin-left border-t border-dashed border-border md:block"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
        {/* Connecting line — vertical on mobile */}
        <motion.div
          className="absolute left-6 top-0 h-full w-px origin-top border-l border-dashed border-border md:hidden"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />

        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              delay: 0.3 + index * 0.15,
            }}
            className="relative flex flex-col items-start gap-4 pl-16 md:items-center md:pl-0 md:text-center"
          >
            {/* Numbered circle with spring scale */}
            <motion.div
              className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full gradient-coral md:relative md:left-auto md:top-auto"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 12,
                delay: 0.4 + index * 0.15,
              }}
            >
              <span className="text-sm font-semibold text-white">
                {step.number}
              </span>
            </motion.div>

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

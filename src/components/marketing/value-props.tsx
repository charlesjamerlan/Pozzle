"use client";

import { motion } from "motion/react";
import { Palette, GitCompare, Globe, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ValueProp {
  icon: LucideIcon;
  title: string;
  description: string;
}

const valueProps: ValueProp[] = [
  {
    icon: Palette,
    title: "Extract",
    description:
      "Pull every color, font, spacing, and radius token from any live website in seconds.",
  },
  {
    icon: GitCompare,
    title: "Reconcile",
    description:
      "Identify inconsistencies and get AI-powered recommendations to clean up your system.",
  },
  {
    icon: Globe,
    title: "Host",
    description:
      "Publish your tokens as a living, versioned design system accessible to your entire team.",
  },
];

const directions = [
  { x: -30, y: 0 },   // Extract: from left
  { x: 0, y: 30 },    // Reconcile: from below
  { x: 30, y: 0 },    // Host: from right
];

function ValueProps() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {valueProps.map((prop, index) => {
          const Icon = prop.icon;
          const dir = directions[index];
          return (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, x: dir.x, y: dir.y }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: index * 0.12,
              }}
            >
              <Card hover className="flex flex-col items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-coral/10">
                  <Icon className="h-6 w-6 text-coral" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {prop.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {prop.description}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export { ValueProps };

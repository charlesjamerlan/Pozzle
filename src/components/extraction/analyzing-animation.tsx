"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, Palette, Type, Ruler, Check } from "lucide-react";

const phases = [
  { label: "Crawling website...", Icon: Globe },
  { label: "Extracting colors...", Icon: Palette },
  { label: "Analyzing typography...", Icon: Type },
  { label: "Mapping spacing...", Icon: Ruler },
] as const;

export function AnalyzingAnimation() {
  const [activePhase, setActivePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhase((prev) => {
        if (prev < phases.length - 1) return prev + 1;
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const progress = ((activePhase + 1) / phases.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center gap-10 w-full max-w-sm mx-auto px-4 py-16"
    >
      <div className="flex flex-col gap-5 w-full">
        {phases.map((phase, index) => {
          const isActive = index === activePhase;
          const isCompleted = index < activePhase;

          return (
            <motion.div
              key={phase.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15, duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className="relative flex items-center justify-center w-8 h-8">
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-green/10"
                    >
                      <Check className="h-4 w-4 text-accent-green" />
                    </motion.div>
                  ) : isActive ? (
                    <motion.div
                      key="active"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="relative flex items-center justify-center w-8 h-8"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <phase.Icon className="h-4 w-4 text-coral" />
                      </motion.div>
                      <motion.div
                        animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0 rounded-full bg-coral/20"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pending"
                      className="flex items-center justify-center w-8 h-8"
                    >
                      <phase.Icon className="h-4 w-4 text-text-tertiary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <span
                className={
                  isActive
                    ? "text-sm font-medium text-text-primary"
                    : isCompleted
                      ? "text-sm text-accent-green"
                      : "text-sm text-text-tertiary"
                }
              >
                {phase.label}
              </span>

              {isActive && (
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-coral"
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-coral to-coral/70"
        />
      </div>
    </motion.div>
  );
}

// components/ui/BreakCard.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Timer, Coffee } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/classNames";

export interface BreakCardProps {
  isVisible: boolean;
  isBreakNow: boolean;
  timeLeft?: string | null;
  durationMinutes: number;
  subjectColor?: string;
  gradientColors?: string[];
  className?: string;
  label?: string;
  leftLabel?: string;
  minutesLabel?: string;
  showIcon?: boolean;
}

export function BreakCard({
  isVisible,
  isBreakNow,
  timeLeft,
  durationMinutes,
  subjectColor,
  gradientColors,
  className,
  label = "Break",
  leftLabel = "Left",
  minutesLabel = "min",
  showIcon = true,
}: BreakCardProps) {
  const backgroundStyle =
    gradientColors && gradientColors.length >= 2
      ? {
          backgroundImage: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`,
        }
      : {
          backgroundColor: subjectColor || "var(--color-indigo-500)",
        };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0, marginBottom: 0 }}
          animate={{ height: 48, opacity: 1, marginBottom: 8 }}
          exit={{ height: 0, opacity: 0, marginBottom: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.015, y: -2 }}
          className={cn("overflow-hidden flex justify-center w-full", className)}
        >
          <div className="mx-6 h-12 rounded-[18px] w-full max-w-[calc(100%-48px)] bg-white dark:bg-zinc-900 shadow-[0_2px_5px_rgba(0,0,0,.05)] overflow-hidden relative flex items-center justify-center">
            <div
              className={cn(
                "absolute inset-0 z-0",
                isBreakNow ? "opacity-15" : "opacity-5"
              )}
              style={backgroundStyle}
            />

            <div className="relative z-10 flex flex-row items-center justify-center px-4">
              {showIcon && <motion.div
                key={isBreakNow ? "timer" : "coffee"}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 12,
                }}
                whileHover={{ rotate: isBreakNow ? 12 : -8, scale: 1.12 }}
                className="mr-2"
              >
                {isBreakNow ? (
                  <Timer
                    size={16}
                    weight="bold"
                    className="text-zinc-900 dark:text-white"
                  />
                ) : (
                  <Coffee
                    size={16}
                    weight="regular"
                    className="text-zinc-500 dark:text-zinc-400"
                  />
                )}
              </motion.div>}

              <span
                className={cn(
                  "text-[13px] tracking-wide",
                  isBreakNow
                    ? "text-zinc-900 dark:text-white font-bold"
                    : "text-zinc-500 dark:text-zinc-400 font-semibold"
                )}
              >
                {isBreakNow
                  ? `${leftLabel} ${timeLeft}`
                  : `${label} ${durationMinutes} ${minutesLabel}`}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

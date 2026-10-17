"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const transitionKey = pathname.replace(/^\/([^/]+)\/wiki(?:\/[^/]+)?$/, "/$1/wiki");

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-1 w-full flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { fadeInUp } from "@/lib/framer-variants";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
}

export const ScrollReveal = ({ children, className }: ScrollRevealProps) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={fadeInUp}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "50px 0px", amount: 0.1 }} 
      className={className || ""}
    >
      {children}
    </motion.div>
  );
};
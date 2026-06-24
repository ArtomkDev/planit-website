"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { fadeInUp } from "@/lib/framer-variants";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
}

export const ScrollReveal = ({ children, className }: ScrollRevealProps) => {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px 0px -50px 0px", amount: 0.1 }}
      className={`will-change-[opacity,transform] ${className || ""}`}
    >
      {children}
    </motion.div>
  );
};
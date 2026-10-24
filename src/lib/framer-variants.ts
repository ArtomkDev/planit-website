import { Variants } from "framer-motion";

export const fadeInUp: Variants = {
  hidden: { opacity: 1, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { 
      staggerChildren: 0.03,
      delayChildren: 0.05
    },
  },
};

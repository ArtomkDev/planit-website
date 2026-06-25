"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MouseEvent as ReactMouseEvent, useEffect, useRef, ReactNode } from "react";
import { fadeInUp } from "@/lib/framer-variants";
import { cn } from "@/lib/utils/classNames";

export interface BentoCardProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  spotlightColor?: string;
  pattern?: ReactNode;
}

export const BentoCard = ({
  children,
  className,
  contentClassName,
  colorPrimary = "rgba(99, 102, 241, 0.12)",
  colorSecondary = "rgba(168, 85, 247, 0.12)",
  spotlightColor = "rgba(99, 102, 241, 0.15)",
  pattern,
}: BentoCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);

  const smoothMouseX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 120, damping: 20 });
  const smoothTiltX = useSpring(tiltX, { stiffness: 100, damping: 18 });
  const smoothTiltY = useSpring(tiltY, { stiffness: 100, damping: 18 });

  const rotateX = useTransform(smoothTiltY, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(smoothTiltX, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    mouseX.set(localX);
    mouseY.set(localY);
    tiltX.set(localX / width - 0.5);
    tiltY.set(localY / height - 0.5);
  };

  const handleMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const spotlight = useMotionTemplate`radial-gradient(700px circle at ${smoothMouseX}px ${smoothMouseY}px, ${spotlightColor}, transparent 100%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      variants={fadeInUp}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      // Змінено scale з 0.98 на 1.03, щоб картка піднімалася вгору при наведенні
      whileHover={{ scale: 1.03 }}
      className={cn(
        "relative rounded-[2.5rem] flex flex-col group group/card transition-all duration-700 perspective-1000 transform-gpu shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.65)]",
        className
      )}
    >
      <div className="absolute inset-0 z-0 pointer-events-none rounded-[2.5rem] overflow-hidden bg-zinc-50/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800/50 transition-colors duration-500 group-hover/card:border-zinc-300/80 dark:group-hover/card:border-zinc-700/80">
        <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000 overflow-hidden z-0">
          <motion.div
            animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] blur-[140px] opacity-60 mix-blend-normal dark:mix-blend-lighten"
            style={{
              background: `conic-gradient(from 0deg at 50% 50%, ${colorPrimary} 0%, transparent 20%, ${colorSecondary} 50%, transparent 80%, ${colorPrimary} 100%)`,
            }}
          />

          <motion.div
            animate={{ rotate: [360, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[50%] -right-[50%] w-[200%] h-[200%] blur-[120px] opacity-50 mix-blend-normal dark:mix-blend-lighten"
            style={{
              background: `radial-gradient(ellipse at center, ${colorSecondary} 0%, transparent 70%)`,
            }}
          />

          <motion.div
            className="absolute inset-0 z-10 opacity-80"
            style={{ background: spotlight }}
          />
        </div>

        {pattern && (
          <div className="absolute inset-0 opacity-40 dark:opacity-60 transition-opacity duration-700 mix-blend-overlay group-hover/card:opacity-70 dark:group-hover/card:opacity-80 z-0">
            {pattern}
          </div>
        )}

        <div
          className="absolute inset-0 z-20 mix-blend-overlay opacity-[0.15] dark:opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Головний контейнер контенту: висунутий вперед за допомогою translateZ(40px) */}
      <div
        className={cn(
          "relative z-30 transform-gpu flex flex-col h-full p-8 md:p-10",
          contentClassName
        )}
        style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
      >
        {children}
      </div>
    </motion.div>
  );
};

export interface ProximityBlockProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

export const ProximityBlock = ({ children, className, color = "rgba(255, 255, 255, 0.4)" }: ProximityBlockProps) => {
  const blockRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const cardElement = blockRef.current?.closest(".group\\/card");
    if (!cardElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!blockRef.current) return;
      const rect = blockRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };

    const handleMouseLeave = () => {
      mouseX.set(-1000);
      mouseY.set(-1000);
    };

    cardElement.addEventListener("mousemove", handleMouseMove as EventListener);
    cardElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cardElement.removeEventListener("mousemove", handleMouseMove as EventListener);
      cardElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  const background = useMotionTemplate`radial-gradient(circle 250px at ${smoothX}px ${smoothY}px, ${color}, transparent 100%)`;

  return (
    <div 
      ref={blockRef} 
      style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
      className={cn("relative shrink-0 rounded-[inherit]", className)}
    >
      {children}
      <div
        className="absolute inset-0 rounded-[inherit] p-[1px] pointer-events-none z-10"
        style={{
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
        }}
      >
        <motion.div
          className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000"
          style={{ background }}
        />
      </div>
    </div>
  );
};
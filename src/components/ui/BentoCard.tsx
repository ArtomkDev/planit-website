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

  const smoothMouseX = useSpring(mouseX, { stiffness: 200, damping: 25 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 200, damping: 25 });
  const smoothTiltX = useSpring(tiltX, { stiffness: 150, damping: 20 });
  const smoothTiltY = useSpring(tiltY, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(smoothTiltY, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(smoothTiltX, [-0.5, 0.5], ["-8deg", "8deg"]);

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

  const handleMouseEnter = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const spotlight = useMotionTemplate`radial-gradient(700px circle at ${smoothMouseX}px ${smoothMouseY}px, ${spotlightColor}, transparent 100%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      variants={fadeInUp}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative rounded-[2.5rem] flex flex-col group group/card perspective-1000 transform-gpu shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.65)] transition-shadow duration-500",
        className
      )}
    >
      <div className="absolute inset-0 z-0 pointer-events-none rounded-[2.5rem] overflow-hidden bg-zinc-50/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800/50 transition-colors duration-500 group-hover/card:border-zinc-300/80 dark:group-hover/card:border-zinc-700/80">
        <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 overflow-hidden z-0">
          <div
            className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] blur-[140px] opacity-60 mix-blend-normal dark:mix-blend-lighten animate-spin [animation-duration:30s]"
            style={{
              background: `conic-gradient(from 0deg at 50% 50%, ${colorPrimary} 0%, transparent 20%, ${colorSecondary} 50%, transparent 80%, ${colorPrimary} 100%)`,
            }}
          />
          <div
            className="absolute -bottom-[50%] -right-[50%] w-[200%] h-[200%] blur-[120px] opacity-50 mix-blend-normal dark:mix-blend-lighten animate-spin [animation-duration:25s] [animation-direction:reverse]"
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
          <div className="absolute inset-0 opacity-40 dark:opacity-60 transition-opacity duration-500 mix-blend-overlay group-hover/card:opacity-70 dark:group-hover/card:opacity-80 z-0">
            {pattern}
          </div>
        )}
      </div>

      <div
        className={cn(
          "relative z-30 transform-gpu flex flex-col h-full p-8 md:p-10",
          contentClassName
        )}
        style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
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
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const cardElement = blockRef.current?.closest(".group\\/card");
    if (!cardElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!blockRef.current) return;
      const rect = blockRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      if (!blockRef.current) return;
      const rect = blockRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };

    cardElement.addEventListener("mousemove", handleMouseMove as EventListener);
    cardElement.addEventListener("mouseenter", handleMouseEnter as EventListener);

    return () => {
      cardElement.removeEventListener("mousemove", handleMouseMove as EventListener);
      cardElement.removeEventListener("mouseenter", handleMouseEnter as EventListener);
    };
  }, [mouseX, mouseY]);

  const background = useMotionTemplate`radial-gradient(circle 100px at ${mouseX}px ${mouseY}px, ${color}, transparent 100%)`;

  return (
    <div 
      ref={blockRef} 
      style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}
      className={cn("relative shrink-0 rounded-[inherit]", className)}
    >
      {children}
      <div
        className="absolute inset-0 rounded-[inherit] p-[1.5px] pointer-events-none z-10"
        style={{
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
        }}
      >
        <motion.div
          className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-150"
          style={{ background }}
        />
      </div>
    </div>
  );
};
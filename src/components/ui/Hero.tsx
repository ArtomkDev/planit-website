"use client";

import { Hero3D } from "./hero/Hero3D";
import { HeroContent } from "./hero/HeroContent";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950 dark:bg-[#050505]">
      <Hero3D />
      <HeroContent />
    </section>
  );
}
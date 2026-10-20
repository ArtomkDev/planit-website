"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { AccentRule } from "@/components/ui/AccentRule";
import { APP_URL } from "@/lib/site";

export const CallToAction = () => {
  const t = useTranslations("CTA");
  const reduceMotion = useReducedMotion();

  return (
    <section id="get-started" aria-labelledby="get-started-title" className="relative z-20 mx-auto w-full max-w-5xl px-6 py-20 md:py-24">
      <ScrollReveal>
        <div className="rounded-3xl border border-site-border bg-site-surface px-6 py-12 text-left sm:px-12 md:py-16">
          <AccentRule className="mb-6" />
          <h2 id="get-started-title" className="max-w-2xl text-balance text-3xl font-black tracking-tight text-site-text sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-md text-pretty text-base leading-7 text-site-muted sm:text-lg">
            {t("description")}
          </p>
          <motion.a
            href={APP_URL}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-[14px] bg-site-text px-6 py-3.5 font-bold text-site-bg transition-opacity hover:opacity-85"
          >
            {t("button")}
            <ArrowRight aria-hidden="true" weight="bold" className="h-5 w-5" />
          </motion.a>
        </div>
      </ScrollReveal>
    </section>
  );
};

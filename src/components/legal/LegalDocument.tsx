"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  CalendarBlank,
  CheckCircle,
  Clock,
  Cookie,
  FileText,
  ShieldCheck,
  Trash,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { legalDocuments } from "@/content/legal-documents";
import { AntigravityParticles } from "@/components/legal/AntigravityParticles";
import styles from "./LegalDocument.module.css";

export type LegalDocumentKind = "privacy" | "terms" | "delete" | "cookies";

interface LegalDocumentProps {
  locale: string;
  kind: LegalDocumentKind;
}

const documentIcons = {
  privacy: ShieldCheck,
  terms: FileText,
  delete: Trash,
  cookies: Cookie,
};

export function LegalDocument({ locale, kind }: LegalDocumentProps) {
  const tDoc = useTranslations("LegalDocument");
  const document = legalDocuments[kind];
  const Icon = documentIcons[kind];

  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${document.effectiveDate}T00:00:00Z`));

  useEffect(() => {
    window.document.title = `${document.title} | PlanIt`;
  }, [document.title]);

  return (
    <div className="relative isolate min-h-screen overflow-clip bg-zinc-50 px-4 pb-24 dark:bg-[#09090b] sm:px-6 lg:pb-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ x: [0, 28, 0], y: [0, -18, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-32 top-16 h-80 w-80 rounded-full bg-indigo-300/30 blur-[100px] dark:bg-indigo-600/15"
        />
        <motion.div
          animate={{ x: [0, -24, 0], y: [0, 24, 0], scale: [1, 0.94, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-28 top-[28rem] h-96 w-96 rounded-full bg-fuchsia-300/20 blur-[120px] dark:bg-fuchsia-700/10"
        />
        <AntigravityParticles className="opacity-80 dark:opacity-70" />
      </div>

      <div className="mx-auto w-full max-w-5xl pt-12 sm:pt-16 lg:pt-20">
        <header className="mx-auto mb-10 max-w-4xl text-center sm:mb-12">
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-indigo-200/70 bg-white/75 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.19em] text-indigo-600 shadow-sm backdrop-blur-xl dark:border-indigo-900/70 dark:bg-zinc-900/70 dark:text-indigo-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            {tDoc("eyebrow")}
          </div>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-white/80 bg-white/75 text-indigo-600 shadow-[0_20px_60px_-22px_rgba(79,70,229,0.7)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/75 dark:text-indigo-300">
            <Icon className="h-8 w-8" weight="duotone" />
          </div>
          <h1 className="text-balance text-4xl font-black tracking-[-0.045em] text-zinc-950 dark:text-white sm:text-6xl lg:text-7xl">
            {document.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base font-medium leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
            {document.summary}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/70 px-3 py-2 text-xs font-bold text-zinc-600 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300">
              <CalendarBlank className="h-4 w-4 text-indigo-500" weight="duotone" />
              {tDoc("updated")} {formattedDate}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/70 px-3 py-2 text-xs font-bold text-zinc-600 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300">
              <Clock className="h-4 w-4 text-indigo-500" weight="duotone" />
              {document.readTime} {tDoc("readTimeLabel")}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/70 px-3 py-2 text-xs font-bold text-zinc-600 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300">
              <CheckCircle className="h-4 w-4 text-emerald-500" weight="fill" />
              {document.sections.length} {tDoc("sectionsLabel")}
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-4xl">
          <article className="min-w-0 space-y-4 sm:space-y-5">
            {document.sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-40 rounded-[1.6rem] border border-zinc-200/80 bg-white/85 px-5 py-7 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-shadow duration-500 hover:shadow-[0_32px_100px_-52px_rgba(79,70,229,0.32)] dark:border-zinc-800 dark:bg-zinc-900/85 dark:hover:shadow-[0_32px_100px_-52px_rgba(99,102,241,0.24)] sm:px-8 sm:py-9 xl:px-10"
              >
                <div className="mb-6 flex items-start gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-sm font-black text-indigo-600 ring-1 ring-indigo-100 dark:bg-indigo-950/45 dark:text-indigo-300 dark:ring-indigo-900/70">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">{tDoc("section")} {index + 1}</p>
                    <h2 className="text-pretty text-2xl font-black tracking-[-0.025em] text-zinc-950 dark:text-white sm:text-3xl">
                      {section.title}
                    </h2>
                  </div>
                </div>
                <div
                  className={styles.prose}
                  dangerouslySetInnerHTML={{
                    __html: section.content.replaceAll("/__LOCALE__/", `/${locale}/wiki/`),
                  }}
                />
              </section>
            ))}

            <div className="mt-6 flex flex-col gap-4 rounded-[1.6rem] bg-zinc-950 p-6 text-white shadow-[0_30px_90px_-40px_rgba(79,70,229,0.65)] sm:flex-row sm:items-center sm:justify-between sm:p-8 dark:bg-white dark:text-zinc-950">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-300 dark:text-indigo-600">PlanIt support</p>
                <p className="mt-1 text-lg font-extrabold">{tDoc("support")}</p>
              </div>
              <a
                href="mailto:planit.app.support@gmail.com"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-zinc-950 transition-transform hover:-translate-y-0.5 dark:bg-zinc-950 dark:text-white"
              >
                {tDoc("supportAction")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" weight="bold" />
              </a>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

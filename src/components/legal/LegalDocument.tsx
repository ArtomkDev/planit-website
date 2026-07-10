"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarBlank,
  Cookie,
  FileText,
  ShieldCheck,
  Trash,
} from "@phosphor-icons/react";
import { legalDocuments } from "@/content/legal-documents";
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

const wikiDocuments = ["terms", "privacy", "delete", "cookies"] as const satisfies ReadonlyArray<LegalDocumentKind>;

function isLegalDocumentKind(value: string | undefined): value is LegalDocumentKind {
  return wikiDocuments.includes(value as LegalDocumentKind);
}

function documentFromPathname() {
  if (typeof window === "undefined") {
    return null;
  }

  const segment = window.location.pathname.split("/").filter(Boolean).at(-1);
  return isLegalDocumentKind(segment) ? segment : null;
}

export function LegalDocument({ locale, kind }: LegalDocumentProps) {
  const tDoc = useTranslations("LegalDocument");
  const [activeKind, setActiveKind] = useState<LegalDocumentKind>(kind);
  const document = legalDocuments[activeKind];
  const Icon = documentIcons[activeKind];
  const documents = useMemo(
    () => wikiDocuments.map((documentKind) => ({
      kind: documentKind,
      data: legalDocuments[documentKind],
      Icon: documentIcons[documentKind],
    })),
    [],
  );

  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${document.effectiveDate}T00:00:00Z`));

  useEffect(() => {
    window.document.title = `${document.title} | PlanIt`;
  }, [document.title]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveKind(documentFromPathname() ?? "terms");
    };

    handlePopState();
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  function selectDocument(nextKind: LegalDocumentKind) {
    setActiveKind(nextKind);
    window.history.pushState(null, "", `/${locale}/wiki/${nextKind}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#fbfbfc] px-4 pb-20 pt-8 dark:bg-[#09090b] sm:px-6 lg:pb-28 lg:pt-12">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 border-b border-zinc-200/70 bg-[linear-gradient(180deg,rgba(244,91,138,0.055),transparent_72%)] dark:border-zinc-900 dark:bg-[linear-gradient(180deg,rgba(62,247,210,0.035),transparent_72%)]" />

      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
          <div className="rounded-[8px] border border-zinc-200 bg-white/88 p-2 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/78">
            <div className="px-3 pb-3 pt-2">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">{tDoc("eyebrow")}</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950 dark:text-white">PlanIt Wiki</h2>
            </div>
            <nav aria-label={tDoc("contents")} className="grid gap-1">
              {documents.map(({ kind: documentKind, data, Icon: DocumentIcon }) => {
                const isActive = activeKind === documentKind;

                return (
                  <button
                    key={documentKind}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => selectDocument(documentKind)}
                    className={`group relative flex w-full items-start gap-3 rounded-[6px] p-3 text-left transition-colors ${
                      isActive
                        ? "bg-zinc-950 text-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.5)] dark:bg-white dark:text-zinc-950"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {isActive ? <span aria-hidden className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-[#F45B8A] dark:bg-[#3EF7D2]" /> : null}
                    <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] ${
                      isActive
                        ? "bg-white/10 text-white dark:bg-zinc-950/10 dark:text-zinc-950"
                        : "bg-zinc-100 text-zinc-500 group-hover:bg-white group-hover:text-zinc-950 dark:bg-zinc-900 dark:group-hover:bg-zinc-800 dark:group-hover:text-white"
                    }`}>
                      <DocumentIcon className="h-5 w-5" weight="bold" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-black">{data.title}</span>
                      <span className={`mt-1 line-clamp-2 block text-xs font-semibold leading-5 ${
                        isActive ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-500 dark:text-zinc-500"
                      }`}>
                        {data.summary}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="mb-6 rounded-[8px] border border-zinc-200 bg-white/86 p-5 shadow-[0_20px_70px_-48px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/78 sm:p-7 lg:p-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeKind}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[8px] border border-zinc-200 bg-zinc-50 text-zinc-700 shadow-[0_18px_46px_-38px_rgba(15,23,42,0.55)] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                  <Icon className="h-7 w-7" weight="duotone" />
                </div>
                <h1 className="text-balance text-4xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-5xl lg:text-6xl">
                  {document.title}
                </h1>
                <p className="mt-4 max-w-3xl text-pretty text-base font-medium leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
                  {document.summary}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                    <CalendarBlank className="h-4 w-4 text-zinc-400 dark:text-zinc-500" weight="duotone" />
                    {tDoc("updated")} {formattedDate}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </header>

          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={activeKind}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="min-w-0 space-y-4 sm:space-y-5"
            >
              {document.sections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28 rounded-[8px] border border-zinc-200 bg-white px-5 py-7 shadow-[0_22px_80px_-54px_rgba(15,23,42,0.38)] dark:border-zinc-800 dark:bg-zinc-950/88 sm:px-8 sm:py-9 xl:px-10"
                >
                  <div className="mb-6 flex items-start gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-zinc-100 text-sm font-black text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">{tDoc("section")} {index + 1}</p>
                      <h2 className="text-pretty text-2xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
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

              <motion.div
                initial="rest"
                whileHover="hover"
                className="relative mt-6 overflow-hidden rounded-[8px] border border-zinc-200 bg-zinc-50 p-8 text-center shadow-[0_24px_90px_-58px_rgba(15,23,42,0.55)] transition-colors duration-500 dark:border-zinc-800 dark:bg-zinc-900 sm:p-10"
              >
                <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F45B8A]/6 via-transparent to-transparent dark:from-[#3EF7D2]/10" />
                <motion.div
                  variants={{
                    rest: { scale: 1, rotate: 0, x: 0, y: 0, opacity: 0.22 },
                    hover: { scale: 1.16, rotate: 28, x: 18, y: -14, opacity: 0.36 },
                  }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-none absolute -left-16 -top-16 z-0 h-48 w-48 rounded-[42%_58%_68%_32%/44%_52%_48%_56%] bg-[#3EF7D2] blur-[42px] mix-blend-multiply dark:mix-blend-screen"
                />
                <motion.div
                  variants={{
                    rest: { scale: 1, rotate: 0, x: 0, y: 0, opacity: 0.24 },
                    hover: { scale: 1.18, rotate: -24, x: -18, y: 16, opacity: 0.38 },
                  }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-none absolute -bottom-20 -right-16 z-0 h-56 w-56 rounded-[56%_44%_36%_64%/50%_46%_54%_50%] bg-[#F45B8A] blur-[48px] mix-blend-multiply dark:mix-blend-screen"
                />
                <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">PlanIt support</p>
                  <p className="mt-3 text-2xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-3xl">{tDoc("support")}</p>
                </div>
                <motion.a
                  href="mailto:planit.app.support@gmail.com"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="group relative z-10 mt-7 inline-flex items-center justify-center gap-3 rounded-full bg-zinc-950 px-7 py-4 text-sm font-black text-white shadow-[0_18px_48px_-26px_rgba(15,23,42,0.75)] transition-shadow duration-300 hover:shadow-[0_20px_58px_-30px_rgba(244,91,138,0.55)] dark:bg-white dark:text-zinc-950 dark:hover:shadow-[0_20px_58px_-30px_rgba(62,247,210,0.45)]"
                >
                  {tDoc("supportAction")}
                  <ArrowRight className="h-4 w-4 text-[#F45B8A] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#3EF7D2]" weight="bold" />
                </motion.a>
              </motion.div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  CalendarBlank,
  CheckCircle,
  Clock,
  FileText,
  List,
  ShieldCheck,
  Trash,
} from "@phosphor-icons/react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { legalDocuments } from "@/content/legal-documents";
import { AntigravityParticles } from "@/components/legal/AntigravityParticles";
import styles from "./LegalDocument.module.css";

export type LegalDocumentKind = "privacy" | "terms" | "delete";

interface LegalDocumentProps {
  locale: string;
  kind: LegalDocumentKind;
}

const documentIcons = {
  privacy: ShieldCheck,
  terms: FileText,
  delete: Trash,
};

const documentTabs: Array<{ kind: LegalDocumentKind; labelKey: "Navigation.privacy" | "Navigation.terms" | "Navigation.delete" }> = [
  { kind: "privacy", labelKey: "Navigation.privacy" },
  { kind: "terms", labelKey: "Navigation.terms" },
  { kind: "delete", labelKey: "Navigation.delete" },
];

const ease = [0.22, 1, 0.36, 1] as const;

function isLegalDocumentKind(value: string | undefined): value is LegalDocumentKind {
  return value === "privacy" || value === "terms" || value === "delete";
}

export function LegalDocument({ locale, kind }: LegalDocumentProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const tDoc = useTranslations("LegalDocument");
  const tNav = useTranslations();
  const rootRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  
  const routeKind = pathname.split("/").filter(Boolean).at(-1);
  const activeKind = isLegalDocumentKind(routeKind) ? routeKind : kind;
  const document = legalDocuments[activeKind];
  const Icon = documentIcons[activeKind];

  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${document.effectiveDate}T00:00:00Z`));

  const [activeSectionState, setActiveSectionState] = useState(() => ({
    kind,
    id: legalDocuments[kind].sections[0]?.id ?? "",
  }));
  const activeSection = activeSectionState.kind === activeKind
    ? activeSectionState.id
    : document.sections[0]?.id ?? "";

  const { scrollYProgress } = useScroll({
    target: articleRef,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.25,
  });

  useEffect(() => {
    window.document.title = `${document.title} | PlanIt`;
  }, [document.title]);

  useEffect(() => {
    const sections = document.sections
      .map((section) => window.document.getElementById(section.id))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActiveSectionState({ kind: activeKind, id: visible[0].target.id });
        }
      },
      { rootMargin: "-22% 0px -62% 0px", threshold: [0, 0.1, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [activeKind, document.sections]);

  function switchDocument(event: MouseEvent<HTMLAnchorElement>, targetKind: LegalDocumentKind) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    if (targetKind === activeKind) {
      return;
    }
    setActiveSectionState({
      kind: targetKind,
      id: legalDocuments[targetKind].sections[0]?.id ?? "",
    });
    window.history.pushState(null, "", `/${locale}/${targetKind}`);
    window.requestAnimationFrame(() => {
      rootRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  return (
    <MotionConfig reducedMotion="user">
      <div ref={rootRef} className="relative isolate min-h-screen scroll-mt-16 overflow-clip bg-zinc-50 px-4 pb-24 dark:bg-[#09090b] sm:px-6 lg:pb-32">
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

        <div className="sticky top-16 z-40 -mx-4 border-y border-zinc-200/70 bg-white/80 px-4 py-2 shadow-[0_12px_36px_-24px_rgba(15,23,42,0.45)] backdrop-blur-2xl dark:border-zinc-800/80 dark:bg-zinc-950/82 sm:-mx-6 sm:px-6">
          <nav
            data-testid="legal-document-switcher"
            aria-label="Legal documents"
            className="mx-auto grid w-full max-w-4xl grid-cols-3 gap-1.5 rounded-2xl border border-zinc-200/80 bg-zinc-100/70 p-1.5 dark:border-zinc-800 dark:bg-zinc-900/80"
          >
            {documentTabs.map((tab) => {
              const TabIcon = documentIcons[tab.kind];
              const isActive = tab.kind === activeKind;
              return (
                <a
                  key={tab.kind}
                  href={`/${locale}/${tab.kind}`}
                  onClick={(event) => switchDocument(event, tab.kind)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative flex min-h-12 items-center justify-center gap-1.5 overflow-hidden rounded-xl px-2 py-2 text-center text-[11px] font-extrabold leading-tight transition-all duration-300 sm:gap-2.5 sm:px-4 sm:text-sm ${
                    isActive
                      ? "bg-zinc-950 text-white shadow-lg shadow-zinc-950/15 dark:bg-white dark:text-zinc-950"
                      : "text-zinc-500 hover:bg-white hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-legal-document"
                      className="absolute inset-0 -z-10 rounded-xl bg-zinc-950 dark:bg-white"
                      transition={{ duration: 0.32, ease }}
                    />
                  )}
                  <TabIcon className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110 sm:h-5 sm:w-5" weight={isActive ? "fill" : "duotone"} />
                  <span>{tNav(tab.labelKey)}</span>
                  {isActive && <span className="sr-only">({tDoc("current")})</span>}
                </a>
              );
            })}
          </nav>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
            style={{ scaleX: progress }}
          />
        </div>

        <div className="mx-auto w-full max-w-7xl pt-12 sm:pt-16">
          <AnimatePresence mode="wait" initial={false}>
            <motion.header
              key={activeKind}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -14 }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
              }}
              className="mx-auto mb-10 max-w-4xl text-center sm:mb-12"
            >
              <motion.div
                variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } }}
                className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-indigo-200/70 bg-white/75 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.19em] text-indigo-600 shadow-sm backdrop-blur-xl dark:border-indigo-900/70 dark:bg-zinc-900/70 dark:text-indigo-300"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                </span>
                {tDoc("eyebrow")}
              </motion.div>
              <motion.div
                variants={{ hidden: { opacity: 0, y: 18, scale: 0.96 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease } } }}
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-white/80 bg-white/75 text-indigo-600 shadow-[0_20px_60px_-22px_rgba(79,70,229,0.7)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/75 dark:text-indigo-300"
              >
                <Icon className="h-8 w-8" weight="duotone" />
              </motion.div>
              <motion.h1
                variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } } }}
                className="text-balance text-4xl font-black tracking-[-0.045em] text-zinc-950 dark:text-white sm:text-6xl lg:text-7xl"
              >
                {document.title}
              </motion.h1>
              <motion.p
                variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } }}
                className="mx-auto mt-5 max-w-2xl text-pretty text-base font-medium leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg"
              >
                {document.summary}
              </motion.p>
              <motion.div
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}
                className="mt-6 flex flex-wrap items-center justify-center gap-2.5"
              >
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
              </motion.div>
            </motion.header>
          </AnimatePresence>

          <div className="mb-5 lg:hidden">
            <details className="group rounded-2xl border border-zinc-200/80 bg-white/80 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-extrabold text-zinc-950 dark:text-white [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2.5"><List className="h-5 w-5 text-indigo-500" weight="bold" />{tDoc("mobileContents")}</span>
                <span className="text-indigo-500 transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="grid gap-1 border-t border-zinc-200/80 p-2 dark:border-zinc-800">
                {document.sections.map((section, index) => (
                  <a key={section.id} href={`#${section.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-zinc-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700 dark:text-zinc-400 dark:hover:bg-indigo-950/35 dark:hover:text-indigo-300">
                    <span className="w-6 font-black text-indigo-500">{String(index + 1).padStart(2, "0")}</span>
                    {section.title}
                  </a>
                ))}
              </div>
            </details>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeKind}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.32, ease }}
              className="grid items-start gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] xl:gap-10"
            >
              <aside data-testid="legal-section-sidebar" className="sticky top-[9rem] hidden max-h-[calc(100vh-10rem)] lg:block">
                <motion.div
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.38, duration: 0.55, ease }}
                  className="flex max-h-[calc(100vh-10rem)] flex-col rounded-[1.5rem] border border-zinc-200/80 bg-white/75 p-3 shadow-[0_22px_80px_-42px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:border-zinc-800 dark:bg-zinc-900/75"
                >
                  <div className="mb-2 flex items-center gap-2 px-3 pb-3 pt-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                    <List className="h-4 w-4 text-indigo-500" weight="bold" />
                    {tDoc("contents")}
                  </div>
                  <nav aria-label={tDoc("contents")} className={`${styles.toc} min-h-0 space-y-1 overflow-y-auto overscroll-contain pr-1`}>
                    {document.sections.map((section, index) => {
                      const isActive = section.id === activeSection;
                      return (
                        <a
                          key={section.id}
                          href={`#${section.id}`}
                          onClick={() => setActiveSectionState({ kind: activeKind, id: section.id })}
                          aria-current={isActive ? "location" : undefined}
                          className={`group relative flex items-start gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold leading-5 transition-all duration-300 ${
                            isActive
                              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/35 dark:text-indigo-300"
                              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-500 dark:hover:bg-zinc-800/80 dark:hover:text-white"
                          }`}
                        >
                          <span className={`mt-0.5 shrink-0 font-black transition-colors ${isActive ? "text-indigo-500" : "text-zinc-300 group-hover:text-indigo-400 dark:text-zinc-700"}`}>
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span>{section.title}</span>
                        </a>
                      );
                    })}
                  </nav>
                </motion.div>
              </aside>

              <article ref={articleRef} className="min-w-0 space-y-4 sm:space-y-5">
                {document.sections.map((section, index) => (
                  <motion.section
                    key={section.id}
                    id={section.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.08, margin: "0px 0px -80px" }}
                    transition={{ duration: 0.6, delay: Math.min(index * 0.025, 0.15), ease }}
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
                        __html: section.content.replaceAll("/__LOCALE__/", `/${locale}/`),
                      }}
                    />
                  </motion.section>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, ease }}
                  className="mt-6 flex flex-col gap-4 rounded-[1.6rem] bg-zinc-950 p-6 text-white shadow-[0_30px_90px_-40px_rgba(79,70,229,0.65)] sm:flex-row sm:items-center sm:justify-between sm:p-8 dark:bg-white dark:text-zinc-950"
                >
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
                </motion.div>
              </article>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}

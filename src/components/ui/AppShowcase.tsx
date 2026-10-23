"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import {
  AppWindow, ArrowLeft, ArrowRight, ArrowsLeftRight, BellRinging,
  Check, CloudArrowUp, DeviceMobile, FileArrowDown, FilePdf,
  Image as ImageIcon, Paperclip, ShareNetwork,
} from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { staggerContainer } from "@/lib/framer-variants";
import { BentoCard, ProximityBlock } from "@/components/ui/BentoCard";
import { LessonCardAccent } from "@/components/ui/LessonCardAccent";
import { AccentRule } from "@/components/ui/AccentRule";
import { AnimatedScheduleCode } from "@/components/ui/AnimatedScheduleCode";
import { FeaturePreviewMotion } from "@/components/ui/FeaturePreviewMotion";
import previewStyles from "./feature-preview.module.css";

const cards = [
  { id: "sharing", Icon: ShareNetwork, tone: "text-amber-500", color: "245, 158, 11" },
  { id: "exports", Icon: FileArrowDown, tone: "text-indigo-500", color: "99, 102, 241" },
  { id: "reminders", Icon: BellRinging, tone: "text-cyan-500", color: "6, 182, 212" },
  { id: "materials", Icon: Paperclip, tone: "text-emerald-500", color: "16, 185, 129" },
  { id: "widgets", Icon: AppWindow, tone: "text-rose-500", color: "244, 63, 94" },
  { id: "sync", Icon: CloudArrowUp, tone: "text-violet-500", color: "139, 92, 246" },
] as const;

type FeatureId = (typeof cards)[number]["id"];

const previewIntroDelay: Record<FeatureId, number> = {
  sharing: 0, exports: 400, reminders: 650, materials: 0, widgets: 180, sync: 360,
};

function FeaturePreview({ id, accentColor }: { id: FeatureId; accentColor: string }) {
  const t = useTranslations("AppShowcase.preview");

  return (
    <FeaturePreviewMotion accentColor={accentColor} animate={id !== "sharing"} interactive={id === "sharing"} delay={previewIntroDelay[id]}>
      {id === "sharing" && (
        <>
          <div className="flex items-center justify-between gap-2 text-xs text-site-muted">
            <span>{t("sharing.label")}</span><span>{t("example")}</span>
          </div>
          <AnimatedScheduleCode />
          <p className="text-xs text-site-muted">{t("sharing.duration")}</p>
        </>
      )}
      {id === "exports" && (
        <>
          <p className="text-xs text-site-muted">{t("exports.label")}</p>
          <div className="flex flex-wrap gap-2">
            {["PDF", "DOCX", "XLSX", "CSV", "TXT"].map((format, index) => (
              <span key={format} style={{ "--item-delay": `${index * 85}ms` } as CSSProperties} className={`${previewStyles.format} rounded-md border border-site-border bg-site-surface px-2 py-1.5 font-mono text-xs font-bold`}>{format}</span>
            ))}
          </div>
          <p className="text-xs text-site-muted">{t("exports.caption")}</p>
        </>
      )}
      {id === "reminders" && (
        <div className="flex items-center gap-3">
          <BellRinging size={24} className={`${previewStyles.bell} ${previewStyles.accent} shrink-0`} />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-site-muted">{t("reminders.label")}</p>
            <div className="mt-2 flex items-center gap-3 font-mono text-lg font-bold">
              <span>08:30</span><ArrowRight size={16} className="shrink-0 text-site-muted" /><span>09:00</span>
            </div>
            <p className="mt-1 text-xs text-site-muted">{t("reminders.caption")}</p>
          </div>
        </div>
      )}
      {id === "materials" && (
        <>
          <div className={`${previewStyles.material} flex items-center gap-3`}>
            <FilePdf size={25} className={`${previewStyles.accent} shrink-0`} />
            <span className="min-w-0 text-sm font-semibold">{t("materials.file")}</span>
          </div>
          <div className={`${previewStyles.material} flex items-center gap-3 border-t border-site-border pt-3`}>
            <ImageIcon size={25} className="shrink-0 text-site-muted" />
            <span className="min-w-0 text-sm font-semibold">{t("materials.photo")}</span>
          </div>
        </>
      )}
      {id === "widgets" && (
        <>
          <div className="flex items-center justify-between gap-3 text-xs text-site-muted">
            <ArrowLeft size={14} /><span>{t("widgets.today")}</span><ArrowRight size={14} />
          </div>
          <div className={`${previewStyles.widgetLesson} ${previewStyles.accentBorder} border-l-2 pl-3`}>
            <p className="text-sm font-bold">{t("widgets.subject")}</p>
            <p className="mt-1 font-mono text-xs text-site-muted">09:00 — 10:30</p>
          </div>
        </>
      )}
      {id === "sync" && (
        <>
          <div className="flex items-center justify-between gap-2 text-xs text-site-muted">
            <span className="flex items-center gap-1.5"><DeviceMobile size={18} />{t("sync.local")}</span>
            <ArrowsLeftRight size={18} className={`${previewStyles.syncArrow} ${previewStyles.accent} shrink-0`} />
            <span className="flex items-center gap-1.5"><CloudArrowUp size={18} className={`${previewStyles.syncCloud} ${previewStyles.accent}`} />{t("sync.cloud")}</span>
          </div>
          <p className="flex items-center justify-center gap-2 border-t border-site-border pt-3 text-sm font-bold">
            <Check size={17} className={`${previewStyles.accent} shrink-0`} />{t("sync.both")}
          </p>
        </>
      )}
    </FeaturePreviewMotion>
  );
}

export function AppShowcase() {
  const t = useTranslations("AppShowcase");

  return (
    <section id="everyday" aria-labelledby="everyday-title" className="relative z-20 mx-auto w-full max-w-7xl px-6 py-24">
      <LessonCardAccent seed={23} className="-left-64 top-[34%]" />
      <ScrollReveal className="relative z-20 mb-12 flex flex-col items-start text-left">
        <span className="mb-4 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-strong">
          <AccentRule />{t("badge")}
        </span>
        <h2 id="everyday-title" className="max-w-2xl text-4xl font-black tracking-tight text-site-text md:text-5xl">{t("title")}</h2>
      </ScrollReveal>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-20 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        {cards.map(({ id, Icon, tone, color }) => (
          <BentoCard
            key={id}
            className="min-w-0"
            contentClassName="pointer-events-none min-w-0"
            colorPrimary={`rgba(${color}, 0.12)`}
            colorSecondary={`rgba(${color}, 0.05)`}
            spotlightColor={`rgba(${color}, 0.15)`}
          >
            <div className="mb-4 flex items-center gap-4" style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}>
              <ProximityBlock
                color={`rgba(${color}, 0.8)`}
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-site-border bg-site-surface/90 ${tone} shadow-[0_8px_18px_-10px_var(--site-surface-shadow)] backdrop-blur-xl transition-all duration-700 ease-[0.22,1,0.36,1] motion-safe:group-hover/card:-translate-y-1 motion-safe:group-hover/card:scale-110`}
              >
                <Icon size={26} weight="duotone" aria-hidden="true" />
              </ProximityBlock>
              <h3 className="text-xl font-bold leading-tight tracking-tight text-site-text">{t(`items.${id}.title`)}</h3>
            </div>
            <p className="text-sm leading-6 text-site-muted">{t(`items.${id}.description`)}</p>
            <div className="mt-auto pt-5">
              <FeaturePreview id={id} accentColor={`rgb(${color})`} />
            </div>
          </BentoCard>
        ))}
      </motion.div>
    </section>
  );
}

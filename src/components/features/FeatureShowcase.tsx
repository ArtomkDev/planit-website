"use client";

import {
  ArrowUpRight,
  BookOpen,
  CheckSquare,
  CursorClick,
  Palette,
  SlidersHorizontal,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { PixelDisplay } from "@/components/ui/PixelDisplay";
import { LessonCardAccent } from "@/components/ui/LessonCardAccent";
import { LessonEditorDemo } from "./LessonEditorDemo";
import { AppearanceDemo } from "./AppearanceDemo";
import { TasksDemo } from "./TasksDemo";
import { ScheduleSettingsDemo } from "./ScheduleSettingsDemo";
import { type DemoRenderProps } from "./DemoPrimitives";
import styles from "./features.module.css";

function TasksFeature({ render }: DemoRenderProps) {
  return render({ editor: <TasksDemo /> });
}

function ScheduleFeature({ render }: DemoRenderProps) {
  return render({ editor: <ScheduleSettingsDemo /> });
}

const features = [
  {
    id: "lesson",
    Icon: BookOpen,
    Demo: LessonEditorDemo,
    accents: [
      { seed: 101, depth: "foreground", placement: "lessonOrbit" },
      { seed: 102, depth: "background", placement: "lessonEcho" },
    ],
  },
  {
    id: "appearance",
    Icon: Palette,
    Demo: AppearanceDemo,
    accents: [
      { seed: 103, depth: "foreground", placement: "appearanceOrbit" },
    ],
  },
  {
    id: "tasks",
    Icon: CheckSquare,
    Demo: TasksFeature,
    accents: [
      { seed: 105, depth: "background", placement: "tasksEcho" },
      { seed: 106, depth: "foreground", placement: "tasksOrbit" },
      { seed: 107, depth: "background", placement: "tasksSatellite" },
    ],
  },
  {
    id: "schedule",
    Icon: SlidersHorizontal,
    Demo: ScheduleFeature,
    accents: [
      { seed: 108, depth: "foreground", placement: "scheduleOrbit" },
      { seed: 109, depth: "background", placement: "scheduleEcho" },
    ],
  },
] as const;

export function FeatureShowcase() {
  const t = useTranslations("Features");
  const reduceMotion = useReducedMotion();
  const reveal: Variants = {
    hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: reduceMotion ? 0 : 0.65,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
  const sequence: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.09 },
    },
  };
  const entrance = {
    initial: reduceMotion ? (false as const) : "hidden",
    whileInView: "visible",
    viewport: { once: true, amount: 0.18 },
  };

  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className={styles.section}
    >
      <motion.div {...entrance} variants={sequence} className={styles.intro}>
        <motion.span variants={reveal} className={styles.eyebrow}>
          {t("badge")}
        </motion.span>
        <motion.h2 variants={reveal} id="features-title">
          {t("title")}
        </motion.h2>
        <motion.p variants={reveal}>{t("description")}</motion.p>
      </motion.div>

      {features.map(({ id, Icon, Demo, accents }, index) => (
        <article
          key={id}
          id={`feature-${id}`}
          aria-labelledby={`feature-${id}-title`}
          data-live-preview={id === "lesson" || id === "appearance" || undefined}
          className={styles.feature}
        >
          <div className={styles.lessonAccents} aria-hidden="true">
            {accents.map(({ seed, depth, placement }) => (
              <LessonCardAccent
                key={seed}
                seed={seed}
                depth={depth}
                className={`${styles.accentCard} ${styles[placement]}`}
              />
            ))}
          </div>
          <Demo
            render={({ editor, preview }) => (
              <>
                <motion.div
                  {...entrance}
                  variants={sequence}
                  className={styles.copy}
                >
                  <motion.span variants={reveal} className={styles.featureNumber}>
                    <span>0{index + 1}</span>
                    <Icon size={20} />
                    {t(`${id}.label`)}
                  </motion.span>
                  <motion.h3 variants={reveal} id={`feature-${id}-title`}>
                    {t(`${id}.title`)}
                  </motion.h3>
                  <motion.p variants={reveal}>{t(`${id}.description`)}</motion.p>
                  <motion.ul variants={sequence}>
                    {["first", "second", "third"].map((item) => (
                      <motion.li variants={reveal} key={item}>
                        <span aria-hidden="true" />
                        {t(`${id}.points.${item}`)}
                      </motion.li>
                    ))}
                  </motion.ul>
                  <motion.div variants={reveal} className={styles.tryHint}>
                    <CursorClick size={20} />
                    {t(`${id}.hint`)}
                  </motion.div>
                </motion.div>
                <div className={styles.interactiveViews}>
                  <div className={styles.interactivePanel}>
                    {preview && (
                      <motion.div
                        {...entrance}
                        variants={reveal}
                        className={styles.livePreview}
                        role="group"
                        aria-label={t("ui.cardPreview")}
                      >
                        <div className={styles.livePreviewCard}>{preview}</div>
                        <div className={styles.livePreviewCaption}>
                          <span>{t("ui.cardPreview")}</span>
                        </div>
                      </motion.div>
                    )}
                    <motion.div
                      {...entrance}
                      variants={sequence}
                      className={styles.stage}
                    >
                      <div className={styles.pixelBackdrop} aria-hidden="true">
                        <PixelDisplay
                          variant="feature"
                          tornEdge={index % 2 === 0 ? "left" : "right"}
                        />
                      </div>
                      <motion.div
                        className={styles.demoReveal}
                        variants={{
                          hidden: {
                            opacity: 0,
                            y: 70,
                            scale: 0.94,
                            rotate: index % 2 === 0 ? 2 : -2,
                            filter: "blur(8px)",
                          },
                          visible: {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            rotate: 0,
                            filter: "blur(0px)",
                            transition: reduceMotion
                              ? { duration: 0 }
                              : { type: "spring", duration: 1, bounce: 0.14 },
                          },
                        }}
                      >
                        {editor}
                      </motion.div>
                      <motion.span variants={reveal} className={styles.demoCaption}>
                        {t("demoCaption")}
                      </motion.span>
                    </motion.div>
                  </div>
                </div>
              </>
            )}
          />
        </article>
      ))}

      <a
        className={styles.openApp}
        href={process.env.NEXT_PUBLIC_APP_URL || "https://planit-demo.web.app"}
      >
        {t("openApp")}
        <ArrowUpRight size={20} />
      </a>
    </section>
  );
}

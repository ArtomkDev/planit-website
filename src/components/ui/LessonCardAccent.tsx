"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { LessonCard, LessonData } from "@/components/ui/LessonCard";
import { cn } from "@/lib/utils/classNames";
import styles from "./LessonCardAccent.module.css";

type AccentDepth = "foreground" | "background";

interface LessonCardAccentProps {
  seed?: number;
  depth?: AccentDepth;
  className?: string;
  gutterSide?: "left" | "right";
  direction?: "up" | "down";
  travel?: number;
}

const timePresets = [
  ["08:00", "09:30"],
  ["09:40", "11:10"],
  ["11:20", "12:50"],
  ["13:00", "14:30"],
  ["14:40", "16:10"],
  ["16:20", "17:50"],
  ["18:00", "19:30"],
  ["19:40", "21:10"],
] as const;

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function pick<T>(items: readonly T[], random: () => number) {
  return items[Math.floor(random() * items.length)];
}

export function LessonCardAccent({
  seed = 1,
  depth = "foreground",
  className,
  gutterSide,
  direction = "up",
  travel = 48,
}: LessonCardAccentProps) {
  const t = useTranslations("DecorativeCards");
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(rootRef, { margin: "100px" });
  const [documentVisible, setDocumentVisible] = useState(true);
  const isBackground = depth === "background";
  const motionSign = direction === "up" ? -1 : 1;
  const [randomSeed, setRandomSeed] = useState(seed);
  const localizedContent = useMemo(
    () => ({
      subjects: t.raw("subjects") as string[],
      types: t.raw("types") as string[],
      rooms: t.raw("rooms") as string[],
      buildings: t.raw("buildings") as string[],
      teachers: t.raw("teachers") as string[],
    }),
    [t],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      setRandomSeed(value[0] ^ seed);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [seed]);

  useEffect(() => {
    const syncVisibility = () => setDocumentVisible(!document.hidden);
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  const preset = useMemo(() => {
    const random = createSeededRandom(randomSeed);
    const subjectIndex = Math.floor(random() * localizedContent.subjects.length);

    return {
      subjectIndex,
      subjectName: localizedContent.subjects[subjectIndex],
      displayType: pick(localizedContent.types, random),
      displayRoom: pick(localizedContent.rooms, random),
      displayBuilding:
        random() > 0.45 ? pick(localizedContent.buildings, random) : undefined,
      teacherName: pick(localizedContent.teachers, random),
      time: pick(timePresets, random),
    };
  }, [localizedContent, randomSeed]);

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start end", "end start"],
  });
  const rawParallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    [-motionSign * travel, motionSign * travel],
  );
  const rawParallaxX = useTransform(scrollYProgress, [0, 1], [-motionSign * 6, motionSign * 6]);
  const parallaxY = useSpring(rawParallaxY, {
    stiffness: 92,
    damping: 24,
    mass: 0.65,
  });
  const parallaxX = useSpring(rawParallaxX, {
    stiffness: 78,
    damping: 26,
    mass: 0.7,
  });
  const [timeStart, timeEnd] = preset.time;

  const lesson: LessonData = {
    id: `accent-${seed}-${randomSeed}`,
    subjectIndex: preset.subjectIndex,
    appearanceSeed: randomSeed,
    subjectName: preset.subjectName,
    displayType: preset.displayType,
    displayRoom: preset.displayRoom,
    displayBuilding: preset.displayBuilding,
    teacherName: preset.teacherName,
    timeStart,
    timeEnd,
  };

  return (
    <motion.div
      ref={rootRef}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: isBackground ? 0.24 : 0.78, scale: 1 }}
      viewport={{ once: true, margin: "120px" }}
      transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
      data-lesson-accent={seed}
      data-gutter-side={gutterSide}
      data-drift-direction={direction}
      className={cn(
        styles.card,
        "absolute w-64 transform-gpu",
        isBackground
          ? "z-0 scale-110 blur-[3px] saturate-75"
          : "z-10 drop-shadow-[0_24px_30px_rgba(15,23,42,.18)]",
        className,
      )}
    >
      <motion.div
        style={{ x: reduceMotion ? 0 : parallaxX, y: reduceMotion ? 0 : parallaxY }}
      >
        <div
          className={styles.float}
          style={{
            "--accent-float": `${motionSign * (isBackground ? 10 : 8)}px`,
            "--accent-rotation": `${motionSign * 4 * (isBackground ? 1.4 : 1)}deg`,
            animationPlayState: inView && documentVisible && !reduceMotion ? "running" : "paused",
          } as CSSProperties}
        >
          <LessonCard
            lesson={lesson}
            showIcons={!isBackground}
            enable3D={!isBackground}
            className="mb-0"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

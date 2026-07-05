"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { LessonCard, LessonData } from "@/components/ui/LessonCard";
import { cn } from "@/lib/utils/classNames";

type AccentDepth = "foreground" | "background";

interface LessonCardAccentProps {
  seed?: number;
  depth?: AccentDepth;
  className?: string;
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
}: LessonCardAccentProps) {
  const t = useTranslations("DecorativeCards");
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isBackground = depth === "background";
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

  const preset = useMemo(() => {
    const random = createSeededRandom(randomSeed);
    const subjectIndex = Math.floor(random() * localizedContent.subjects.length);
    const isSlowerThanPage = random() > 0.5;
    const scrollSpeed = isSlowerThanPage
      ? 0.45 + random() * 0.35
      : 1.2 + random() * 0.45;
    const parallaxDelta = (1 - scrollSpeed) * 520;
    const horizontalDirection = random() > 0.5 ? 1 : -1;
    const parallaxXTravel = 8 + random() * 24;

    return {
      subjectIndex,
      subjectName: localizedContent.subjects[subjectIndex],
      displayType: pick(localizedContent.types, random),
      displayRoom: pick(localizedContent.rooms, random),
      displayBuilding:
        random() > 0.45 ? pick(localizedContent.buildings, random) : undefined,
      teacherName: pick(localizedContent.teachers, random),
      time: pick(timePresets, random),
      baseRotation: (random() * 10 - 5) * (isBackground ? 1.4 : 1),
      floatDuration: 6.5 + random() * 6,
      floatDirection: random() > 0.5 ? 1 : -1,
      scrollSpeed,
      parallaxY: [
        -parallaxDelta * 0.5,
        parallaxDelta * 0.5,
      ] as [number, number],
      parallaxX: [
        -horizontalDirection * parallaxXTravel * 0.35,
        horizontalDirection * parallaxXTravel * 0.65,
      ] as [number, number],
    };
  }, [isBackground, localizedContent, randomSeed]);

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start end", "end start"],
  });
  const rawParallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    preset.parallaxY,
  );
  const rawParallaxX = useTransform(scrollYProgress, [0, 1], preset.parallaxX);
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
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: isBackground ? 0.24 : 0.78, scale: 1 }}
      viewport={{ once: true, margin: "120px" }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        x: reduceMotion ? 0 : parallaxX,
        y: reduceMotion ? 0 : parallaxY,
      }}
      aria-hidden="true"
      data-scroll-speed={preset.scrollSpeed.toFixed(2)}
      data-scroll-mode={preset.scrollSpeed < 1 ? "slower" : "faster"}
      className={cn(
        "absolute hidden w-64 transform-gpu",
        isBackground
          ? "pointer-events-none z-0 scale-110 blur-[3px] saturate-75 xl:block"
          : "pointer-events-auto z-10 drop-shadow-[0_24px_30px_rgba(15,23,42,.18)] 2xl:block",
        className,
      )}
    >
      <motion.div
        style={{ transformStyle: isBackground ? "flat" : "preserve-3d" }}
        animate={
          reduceMotion || !isBackground
            ? { rotate: preset.baseRotation }
            : {
                x: [0, 7 * preset.floatDirection, -4 * preset.floatDirection, 0],
                y: [0, -12, 4, 0],
                rotate: [
                  preset.baseRotation,
                  preset.baseRotation + 1.8,
                  preset.baseRotation - 1.2,
                  preset.baseRotation,
                ],
              }
        }
        transition={
          reduceMotion || !isBackground
            ? { duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }
            : { duration: preset.floatDuration, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <LessonCard
          lesson={lesson}
          showIcons={!isBackground}
          enable3D={!isBackground}
          className="mb-0"
        />
      </motion.div>
    </motion.div>
  );
}

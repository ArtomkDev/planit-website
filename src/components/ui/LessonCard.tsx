"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  Atom,
  BezierCurve,
  BookOpen,
  Brain,
  Calculator,
  ChartLineUp,
  Circuitry,
  Clock,
  CodeBlock,
  Flask,
  Hourglass,
  MapPin,
  Microscope,
  MusicNotes,
  Palette,
  Translate,
  User,
  type Icon,
} from "@phosphor-icons/react";
import { PointerEvent } from "react";
import { cn } from "@/lib/utils/classNames";

export interface LessonData {
  id: string;
  subjectName: string;
  subjectIndex?: number;
  appearanceSeed?: number;
  subjectColor?: string;
  gradientColors?: string[];
  icon?: Icon;
  timeStart: string;
  timeEnd: string;
  displayType?: string;
  displayRoom?: string;
  displayBuilding?: string;
  teacherName?: string;
  isActive?: boolean;
  timeLeft?: string;
  activeLabel?: string;
  activeTextColor?: string;
}

export interface LessonCardProps {
  lesson: LessonData;
  onClick?: () => void;
  className?: string;
  showIcons?: boolean;
  enable3D?: boolean;
}

interface SubjectTheme {
  icons: readonly Icon[];
  hues: readonly [number, number];
  saturation: readonly [number, number];
  lightness: readonly [number, number];
}

// The order matches DecorativeCards.subjects in every locale. Keeping the
// visual identity here makes every LessonCard render a subject consistently.
const subjectThemes: readonly SubjectTheme[] = [
  { icons: [Calculator], hues: [344, 8], saturation: [72, 82], lightness: [38, 57] },
  { icons: [CodeBlock, Circuitry], hues: [221, 190], saturation: [68, 76], lightness: [38, 53] },
  { icons: [Palette, BezierCurve], hues: [274, 327], saturation: [62, 72], lightness: [41, 58] },
  { icons: [Atom], hues: [356, 29], saturation: [74, 86], lightness: [41, 57] },
  { icons: [Flask], hues: [169, 143], saturation: [62, 69], lightness: [32, 49] },
  { icons: [BookOpen], hues: [215, 42], saturation: [17, 62], lightness: [31, 53] },
  { icons: [Translate, BookOpen], hues: [228, 198], saturation: [68, 76], lightness: [42, 56] },
  { icons: [ChartLineUp, Calculator], hues: [191, 160], saturation: [59, 67], lightness: [33, 47] },
  { icons: [BezierCurve], hues: [12, 36], saturation: [58, 70], lightness: [40, 57] },
  { icons: [MusicNotes], hues: [251, 294], saturation: [59, 67], lightness: [42, 57] },
  { icons: [Microscope], hues: [91, 128], saturation: [54, 63], lightness: [34, 46] },
  { icons: [Brain, Circuitry], hues: [232, 268], saturation: [66, 62], lightness: [42, 57] },
];

function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

export function resolveLessonAppearance(lesson: Pick<LessonData, "id" | "subjectIndex" | "appearanceSeed">) {
  const subjectIndex = positiveModulo(lesson.subjectIndex ?? 0, subjectThemes.length);
  const theme = subjectThemes[subjectIndex];
  const seed = Math.abs(lesson.appearanceSeed ?? lesson.id.length);
  const hueShift = positiveModulo(seed * 5, 7) - 3;
  const lightShift = (positiveModulo(seed * 7, 9) - 4) / 2;

  return {
    icon: theme.icons[positiveModulo(seed, theme.icons.length)],
    gradientColors: [
      `hsl(${theme.hues[0] + hueShift} ${theme.saturation[0]}% ${theme.lightness[0] + lightShift}%)`,
      `hsl(${theme.hues[1] + hueShift} ${theme.saturation[1]}% ${theme.lightness[1] + lightShift}%)`,
    ],
  };
}

interface ElasticLayerOptions {
  intensity: number;
  z: number;
  stiffness: number;
  damping: number;
  mass: number;
}

function useElasticFollower(
  sourceX: MotionValue<number>,
  sourceY: MotionValue<number>,
  options: ElasticLayerOptions,
) {
  const targetX = useTransform(sourceX, (value) => value * options.intensity);
  const targetY = useTransform(sourceY, (value) => value * options.intensity);
  const x = useSpring(targetX, options);
  const y = useSpring(targetY, options);
  const transform = useMotionTemplate`translate3d(${x}px, ${y}px, ${options.z}px)`;

  return { x, y, transform };
}

export function LessonCard({
  lesson,
  onClick,
  className,
  showIcons = true,
  enable3D = false,
}: LessonCardProps) {
  const appearance = resolveLessonAppearance(lesson);
  const Icon = showIcons ? lesson.icon ?? appearance.icon : undefined;
  const reduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const smoothTiltX = useSpring(tiltX, { stiffness: 190, damping: 32 });
  const smoothTiltY = useSpring(tiltY, { stiffness: 190, damping: 32 });
  const rotateX = useTransform(smoothTiltY, [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(smoothTiltX, [-0.5, 0.5], ["-4deg", "4deg"]);
  const iconParallaxX = useTransform(smoothTiltX, [-0.5, 0.5], [-2.5, 2.5]);
  const iconParallaxY = useTransform(smoothTiltY, [-0.5, 0.5], [-2, 2]);
  const iconLayerTransform = useMotionTemplate`translate3d(${iconParallaxX}px, ${iconParallaxY}px, 12px) scale(0.995)`;
  const cursorLayerX = useTransform(tiltX, [-0.5, 0.5], [-6, 6]);
  const cursorLayerY = useTransform(tiltY, [-0.5, 0.5], [-4, 4]);
  const titleLayer = useElasticFollower(cursorLayerX, cursorLayerY, {
    intensity: 1, z: 8, stiffness: 180, damping: 26, mass: 0.65,
  });
  const typeLayer = useElasticFollower(titleLayer.x, titleLayer.y, {
    intensity: 0.72, z: 6, stiffness: 165, damping: 25, mass: 0.7,
  });
  const timeLayer = useElasticFollower(typeLayer.x, typeLayer.y, {
    intensity: 0.68, z: 4, stiffness: 150, damping: 24, mass: 0.76,
  });
  const teacherLayer = useElasticFollower(titleLayer.x, titleLayer.y, {
    intensity: 0.74, z: 6, stiffness: 145, damping: 23, mass: 0.85,
  });
  const roomLayer = useElasticFollower(teacherLayer.x, teacherLayer.y, {
    intensity: 0.68, z: 4, stiffness: 130, damping: 22, mass: 0.95,
  });
  const spotlight = useMotionTemplate`radial-gradient(210px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,.22), transparent 74%)`;

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - bounds.left;
    const localY = event.clientY - bounds.top;
    mouseX.set(localX);
    mouseY.set(localY);

    if (enable3D && !reduceMotion && event.pointerType === "mouse") {
      tiltX.set(Math.max(-0.5, Math.min(0.5, localX / bounds.width - 0.5)));
      tiltY.set(Math.max(-0.5, Math.min(0.5, localY / bounds.height - 0.5)));
    }
  };

  const handlePointerLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const gradientColors = lesson.gradientColors ?? appearance.gradientColors;
  const backgroundStyle =
    gradientColors.length >= 2
      ? {
          backgroundImage: `linear-gradient(125deg, ${gradientColors[0]}, ${gradientColors[1]})`,
        }
      : {
          backgroundColor: lesson.subjectColor || "var(--color-indigo-500)",
        };

  return (
    <motion.div
      initial="rest"
      whileHover={reduceMotion ? undefined : "hover"}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? lesson.subjectName : undefined}
      data-3d={enable3D ? "on" : "off"}
      style={enable3D ? { perspective: "900px" } : undefined}
      className={cn(
        "relative w-full min-h-[90px] rounded-[18px] mb-2 text-left outline-none group",
        "focus-visible:ring-4 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        !onClick && "cursor-default",
        className
      )}
    >
      <motion.div
        variants={{
          rest: { y: 0, scale: 1 },
          hover: enable3D
            ? { y: -1.5, scale: 1.008 }
            : { y: -2, scale: 1.01 },
        }}
        whileTap={onClick && !reduceMotion ? { scale: 0.985 } : undefined}
        style={
          enable3D
            ? {
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                transformOrigin: "center center",
                backfaceVisibility: "hidden",
                willChange: "transform",
              }
            : { transformStyle: "flat" }
        }
        className={cn(
          "relative isolate w-full min-h-[90px] rounded-[18px] transform-gpu overflow-visible",
          "shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-[box-shadow,filter] duration-500 group-hover:shadow-[0_10px_22px_-14px_rgba(15,23,42,0.38)]",
          enable3D &&
            "shadow-[0_10px_22px_-15px_rgba(15,23,42,.55),0_3px_0_-2px_rgba(15,23,42,.18)]",
        )}
      >
      <div
        className="absolute inset-0 rounded-[18px] overflow-hidden z-0"
        style={{
          ...backgroundStyle,
          transform: enable3D ? "translateZ(0px)" : undefined,
        }}
      />

      {Icon && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 z-10 overflow-hidden rounded-[18px] pointer-events-none"
          style={
            enable3D
              ? { transform: iconLayerTransform, transformStyle: "preserve-3d" }
              : { transformStyle: "flat" }
          }
        >
          <div
            className="absolute -inset-5 grid opacity-20 transition-opacity duration-500 group-hover:opacity-30"
            style={{
              gridTemplateColumns: "repeat(12, 38px)",
              gridAutoRows: "38px",
            }}
          >
            {Array.from({ length: 60 }).map((_, index) => {
              const row = Math.floor(index / 12);
              const column = index % 12;
              return (
                <span key={index} className="flex h-[38px] w-[38px] items-center justify-center">
                  {(row + column) % 2 === 0 && (
                    <Icon size={18} color="white" weight="regular" className="-rotate-12" />
                  )}
                </span>
              );
            })}
          </div>
        </motion.div>
      )}

      <motion.div
        aria-hidden="true"
        className="absolute inset-0 z-10 rounded-[18px] opacity-0 transition-opacity duration-300 pointer-events-none group-hover:opacity-100"
        style={{
          background: spotlight,
          transform: enable3D ? "translateZ(22px)" : undefined,
        }}
      />
      {enable3D && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 rounded-[18px] border border-white/18 shadow-[inset_0_1px_0_rgba(255,255,255,.18)]"
            style={{ transform: "translateZ(20px)" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-1 -z-10 rounded-[18px] bg-zinc-950/25 blur-[1px]"
            style={{ transform: "translate3d(0, 5px, -10px)" }}
          />
        </>
      )}
      <div
        aria-hidden="true"
        className="absolute inset-x-5 -bottom-1 -z-10 h-4 rounded-full bg-black/20 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-45"
      />

      {lesson.isActive && (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-[18px] border-[3.5px] border-black/60 shadow-[inset_0_0_24px_rgba(0,0,0,.6)] dark:border-white/95 dark:shadow-[inset_0_0_24px_rgba(255,255,255,.95)] z-30 pointer-events-none"
          style={{ transform: enable3D ? "translateZ(22px)" : undefined }}
        />
      )}

      <motion.div
        className="relative z-20 flex flex-col justify-between h-full p-3 py-2.5"
        style={
          enable3D
            ? { transform: "translateZ(16px) scale(0.985)", transformStyle: "preserve-3d" }
            : undefined
        }
      >
        <div className="flex flex-row justify-between items-center mb-0.5">
          <motion.div
            className={cn(
              "flex flex-row items-center px-1.5 py-0.5 rounded-md",
              lesson.isActive ? "bg-zinc-950 dark:bg-white" : "bg-black/35"
            )}
            style={{ transform: enable3D ? timeLayer.transform : undefined }}
          >
            {showIcons && <div className="w-3 h-3 flex items-center justify-center mr-1">
              {lesson.isActive ? (
                <Hourglass
                  size={11}
                  weight="fill"
                  style={{ color: lesson.activeTextColor || "var(--background)" }}
                />
              ) : (
                <Clock size={11} color="white" weight="regular" />
              )}
            </div>}
            <span
              className={cn(
                "text-[11px] font-bold tabular-nums",
                lesson.isActive ? "" : "text-white"
              )}
              style={lesson.isActive ? { color: lesson.activeTextColor || "var(--background)" } : undefined}
            >
              {lesson.isActive
                ? `${lesson.activeLabel || "Left"} ${lesson.timeLeft}`
                : `${lesson.timeStart} - ${lesson.timeEnd}`}
            </span>
          </motion.div>

          {lesson.displayType && (
            <motion.div
              className="bg-white/15 px-1.5 py-[2px] rounded-md border border-white/30"
              style={{ transform: enable3D ? typeLayer.transform : undefined }}
            >
              <span className="text-white text-[8px] font-extrabold uppercase tracking-widest">
                {lesson.displayType}
              </span>
            </motion.div>
          )}
        </div>

        <motion.div
          className="my-0.5"
          style={{ transform: enable3D ? titleLayer.transform : undefined }}
        >
          <span className="text-[17px] font-extrabold text-white drop-shadow-sm line-clamp-1">
            {lesson.subjectName}
          </span>
        </motion.div>

        <div className="flex flex-row items-center mt-0.5 gap-2.5">
          <motion.div
            className="flex flex-row items-center bg-black/15 px-[5px] py-0.5 rounded-[5px] max-w-[55%] mr-0"
            style={{ transform: enable3D ? teacherLayer.transform : undefined }}
          >
              {showIcons && <div className="w-3 h-3 flex items-center justify-center mr-1">
                <User size={11} color="rgba(255,255,255,0.85)" weight="fill" />
              </div>}
              <span className="text-white/90 text-[10px] font-semibold line-clamp-1">
                {lesson.teacherName || "—"}
              </span>
          </motion.div>

          {(lesson.displayRoom || lesson.displayBuilding) && (
            <motion.div
              className="flex flex-row items-center bg-black/15 px-1.5 py-0.5 rounded-md max-w-[55%]"
              style={{ transform: enable3D ? roomLayer.transform : undefined }}
            >
              {showIcons && <div className="w-3 h-3 flex items-center justify-center mr-1">
                <MapPin size={11} color="rgba(255,255,255,0.85)" weight="fill" />
              </div>}
              <span className="text-white/90 text-[10px] font-semibold line-clamp-1">
                {lesson.displayBuilding ? `${lesson.displayBuilding} ` : ""}
                {lesson.displayRoom}
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
      </motion.div>
    </motion.div>
  );
}

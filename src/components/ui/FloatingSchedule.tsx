"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowCounterClockwise,
  CalendarBlank,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  LessonCard,
  resolveLessonAppearance,
  type LessonData,
} from "@/components/ui/LessonCard";
import { BreakCard } from "@/components/ui/BreakCard";

const weekDates = [29, 30, 1, 2, 3, 4, 5];
const weekKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

const timeSlots = [
  { start: "09:00", end: "10:30", startMins: 540, endMins: 630 },
  { start: "10:40", end: "12:10", startMins: 640, endMins: 730 },
  { start: "12:20", end: "13:50", startMins: 740, endMins: 830 },
];

interface GeneratedLesson {
  id: string;
  subjectIndex: number;
  appearanceSeed: number;
  subjectName: string;
  displayType: string;
  displayRoom: string;
  teacherName: string;
  timeStart: string;
  timeEnd: string;
  startMins: number;
  endMins: number;
}

interface DaySchedule {
  dayIndex: number;
  lessons: GeneratedLesson[];
}

export function FloatingSchedule() {
  const tHero = useTranslations("Hero.preview");
  const tCards = useTranslations("DecorativeCards");
  const reduceMotion = useReducedMotion();
  const [localizedContent] = useState(() => ({
    subjects: tCards.raw("subjects") as string[],
    types: tCards.raw("types") as string[],
    rooms: tCards.raw("rooms") as string[],
    teachers: tCards.raw("teachers") as string[],
  }));

  const [isClient, setIsClient] = useState(false);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [autoSelectedDay, setAutoSelectedDay] = useState<number>(0);
  const [currentRealDay, setCurrentRealDay] = useState<number>(0);
  const [currentMins, setCurrentMins] = useState<number>(0);

  useEffect(() => {
    const { subjects, types, rooms, teachers } = localizedContent;

    const generatedSchedule: DaySchedule[] = [];

    for (let i = 0; i < 7; i++) {
      let count = 0;
      if (i < 5) {
        count = Math.floor(Math.random() * 2) + 2;
      } else if (i === 5) {
        count = Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : 0;
      }

      const lessons: GeneratedLesson[] = [];
      const availableSubjectIndexes = subjects.map((_, index) => index);
      for (let j = 0; j < count; j++) {
        const randomSubjectPosition = Math.floor(Math.random() * availableSubjectIndexes.length);
        const [subjectIndex] = availableSubjectIndexes.splice(randomSubjectPosition, 1);
        lessons.push({
          id: `day${i}-lesson${j}`,
          subjectIndex,
          appearanceSeed: i * timeSlots.length + j,
          subjectName: subjects[subjectIndex],
          displayType: types[Math.floor(Math.random() * types.length)],
          displayRoom: rooms[Math.floor(Math.random() * rooms.length)],
          teacherName: teachers[Math.floor(Math.random() * teachers.length)],
          timeStart: timeSlots[j].start,
          timeEnd: timeSlots[j].end,
          startMins: timeSlots[j].startMins,
          endMins: timeSlots[j].endMins,
        });
      }
      generatedSchedule.push({ dayIndex: i, lessons });
    }

    const now = new Date();
    const currentDayIndex = (now.getDay() + 6) % 7;
    const mins = now.getHours() * 60 + now.getMinutes();

    let targetDay = currentDayIndex;
    const todayLessons = generatedSchedule[currentDayIndex].lessons;

    if (todayLessons.length === 0 || mins >= todayLessons[todayLessons.length - 1].endMins) {
      for (let i = 1; i <= 7; i++) {
        const nextDay = (currentDayIndex + i) % 7;
        if (generatedSchedule[nextDay].lessons.length > 0) {
          targetDay = nextDay;
          break;
        }
      }
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    const frame = window.requestAnimationFrame(() => {
      setSchedule(generatedSchedule);
      setCurrentRealDay(currentDayIndex);
      setAutoSelectedDay(targetDay);
      setSelectedDay(targetDay);
      setCurrentMins(mins);
      setIsClient(true);

      interval = setInterval(() => {
        const date = new Date();
        setCurrentMins(date.getHours() * 60 + date.getMinutes());
      }, 60000);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (interval) clearInterval(interval);
    };
  }, [localizedContent]);

  if (!isClient) {
    return (
      <div className="relative mx-auto w-full max-w-[460px] perspective-1000 min-h-[500px] opacity-0" />
    );
  }

  const lessons = schedule[selectedDay]?.lessons || [];
  let dayBreakIndex = -1;
  let isBreakNow = false;
  let breakDuration = 0;
  let breakTimeLeft = 0;

  if (lessons.length > 1) {
    if (selectedDay === currentRealDay) {
      for (let i = 0; i < lessons.length - 1; i++) {
        const l1 = lessons[i];
        const l2 = lessons[i + 1];
        if (currentMins >= l1.endMins && currentMins < l2.startMins) {
          dayBreakIndex = i;
          isBreakNow = true;
          breakDuration = l2.startMins - l1.endMins;
          breakTimeLeft = l2.startMins - currentMins;
          break;
        } else if (currentMins < l1.endMins) {
          dayBreakIndex = i;
          isBreakNow = false;
          breakDuration = l2.startMins - l1.endMins;
          break;
        }
      }
      if (dayBreakIndex === -1) {
        dayBreakIndex = 0;
        breakDuration = lessons[1].startMins - lessons[0].endMins;
      }
    } else {
      dayBreakIndex = 0;
      breakDuration = lessons[1].startMins - lessons[0].endMins;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 36, rotateY: -8 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[460px] perspective-1000"
    >
      <div className="absolute -inset-10 -z-10 rounded-full bg-gradient-to-br from-indigo-500/25 via-cyan-400/10 to-pink-500/20 blur-3xl" />
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-zinc-100 shadow-[0_32px_90px_-28px_rgba(30,41,59,.55)] dark:border-white/10 dark:bg-zinc-950"
      >
        <div className="border-b border-zinc-200/80 bg-white/82 px-3 pb-1.5 pt-3 backdrop-blur-2xl dark:border-zinc-800 dark:bg-zinc-950/82">
          <div className="flex min-h-8 items-center justify-between gap-3">
            <div className="flex min-h-[30px] max-w-[42%] items-center rounded-[11px] border border-zinc-200 bg-zinc-50 px-2.5 dark:border-zinc-800 dark:bg-zinc-900">
              <span className="mr-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
              <span className="truncate text-[13px] font-bold text-zinc-900 dark:text-white">
                {tHero("scheduleName")}
              </span>
            </div>
            <div className="flex min-w-0 items-center justify-end gap-1.5">
              <span className="truncate text-right text-[17px] font-extrabold leading-[22px] tracking-[-0.35px] text-zinc-900 dark:text-white">
                {tHero("month")}
              </span>
              <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center text-zinc-400 dark:text-zinc-600">
                <CalendarBlank size={17} weight="bold" />
              </span>
              <button
                type="button"
                onClick={() => setSelectedDay(autoSelectedDay)}
                disabled={selectedDay === autoSelectedDay}
                aria-label={tHero("resetDay")}
                title={tHero("resetDay")}
                className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  selectedDay === autoSelectedDay
                    ? "cursor-default text-zinc-400 dark:text-zinc-600"
                    : "text-indigo-500 hover:bg-indigo-500/10 hover:text-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-300"
                }`}
              >
                <ArrowCounterClockwise size={17} weight="bold" />
              </button>
            </div>
          </div>
          <div className="pt-0.5 pb-1">
            <div className="grid grid-cols-7 gap-0.5 rounded-[15px] border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
              {weekKeys.map((key, index) => {
                const isSelected = index === selectedDay;
                const hasLessons = schedule[index]?.lessons.length > 0;
                return (
                  <button
                    key={key}
                    onClick={() => hasLessons && setSelectedDay(index)}
                    disabled={!hasLessons}
                    className={`relative flex h-10 min-w-0 flex-col items-center justify-center rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isSelected
                        ? "bg-indigo-500 text-white shadow-md"
                        : hasLessons
                        ? "text-zinc-500 hover:bg-zinc-200/50 dark:text-zinc-400 dark:hover:bg-zinc-800/50 cursor-pointer"
                        : "text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <span className="text-[8px] font-extrabold uppercase leading-[10px] tracking-[.25px]">
                      {tHero(`days.${key}`)}
                    </span>
                    <span
                      className={`text-[15px] font-extrabold leading-[18px] ${
                        isSelected ? "text-white" : hasLessons ? "text-zinc-900 dark:text-white" : "text-inherit"
                      }`}
                    >
                      {weekDates[index]}
                    </span>
                    {isSelected && <span className="absolute bottom-0.5 h-[3px] w-[3px] rounded-full bg-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="p-4 relative min-h-[412px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, x: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -16, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col relative z-10 w-full"
            >
              {lessons.map((lesson, idx) => {
                const isToday = selectedDay === currentRealDay;
                const isActiveLesson = isToday && currentMins >= lesson.startMins && currentMins < lesson.endMins;
                const lessonTimeLeft = lesson.endMins - currentMins;

                const mappedData: LessonData = {
                  id: lesson.id,
                  subjectIndex: lesson.subjectIndex,
                  appearanceSeed: lesson.appearanceSeed,
                  subjectName: lesson.subjectName,
                  displayType: lesson.displayType,
                  displayRoom: lesson.displayRoom,
                  teacherName: lesson.teacherName,
                  timeStart: lesson.timeStart,
                  timeEnd: lesson.timeEnd,
                  isActive: isActiveLesson,
                  activeLabel: tHero("activeLabel"),
                  timeLeft: isActiveLesson ? `${lessonTimeLeft} ${tHero("minutesLabel")}` : undefined,
                };
                const { gradientColors } = resolveLessonAppearance(mappedData);

                return (
                  <div key={lesson.id} className="flex flex-col w-full">
                    <LessonCard lesson={mappedData} className={idx === lessons.length - 1 ? "mb-0" : ""} />
                    {idx === dayBreakIndex && lessons[idx + 1] && (
                      <BreakCard
                        isVisible={true}
                        isBreakNow={isBreakNow}
                        durationMinutes={breakDuration}
                        timeLeft={isBreakNow ? `${breakTimeLeft} ${tHero("minutesLabel")}` : null}
                        label={tHero("breakLabel")}
                        leftLabel={tHero("activeLabel")}
                        minutesLabel={tHero("minutesLabel")}
                        gradientColors={gradientColors}
                      />
                    )}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

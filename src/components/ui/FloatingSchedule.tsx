"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowCounterClockwise,
  Bell,
  CalendarBlank,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import {
  LessonCard,
  resolveLessonAppearance,
  type LessonData,
} from "@/components/ui/LessonCard";
import { BreakCard } from "@/components/ui/BreakCard";

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

interface LocalizedContent {
  subjects: string[];
  types: string[];
  rooms: string[];
  teachers: string[];
}

interface DaySelection {
  dayIndex: number;
  todayKey: string;
  weekStartKey: string;
}

function getWeekStart(date: Date) {
  const weekStart = new Date(date);
  const dayIndex = (weekStart.getDay() + 6) % 7;
  weekStart.setHours(12, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - dayIndex);
  return weekStart;
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function getWeekDates(weekStartKey: string) {
  if (!weekStartKey) return [];

  const weekStart = getDateFromKey(weekStartKey);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seed: number) {
  let state = seed || 1;

  return () => {
    state = Math.imul(state ^ (state >>> 15), 1 | state);
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
}

function createSchedule(content: LocalizedContent, weekStartKey: string) {
  const random = createSeededRandom(hashString(weekStartKey));
  const generatedSchedule: DaySchedule[] = [];

  for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
    let lessonCount = 0;

    if (dayIndex < 5) {
      lessonCount = 3;
    } else if (dayIndex === 5 && random() > 0.52) {
      lessonCount = random() > 0.55 ? 2 : 1;
    }

    const lessons: GeneratedLesson[] = [];
    const availableSubjectIndexes = content.subjects.map((_, index) => index);

    for (let lessonIndex = 0; lessonIndex < lessonCount; lessonIndex += 1) {
      const randomSubjectPosition = Math.floor(
        random() * availableSubjectIndexes.length,
      );
      const [subjectIndex] = availableSubjectIndexes.splice(
        randomSubjectPosition,
        1,
      );
      const timeSlot = timeSlots[lessonIndex];

      lessons.push({
        id: `${weekStartKey}-day${dayIndex}-lesson${lessonIndex}`,
        subjectIndex,
        appearanceSeed:
          hashString(weekStartKey) + dayIndex * timeSlots.length + lessonIndex,
        subjectName: content.subjects[subjectIndex],
        displayType: content.types[Math.floor(random() * content.types.length)],
        displayRoom: content.rooms[Math.floor(random() * content.rooms.length)],
        teacherName:
          content.teachers[Math.floor(random() * content.teachers.length)],
        timeStart: timeSlot.start,
        timeEnd: timeSlot.end,
        startMins: timeSlot.startMins,
        endMins: timeSlot.endMins,
      });
    }

    generatedSchedule.push({ dayIndex, lessons });
  }

  return generatedSchedule;
}

function findAutomaticSelection(content: LocalizedContent, now: Date) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const scheduleCache = new Map<string, DaySchedule[]>();

  for (let offset = 0; offset < 21; offset += 1) {
    const candidateDate = new Date(now);
    candidateDate.setHours(12, 0, 0, 0);
    candidateDate.setDate(now.getDate() + offset);

    const weekStartKey = getDateKey(getWeekStart(candidateDate));
    let schedule = scheduleCache.get(weekStartKey);

    if (!schedule) {
      schedule = createSchedule(content, weekStartKey);
      scheduleCache.set(weekStartKey, schedule);
    }

    const dayIndex = (candidateDate.getDay() + 6) % 7;
    const lessons = schedule[dayIndex]?.lessons ?? [];

    if (lessons.length === 0) continue;
    if (offset === 0 && lessons.every((lesson) => lesson.endMins <= currentMinutes)) {
      continue;
    }

    return {
      dayIndex,
      todayKey: getDateKey(now),
      weekStartKey,
    } satisfies DaySelection;
  }

  return {
    dayIndex: (now.getDay() + 6) % 7,
    todayKey: getDateKey(now),
    weekStartKey: getDateKey(getWeekStart(now)),
  } satisfies DaySelection;
}

export function FloatingSchedule() {
  const tHero = useTranslations("Hero.preview");
  const tCards = useTranslations("DecorativeCards");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const [localizedContent] = useState<LocalizedContent>(() => ({
    subjects: tCards.raw("subjects") as string[],
    types: tCards.raw("types") as string[],
    rooms: tCards.raw("rooms") as string[],
    teachers: tCards.raw("teachers") as string[],
  }));
  const [clock, setClock] = useState<Date | null>(null);
  const [manualSelection, setManualSelection] = useState<DaySelection | null>(
    null,
  );

  useEffect(() => {
    const updateClock = () => setClock(new Date());
    const frame = window.requestAnimationFrame(updateClock);
    const interval = window.setInterval(updateClock, 60_000);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(interval);
    };
  }, []);

  const todayKey = clock ? getDateKey(clock) : "";
  const automaticSelection = useMemo(
    () => (clock ? findAutomaticSelection(localizedContent, clock) : null),
    [clock, localizedContent],
  );
  const activeManualSelection =
    manualSelection?.todayKey === todayKey ? manualSelection : null;
  const activeSelection = activeManualSelection ?? automaticSelection;
  const weekStartKey = activeSelection?.weekStartKey ?? "";
  const weekDates = useMemo(() => getWeekDates(weekStartKey), [weekStartKey]);
  const schedule = useMemo(
    () => (weekStartKey ? createSchedule(localizedContent, weekStartKey) : []),
    [localizedContent, weekStartKey],
  );

  if (!clock || !automaticSelection || !activeSelection || weekDates.length === 0) {
    return (
      <div className="relative mx-auto min-h-[518px] w-full max-w-[460px] opacity-0" />
    );
  }

  const selectedDayIndex = activeSelection.dayIndex;
  const lessons = schedule[selectedDayIndex]?.lessons ?? [];
  const selectedDate = weekDates[selectedDayIndex];
  const currentMinutes = clock.getHours() * 60 + clock.getMinutes();
  const isSelectedToday = getDateKey(selectedDate) === todayKey;
  const isAutomaticDate =
    selectedDayIndex === automaticSelection.dayIndex &&
    weekStartKey === automaticSelection.weekStartKey;
  const rawMonthLabel = new Intl.DateTimeFormat(
    locale === "uk" ? "uk-UA" : "en-US",
    { month: "long", year: "numeric" },
  ).format(selectedDate);
  const monthLabel =
    rawMonthLabel.charAt(0).toUpperCase() + rawMonthLabel.slice(1);
  let dayBreakIndex = -1;
  let isBreakNow = false;
  let breakDuration = 0;
  let breakTimeLeft = 0;

  if (lessons.length > 1) {
    if (isSelectedToday) {
      dayBreakIndex = lessons.findIndex((lesson, index) => {
        const nextLesson = lessons[index + 1];
        return (
          Boolean(nextLesson) &&
          currentMinutes >= lesson.startMins &&
          currentMinutes < nextLesson.startMins
        );
      });

      if (dayBreakIndex === -1) {
        dayBreakIndex = lessons.findIndex(
          (lesson, index) =>
            index < lessons.length - 1 && lesson.startMins > currentMinutes,
        );
      }
    } else {
      dayBreakIndex = 0;
    }

    if (dayBreakIndex >= 0) {
      const lesson = lessons[dayBreakIndex];
      const nextLesson = lessons[dayBreakIndex + 1];
      isBreakNow =
        isSelectedToday &&
        currentMinutes >= lesson.endMins &&
        currentMinutes < nextLesson.startMins;
      breakDuration = nextLesson.startMins - lesson.endMins;
      breakTimeLeft = nextLesson.startMins - currentMinutes;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.65,
        delay: 0.25,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative mx-auto w-full max-w-[460px]"
    >
      <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-zinc-100 shadow-[0_24px_60px_-30px_rgba(15,23,42,.45)] dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-[0_24px_60px_-30px_rgba(0,0,0,.9)]">
        <div className="border-b border-zinc-200 bg-white px-3 pb-2 pt-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex min-h-8 items-center justify-between gap-2">
            <div className="flex min-h-[30px] max-w-[42%] min-w-0 items-center rounded-[11px] border border-zinc-200 bg-zinc-50 px-2.5 dark:border-zinc-800 dark:bg-zinc-900">
              <span className="mr-2 h-2 w-2 shrink-0 rounded-full bg-[#3B82F6]" />
              <span className="truncate text-[13px] font-bold text-zinc-900 dark:text-white">
                {tHero("scheduleName")}
              </span>
            </div>

            <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
              <span className="min-w-0 truncate text-right text-[17px] font-extrabold leading-[22px] tracking-[-0.25px] text-zinc-900 dark:text-white">
                {monthLabel}
              </span>
              <span
                aria-hidden="true"
                className="flex h-[30px] w-[30px] shrink-0 items-center justify-center text-zinc-400 dark:text-zinc-600"
              >
                <CalendarBlank size={17} weight="bold" />
              </span>
              <span
                aria-hidden="true"
                className="relative flex h-[30px] w-[30px] shrink-0 items-center justify-center text-zinc-400 dark:text-zinc-600"
              >
                <Bell size={17} weight="fill" />
                <span className="absolute right-[5px] top-[5px] h-2 w-2 rounded-full border border-white bg-zinc-400 dark:border-zinc-950 dark:bg-zinc-600" />
              </span>
              <button
                type="button"
                onClick={() => setManualSelection(null)}
                disabled={isAutomaticDate}
                aria-label={tHero("resetDay")}
                title={tHero("resetDay")}
                className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] ${
                  isAutomaticDate
                    ? "cursor-default text-zinc-300 dark:text-zinc-700"
                    : "text-[#3B82F6] hover:text-[#2563EB]"
                }`}
              >
                <ArrowCounterClockwise size={17} weight="bold" />
              </button>
            </div>
          </div>

          <div className="pt-1.5">
            <div className="grid grid-cols-7 gap-0.5 rounded-[15px] border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
              {weekKeys.map((key, index) => {
                const date = weekDates[index];
                const isSelected = index === selectedDayIndex;
                const isToday = getDateKey(date) === todayKey;

                return (
                  <button
                    key={getDateKey(date)}
                    type="button"
                    onClick={() =>
                      setManualSelection({
                        dayIndex: index,
                        todayKey,
                        weekStartKey,
                      })
                    }
                    aria-current={isToday ? "date" : undefined}
                    aria-pressed={isSelected}
                    className={`relative flex h-10 min-w-0 flex-col items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] ${
                      isSelected
                        ? "bg-[#3B82F6] text-white"
                        : isToday
                          ? "bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#60A5FA]"
                          : "text-zinc-500 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span className="text-[8px] font-extrabold uppercase leading-[10px] tracking-[.25px]">
                      {tHero(`days.${key}`)}
                    </span>
                    <span
                      className={`text-[15px] font-extrabold leading-[18px] ${
                        isSelected
                          ? "text-white"
                          : isToday
                            ? "text-[#2563EB] dark:text-[#60A5FA]"
                            : "text-zinc-900 dark:text-white"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {isToday && (
                      <span
                        className={`absolute bottom-0.5 h-[3px] w-[3px] rounded-full ${
                          isSelected ? "bg-white" : "bg-[#3B82F6]"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative h-[412px] overflow-hidden p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${weekStartKey}-${selectedDayIndex}`}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{
                duration: reduceMotion ? 0 : 0.22,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative z-10 flex w-full flex-col"
            >
              {lessons.length === 0 && (
                <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
                  <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                    {tHero("emptyTitle")}
                  </p>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
                    {tHero("emptyHint")}
                  </p>
                </div>
              )}

              {lessons.map((lesson, index) => {
                const isToday = isSelectedToday;
                const isActiveLesson =
                  isToday &&
                  currentMinutes >= lesson.startMins &&
                  currentMinutes < lesson.endMins;
                const lessonTimeLeft = lesson.endMins - currentMinutes;
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
                  timeLeft: isActiveLesson
                    ? `${lessonTimeLeft} ${tHero("minutesLabel")}`
                    : undefined,
                };
                const { gradientColors } = resolveLessonAppearance(mappedData);

                return (
                  <div key={lesson.id} className="flex w-full flex-col">
                    <LessonCard
                      lesson={mappedData}
                      className={index === lessons.length - 1 ? "mb-0" : ""}
                    />
                    {index === dayBreakIndex && lessons[index + 1] && (
                      <BreakCard
                        isVisible
                        isBreakNow={isBreakNow}
                        durationMinutes={breakDuration}
                        timeLeft={
                          isBreakNow
                            ? `${breakTimeLeft} ${tHero("minutesLabel")}`
                            : null
                        }
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
      </div>
    </motion.div>
  );
}

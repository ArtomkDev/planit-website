"use client";

import {
  Atom,
  BookOpen,
  Calculator,
  CalendarDots,
  CaretDown,
  Check,
  Clock,
  CodeBlock,
  PencilSimple,
  Plus,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ChoiceList, DemoFrame, SettingsGroup } from "./DemoPrimitives";
import styles from "./features.module.css";

type DemoTask = {
  id: number;
  subject: string;
  text: string;
  schedule: "main" | "exams";
  completed: boolean;
  time: string;
};
const initialTasks: DemoTask[] = [
  {
    id: 1,
    subject: "math",
    text: "mathTask",
    schedule: "main",
    completed: false,
    time: "09:00 – 10:30",
  },
  {
    id: 2,
    subject: "informatics",
    text: "codeTask",
    schedule: "main",
    completed: false,
    time: "10:40 – 12:10",
  },
  {
    id: 3,
    subject: "physics",
    text: "physicsTask",
    schedule: "main",
    completed: true,
    time: "12:20 – 13:50",
  },
  {
    id: 4,
    subject: "math",
    text: "examTask",
    schedule: "exams",
    completed: false,
    time: "09:00 – 10:30",
  },
];
const taskAppearance: Record<
  string,
  { colors: string; Icon: typeof Calculator }
> = {
  math: {
    colors: "linear-gradient(125deg, #a7194b, #ef4444)",
    Icon: Calculator,
  },
  informatics: {
    colors: "linear-gradient(125deg, #1e40af, #0891b2)",
    Icon: CodeBlock,
  },
  physics: { colors: "linear-gradient(125deg, #b91c1c, #ea580c)", Icon: Atom },
};

export function TasksDemo() {
  const t = useTranslations("Features.ui");
  const [tasks, setTasks] = useState(() =>
    initialTasks.map((task) => ({ ...task, text: t(task.text) })),
  );
  const [schedule, setSchedule] = useState<"main" | "exams">("main");
  const [filterOpen, setFilterOpen] = useState(false);
  const [editing, setEditing] = useState<DemoTask | null>(null);
  const [status, setStatus] = useState("");
  const visibleTasks = tasks.filter((task) => task.schedule === schedule);
  const pending = visibleTasks.filter((task) => !task.completed).length;
  function reset() {
    setTasks(initialTasks.map((task) => ({ ...task, text: t(task.text) })));
    setSchedule("main");
    setEditing(null);
    setFilterOpen(false);
    setStatus("");
  }
  function saveTask() {
    if (!editing?.text.trim()) return;
    const task = { ...editing, text: editing.text.trim() };
    setTasks((current) =>
      current.some((value) => value.id === task.id)
        ? current.map((value) => (value.id === task.id ? task : value))
        : [...current, task],
    );
    setEditing(null);
    setStatus(t("saved"));
  }

  return (
    <DemoFrame
      title={t(
        editing
          ? tasks.some((task) => task.id === editing.id)
            ? "taskEditor"
            : "newTask"
          : "tasks",
      )}
      onReset={reset}
      status={status}
      action={
        editing ? (
          <>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setEditing(null)}
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              disabled={!editing.text.trim()}
              onClick={saveTask}
            >
              <Check size={18} />
              {t("save")}
            </button>
          </>
        ) : (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              setEditing({
                id: Math.max(...tasks.map((task) => task.id), 0) + 1,
                subject: "math",
                text: "",
                schedule,
                completed: false,
                time: "09:00 – 10:30",
              });
              setFilterOpen(false);
            }}
          >
            <Plus size={19} />
            {t("addTask")}
          </button>
        )
      }
    >
      {editing ? (
        <div className={styles.taskEditor}>
          <SettingsGroup title={t("linkedLesson")}>
            <label className={styles.field}>
              <BookOpen size={20} />
              {t("subject")}
              <select
                className={styles.input}
                value={editing.subject}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    subject: event.target.value,
                    time:
                      event.target.value === "math"
                        ? "09:00 – 10:30"
                        : event.target.value === "informatics"
                          ? "10:40 – 12:10"
                          : "12:20 – 13:50",
                  })
                }
              >
                {["math", "informatics", "physics"].map((subject) => (
                  <option key={subject} value={subject}>
                    {t(subject)}
                  </option>
                ))}
              </select>
            </label>
            <p className={`${styles.help} ${styles.expanded}`}>
              <Clock size={14} className="inline mr-1" />
              {t("tuesday")} · {editing.time}
            </p>
          </SettingsGroup>
          <SettingsGroup title={t("taskText")}>
            <label className={styles.expanded}>
              <span className={styles.status}>{t("taskText")}</span>
              <textarea
                className={styles.input}
                autoFocus
                value={editing.text}
                maxLength={1000}
                placeholder={t("taskPlaceholder")}
                onChange={(event) =>
                  setEditing({ ...editing, text: event.target.value })
                }
              />
            </label>
          </SettingsGroup>
          <p className={styles.help}>{t("taskLessonHint")}</p>
        </div>
      ) : (
        <>
          <div className={styles.taskHeader}>
            <div>
              <h5>{t("tasks")}</h5>
              <p>{t("pendingTasks", { count: pending })}</p>
            </div>
            <button
              type="button"
              className={styles.filterButton}
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <CalendarDots size={18} />
              {t(schedule === "main" ? "mySchedule" : "examSchedule")}
              <CaretDown size={13} />
            </button>
          </div>
          {filterOpen && (
            <ChoiceList
              label={t("scheduleFilter")}
              options={[t("mySchedule"), t("examSchedule")]}
              value={t(schedule === "main" ? "mySchedule" : "examSchedule")}
              onChange={(value) => {
                setSchedule(value === t("mySchedule") ? "main" : "exams");
                setFilterOpen(false);
              }}
            />
          )}
          <div className={styles.taskList}>
            {visibleTasks.map((task) => {
              const { Icon, colors } = taskAppearance[task.subject];
              return (
                <div
                  key={task.id}
                  className={`${styles.taskCard} ${task.completed ? styles.taskCompleted : ""}`}
                  style={{ background: colors }}
                >
                  {!task.completed && (
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black/20" />
                  )}
                  {!task.completed && (
                    <div className={styles.taskPattern} aria-hidden="true">
                      {Array.from({ length: 32 }, (_, index) => (
                        <Icon key={index} size={22} />
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={task.completed}
                    aria-label={`${t("completeTask")}: ${task.text}`}
                    className={styles.taskCheckbox}
                    onClick={() => {
                      setTasks((current) =>
                        current.map((value) =>
                          value.id === task.id
                            ? { ...value, completed: !value.completed }
                            : value,
                        ),
                      );
                      setStatus(
                        t(task.completed ? "taskRestored" : "taskCompleted"),
                      );
                    }}
                  >
                    {task.completed && <Check size={18} weight="bold" />}
                  </button>
                  <div className={styles.taskCopy}>
                    <h6>{t(task.subject)}</h6>
                    {!task.completed && (
                      <>
                        <p>{task.text}</p>
                        <span className={styles.taskMeta}>
                          <Clock size={12} />
                          {t("tuesday")} · {task.time}
                        </span>
                      </>
                    )}
                    <button
                      type="button"
                      className={styles.taskEdit}
                      onClick={() => setEditing({ ...task })}
                    >
                      <PencilSimple size={12} />
                      {t("edit")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </DemoFrame>
  );
}

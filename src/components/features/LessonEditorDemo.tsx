"use client";

import {
  Bell,
  BookOpen,
  CalendarDots,
  CaretDown,
  Check,
  Clock,
  MapPin,
  Tag,
  User,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  ChoiceList,
  DemoFrame,
  DemoTabs,
  type DemoRenderProps,
  LessonPreview,
  SettingRow,
  SettingsGroup,
} from "./DemoPrimitives";
import styles from "./features.module.css";

type ExpandedField =
  | "subject"
  | "type"
  | "teacher"
  | "room"
  | "repeat"
  | "reminder"
  | null;
type LessonDraft = {
  subject: string;
  type: string;
  localType?: string;
  teacher: string;
  room: string;
  start: string;
  end: string;
  timeMode: "slot" | "custom";
  weeks: number[];
  reminder: string;
  scope: "global" | "local";
};

export function LessonEditorDemo({ render }: DemoRenderProps) {
  const t = useTranslations("Features.ui");
  const [initial] = useState<LessonDraft>(() => ({
    subject: t("chemistry"),
    type: t("lecture"),
    teacher: t("teacherName"),
    room: "204",
    start: "09:00",
    end: "10:30",
    timeMode: "slot",
    weeks: [1, 2],
    reminder: "default",
    scope: "global",
  }));
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [expanded, setExpanded] = useState<ExpandedField>(null);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [didSave, setDidSave] = useState(false);

  function update(patch: Partial<LessonDraft>) {
    setDraft((value) => ({ ...value, ...patch }));
    setDidSave(false);
  }
  function toggle(field: ExpandedField) {
    setExpanded((value) => (value === field ? null : field));
  }
  function reset() {
    setDraft(initial);
    setSaved(initial);
    setExpanded(null);
    setScopeOpen(false);
    setDidSave(false);
  }
  const validTime = Boolean(
    draft.start && draft.end && draft.end > draft.start,
  );
  const currentType =
    draft.scope === "local" ? (draft.localType ?? draft.type) : draft.type;
  const repeatValue =
    draft.weeks.length === 2
      ? t("everyWeek")
      : t("selectedWeeks", { weeks: draft.weeks.join(", ") });
  const reminderValue =
    draft.reminder === "default"
      ? t("defaultReminder")
      : draft.reminder === "off"
        ? t("off")
        : t("beforeMinutes", { minutes: draft.reminder });

  const preview = (
    <LessonPreview
      lesson={{
        subjectName: draft.subject,
        subjectIndex:
          draft.subject === t("informatics")
            ? 1
            : draft.subject === t("chemistry")
              ? 4
              : 0,
        displayType: currentType,
        displayRoom: draft.room,
        teacherName: draft.teacher,
        timeStart: draft.start || "—",
        timeEnd: draft.end || "—",
      }}
    />
  );
  const editor = (
    <DemoFrame
      title={t("editLesson")}
      onReset={reset}
      status={didSave ? t("saved") : undefined}
      action={
        <>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              setDraft(saved);
              setExpanded(null);
              setDidSave(false);
            }}
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={!validTime}
            onClick={() => {
              setSaved(draft);
              setExpanded(null);
              setDidSave(true);
            }}
          >
            {didSave && <Check size={18} />}
            {t(didSave ? "saved" : "save")}
          </button>
        </>
      }
    >
      <SettingsGroup title={t("subject")}>
        <SettingRow
          Icon={BookOpen}
          label={t("subjectName")}
          value={draft.subject}
          expanded={expanded === "subject"}
          onClick={() => toggle("subject")}
        />
        {expanded === "subject" && (
          <ChoiceList
            label={t("subject")}
            options={[t("math"), t("informatics"), t("chemistry")]}
            value={draft.subject}
            onChange={(subject) => {
              update({ subject });
              setExpanded(null);
            }}
          />
        )}
      </SettingsGroup>
      <SettingsGroup title={t("time")}>
        <div className={styles.expanded}>
          <DemoTabs
            label={t("time")}
            options={[
              { id: "slot", label: t("slotTime") },
              { id: "custom", label: t("customTime") },
            ]}
            value={draft.timeMode}
            onChange={(timeMode) =>
              update({
                timeMode,
                ...(timeMode === "slot"
                  ? { start: "09:00", end: "10:30" }
                  : {}),
              })
            }
          />
        </div>
        {draft.timeMode === "slot" ? (
          <SettingRow
            Icon={Clock}
            label={t("lessonNumber", { number: 1 })}
            value="09:00 – 10:30"
          />
        ) : (
          <>
            <label className={styles.field}>
              {t("start")}
              <input
                className={styles.input}
                type="time"
                aria-label={t("start")}
                value={draft.start}
                onChange={(event) => update({ start: event.target.value })}
              />
            </label>
            <label className={styles.field}>
              {t("end")}
              <input
                className={styles.input}
                type="time"
                aria-label={t("end")}
                value={draft.end}
                onChange={(event) => update({ end: event.target.value })}
              />
            </label>
            {!validTime && (
              <p role="alert" className={styles.error}>
                {t("invalidTime")}
              </p>
            )}
          </>
        )}
      </SettingsGroup>
      <SettingsGroup
        title={t("classType")}
        extra={
          <button
            type="button"
            className={styles.scopeButton}
            aria-expanded={scopeOpen}
            onClick={() => setScopeOpen(!scopeOpen)}
          >
            {t(draft.scope === "global" ? "allLessons" : "thisLesson")}
            <CaretDown size={12} />
          </button>
        }
      >
        {scopeOpen && (
          <div className={styles.expanded}>
            <DemoTabs
              label={t("scope")}
              options={[
                { id: "global", label: t("allLessons") },
                { id: "local", label: t("thisLesson") },
              ]}
              value={draft.scope}
              onChange={(scope) => update({ scope })}
            />
            <p className={styles.help}>
              {t(
                draft.scope === "global" ? "globalScopeHint" : "localScopeHint",
              )}
            </p>
          </div>
        )}
        <SettingRow
          Icon={Tag}
          label={t("classType")}
          value={currentType}
          expanded={expanded === "type"}
          onClick={() => toggle("type")}
        />
        {expanded === "type" && (
          <ChoiceList
            label={t("classType")}
            options={[t("lecture"), t("practice"), t("lab")]}
            value={currentType}
            onChange={(type) => {
              update(draft.scope === "global" ? { type } : { localType: type });
              setExpanded(null);
            }}
          />
        )}
      </SettingsGroup>
      <SettingsGroup title={t("location")}>
        <SettingRow
          Icon={MapPin}
          label={t("room")}
          value={draft.room}
          expanded={expanded === "room"}
          onClick={() => toggle("room")}
        />
        {expanded === "room" && (
          <div className={styles.expanded}>
            <label className={styles.help}>
              {t("room")}
              <input
                className={styles.input}
                value={draft.room}
                maxLength={40}
                onChange={(event) => update({ room: event.target.value })}
              />
            </label>
          </div>
        )}
      </SettingsGroup>
      <SettingsGroup title={t("people")}>
        <SettingRow
          Icon={User}
          label={t("teacher")}
          value={draft.teacher}
          expanded={expanded === "teacher"}
          onClick={() => toggle("teacher")}
        />
        {expanded === "teacher" && (
          <ChoiceList
            label={t("teacher")}
            options={[t("teacherName"), t("secondTeacher"), t("thirdTeacher")]}
            value={draft.teacher}
            onChange={(teacher) => {
              update({ teacher });
              setExpanded(null);
            }}
          />
        )}
      </SettingsGroup>
      <SettingsGroup title={t("repeat")}>
        <SettingRow
          Icon={CalendarDots}
          label={t("when")}
          value={repeatValue}
          expanded={expanded === "repeat"}
          onClick={() => toggle("repeat")}
        />
        {expanded === "repeat" && (
          <div className={styles.expanded}>
            <DemoTabs
              label={t("repeat")}
              options={[
                { id: "all", label: t("everyWeek") },
                { id: "selected", label: t("chooseWeeks") },
              ]}
              value={draft.weeks.length === 2 ? "all" : "selected"}
              onChange={(mode) =>
                update({ weeks: mode === "all" ? [1, 2] : [1] })
              }
            />
            <p className={styles.help}>{t("cycleWeeks")}</p>
            <div className={styles.chips}>
              {[1, 2].map((week) => (
                <button
                  key={week}
                  type="button"
                  aria-label={t("week", { number: week })}
                  aria-pressed={draft.weeks.includes(week)}
                  onClick={() => {
                    if (draft.weeks.includes(week) && draft.weeks.length === 1)
                      return;
                    update({
                      weeks: draft.weeks.includes(week)
                        ? draft.weeks.filter((value) => value !== week)
                        : [...draft.weeks, week].sort(),
                    });
                  }}
                >
                  {week}
                </button>
              ))}
            </div>
          </div>
        )}
      </SettingsGroup>
      <SettingsGroup title={t("reminders")}>
        <SettingRow
          Icon={Bell}
          label={t("reminderMode")}
          value={reminderValue}
          expanded={expanded === "reminder"}
          onClick={() => toggle("reminder")}
        />
        {expanded === "reminder" && (
          <div className={styles.expanded}>
            <div className={styles.chips}>
              {["default", "off", "5", "10", "15", "30", "60"].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={draft.reminder === value}
                  onClick={() => update({ reminder: value })}
                >
                  {value === "default"
                    ? t("default")
                    : value === "off"
                      ? t("off")
                      : t("minutes", { count: Number(value) })}
                </button>
              ))}
            </div>
            <p className={styles.help}>{t("reminderDemoHint")}</p>
          </div>
        )}
      </SettingsGroup>
    </DemoFrame>
  );
  return render({ editor, preview });
}

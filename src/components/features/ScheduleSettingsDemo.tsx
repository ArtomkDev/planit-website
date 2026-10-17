"use client";

import { Bell, Check, CheckSquare, Stack } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  DemoFrame,
  DemoTabs,
  SettingRow,
  SettingsGroup,
} from "./DemoPrimitives";
import styles from "./features.module.css";

const initialSettings = {
  start: "09:00",
  duration: "90",
  pause: "10",
  repeat: "2",
  reminder: "30",
  autoLink: true,
};

export function ScheduleSettingsDemo() {
  const t = useTranslations("Features.ui");
  const [draft, setDraft] = useState(initialSettings);
  const [saved, setSaved] = useState(initialSettings);
  const [didSave, setDidSave] = useState(false);
  function update(patch: Partial<typeof draft>) {
    setDraft((value) => ({ ...value, ...patch }));
    setDidSave(false);
  }
  const [hours, minutes] = draft.start.split(":").map(Number);
  const start = hours * 60 + minutes;
  const duration = Number(draft.duration);
  const pause = Number(draft.pause);
  const valid = Boolean(
    draft.start &&
      draft.duration &&
      draft.pause &&
      Number.isInteger(duration) &&
      Number.isInteger(pause) &&
      duration >= 5 &&
      duration <= 240 &&
      pause >= 0 &&
      pause <= 120 &&
      start + duration * 3 + pause * 2 <= 1439,
  );
  function formatTime(value: number) {
    return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  }

  return (
    <DemoFrame
      title={t("scheduleSettings")}
      onReset={() => {
        setDraft(initialSettings);
        setSaved(initialSettings);
        setDidSave(false);
      }}
      status={didSave ? t("saved") : undefined}
      action={
        <>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              setDraft(saved);
              setDidSave(false);
            }}
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={!valid}
            onClick={() => {
              setSaved(draft);
              setDidSave(true);
            }}
          >
            {didSave && <Check size={18} />}
            {t(didSave ? "saved" : "save")}
          </button>
        </>
      }
    >
      <SettingsGroup title={t("timing")}>
        <label className={styles.field}>
          {t("dayStart")}
          <input
            type="time"
            className={styles.input}
            value={draft.start}
            onChange={(event) => update({ start: event.target.value })}
          />
        </label>
        <label className={styles.field}>
          {t("allDurations")}
          <input
            type="number"
            min={5}
            max={240}
            className={styles.input}
            value={draft.duration}
            onChange={(event) => update({ duration: event.target.value })}
          />
        </label>
        <label className={styles.field}>
          {t("allBreaks")}
          <input
            type="number"
            min={0}
            max={120}
            className={styles.input}
            value={draft.pause}
            onChange={(event) => update({ pause: event.target.value })}
          />
        </label>
      </SettingsGroup>
      <p className={styles.help}>{t("timingHint")}</p>
      <SettingsGroup title={t("lessonTimes")}>
        {valid ? (
          <div className={styles.slotList}>
            {[0, 1, 2].map((index) => {
              const lessonStart = start + index * (duration + pause);
              return (
                <div key={index}>
                  <div className={styles.slot}>
                    <span>{t("lessonNumber", { number: index + 1 })}</span>
                    <strong>
                      {formatTime(lessonStart)} –{" "}
                      {formatTime(lessonStart + duration)}
                    </strong>
                  </div>
                  {index < 2 && (
                    <p className={styles.slotBreak}>
                      {t("breakMinutes", { count: pause })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p role="alert" className={`${styles.error} ${styles.expanded}`}>
            {t("invalidTiming")}
          </p>
        )}
      </SettingsGroup>
      <SettingsGroup title={t("cycleWeeks")}>
        <SettingRow Icon={Stack} label={t("weekCount")} value={draft.repeat} />
        <div className={styles.expanded}>
          <DemoTabs
            label={t("weekCount")}
            options={[1, 2, 3, 4].map((number) => ({
              id: String(number),
              label: String(number),
            }))}
            value={draft.repeat}
            onChange={(repeat) => update({ repeat })}
          />
        </div>
      </SettingsGroup>
      <SettingsGroup title={t("reminders")}>
        <SettingRow
          Icon={Bell}
          label={t("reminderMode")}
          value={
            draft.reminder === "off"
              ? t("off")
              : t("beforeMinutes", { minutes: draft.reminder })
          }
        />
        <div className={styles.expanded}>
          <div className={styles.chips}>
            {["off", "5", "10", "15", "30", "60"].map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={value === draft.reminder}
                onClick={() => update({ reminder: value })}
              >
                {value === "off"
                  ? t("off")
                  : t("minutes", { count: Number(value) })}
              </button>
            ))}
          </div>
          <p className={styles.help}>{t("reminderDemoHint")}</p>
        </div>
      </SettingsGroup>
      <SettingsGroup title={t("tasks")}>
        <SettingRow
          Icon={CheckSquare}
          label={t("autoLink")}
          value={t("autoLinkHint")}
          trailing={
            <button
              type="button"
              className={styles.switch}
              role="switch"
              aria-label={t("autoLink")}
              aria-checked={draft.autoLink}
              onClick={() => update({ autoLink: !draft.autoLink })}
            >
              <span />
            </button>
          }
        />
      </SettingsGroup>
    </DemoFrame>
  );
}

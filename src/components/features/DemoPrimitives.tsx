"use client";

import {
  ArrowCounterClockwise,
  CaretRight,
  Check,
  type Icon,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { type ReactNode, useId } from "react";
import { LessonCard, type LessonData } from "@/components/ui/LessonCard";
import styles from "./features.module.css";

// Keep each demo's draft in one place while the showcase arranges its two views.
export type DemoRenderProps = {
  render: (parts: { editor: ReactNode; preview?: ReactNode }) => ReactNode;
};

// Palette from PlanIt/src/config/themes.js; these demos mirror its settings UI.
export const subjectColors = [
  { id: "blue", color: "#3B82F6" },
  { id: "indigo", color: "#6366F1" },
  { id: "violet", color: "#8B5CF6" },
  { id: "pink", color: "#EC4899" },
  { id: "teal", color: "#14B8A6" },
  { id: "green", color: "#10B981" },
  { id: "orange", color: "#F97316" },
  { id: "red", color: "#EF4444" },
] as const;

export function DemoFrame({
  title,
  children,
  onReset,
  action,
  status,
}: {
  title: string;
  children: ReactNode;
  onReset: () => void;
  action?: ReactNode;
  status?: string;
}) {
  const t = useTranslations("Features.ui");
  const id = useId();
  return (
    <div className={styles.frame} role="group" aria-labelledby={id}>
      <div className={styles.screenHeader}>
        <h4 id={id}>{title}</h4>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onReset}
          aria-label={t("reset")}
          title={t("reset")}
        >
          <ArrowCounterClockwise size={19} />
        </button>
      </div>
      <div className={styles.screenBody} role="region" aria-label={title} tabIndex={0}>{children}</div>
      {action && <div className={styles.screenFooter}>{action}</div>}
      <span role="status" className={styles.status}>
        {status}
      </span>
    </div>
  );
}

export function SettingsGroup({
  title,
  children,
  extra,
}: {
  title: string;
  children: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <div className={styles.settingsGroup}>
      <div className={styles.groupHeading}>
        <h5>{title}</h5>
        {extra}
      </div>
      <div className={styles.groupBody}>{children}</div>
    </div>
  );
}

export function SettingRow({
  label,
  value,
  Icon,
  onClick,
  expanded,
  trailing,
}: {
  label: string;
  value?: string;
  Icon: Icon;
  onClick?: () => void;
  expanded?: boolean;
  trailing?: ReactNode;
}) {
  const contents = (
    <>
      <Icon size={21} />
      <span className={styles.rowCopy}>
        <span>{label}</span>
        {value && <small>{value}</small>}
      </span>
      {trailing}
      {onClick && (
        <CaretRight
          className={expanded ? styles.caretOpen : undefined}
          size={17}
        />
      )}
    </>
  );
  return onClick ? (
    <button
      type="button"
      className={styles.settingRow}
      onClick={onClick}
      aria-expanded={expanded}
    >
      {contents}
    </button>
  ) : (
    <div className={styles.settingRow}>{contents}</div>
  );
}

export function DemoTabs<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className={styles.tabs} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          type="button"
          key={option.id}
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={value === option.id ? styles.selectedTab : undefined}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ChoiceList({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.choices} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          type="button"
          key={option}
          aria-pressed={value === option}
          onClick={() => onChange(option)}
        >
          {option}
          {value === option && <Check size={17} weight="bold" />}
        </button>
      ))}
    </div>
  );
}

export function LessonPreview({ lesson }: { lesson: Partial<LessonData> }) {
  const t = useTranslations("Features.ui");
  return (
    <div className={styles.lessonPreview}>
      <LessonCard
        lesson={{
          id: "feature-preview",
          subjectName: t("math"),
          subjectIndex: 0,
          textColor: "#ffffff",
          timeStart: "09:00",
          timeEnd: "10:30",
          displayType: t("lecture"),
          displayRoom: "204",
          teacherName: t("teacherName"),
          ...lesson,
        }}
      />
    </div>
  );
}

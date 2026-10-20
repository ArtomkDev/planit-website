"use client";

import {
  Atom,
  BookOpen,
  Calculator,
  Check,
  CodeBlock,
  Flask,
  Image as ImageIcon,
  Palette,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  DemoFrame,
  DemoTabs,
  type DemoRenderProps,
  LessonPreview,
  SettingsGroup,
  subjectColors,
} from "./DemoPrimitives";
import styles from "./features.module.css";

const subjectIcons = [
  { id: "calculator", Icon: Calculator },
  { id: "code", Icon: CodeBlock },
  { id: "flask", Icon: Flask },
  { id: "atom", Icon: Atom },
  { id: "book", Icon: BookOpen },
  { id: "palette", Icon: Palette },
] as const;

const initialAppearance = {
  mode: "gradient" as "color" | "gradient",
  color: "#3B82F6",
  first: "#990000",
  second: "#ff0099",
  angle: 45,
  icon: "calculator",
};

export function AppearanceDemo({ render }: DemoRenderProps) {
  const t = useTranslations("Features.ui");
  const [draft, setDraft] = useState(initialAppearance);
  const [saved, setSaved] = useState(initialAppearance);
  const [didSave, setDidSave] = useState(false);
  function update(patch: Partial<typeof draft>) {
    setDraft((value) => ({ ...value, ...patch }));
    setDidSave(false);
  }
  const Icon =
    subjectIcons.find((icon) => icon.id === draft.icon)?.Icon ?? Calculator;

  const preview = (
    <LessonPreview
      lesson={{
        icon: Icon,
        gradientColors:
          draft.mode === "gradient" ? [draft.first, draft.second] : [],
        subjectColor: draft.color,
        gradientAngle: draft.angle + 90,
      }}
    />
  );
  const editor = (
    <DemoFrame
      title={t("cardColor")}
      onReset={() => {
        setDraft(initialAppearance);
        setSaved(initialAppearance);
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
      <p className={styles.help}>{t("appearanceHint")}</p>
      <div className={styles.gradientControls}>
        <DemoTabs
          label={t("cardColor")}
          options={[
            { id: "color", label: t("color") },
            { id: "gradient", label: t("gradient") },
          ]}
          value={draft.mode}
          onChange={(mode) => update({ mode })}
        />
        {draft.mode === "color" ? (
          <div
            className={styles.colorGrid}
            role="group"
            aria-label={t("color")}
          >
            {subjectColors.map(({ id, color }) => (
              <button
                type="button"
                key={id}
                className={styles.colorTile}
                aria-pressed={draft.color === color}
                onClick={() => update({ color })}
              >
                <span className={styles.swatch} style={{ background: color }}>
                  {draft.color === color && <Check size={24} weight="bold" />}
                </span>
                {t(`colors.${id}`)}
              </button>
            ))}
          </div>
        ) : (
          <SettingsGroup title={t("gradientSettings")}>
            <div className={styles.colorInputs}>
              <label>
                {t("firstColor")}
                <input
                  type="color"
                  value={draft.first}
                  onChange={(event) => update({ first: event.target.value })}
                />
              </label>
              <label>
                {t("secondColor")}
                <input
                  type="color"
                  value={draft.second}
                  onChange={(event) => update({ second: event.target.value })}
                />
              </label>
            </div>
            <label className={styles.rangeField}>
              <span>
                {t("angle")}
                <strong>{draft.angle}°</strong>
              </span>
              <input
                type="range"
                min={0}
                max={359}
                value={draft.angle}
                onChange={(event) =>
                  update({ angle: Number(event.target.value) })
                }
              />
              <span className={styles.rangeScale}>
                <span>0°</span>
                <span>90°</span>
                <span>180°</span>
                <span>270°</span>
                <span>359°</span>
              </span>
            </label>
          </SettingsGroup>
        )}
      </div>
      <SettingsGroup title={t("subjectIcon")} extra={<ImageIcon size={17} />}>
        <div
          className={styles.iconGrid}
          role="group"
          aria-label={t("chooseIcon")}
        >
          {subjectIcons.map(({ id, Icon: ItemIcon }) => (
            <button
              type="button"
              key={id}
              aria-label={t(`icons.${id}`)}
              aria-pressed={draft.icon === id}
              onClick={() => update({ icon: id })}
            >
              <ItemIcon size={24} />
            </button>
          ))}
        </div>
      </SettingsGroup>
    </DemoFrame>
  );
  return render({ editor, preview });
}

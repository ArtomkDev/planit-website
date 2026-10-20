"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowsClockwise, Check, Copy } from "@phosphor-icons/react";
import { createScheduleCodeAnimation, INITIAL_SCHEDULE_CODE, type CodeGlyph } from "@/lib/schedule-code-animation";
import styles from "./schedule-code.module.css";

export function AnimatedScheduleCode() {
  const t = useTranslations("AppShowcase.preview.sharing");
  const currentCodeId = useId();
  const codeRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<ReturnType<typeof createScheduleCodeAnimation> | null>(null);
  const preferenceRef = useRef<MediaQueryList | null>(null);
  const syncRef = useRef(() => {});
  const interactionRef = useRef({ pointer: false, focus: false });
  const lifetimeRef = useRef({ active: false });
  const copyRequestRef = useRef(0);
  const feedbackTimerRef = useRef<number | undefined>(undefined);
  const [currentCode, setCurrentCode] = useState(INITIAL_SCHEDULE_CODE);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [glyphs, setGlyphs] = useState<CodeGlyph[]>(() =>
    INITIAL_SCHEDULE_CODE.split("").map(value => ({ value, phase: "idle", revision: 0 })),
  );

  useEffect(() => {
    const element = codeRef.current;
    if (!element) return;
    let mounted = true;
    const lifetime = { active: true };
    lifetimeRef.current = lifetime;
    let inView = false;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    preferenceRef.current = motionPreference;
    const animation = createScheduleCodeAnimation(next => {
      if (!mounted) return;
      setGlyphs(next);
      if (next.every(glyph => glyph.phase !== "scrambling")) setCurrentCode(next.map(glyph => glyph.value).join(""));
    });
    animationRef.current = animation;
    const sync = () => {
      if (!mounted) return;
      if (!inView || document.hidden || motionPreference.matches) animation.stop();
      else if (interactionRef.current.pointer || interactionRef.current.focus) animation.pause();
      else animation.start();
    };
    syncRef.current = sync;
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.6;
      sync();
    }, { threshold: 0.6 });

    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    motionPreference.addEventListener("change", sync);
    return () => {
      mounted = false;
      lifetime.active = false;
      window.clearTimeout(feedbackTimerRef.current);
      animation.stop();
      animationRef.current = null;
      preferenceRef.current = null;
      syncRef.current = () => {};
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motionPreference.removeEventListener("change", sync);
    };
  }, []);

  const regenerate = () => {
    copyRequestRef.current++;
    window.clearTimeout(feedbackTimerRef.current);
    setCopyStatus("idle");
    animationRef.current?.regenerate(!preferenceRef.current?.matches);
  };

  const copyCode = async () => {
    const request = ++copyRequestRef.current;
    const lifetime = lifetimeRef.current;
    window.clearTimeout(feedbackTimerRef.current);
    setCopyStatus("idle");
    const code = animationRef.current?.stop() ?? currentCode;
    animationRef.current?.pause();
    try {
      await navigator.clipboard.writeText(code);
      if (!lifetime.active || request !== copyRequestRef.current) return;
      setCopyStatus("copied");
    } catch {
      if (!lifetime.active || request !== copyRequestRef.current) return;
      setCopyStatus("error");
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      if (!lifetime.active || request !== copyRequestRef.current) return;
      setCopyStatus("idle");
      syncRef.current();
    }, 1800);
  };

  const feedback = copyStatus === "copied" ? t("copied") : copyStatus === "error" ? t("copyError") : "";

  return (
    <div className={styles.controls}
      onPointerEnter={event => {
        if (event.pointerType === "touch") return;
        interactionRef.current.pointer = true;
        syncRef.current();
      }}
      onPointerLeave={() => { interactionRef.current.pointer = false; syncRef.current(); }}
      onFocusCapture={() => { interactionRef.current.focus = true; syncRef.current(); }}
      onBlurCapture={event => {
        if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
        interactionRef.current.focus = false;
        syncRef.current();
      }}>
      <button type="button" className={styles.refresh} onClick={regenerate} aria-label={t("regenerate")} aria-describedby={currentCodeId} title={t("regenerate")}>
        <span ref={codeRef} aria-hidden="true" className={`${styles.code} font-mono text-2xl font-bold`} data-schedule-code="">
          {glyphs.map((glyph, index) => (
            <span key={index} className={styles.character}>
              <span key={glyph.revision} className={`${styles.glyph} ${glyph.phase === "idle" ? "" : styles[glyph.phase]}`}>
                {glyph.value}
              </span>
            </span>
          ))}
        </span>
        <ArrowsClockwise size={16} aria-hidden="true" />
      </button>
      <span id={currentCodeId} className="sr-only">{t("currentCode", { code: currentCode })}</span>
      <div className={styles.copyWrap}>
        <button type="button" className={styles.copy} onClick={copyCode} aria-label={t("copy")} aria-describedby={currentCodeId} title={t("copy")}>
          {copyStatus === "copied" ? <Check size={20} weight="bold" aria-hidden="true" /> : <Copy size={20} aria-hidden="true" />}
        </button>
        {feedback && <span aria-hidden="true" className={styles.feedback} data-error={copyStatus === "error" || undefined}>{feedback}</span>}
      </div>
      <span role="status" className="sr-only">{feedback}</span>
    </div>
  );
}

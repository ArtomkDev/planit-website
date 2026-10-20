"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./feature-preview.module.css";

type Playback = { mode: "intro" | "hover" | null; active: boolean };

export function FeaturePreviewMotion({ children, accentColor, delay = 0, animate = true, interactive = false }: {
  children: ReactNode;
  accentColor: string;
  delay?: number;
  animate?: boolean;
  interactive?: boolean;
}) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [playback, setPlayback] = useState<Playback>({ mode: null, active: false });
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const element = previewRef.current;
    if (!element || !animate) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let mounted = true;
    let played = false;
    let mode: Playback["mode"] = null;
    let timer: number | undefined;
    const reset = () => {
      window.clearTimeout(timer);
      mode = null;
      if (mounted) setPlayback({ mode: null, active: false });
    };
    const release = () => {
      window.clearTimeout(timer);
      if (!mounted || mode === null) return;
      // Keep the same animation and delay while its strength eases back to zero.
      setPlayback({ mode, active: false });
      timer = window.setTimeout(reset, 520);
    };
    const start = (source: NonNullable<Playback["mode"]>) => {
      if (!mounted || document.hidden || preference.matches) return;
      window.clearTimeout(timer);
      mode = source;
      setCycle(previous => previous + 1);
      setPlayback({ mode, active: true });
      if (source === "intro") timer = window.setTimeout(release, 1800);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!mounted) return;
      if (!entry.isIntersecting || entry.intersectionRatio < 0.6) {
        release();
      } else if (!played && !document.hidden && !preference.matches) {
        played = true;
        if (mode === null) start("intro");
      }
    }, { threshold: 0.6 });
    const card = element.closest<HTMLElement>('[class~="group/card"]');
    const enter = (event: PointerEvent) => { if (event.pointerType !== "touch") start("hover"); };
    const stopWhenHidden = () => { if (document.hidden) reset(); };
    const stopWhenReduced = () => { if (preference.matches) reset(); };

    observer.observe(element);
    card?.addEventListener("pointerenter", enter);
    card?.addEventListener("pointerleave", release);
    document.addEventListener("visibilitychange", stopWhenHidden);
    preference.addEventListener("change", stopWhenReduced);
    return () => {
      mounted = false;
      window.clearTimeout(timer);
      observer.disconnect();
      card?.removeEventListener("pointerenter", enter);
      card?.removeEventListener("pointerleave", release);
      document.removeEventListener("visibilitychange", stopWhenHidden);
      preference.removeEventListener("change", stopWhenReduced);
    };
  }, [animate]);

  return (
    <div ref={previewRef} aria-hidden={interactive ? undefined : true} data-motion={playback.mode || undefined} data-active={playback.active || undefined} data-cycle={cycle}
      style={{ "--intro-delay": `${delay}ms`, "--preview-accent": accentColor } as CSSProperties}
      className={`${styles.preview} grid min-h-32 content-center gap-3 rounded-2xl border border-site-border bg-site-surface-muted/70 p-4 text-site-text`}>
      <div key={cycle} className={styles.cycle}>{children}</div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getCurrentSection, getSectionNavLetter, getSectionNavPoses, getSectionNavUrl, sectionNavEase, sectionNavTargets, SECTION_NAV_CURRENT_GAP, SECTION_NAV_FONT, SECTION_NAV_QUEUE_SCALE } from "@/lib/section-navigation";
import { getSectionNavScrollPlan, runSectionNavScroll, SECTION_NAV_TRAVEL_EVENT, type SectionNavTravelDetail } from "@/lib/section-navigation-scroll";
import styles from "./floating-section-navigation.module.css";

export function FloatingSectionNavigation() {
  const t = useTranslations("SectionNavigation");
  const locale = useLocale();
  const pathname = usePathname();
  const home = pathname === `/${locale}` || pathname === `/${locale}/`;
  const rootRef = useRef<HTMLElement>(null);
  const cancelTravelRef = useRef<(() => void) | null>(null);
  const cancelTravel = useCallback(() => {
    cancelTravelRef.current?.();
    cancelTravelRef.current = null;
  }, []);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    cancelTravel();
    const url = getSectionNavUrl(window.location.href, id);
    // Preserve Next App Router history state while replacing only the fragment.
    if (url !== window.location.href) window.history.pushState(null, "", url);
    const heading = target.querySelector<HTMLElement>("h1, h2") ?? target;
    if (!heading.hasAttribute("tabindex")) heading.tabIndex = -1;
    const from = window.scrollY;
    const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const to = Math.max(0, Math.min(document.documentElement.scrollHeight - window.innerHeight, from + target.getBoundingClientRect().top - margin));
    const instant = Math.abs(to - from) < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const plan = getSectionNavScrollPlan(from, to);
    const announce = (phase: SectionNavTravelDetail["phase"]) => window.dispatchEvent(new CustomEvent<SectionNavTravelDetail>(SECTION_NAV_TRAVEL_EVENT, {
      detail: { id, phase, duration: instant ? 0 : plan.duration },
    }));
    const finish = () => { cancelTravelRef.current = null; announce("finish"); heading.focus({ preventScroll: true }); };
    announce("start");
    if (instant) {
      window.scrollTo({ top: to, behavior: "instant" });
      finish();
      return;
    }
    const stop = runSectionNavScroll(plan, {
      now: () => performance.now(),
      requestFrame: (callback) => window.requestAnimationFrame(callback),
      cancelFrame: (frame) => window.cancelAnimationFrame(frame),
      writePosition: (top) => window.scrollTo({ top, behavior: "instant" }),
    }, finish);
    cancelTravelRef.current = () => { stop(); announce("cancel"); };
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!home || !root) return;
    const groups = Array.from(root.querySelectorAll<HTMLElement>("[data-word]"));
    const links = groups.map(group => group.querySelector<HTMLAnchorElement>("a")!);
    const enabled = window.matchMedia("(min-width: 1920px) and (min-height: 640px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let focused = false;
    let disposed = false;
    let previousCurrent = -1;
    let height = 0;
    let pageHeight = 0;
    let availableWidth = 224;
    let tops: number[] = [];
    let metrics: { width: number; centers: number[]; widths: number[]; letters: HTMLElement[]; transforms: string[]; opacities: number[]; hit: string }[] = [];

    const draw = () => {
      frame = 0;
      if (!enabled.matches || document.hidden || !metrics.length) return;
      // Read scroll once. All geometry was measured outside this render pass.
      const scroll = window.scrollY;
      const poses = getSectionNavPoses(tops, scroll, height, pageHeight);
      const current = getCurrentSection(tops, scroll, height, pageHeight);
      const incoming = sectionNavEase(poses[current + 1]?.flip ?? 0);
      links.forEach((link, index) => {
        if (previousCurrent !== current) {
          if (index === current) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        }
        const metric = metrics[index];
        const motion = poses[index];
        const headingScale = Math.min(30 / SECTION_NAV_FONT, availableWidth / metric.width);
        const active = index === current;
        const settled = {
          y: motion.dockY + (active ? SECTION_NAV_CURRENT_GAP * (1 - incoming) : 0),
          scale: active ? headingScale + (SECTION_NAV_QUEUE_SCALE - headingScale) * incoming : SECTION_NAV_QUEUE_SCALE,
          opacity: active ? 1 - 0.38 * incoming : 0.62,
        };
        let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
        metric.letters.forEach((letter, glyph) => {
          const pose = reduced.matches || focused ? {
            x: 200 - (metric.width - metric.centers[glyph]) * (reduced.matches || !active ? SECTION_NAV_QUEUE_SCALE : headingScale),
            y: reduced.matches ? motion.queueY : motion.dockY + (index >= current ? SECTION_NAV_CURRENT_GAP : 0),
            rotation: 0, scale: reduced.matches || !active ? SECTION_NAV_QUEUE_SCALE : headingScale, opacity: active ? 1 : 0.62,
          } : getSectionNavLetter({ width: metric.width, center: metric.centers[glyph], index: glyph, count: metric.letters.length }, motion, headingScale, settled);
          const transform = `translate3d(${pose.x.toFixed(3)}px, ${pose.y.toFixed(3)}px, 0) translate(-50%, -50%) rotate(${pose.rotation.toFixed(3)}deg) scale(${pose.scale.toFixed(5)})`;
          if (transform !== metric.transforms[glyph]) { letter.style.transform = transform; metric.transforms[glyph] = transform; }
          if (pose.opacity !== metric.opacities[glyph]) { letter.style.opacity = String(pose.opacity); metric.opacities[glyph] = pose.opacity; }
          const angle = pose.rotation * Math.PI / 180;
          const halfWidth = (Math.abs(Math.cos(angle)) * metric.widths[glyph] + Math.abs(Math.sin(angle)) * SECTION_NAV_FONT) * pose.scale / 2;
          const halfHeight = (Math.abs(Math.sin(angle)) * metric.widths[glyph] + Math.abs(Math.cos(angle)) * SECTION_NAV_FONT) * pose.scale / 2;
          left = Math.min(left, pose.x - halfWidth); right = Math.max(right, pose.x + halfWidth);
          top = Math.min(top, pose.y - halfHeight); bottom = Math.max(bottom, pose.y + halfHeight);
        });
        // The clickable area follows the rendered letters, including a word in flight.
        const width = Math.max(44, right - left + 4), hitHeight = Math.max(44, bottom - top + 4);
        const hit = `left:${(left + right - width) / 2}px;top:${(top + bottom - hitHeight) / 2}px;width:${width}px;height:${hitHeight}px`;
        if (metric.hit !== hit) { link.style.cssText = hit; metric.hit = hit; }
      });
      previousCurrent = current;
      if (root.dataset.ready !== "true") root.dataset.ready = "true";
    };
    const schedule = () => {
      if (!frame && enabled.matches && !document.hidden) frame = window.requestAnimationFrame(draw);
    };
    const measure = () => {
      if (disposed) return;
      if (!enabled.matches) {
        root.dataset.ready = "false";
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        return;
      }
      const targets = sectionNavTargets.map(({ id }) => document.getElementById(id));
      if (targets.some(target => !target)) { root.dataset.ready = "false"; return; }
      height = window.innerHeight;
      pageHeight = document.documentElement.scrollHeight;
      availableWidth = Math.max(200, (document.documentElement.clientWidth - 1280) / 2 - 72);
      tops = targets.map(target => Math.max(0, target!.getBoundingClientRect().top + window.scrollY));
      metrics = groups.map(group => {
        const measure = group.querySelector<HTMLElement>("[data-measure]")!;
        const bounds = measure.getBoundingClientRect();
        const glyphs = Array.from(measure.children).map(glyph => glyph.getBoundingClientRect());
        return { width: bounds.width, centers: glyphs.map(glyph => glyph.left - bounds.left + glyph.width / 2),
          widths: glyphs.map(glyph => glyph.width), letters: Array.from(group.querySelectorAll<HTMLElement>("[data-letter]")),
          transforms: [], opacities: [], hit: "" };
      });
      schedule();
    };
    const focusIn = (event: FocusEvent) => { focused ||= (event.target as HTMLElement).matches(":focus-visible"); schedule(); };
    const focusOut = (event: FocusEvent) => { if (!root.contains(event.relatedTarget as Node | null)) { focused = false; schedule(); } };
    const visibility = () => {
      if (document.hidden) { cancelTravel(); if (frame) window.cancelAnimationFrame(frame); frame = 0; }
      else measure();
    };
    const resize = () => { cancelTravel(); measure(); };
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    observer.observe(root);
    groups.forEach(group => observer.observe(group.querySelector("[data-measure]")!));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    enabled.addEventListener("change", resize);
    reduced.addEventListener("change", resize);
    window.addEventListener("wheel", cancelTravel, { passive: true });
    window.addEventListener("touchstart", cancelTravel, { passive: true });
    window.addEventListener("keydown", cancelTravel);
    window.addEventListener("pointerdown", cancelTravel);
    window.addEventListener("popstate", cancelTravel);
    document.addEventListener("visibilitychange", visibility);
    root.addEventListener("focusin", focusIn);
    root.addEventListener("focusout", focusOut);
    measure();
    void document.fonts.ready.then(measure);
    return () => {
      disposed = true;
      cancelTravel();
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      enabled.removeEventListener("change", resize);
      reduced.removeEventListener("change", resize);
      window.removeEventListener("wheel", cancelTravel);
      window.removeEventListener("touchstart", cancelTravel);
      window.removeEventListener("keydown", cancelTravel);
      window.removeEventListener("pointerdown", cancelTravel);
      window.removeEventListener("popstate", cancelTravel);
      document.removeEventListener("visibilitychange", visibility);
      root.removeEventListener("focusin", focusIn);
      root.removeEventListener("focusout", focusOut);
    };
  }, [home, locale, cancelTravel]);

  if (!home) return null;
  return (
    <nav ref={rootRef} className={styles.navigation} data-floating-section-nav aria-label={t("label")}>
      {sectionNavTargets.map(({ id, label }) => {
        const text = t(label);
        const letters = Array.from(text.toLocaleUpperCase(locale));
        return (
          <div key={id} data-word className={styles.word}>
            <a href={`#${id}`} onClick={(event) => navigate(event, id)} aria-label={text} className={styles.link}>
              <span data-measure aria-hidden="true" className={styles.measure}>
                {letters.map((letter, index) => <span key={index}>{letter === " " ? "\u00a0" : letter}</span>)}
              </span>
            </a>
            <span aria-hidden="true" className={styles.flight}>
              {letters.map((letter, index) => <span key={index} data-letter className={styles.letter}>{letter === " " ? "\u00a0" : letter}</span>)}
            </span>
          </div>
        );
      })}
    </nav>
  );
}

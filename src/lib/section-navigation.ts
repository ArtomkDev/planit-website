export const sectionNavTargets = [
  { id: "top", label: "home" },
  { id: "features", label: "features" },
  { id: "everyday", label: "everyday" },
  { id: "platforms", label: "platforms" },
  { id: "get-started", label: "start" },
] as const;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
export const sectionNavEase = (value: number) => value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;
export const SECTION_NAV_ROW = 44;
export const SECTION_NAV_RIGHT = 200;
export const SECTION_NAV_FONT = 34;
export const SECTION_NAV_QUEUE_SCALE = 16 / SECTION_NAV_FONT;
export const SECTION_NAV_RIDE_SCALE = 20 / SECTION_NAV_FONT;
export const SECTION_NAV_CURRENT_GAP = 20;

export interface SectionNavMotion {
  progress: number;
  detach: number;
  flip: number;
  ride: number;
  queueY: number;
  dockY: number;
  travel: number;
  y: number;
  home: boolean;
}

export interface SectionNavGlyph { width: number; center: number; index: number; count: number }
export interface SectionNavLetterPose { x: number; y: number; rotation: number; scale: number; opacity: number }

function interpolateLetter(from: SectionNavLetterPose, to: SectionNavLetterPose, phase: number, glyph: SectionNavGlyph) {
  // A separate timeline per letter, from the end of the word toward its beginning.
  const stagger = 0.16;
  const local = clamp(phase * (1 + (glyph.count - 1) * stagger) - (glyph.count - 1 - glyph.index) * stagger);
  const amount = sectionNavEase(local);
  const mix = (start: number, end: number) => start + (end - start) * amount;
  return {
    // Quadratic flight bowing toward the page, rather than bending a shared word.
    x: mix(from.x, to.x) - 2 * 28 * amount * (1 - amount),
    y: mix(from.y, to.y),
    rotation: mix(from.rotation, to.rotation),
    scale: mix(from.scale, to.scale),
    opacity: mix(from.opacity, to.opacity),
  };
}

function getSectionActivationStops(sectionTops: readonly number[], height: number, pageHeight: number) {
  const lastStop = Math.max(0, pageHeight - height - 8);
  return sectionTops.map((top, index) => index === 0 ? 0 : Math.min(lastStop, Math.max(0, top - Math.max(height * 0.12, 112 + index * SECTION_NAV_ROW + SECTION_NAV_CURRENT_GAP))));
}

export function getSectionNavUrl(currentUrl: string, id: string) {
  const url = new URL(currentUrl);
  url.hash = id;
  return url.href;
}

export function getSectionNavMotionWindows(
  sectionTops: readonly number[],
  height: number,
  pageHeight: number,
) {
  const stops = getSectionActivationStops(sectionTops, height, pageHeight);
  // Home stays horizontal while making room for the first incoming name.
  const homeEnd = Math.min(240, (stops[1] ?? Math.max(0, pageHeight - height)) * 0.24);
  return sectionTops.map((_, index) => {
    const end = index === 0 ? homeEnd : stops[index];
    const previousEnd = index <= 1 ? homeEnd : stops[index - 1];
    // Every name finishes before it becomes active, using its actual section boundary.
    const start = index === 0 ? 0 : Math.max(previousEnd, end - height * 0.84);
    return { start, end, home: index === 0 };
  });
}

export function getSectionNavPoses(
  sectionTops: readonly number[],
  scroll: number,
  height: number,
  pageHeight: number,
  reducedMotion = false,
) {
  const firstBottom = height - 40 - (sectionTops.length - 1) * SECTION_NAV_ROW;
  return getSectionNavMotionWindows(sectionTops, height, pageHeight).map(({ start, end }, index) => {
    const progress = end <= start ? Number(scroll >= end) : clamp((scroll - start) / (end - start));
    const detachEnd = Math.min(0.4, 240 / Math.max(1, end - start));
    const flipStart = Math.max(0.6, 1 - 200 / Math.max(1, end - start));
    const queueY = firstBottom + index * SECTION_NAV_ROW;
    const dockY = 112 + index * SECTION_NAV_ROW;
    return {
      progress,
      detach: clamp(progress / detachEnd),
      flip: clamp((progress - flipStart) / (1 - flipStart)),
      ride: clamp((progress - detachEnd) / (flipStart - detachEnd)),
      queueY,
      dockY,
      travel: queueY - dockY,
      y: reducedMotion ? queueY : queueY - sectionNavEase(progress) * (queueY - dockY),
      home: index === 0,
    };
  });
}

export function getSectionNavLetter(
  glyph: SectionNavGlyph,
  motion: SectionNavMotion,
  headingScale: number,
  settled: { y: number; scale: number; opacity: number },
): SectionNavLetterPose {
  const horizontal = (y: number, scale: number, opacity: number): SectionNavLetterPose => ({
    x: SECTION_NAV_RIGHT - (glyph.width - glyph.center) * scale,
    y, rotation: 0, scale, opacity,
  });
  if (motion.home) {
    const amount = sectionNavEase(motion.progress);
    return horizontal(motion.queueY + (settled.y - motion.queueY) * amount,
      SECTION_NAV_QUEUE_SCALE + (settled.scale - SECTION_NAV_QUEUE_SCALE) * amount,
      0.62 + (settled.opacity - 0.62) * amount);
  }
  if (motion.progress >= 1) return horizontal(settled.y, settled.scale, settled.opacity);
  const queue = horizontal(motion.queueY, SECTION_NAV_QUEUE_SCALE, 0.62);
  if (motion.progress <= 0) return queue;
  const rideLength = glyph.width * SECTION_NAV_RIDE_SCALE;
  const queueHead = motion.queueY - rideLength;
  const upperHead = motion.dockY + SECTION_NAV_CURRENT_GAP + Math.max(0, Math.min(200, queueHead - motion.dockY - SECTION_NAV_CURRENT_GAP));
  const vertical = (head: number): SectionNavLetterPose => ({
    x: SECTION_NAV_RIGHT + 20,
    y: head + (glyph.width - glyph.center) * SECTION_NAV_RIDE_SCALE,
    rotation: -90, scale: SECTION_NAV_RIDE_SCALE, opacity: 0.62,
  });
  if (motion.detach < 1) return interpolateLetter(queue, vertical(queueHead), motion.detach, glyph);
  if (motion.flip > 0) {
    const head = upperHead + (motion.dockY + SECTION_NAV_CURRENT_GAP - upperHead) * motion.flip;
    return interpolateLetter(vertical(head), horizontal(motion.dockY + SECTION_NAV_CURRENT_GAP, headingScale, 1), motion.flip, glyph);
  }
  return vertical(queueHead + (upperHead - queueHead) * motion.ride);
}

export function getCurrentSection(sectionTops: readonly number[], scroll: number, height: number, pageHeight: number) {
  let current = 0;
  getSectionActivationStops(sectionTops, height, pageHeight).forEach((stop, index) => {
    if (stop <= scroll) current = index;
  });
  return current;
}

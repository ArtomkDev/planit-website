export interface SectionNavScrollPlan {
  from: number;
  to: number;
  duration: number;
}

export interface SectionNavScrollRuntime {
  now: () => number;
  requestFrame: (callback: (time: number) => void) => number;
  cancelFrame: (frame: number) => void;
  writePosition: (position: number) => void;
}

export function getSectionNavScrollPlan(from: number, to: number): SectionNavScrollPlan {
  const distance = Math.abs(to - from);
  return { from, to, duration: distance < 2 ? 0 : Math.min(520, Math.max(320, 280 + Math.sqrt(distance) * 2.4)) };
}

export function getSectionNavScrollPosition(plan: SectionNavScrollPlan, elapsed: number) {
  if (plan.duration === 0 || elapsed >= plan.duration) return plan.to;
  if (elapsed <= 0) return plan.from;
  const phase = elapsed / plan.duration;
  const eased = phase ** 3 * (phase * (phase * 6 - 15) + 10);
  return plan.from + (plan.to - plan.from) * eased;
}

export function runSectionNavScroll(plan: SectionNavScrollPlan, runtime: SectionNavScrollRuntime, onComplete: () => void) {
  let stopped = false;
  let frame: number | null = null;
  const started = runtime.now();
  const tick = (time: number) => {
    if (stopped) return;
    const finished = time >= started + plan.duration;
    runtime.writePosition(finished ? plan.to : getSectionNavScrollPosition(plan, time - started));
    if (finished) {
      stopped = true;
      frame = null;
      onComplete();
    } else frame = runtime.requestFrame(tick);
  };
  if (plan.duration === 0) tick(started);
  else frame = runtime.requestFrame(tick);
  return () => {
    stopped = true;
    if (frame !== null) runtime.cancelFrame(frame);
    frame = null;
  };
}

export const INITIAL_SCHEDULE_CODE = "PL7M2K";
const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type CodeGlyph = {
  value: string;
  phase: "idle" | "scrambling" | "settled";
  revision: number;
};

type RevealEvent = Pick<CodeGlyph, "value" | "phase"> & { at: number; index: number };
type Timer = ReturnType<typeof setTimeout>;
type AnimationOptions = {
  random?: () => number;
  now?: () => number;
  schedule?: (callback: () => void, delay: number) => Timer;
  cancel?: (timer: Timer) => void;
};

export function createScheduleCodeAnimation(
  paint: (glyphs: CodeGlyph[]) => void,
  {
    random = Math.random,
    now = () => performance.now(),
    schedule = setTimeout,
    cancel = clearTimeout,
  }: AnimationOptions = {},
) {
  let glyphs: CodeGlyph[] = INITIAL_SCHEDULE_CODE.split("").map(value => ({ value, phase: "idle", revision: 0 }));
  let target = INITIAL_SCHEDULE_CODE;
  let events: RevealEvent[] = [];
  let cursor = 0;
  let startedAt = 0;
  let running = false;
  let repeat = false;
  let paused = false;
  let timer: Timer | undefined;

  const between = (min: number, max: number) => min + random() * (max - min);
  const nextCharacter = (previous: string) => {
    const choices = CHARACTERS.replace(previous, "");
    return choices[Math.floor(random() * choices.length)];
  };

  function advance() {
    timer = undefined;
    if (!running) return;
    const elapsed = now() - startedAt;
    let changed = false;

    while (cursor < events.length && events[cursor].at <= elapsed) {
      const event = events[cursor++];
      glyphs[event.index] = {
        value: event.value,
        phase: event.phase,
        revision: glyphs[event.index].revision + 1,
      };
      changed = true;
    }
    if (changed) paint([...glyphs]);

    if (cursor < events.length) timer = schedule(advance, Math.max(1, events[cursor].at - elapsed));
    else if (repeat) timer = schedule(reveal, between(6500, 11500));
    else running = false;
  }

  function reveal() {
    timer = undefined;
    if (!running) return;
    target = glyphs.map(glyph => nextCharacter(glyph.value)).join("");
    events = target.split("").flatMap((value, index) => {
      let at = index * between(28, 54) + between(0, 110);
      let previous = glyphs[index].value;
      const steps: RevealEvent[] = [];
      const flips = Math.floor(between(3, 6));

      for (let flip = 0; flip < flips; flip++) {
        previous = nextCharacter(previous);
        steps.push({ at, index, value: previous, phase: "scrambling" });
        at += between(65, 115);
      }
      steps.push({ at, index, value, phase: "settled" });
      return steps;
    }).sort((a, b) => a.at - b.at);
    cursor = 0;
    startedAt = now();
    timer = schedule(advance, events[0].at);
  }

  return {
    start() {
      repeat = true;
      if (running) return;
      running = true;
      timer = schedule(reveal, paused ? between(6500, 11500) : 220);
      paused = false;
    },
    pause() {
      repeat = false;
      paused = true;
      if (running && cursor < events.length) return;
      if (timer !== undefined) cancel(timer);
      timer = undefined;
      running = false;
    },
    regenerate(animate = true) {
      if (timer !== undefined) cancel(timer);
      timer = undefined;
      running = true;
      if (animate) reveal();
      else {
        repeat = false;
        running = false;
        target = glyphs.map(glyph => nextCharacter(glyph.value)).join("");
        glyphs = target.split("").map((value, index) => ({ value, phase: "idle", revision: glyphs[index].revision + 1 }));
        events = [];
        cursor = 0;
        paint([...glyphs]);
      }
    },
    stop() {
      const wasRunning = running;
      running = false;
      repeat = false;
      paused = false;
      if (timer !== undefined) cancel(timer);
      timer = undefined;
      if (wasRunning && cursor < events.length) {
        // Leave a complete, readable example when visibility or motion preferences change.
        glyphs = target.split("").map((value, index) => ({ value, phase: "idle", revision: glyphs[index].revision + 1 }));
        events = [];
        cursor = 0;
        paint([...glyphs]);
      }
      return glyphs.map(glyph => glyph.value).join("");
    },
  };
}

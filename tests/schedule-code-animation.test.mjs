import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile('src/lib/schedule-code-animation.ts', 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { createScheduleCodeAnimation, INITIAL_SCHEDULE_CODE } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

function fixture() {
  let now = 0;
  let nextId = 0;
  let seed = 91;
  const tasks = new Map();
  const frames = [];
  const animation = createScheduleCodeAnimation(glyphs => frames.push({ at: now, glyphs }), {
    random: () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    },
    now: () => now,
    schedule: (callback, delay) => {
      const id = ++nextId;
      tasks.set(id, { callback, at: now + delay });
      return id;
    },
    cancel: id => tasks.delete(id),
  });
  const advance = duration => {
    const until = now + duration;
    let iterations = 0;
    while (tasks.size) {
      const [id, task] = [...tasks].sort((a, b) => a[1].at - b[1].at)[0];
      if (task.at > until) break;
      assert.ok(++iterations < 10000, 'animation must not create a busy loop');
      now = task.at;
      tasks.delete(id);
      task.callback();
    }
    now = until;
  };
  return { animation, frames, tasks, advance };
}

test('code resolves to six readable new characters on independent, bounded timings', () => {
  const { animation, frames, advance } = fixture();
  animation.start();
  advance(200);
  assert.equal(frames.length, 0, 'give the card entrance a short head start');
  advance(1800);
  const final = frames.at(-1).glyphs;
  assert.match(final.map(glyph => glyph.value).join(''), /^[A-HJ-NP-Z2-9]{6}$/);
  final.forEach((glyph, index) => {
    assert.equal(glyph.phase, 'settled');
    assert.notEqual(glyph.value, INITIAL_SCHEDULE_CODE[index]);
  });
  const starts = final.map((_, i) => frames.find(frame => frame.glyphs[i].phase === 'scrambling').at);
  const ends = final.map((_, i) => frames.find(frame => frame.glyphs[i].phase === 'settled').at);
  assert.ok(new Set(starts).size > 3, 'characters must not start in lockstep');
  assert.ok(new Set(ends).size > 3, 'characters must not resolve together');
  ends.forEach((end, i) => assert.ok(end - starts[i] >= 195 && end - starts[i] <= 575));
  const count = frames.length;
  advance(3000);
  assert.equal(frames.length, count, 'the completed code stays still and readable');
  animation.stop();
});

test('subsequent reveals use different codes and long, irregular pauses', () => {
  const { animation, frames, advance } = fixture();
  animation.start();
  advance(60000);
  const finished = frames.filter(frame => frame.glyphs.every(glyph => glyph.phase === 'settled'));
  assert.ok(finished.length >= 4);
  const codes = finished.map(frame => frame.glyphs.map(glyph => glyph.value).join(''));
  assert.equal(new Set(codes).size, codes.length);
  const gaps = finished.slice(0, -1).map((frame, index) => {
    const next = frames.find(candidate => candidate.at > frame.at && candidate.at < finished[index + 1].at);
    return next.at - frame.at;
  });
  gaps.forEach(gap => assert.ok(gap >= 6500 && gap <= 11610));
  assert.ok(new Set(gaps.map(Math.round)).size > 1);
  animation.stop();
});

test('stopping cancels all scheduled work, completes partial codes, and permits a clean restart', () => {
  const { animation, frames, tasks, advance } = fixture();
  animation.start();
  animation.start();
  assert.equal(tasks.size, 1, 'repeated visibility events cannot start a second loop');
  advance(430);
  assert.ok(frames.some(frame => frame.glyphs.some(glyph => glyph.phase === 'scrambling')));
  animation.stop();
  assert.equal(tasks.size, 0);
  assert.ok(frames.at(-1).glyphs.every(glyph => glyph.phase === 'idle'));
  const stoppedCode = frames.at(-1).glyphs.map(glyph => glyph.value).join('');
  const count = frames.length;
  animation.stop();
  advance(100000);
  assert.equal(frames.length, count, 'no hidden-tab, offscreen, or unmounted updates');
  animation.start();
  advance(2000);
  assert.notEqual(frames.at(-1).glyphs.map(glyph => glyph.value).join(''), stoppedCode);
  animation.stop();
  assert.equal(tasks.size, 0);
});

test('leaving before the initial reveal performs no work', () => {
  const { animation, frames, tasks, advance } = fixture();
  animation.start();
  advance(100);
  animation.stop();
  advance(30000);
  assert.equal(frames.length, 0);
  assert.equal(tasks.size, 0);
});

test('manual regeneration during a reveal cancels the previous timeline without adding loops', () => {
  const { animation, frames, tasks, advance } = fixture();
  animation.start();
  advance(400);
  for (let click = 0; click < 10; click++) {
    animation.regenerate();
    assert.equal(tasks.size, 1);
    advance(20);
  }
  advance(2000);
  const settled = frames.at(-1).glyphs;
  assert.ok(settled.every(glyph => glyph.phase === 'settled'));
  assert.match(settled.map(glyph => glyph.value).join(''), /^[A-HJ-NP-Z2-9]{6}$/);
  animation.stop();
  assert.equal(tasks.size, 0);
});

test('interaction pauses automatic repeats while manual regeneration remains available', () => {
  const { animation, frames, tasks, advance } = fixture();
  animation.start();
  advance(400);
  animation.pause();
  advance(2000);
  assert.ok(frames.at(-1).glyphs.every(glyph => glyph.phase === 'settled'));
  assert.equal(tasks.size, 0);
  const previous = frames.at(-1).glyphs.map(glyph => glyph.value).join('');
  animation.regenerate();
  advance(2000);
  assert.notEqual(frames.at(-1).glyphs.map(glyph => glyph.value).join(''), previous);
  assert.equal(tasks.size, 0, 'a manual reveal while paused must finish as a single shot');
  const count = frames.length;
  animation.start();
  advance(6000);
  assert.equal(frames.length, count, 'resuming interaction must preserve a readable pause');
  advance(7000);
  assert.ok(frames.length > count);
  animation.stop();
});

test('copying during a reveal returns exactly the complete code that remains displayed', () => {
  const { animation, frames, tasks, advance } = fixture();
  animation.start();
  advance(430);
  const copied = animation.stop();
  animation.pause();
  assert.match(copied, /^[A-HJ-NP-Z2-9]{6}$/);
  assert.equal(frames.at(-1).glyphs.map(glyph => glyph.value).join(''), copied);
  assert.ok(frames.at(-1).glyphs.every(glyph => glyph.phase === 'idle'));
  advance(30000);
  assert.equal(tasks.size, 0);
  assert.equal(frames.at(-1).glyphs.map(glyph => glyph.value).join(''), copied);
});

test('reduced-motion regeneration changes the code immediately without scheduling animation', () => {
  const { animation, frames, tasks, advance } = fixture();
  animation.start();
  advance(430);
  const before = frames.at(-1).glyphs.map(glyph => glyph.value).join('');
  animation.regenerate(false);
  const after = frames.at(-1).glyphs;
  assert.notEqual(after.map(glyph => glyph.value).join(''), before);
  assert.ok(after.every(glyph => glyph.phase === 'idle'));
  assert.equal(tasks.size, 0);
  const count = frames.length;
  advance(30000);
  assert.equal(frames.length, count);
});

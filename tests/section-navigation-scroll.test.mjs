import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile('src/lib/section-navigation-scroll.ts', 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { getSectionNavScrollPlan, getSectionNavScrollPosition, runSectionNavScroll } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
test('page navigation stays fast regardless of how many menu items it passes', () => {
  const plan = getSectionNavScrollPlan(0, 6650);
  assert.ok(plan.duration >= 320 && plan.duration <= 520);
  assert.ok(getSectionNavScrollPlan(0, 900).duration < 400);
  assert.equal(getSectionNavScrollPlan(0, 100000).duration, 520);
  const frames = [];
  for (let time = 0; time <= plan.duration; time += 16) {
    const position = getSectionNavScrollPosition(plan, time);
    assert.ok(position >= 0 && position <= 6650);
    if (frames.length) assert.ok(position >= frames.at(-1));
    frames.push(position);
  }
  assert.equal(getSectionNavScrollPosition(plan, 0), 0);
  assert.equal(getSectionNavScrollPosition(plan, plan.duration), 6650);
  assert.equal(getSectionNavScrollPosition(plan, plan.duration + 1000), 6650);
  assert.ok(getSectionNavScrollPosition(plan, 16) < 5);
  assert.ok(6650 - getSectionNavScrollPosition(plan, plan.duration - 16) < 5);
});

test('reverse and interrupted-position journeys preserve the same smooth timing without overshoot', () => {
  const forward = getSectionNavScrollPlan(120, 6400);
  const backward = getSectionNavScrollPlan(6400, 120);
  assert.ok(Math.abs(forward.duration - backward.duration) < 1e-8);
  for (let step = 0; step <= 100; step++) {
    const position = getSectionNavScrollPosition(forward, forward.duration * step / 100);
    const reversed = getSectionNavScrollPosition(backward, backward.duration * (1 - step / 100));
    assert.ok(Math.abs(position - reversed) < 1e-7);
  }
  const same = getSectionNavScrollPlan(400, 400);
  assert.equal(same.duration, 0);
  assert.equal(getSectionNavScrollPosition(same, 0), 400);
});

function clock() {
  let time = 0;
  let id = 0;
  const pending = new Map();
  const positions = [];
  return {
    positions, pending,
    runtime: {
      now: () => time,
      requestFrame: callback => { pending.set(++id, callback); return id; },
      cancelFrame: frame => pending.delete(frame),
      writePosition: position => positions.push(position),
    },
    advance: next => {
      time = next;
      const callbacks = [...pending.values()];
      pending.clear();
      callbacks.forEach(callback => callback(time));
    },
  };
}

test('one frame loop finishes once, cancels immediately and restarts from the actual interrupted position', () => {
  const timer = clock();
  let completed = 0;
  const first = getSectionNavScrollPlan(0, 6650);
  const stop = runSectionNavScroll(first, timer.runtime, () => completed++);
  timer.advance(100);
  timer.advance(200);
  assert.equal(timer.pending.size, 1);
  const interruptedAt = timer.positions.at(-1);
  assert.ok(interruptedAt > 0 && interruptedAt < 6650);
  stop();
  stop();
  assert.equal(timer.pending.size, 0);
  timer.advance(1500);
  assert.equal(timer.positions.at(-1), interruptedAt);
  assert.equal(completed, 0);
  const second = getSectionNavScrollPlan(interruptedAt, 900);
  runSectionNavScroll(second, timer.runtime, () => completed++);
  timer.advance(1500);
  assert.equal(timer.positions.at(-1), interruptedAt);
  timer.advance(1500 + second.duration);
  assert.equal(timer.positions.at(-1), 900);
  assert.equal(completed, 1);
  assert.equal(timer.pending.size, 0);
  timer.advance(20000);
  assert.equal(completed, 1);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile('src/lib/hero-choreography.ts', 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { createHeroChoreography } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('independent currents stay finite and bounded on portrait and ultrawide screens', () => {
  for (const aspect of [0.3, 0.65, 1, 1.5, 2.7, 4]) {
    for (const count of [5, 7]) {
      const score = createHeroChoreography(324.7, 7);
      for (let time = 0; time < 400; time += 0.25) {
        score.sample(time, aspect, count);
        for (const pose of score.poses.slice(0, count)) {
          for (const value of Object.values(pose)) assert.ok(Number.isFinite(value));
          assert.ok(pose.x >= 0.04 && pose.x <= 0.96);
          assert.ok(pose.y >= 0.1 && pose.y <= 0.9);
          assert.ok(pose.size > 0 && pose.stretch > 0);
          assert.ok(pose.split >= 0 && pose.split <= 1);
        }
      }
    }
  }
});

test('wander, encounters and shape changes remain continuous over time', () => {
  const score = createHeroChoreography(15, 7);
  for (let time = 0.25; time <= 400; time += 0.25) {
    score.sample(time - 0.001, 1.5, 7);
    const before = structuredClone(score.poses);
    score.sample(time + 0.001, 1.5, 7);
    score.poses.forEach((pose, index) => {
      for (const key of ['x', 'y', 'size', 'split', 'stretch', 'satellites', 'morph', 'skew', 'cohesion']) {
        assert.ok(Math.abs(pose[key] - before[index][key]) < 0.004, `${key} jumps at ${time}`);
      }
      for (const key of ['spin', 'budAngle']) {
        const angle = pose[key] - before[index][key];
        assert.ok(Math.abs(Math.atan2(Math.sin(angle), Math.cos(angle))) < 0.004, `${key} jumps at ${time}`);
      }
    });
  }
});

test('budding and local encounters happen independently across the field', () => {
  const score = createHeroChoreography(37, 7);
  const divided = new Set();
  let mixedBudding = 0;
  let mixedEncounters = 0;
  for (let time = 0; time <= 400; time += 0.5) {
    score.sample(time, 1.6, 7);
    score.poses.forEach((pose, index) => { if (pose.split > 0.7) divided.add(index); });
    if (score.poses.some(pose => pose.split > 0.7) && score.poses.some(pose => pose.split < 0.25)) mixedBudding++;
    if (score.poses.some(pose => pose.cohesion > 0.85) && score.poses.some(pose => pose.cohesion < 0.2)) mixedEncounters++;
  }
  assert.equal(divided.size, 7, 'each body should eventually divide on its own clock');
  assert.ok(mixedBudding > 80, 'some bodies divide while others remain whole');
  assert.ok(mixedEncounters > 80, 'local mergers must leave other bodies independent');
});

test('two nearby bodies can fully merge and later move apart', () => {
  const score = createHeroChoreography(37, 2);
  let mergedAt = null;
  let separatedAgain = false;
  for (let time = 0; time <= 900; time += 0.25) {
    score.sample(time, 1.6, 2);
    const [first, second] = score.poses;
    const distance = Math.hypot((first.x - second.x) * 1.6, first.y - second.y);
    if (mergedAt === null && distance < 0.025 && first.cohesion > 0.95) mergedAt = time;
    if (mergedAt !== null && time > mergedAt + 2 && distance > 0.2) separatedAgain = true;
  }
  assert.notEqual(mergedAt, null, 'a close encounter should form one shared core');
  assert.ok(separatedAgain, 'a local merger must be able to dissolve again');
});

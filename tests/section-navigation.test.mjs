import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile('src/lib/section-navigation.ts', 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { getSectionNavPoses, getSectionNavLetter, getSectionNavUrl, getCurrentSection, sectionNavEase, SECTION_NAV_QUEUE_SCALE, SECTION_NAV_RIDE_SCALE, SECTION_NAV_ROW, SECTION_NAV_RIGHT } = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
const tops = [1, 987, 4832, 5938, 6745];
const width = 280;
const glyphs = Array.from({ length: 10 }, (_, index) => ({ width, center: index * 28 + 14, index, count: 10 }));
const base = { progress: 0, detach: 0, flip: 0, ride: 0, queueY: 1043, dockY: 156, travel: 887, y: 1043, home: false };
const settled = { y: 176, scale: 30 / 34, opacity: 1 };
const lower = phase => ({ ...base, progress: phase * 0.3, detach: phase });
const ride = phase => ({ ...base, progress: 0.3 + phase * 0.4, detach: 1, ride: phase });
const upper = phase => ({ ...base, progress: 0.7 + phase * 0.3, detach: 1, ride: 1, flip: phase });
const poseAt = motion => glyphs.map(glyph => getSectionNavLetter(glyph, motion, 30 / 34, settled));
const close = (a, b, message = '') => assert.ok(Math.abs(a - b) < 1e-7, message + ': ' + a + ' / ' + b);

test('repeated navigation replaces the fragment without losing locale or query', () => {
  let url = 'https://planit.app/en?source=demo&preview=1#top';
  for (const id of ['features', 'everyday', 'platforms', 'get-started', 'top']) {
    url = getSectionNavUrl(url, id);
    assert.equal(url, 'https://planit.app/en?source=demo&preview=1#' + id);
  }
  assert.equal(getSectionNavUrl('https://planit.app/uk#top#features', 'everyday'), 'https://planit.app/uk#everyday');
});

test('waiting and completed words use exact horizontal slots and different type sizes', () => {
  poseAt(lower(0)).forEach((pose, index) => {
    close(pose.x, SECTION_NAV_RIGHT - (width - glyphs[index].center) * SECTION_NAV_QUEUE_SCALE);
    assert.equal(pose.y, base.queueY);
    assert.equal(pose.rotation, 0);
    assert.equal(pose.scale, SECTION_NAV_QUEUE_SCALE);
  });
  poseAt({ ...base, progress: 1, detach: 1, flip: 1, ride: 1 }).forEach((pose, index) => {
    close(pose.x, SECTION_NAV_RIGHT - (width - glyphs[index].center) * settled.scale);
    assert.equal(pose.y, settled.y);
    assert.equal(pose.rotation, 0);
    assert.equal(pose.scale, settled.scale);
  });
});

test('lower departure moves the last glyph first with separate readable rotations and spacing', () => {
  const poses = poseAt(lower(0.5));
  assert.equal(poses[0].rotation, 0);
  assert.equal(poses.at(-1).rotation, -90);
  assert.ok(poses.some(pose => pose.rotation < -10 && pose.rotation > -80));
  assert.ok(new Set(poses.map(pose => pose.rotation)).size > 3);
  const gaps = poses.slice(1).map((pose, index) => Math.hypot(pose.x - poses[index].x, pose.y - poses[index].y));
  assert.ok(Math.max(...gaps) > 25, 'letters must separate instead of bending a glued word');
});

test('upper arrival lands the last letter in its own slot while earlier letters remain vertical', () => {
  const poses = poseAt(upper(0.5));
  assert.equal(poses[0].rotation, -90);
  assert.equal(poses.at(-1).rotation, 0);
  assert.equal(poses.at(-1).y, settled.y);
  close(poses.at(-1).x, SECTION_NAV_RIGHT - (width - glyphs.at(-1).center) * settled.scale);
  assert.ok(poses[0].y > settled.y + 100);
  assert.ok(poses.some(pose => pose.rotation > -80 && pose.rotation < -10));
});

test('a riding word is a straight, readable vertical column', () => {
  for (const progress of [0, 0.2, 0.5, 0.8, 1]) {
    const poses = poseAt(ride(progress));
    poses.forEach((pose, index) => {
      assert.equal(pose.x, SECTION_NAV_RIGHT + 20);
      assert.equal(pose.rotation, -90);
      assert.equal(pose.scale, SECTION_NAV_RIDE_SCALE);
      if (index) close(poses[index - 1].y - pose.y, 28 * SECTION_NAV_RIDE_SCALE);
    });
  }
});

test('departure, riding and arrival meet continuously without reversing the upper bend', () => {
  const endpoints = [[lower(1), ride(0)], [ride(1), upper(0)]];
  for (const [before, after] of endpoints) {
    const left = poseAt(before), right = poseAt(after);
    left.forEach((pose, index) => {
      for (const key of ['x', 'y', 'rotation', 'scale', 'opacity']) close(pose[key], right[index][key], key);
    });
  }
  const before = poseAt(upper(1 - 1e-8)), completed = poseAt(upper(1));
  before.forEach((pose, index) => {
    assert.ok(Math.abs(pose.x - completed[index].x) < 0.001);
    assert.ok(Math.abs(pose.y - completed[index].y) < 0.001);
  });
});

test('individual flights remain finite, readable and separated at every sampled frame', () => {
  for (const stage of [lower, ride, upper]) {
    let previous = poseAt(stage(0));
    for (let step = 1; step <= 1000; step++) {
      const poses = poseAt(stage(step / 1000));
      poses.forEach((pose, index) => {
        assert.ok(pose.rotation >= -90 && pose.rotation <= 0);
        assert.ok(pose.x >= -80 && pose.x <= 224);
        assert.ok(pose.y >= 150 && pose.y <= base.queueY + 1);
        assert.ok(Math.abs(pose.x - previous[index].x) < 4);
        assert.ok(Math.abs(pose.y - previous[index].y) < 4);
        if (index) assert.ok(Math.hypot(pose.x - poses[index - 1].x, pose.y - poses[index - 1].y) > 7);
      });
      previous = poses;
    }
  }
});

test('per-section phases are ordered and all current names finish before they are selected', () => {
  for (const height of [640, 900, 1215, 1600, 2160]) {
    for (const sectionTops of [tops, [0, 920, 3200, 3350, 6100]]) {
      for (let scroll = 0; scroll <= 7963 - height; scroll += 7) {
        const motions = getSectionNavPoses(sectionTops, scroll, height, 7963);
        const current = getCurrentSection(sectionTops, scroll, height, 7963);
        motions.forEach(motion => {
          assert.ok(motion.detach >= 0 && motion.detach <= 1);
          if (motion.ride > 0) assert.equal(motion.detach, 1);
          if (motion.flip > 0) assert.equal(motion.ride, 1);
        });
        if (current > 0) assert.equal(motions[current].progress, 1);
      }
    }
  }
});

test('responsive end positions preserve the original bottom stack and the final top stack', () => {
  for (const height of [640, 900, 1215, 1600, 2160]) {
    const initial = getSectionNavPoses(tops, 0, height, 7963);
    assert.equal(initial.at(-1).queueY, height - 40);
    initial.forEach((motion, index) => {
      assert.equal(motion.progress, 0);
      if (index) assert.equal(motion.queueY - initial[index - 1].queueY, SECTION_NAV_ROW);
    });
    const final = getSectionNavPoses(tops, 7963 - height, height, 7963);
    assert.ok(final.every(motion => motion.progress === 1));
    assert.deepEqual(final.map(motion => motion.dockY), [112, 156, 200, 244, 288]);
  }
});

test('active section tracks reading boundaries in both scroll directions and reaches the CTA', () => {
  const sectionTops = [0, 900, 4700, 6100, 6900];
  assert.equal(getCurrentSection(sectionTops, 0, 900, 7600), 0);
  assert.equal(getCurrentSection(sectionTops, 700, 900, 7600), 0);
  assert.equal(getCurrentSection(sectionTops, 780, 900, 7600), 1);
  assert.equal(getCurrentSection(sectionTops, 6000, 900, 7600), 3);
  assert.equal(getCurrentSection(sectionTops, 4500, 900, 7600), 2);
  assert.equal(getCurrentSection(sectionTops, 6700, 900, 7600), 4);
});

test('short and tall viewports keep every word inside the viewport and clear of adjacent words', () => {
  for (const height of [640, 900, 1215, 1600, 2160]) {
    for (const wordWidth of [120, 280, 340]) {
      for (let scroll = 0; scroll <= 7963 - height; scroll += 23) {
        const motions = getSectionNavPoses(tops, scroll, height, 7963);
        const current = getCurrentSection(tops, scroll, height, 7963);
        const incoming = sectionNavEase(motions[current + 1]?.flip ?? 0);
        const headingScale = Math.min(30 / 34, 240 / wordWidth);
        const ranges = motions.map((motion, index) => {
          const active = index === current;
          const target = { y: motion.dockY + (active ? 20 * (1 - incoming) : 0), scale: active ? headingScale + (SECTION_NAV_QUEUE_SCALE - headingScale) * incoming : SECTION_NAV_QUEUE_SCALE, opacity: 1 };
          let min = Infinity, max = -Infinity;
          for (let glyph = 0; glyph < 10; glyph++) {
            const pose = getSectionNavLetter({ width: wordWidth, center: (glyph + 0.5) * wordWidth / 10, index: glyph, count: 10 }, motion, headingScale, target);
            const angle = pose.rotation * Math.PI / 180;
            const halfHeight = (Math.abs(Math.cos(angle)) * 34 + Math.abs(Math.sin(angle)) * wordWidth / 10) * pose.scale / 2;
            min = Math.min(min, pose.y - halfHeight);
            max = Math.max(max, pose.y + halfHeight);
          }
          assert.ok(min >= 64 && max <= height, 'word leaves viewport');
          return { min, max };
        });
        ranges.forEach((range, index) => {
          if (index) assert.ok(range.min - ranges[index - 1].max > 0, 'two words overlap');
        });
      }
    }
  }
});

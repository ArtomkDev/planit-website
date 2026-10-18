const TAU = Math.PI * 2;

export type HeroPose = {
  x: number;
  y: number;
  size: number;
  split: number;
  spin: number;
  stretch: number;
  satellites: number;
  morph: number;
  skew: number;
  budAngle: number;
  cohesion: number;
};

const clamp = (value: number, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const ease = (start: number, end: number, value: number) => {
  const p = clamp((value - start) / (end - start));
  return p * p * (3 - 2 * p);
};
const random = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

// Quintic interpolation keeps both speed and acceleration continuous at noise knots.
function noise(time: number, seed: number) {
  const knot = Math.floor(time);
  const p = time - knot;
  const blend = p * p * p * (p * (p * 6 - 15) + 10);
  const start = random(seed + knot * 17.71);
  return (start + (random(seed + (knot + 1) * 17.71) - start) * blend) * 2 - 1;
}

function episode(time: number, seed: number, period: number) {
  const clock = time / period + random(seed + 11) * 13 + noise(time * 0.019, seed + 47) * 0.13;
  const cycle = Math.floor(clock);
  const progress = clock - cycle;
  const gate = ease(0.04, 0.31, progress) * (1 - ease(0.59, 0.98, progress));
  return { cycle, gate };
}

export function createHeroChoreography(seed: number, capacity: number) {
  const poses: HeroPose[] = Array.from({ length: capacity }, () => ({
    x: 0, y: 0, size: 1, split: 0, spin: 0, stretch: 1,
    satellites: 0, morph: 0, skew: 0, budAngle: 0, cohesion: 0,
  }));
  const baseX = new Float64Array(capacity);
  const baseY = new Float64Array(capacity);
  const pullX = new Float64Array(capacity);
  const pullY = new Float64Array(capacity);
  const pullWeight = new Float64Array(capacity);

  return {
    poses,
    sample(time: number, aspect: number, count: number) {
      const t = Math.max(0, time);
      const metric = Math.max(0.65, aspect);
      pullX.fill(0);
      pullY.fill(0);
      pullWeight.fill(0);

      for (let index = 0; index < count; index += 1) {
        const key = seed + index * 103.31;
        const pose = poses[index];
        const pace = 0.029 + random(key + 2) * 0.035;
        const phase = random(key + 3) * 91;
        const activity = episode(t, key + 5, 9 + random(key + 7) * 17);
        const temperament = random(key + activity.cycle * 41.9 + 23);
        const budding = temperament < 0.61 ? activity.gate : activity.gate * 0.2;
        const stretching = temperament >= 0.61 ? activity.gate : activity.gate * 0.15;

        // Every body wanders through a different, continuously changing current.
        baseX[index] = 0.5 + noise(t * pace + phase, key + 31) * 0.34
          + noise(t * pace * 2.37 + phase, key + 37) * 0.1;
        baseY[index] = 0.5 + noise(t * pace * 0.83 + phase, key + 41) * 0.29
          + noise(t * pace * 2.11 + phase, key + 43) * 0.1;
        pose.size = 0.94 + noise(t * 0.071 + phase, key + 53) * 0.19;
        pose.split = clamp(0.12 + noise(t * 0.083 + phase, key + 59) * 0.1 + budding * 0.84);
        pose.satellites = clamp(0.27 + noise(t * 0.11 + phase, key + 61) * 0.22 + budding * 0.39);
        pose.spin = random(key + 67) * TAU + t * (random(key + 71) - 0.5) * 0.29
          + noise(t * 0.059 + phase, key + 73) * 2.4;
        pose.stretch = 1.14 + noise(t * 0.091 + phase, key + 79) * 0.37 + stretching * 0.6;
        pose.morph = 0.5 + noise(t * 0.12 + phase, key + 83) * 0.36;
        pose.skew = noise(t * 0.097 + phase, key + 89) * 0.8;
        pose.budAngle = pose.spin + 1.9 + noise(t * 0.078 + phase, key + 97) * 1.7;
        pose.cohesion = 0;
      }

      // Encounters belong to pairs, each with its own clock and temperament.
      // Nearby bodies sometimes linger, absorb each other or drift past; the rest
      // of the field continues independently. No scene switches or shared beat.
      for (let first = 0; first < count; first += 1) {
        for (let second = first + 1; second < count; second += 1) {
          const key = seed + first * 131.7 + second * 293.1;
          const encounter = episode(t, key, 13 + random(key + 3) * 23);
          const affinity = random(key + encounter.cycle * 57.3 + 7);
          if (affinity > 0.54) continue;
          const dx = baseX[second] - baseX[first];
          const dy = baseY[second] - baseY[first];
          const distance = Math.hypot(dx * metric, dy);
          const proximity = 1 - ease(0.28, 0.78, distance);
          const bond = encounter.gate * proximity * (affinity < 0.32 ? 1 : 0.46);
          const weight = bond * 0.5;
          pullX[first] += dx * weight;
          pullY[first] += dy * weight;
          pullX[second] -= dx * weight;
          pullY[second] -= dy * weight;
          pullWeight[first] += weight;
          pullWeight[second] += weight;
          poses[first].cohesion = Math.max(poses[first].cohesion, bond);
          poses[second].cohesion = Math.max(poses[second].cohesion, bond);
        }
      }

      for (let index = 0; index < count; index += 1) {
        const pose = poses[index];
        const normalization = Math.max(1, pullWeight[index] / 0.82);
        pose.x = clamp(baseX[index] + pullX[index] / normalization, 0.04, 0.96);
        pose.y = clamp(baseY[index] + pullY[index] / normalization, 0.1, 0.9);
        pose.split *= 1 - pose.cohesion * 0.83;
        pose.size *= 1 + pose.cohesion * 0.1;
      }
    },
  };
}

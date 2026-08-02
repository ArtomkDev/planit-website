// components/ui/Hero.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, RocketLaunch } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { FloatingSchedule } from "@/components/ui/FloatingSchedule";
import { AndroidRobotLogo } from "@/components/ui/BrandIcons";
import { useTheme } from "@/components/providers/ThemeProvider";

const PLAY_MARKET_URL = "https://play.google.com/store/apps/details?id=com.artomk.planit";
const DISPLAY_COLORS = {
  light: [244, 91, 138],
  dark: [62, 247, 210],
} as const;
const TAU = Math.PI * 2;

type FigureSeed = {
  phaseX: number;
  phaseY: number;
  phaseSplit: number;
  speedX: number;
  speedY: number;
  splitSpeed: number;
  orbitSpeed: number;
  radius: number;
  splitDistance: number;
  stretch: number;
};

type FieldLobe = {
  x: number;
  y: number;
  radius: number;
  stretch: number;
  cosine: number;
  sine: number;
  strength: number;
};

type FigureBody = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  energy: number;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const progress = clamp((value - edge0) / (edge1 - edge0));
  return progress * progress * (3 - 2 * progress);
}

function edgeCellNoise(column: number, level: number) {
  const value = Math.sin(column * 91.17 + level * 47.63) * 43758.5453;
  return value - Math.floor(value);
}

function seededUnit(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function createFigureSeed(index: number, animationSeed: number): FigureSeed {
  const seed = animationSeed + index * 137.29;

  return {
    phaseX: (index / 7) * TAU + seededUnit(seed + 1.2) * 0.7,
    phaseY: index * 2.17 + seededUnit(seed + 2.8) * 1.1,
    phaseSplit: seededUnit(seed + 4.1) * TAU,
    speedX: 0.13 + seededUnit(seed + 5.7) * 0.09,
    speedY: 0.11 + seededUnit(seed + 7.3) * 0.1,
    splitSpeed: 0.3 + seededUnit(seed + 9.6) * 0.2,
    orbitSpeed: 0.12 + seededUnit(seed + 11.4) * 0.17,
    radius: 0.165 + seededUnit(seed + 13.8) * 0.065,
    splitDistance: 0.145 + seededUnit(seed + 15.5) * 0.105,
    stretch: 0.86 + seededUnit(seed + 17.1) * 0.72,
  };
}

function PixelDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const redrawRef = useRef<(() => void) | null>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
    redrawRef.current?.();
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let frameId = 0;
    let width = 0;
    let height = 0;
    let lastFrame = 0;
    let gridColumns = 0;
    let gridRows = 0;
    let pixelEnergy = new Float32Array(0);
    let figureBodies: FigureBody[] = [];
    const animationStartedAt = performance.now();
    let lastDrawAt = animationStartedAt;
    const animationSeed = Math.random() * 1000;
    const figureSeeds = Array.from({ length: 8 }, (_, index) =>
      createFigureSeed(index, animationSeed),
    );
    const initialColor = DISPLAY_COLORS[themeRef.current];
    const currentColor = [...initialColor];
    const pointer = {
      x: 0.5,
      y: 0.5,
      targetX: 0.5,
      targetY: 0.5,
      activity: 0,
      targetActivity: 0,
      velocityX: 0,
      velocityY: 0,
      energy: 0,
    };

    const draw = (timestamp: number) => {
      if (width === 0 || height === 0) return;

      const compact = width < 768;
      const cellSize = compact ? 11 : 13;
      const gap = compact ? 1.25 : 1.5;
      const time = reduceMotion ? 18 : (timestamp - animationStartedAt) / 1000;
      const frameDelta = Math.min(
        0.08,
        Math.max(1 / 240, (timestamp - lastDrawAt) / 1000),
      );
      lastDrawAt = timestamp;
      const columns = Math.ceil(width / cellSize);
      const rows = Math.max(4, Math.ceil(height / cellSize));
      const horizontalOffset = (width - columns * cellSize) / 2;
      const verticalOffset = height - rows * cellSize;
      const aspect = width / Math.max(height, 1);
      const activeTheme = themeRef.current;
      const targetColor = DISPLAY_COLORS[activeTheme];
      const colorBlend = reduceMotion ? 1 : 0.09;
      const pointerPositionBlend = reduceMotion
        ? 1
        : 1 - Math.exp(-frameDelta * 10);
      const pointerActivityBlend = reduceMotion
        ? 1
        : 1 -
          Math.exp(
            -frameDelta * (pointer.targetActivity > pointer.activity ? 8 : 4),
          );
      const previousPointerX = pointer.x;
      const previousPointerY = pointer.y;
      pointer.x += (pointer.targetX - pointer.x) * pointerPositionBlend;
      pointer.y += (pointer.targetY - pointer.y) * pointerPositionBlend;
      pointer.activity +=
        (pointer.targetActivity - pointer.activity) * pointerActivityBlend;
      const measuredPointerVelocityX =
        (pointer.x - previousPointerX) / frameDelta;
      const measuredPointerVelocityY =
        (pointer.y - previousPointerY) / frameDelta;
      const pointerVelocityBlend = reduceMotion
        ? 1
        : 1 - Math.exp(-frameDelta * 9);
      pointer.velocityX +=
        (measuredPointerVelocityX - pointer.velocityX) * pointerVelocityBlend;
      pointer.velocityY +=
        (measuredPointerVelocityY - pointer.velocityY) * pointerVelocityBlend;

      if (pointer.targetActivity === 0) {
        const pointerVelocityDamping = Math.exp(-frameDelta * 4.5);
        pointer.velocityX *= pointerVelocityDamping;
        pointer.velocityY *= pointerVelocityDamping;
      }

      const pointerSpeed = Math.min(
        1.8,
        Math.hypot(pointer.velocityX * aspect, pointer.velocityY),
      );
      const figureCount = compact ? 5 : 7;
      const figureTargets = Array.from({ length: figureCount }, (_, index) => {
        const figure = figureSeeds[index];
        const laneCenter = (index + 0.5) / figureCount;

        return {
          x: clamp(
            laneCenter +
              Math.sin(time * figure.speedX + figure.phaseX) *
                (compact ? 0.2 : 0.155) +
              Math.sin(time * 0.057 + figure.phaseY) * 0.045,
            0.025,
            0.975,
          ),
          y:
            0.5 +
            Math.sin(time * figure.speedY + figure.phaseY) * 0.34 +
            Math.sin(time * 0.069 + figure.phaseX) * 0.055,
        };
      });

      if (figureBodies.length !== figureCount) {
        figureBodies = figureTargets.map((target) => ({
          ...target,
          velocityX: 0,
          velocityY: 0,
          energy: 0,
        }));
      }

      const interactionEnergy = new Float32Array(figureCount);
      let pointerCoupling = 0;

      if (reduceMotion) {
        for (let index = 0; index < figureCount; index += 1) {
          const body = figureBodies[index];
          const target = figureTargets[index];
          body.x = target.x;
          body.y = target.y;
          body.velocityX = 0;
          body.velocityY = 0;
          body.energy = 0;
        }
      } else {
        for (let index = 0; index < figureCount; index += 1) {
          const body = figureBodies[index];
          const target = figureTargets[index];
          const pointerOffsetX = (body.x - pointer.x) * aspect;
          const pointerOffsetY = body.y - pointer.y;
          const pointerDistance = Math.max(
            0.0001,
            Math.hypot(pointerOffsetX, pointerOffsetY),
          );
          const pointerInfluence =
            pointer.activity *
            (1 -
              smoothstep(
                compact ? 0.07 : 0.09,
                compact ? 0.52 : 0.62,
                pointerDistance,
              ));

          body.velocityX += (target.x - body.x) * 2.8 * frameDelta;
          body.velocityY += (target.y - body.y) * 2.8 * frameDelta;

          if (pointerInfluence > 0) {
            const pointerPush =
              pointerInfluence * (1.05 + pointerSpeed * 0.55);
            body.velocityX +=
              ((pointerOffsetX / pointerDistance) * pointerPush * frameDelta) /
              aspect;
            body.velocityY +=
              (pointerOffsetY / pointerDistance) * pointerPush * frameDelta;
            body.velocityX +=
              pointer.velocityX * pointerInfluence * 0.72 * frameDelta;
            body.velocityY +=
              pointer.velocityY * pointerInfluence * 0.72 * frameDelta;
            interactionEnergy[index] +=
              pointerInfluence * (0.46 + pointerSpeed * 0.34);
            pointerCoupling = Math.max(
              pointerCoupling,
              pointerInfluence * (0.72 + body.energy * 0.28),
            );
          }
        }

        for (let firstIndex = 0; firstIndex < figureCount; firstIndex += 1) {
          for (
            let secondIndex = firstIndex + 1;
            secondIndex < figureCount;
            secondIndex += 1
          ) {
            const firstBody = figureBodies[firstIndex];
            const secondBody = figureBodies[secondIndex];
            const offsetX = (secondBody.x - firstBody.x) * aspect;
            const offsetY = secondBody.y - firstBody.y;
            const distance = Math.max(0.0001, Math.hypot(offsetX, offsetY));
            const interactionRange =
              (figureSeeds[firstIndex].radius +
                figureSeeds[secondIndex].radius) *
              (compact ? 1.15 : 1.28);
            const proximity =
              1 - smoothstep(interactionRange * 0.38, interactionRange, distance);

            if (proximity <= 0) continue;

            const directionX = offsetX / distance;
            const directionY = offsetY / distance;
            const relativeVelocity =
              (secondBody.velocityX - firstBody.velocityX) *
                aspect *
                directionX +
              (secondBody.velocityY - firstBody.velocityY) * directionY;
            const separationImpulse = proximity * 0.28 * frameDelta;
            const collisionImpulse =
              Math.max(0, -relativeVelocity) * proximity * 0.36;
            const impulse = separationImpulse + collisionImpulse;
            firstBody.velocityX -= (directionX * impulse) / aspect;
            firstBody.velocityY -= directionY * impulse;
            secondBody.velocityX += (directionX * impulse) / aspect;
            secondBody.velocityY += directionY * impulse;
            const transferredEnergy =
              proximity *
              (0.08 +
                Math.min(0.5, Math.abs(relativeVelocity) * 0.55) +
                (firstBody.energy + secondBody.energy) * 0.18);
            interactionEnergy[firstIndex] += transferredEnergy;
            interactionEnergy[secondIndex] += transferredEnergy;
          }
        }

        const bodyDamping = Math.exp(-frameDelta * 1.85);

        for (let index = 0; index < figureCount; index += 1) {
          const body = figureBodies[index];
          const bodySpeed = Math.hypot(
            body.velocityX * aspect,
            body.velocityY,
          );
          const energyTarget = clamp(
            interactionEnergy[index] + bodySpeed * 0.72,
          );
          const energyBlend =
            1 -
            Math.exp(
              -frameDelta * (energyTarget > body.energy ? 8.5 : 1.65),
            );
          body.energy += (energyTarget - body.energy) * energyBlend;
          body.velocityX *= bodyDamping;
          body.velocityY *= bodyDamping;
          body.x += body.velocityX * frameDelta;
          body.y += body.velocityY * frameDelta;

          if (body.x < -0.06 || body.x > 1.06) {
            body.x = clamp(body.x, -0.06, 1.06);
            body.velocityX *= -0.48;
          }
          if (body.y < -0.12 || body.y > 1.12) {
            body.y = clamp(body.y, -0.12, 1.12);
            body.velocityY *= -0.48;
          }
        }
      }

      const pointerEnergyTarget = clamp(
        pointer.activity * (pointerCoupling + pointerSpeed * 0.22),
      );
      const pointerEnergyBlend = reduceMotion
        ? 1
        : 1 -
          Math.exp(
            -frameDelta *
              (pointerEnergyTarget > pointer.energy ? 9.5 : 2.15),
          );
      pointer.energy +=
        (pointerEnergyTarget - pointer.energy) * pointerEnergyBlend;

      const lobes: FieldLobe[] = [];

      for (let index = 0; index < figureCount; index += 1) {
        const figure = figureSeeds[index];
        const body = figureBodies[index];
        const presence = reduceMotion
          ? 1
          : smoothstep(0, 1, (time - index * 0.32) / 2.7);
        const centerX = body.x;
        const centerY = body.y;
        const splitWave =
          0.5 + 0.5 * Math.sin(time * figure.splitSpeed + figure.phaseSplit);
        const splitAmount = smoothstep(0.2, 0.82, splitWave);
        const separation = figure.splitDistance * splitAmount;
        const orbitAngle =
          time * figure.orbitSpeed +
          figure.phaseSplit +
          Math.sin(time * 0.08 + figure.phaseY) * 0.48;
        const splitX = (Math.cos(orbitAngle) * separation) / aspect;
        const splitY = Math.sin(orbitAngle) * separation;
        const rotation =
          orbitAngle * 0.42 +
          Math.sin(time * 0.13 + figure.phaseX) * 0.32 +
          clamp(body.velocityX * aspect * 1.8, -0.42, 0.42);
        const bodySpeed = Math.hypot(
          body.velocityX * aspect,
          body.velocityY,
        );
        const inertiaStretch = 1 + clamp(bodySpeed * 0.58, 0, 0.46);
        const breathing = 0.94 + Math.sin(time * 0.22 + figure.phaseY) * 0.06;
        const parentRadius =
          figure.radius *
          breathing *
          (1 - splitAmount * 0.045) *
          (1 + body.energy * 0.12);
        const childRadius =
          figure.radius *
          (0.71 + Math.sin(time * 0.19 + figure.phaseX) * 0.065) *
          (1 + body.energy * 0.08);

        lobes.push({
          x: centerX - splitX * 0.28,
          y: centerY - splitY * 0.28,
          radius: parentRadius,
          stretch: figure.stretch * inertiaStretch,
          cosine: Math.cos(rotation),
          sine: Math.sin(rotation),
          strength: (0.96 + body.energy * 0.16) * presence,
        });
        lobes.push({
          x: centerX + splitX * 0.72,
          y: centerY + splitY * 0.72,
          radius: childRadius,
          stretch: 1.42 - (figure.stretch - 0.92) * 0.55,
          cosine: Math.cos(rotation + 0.72),
          sine: Math.sin(rotation + 0.72),
          strength:
            (0.63 + splitAmount * 0.28 + body.energy * 0.11) * presence,
        });

        const bridgeStrength =
          (1 - smoothstep(0.52, 0.96, splitAmount)) * 0.42 * presence;

        if (bridgeStrength > 0.01) {
          lobes.push({
            x: centerX + splitX * 0.24,
            y: centerY + splitY * 0.24,
            radius: figure.radius * 0.56,
            stretch: 1.62,
            cosine: Math.cos(orbitAngle),
            sine: Math.sin(orbitAngle),
            strength: bridgeStrength * (1 + body.energy * 0.3),
          });
        }

        if (index % 2 === 0) {
          const budWave =
            0.5 +
            0.5 *
              Math.sin(
                time * (figure.splitSpeed * 0.76) + figure.phaseSplit + 2.3,
              );
          const budAmount = smoothstep(0.34, 0.88, budWave);
          const budAngle = orbitAngle + 2.2 + Math.sin(time * 0.11) * 0.28;
          const budDistance = figure.splitDistance * 0.78 * budAmount;

          lobes.push({
            x: centerX + (Math.cos(budAngle) * budDistance) / aspect,
            y: centerY + Math.sin(budAngle) * budDistance,
            radius: figure.radius * 0.6,
            stretch: 1.12,
            cosine: Math.cos(budAngle),
            sine: Math.sin(budAngle),
            strength:
              (0.34 + budAmount * 0.34 + body.energy * 0.09) * presence,
          });
        }
      }

      if (pointer.activity > 0.002) {
        const pointerAngle = Math.atan2(
          pointer.velocityY,
          pointer.velocityX * aspect,
        );

        lobes.push({
          x: pointer.x - pointer.velocityX * 0.018,
          y: pointer.y - pointer.velocityY * 0.018,
          radius:
            (compact ? 0.17 : 0.2) +
            pointerSpeed * 0.018 +
            pointer.energy * 0.035,
          stretch:
            1.05 + pointerSpeed * 0.22 + pointer.energy * 0.24,
          cosine: Math.cos(pointerAngle),
          sine: Math.sin(pointerAngle),
          strength:
            pointer.activity *
            (0.34 + pointerSpeed * 0.08 + pointer.energy * 0.14),
        });
      }

      if (columns !== gridColumns || rows !== gridRows) {
        gridColumns = columns;
        gridRows = rows;
        pixelEnergy = new Float32Array(columns * rows);
      }

      for (let channel = 0; channel < currentColor.length; channel += 1) {
        currentColor[channel] += (targetColor[channel] - currentColor[channel]) * colorBlend;
      }

      context.clearRect(0, 0, width, height);
      context.fillStyle = `rgb(${currentColor.map(Math.round).join(", ")})`;

      for (let row = 0; row < rows; row += 1) {
        const y = verticalOffset + row * cellSize + cellSize / 2;
        const screenY = y / height;

        for (let column = 0; column < columns; column += 1) {
          const levelFromBottom = rows - row;

          if (levelFromBottom <= 3) {
            const density = [0.58, 0.76, 0.9][levelFromBottom - 1];
            if (edgeCellNoise(column, levelFromBottom) > density) continue;
          }

          const x = horizontalOffset + column * cellSize + cellSize / 2;
          const screenX = x / width;
          const warpedX =
            screenX +
            (Math.sin(screenY * 6.2 + time * 0.12) * 0.012) / aspect;
          const warpedY =
            screenY +
            Math.sin(screenX * aspect * 3.7 - time * 0.095) * 0.012;
          let field = 0;

          for (const lobe of lobes) {
            const offsetX = (warpedX - lobe.x) * aspect;
            const offsetY = warpedY - lobe.y;
            const rotatedX = offsetX * lobe.cosine + offsetY * lobe.sine;
            const rotatedY = -offsetX * lobe.sine + offsetY * lobe.cosine;
            const stretchedX = rotatedX / lobe.stretch;
            const stretchedY = rotatedY * Math.sqrt(lobe.stretch);
            const distanceSquared =
              (stretchedX * stretchedX + stretchedY * stretchedY) /
              (lobe.radius * lobe.radius);
            field += lobe.strength * Math.exp(-distanceSquared * 1.62);
          }

          const pointerOffsetX = (warpedX - pointer.x) * aspect;
          const pointerOffsetY = warpedY - pointer.y;
          const pointerDistanceSquared =
            pointerOffsetX * pointerOffsetX + pointerOffsetY * pointerOffsetY;
          const pointerDistance = Math.sqrt(pointerDistanceSquared);
          const pointerCore = Math.exp(-pointerDistanceSquared * 19);
          const pointerHalo = Math.exp(-pointerDistanceSquared * 6.5);
          const pointerRipple =
            (0.5 +
              Math.cos(pointerDistance * 31 - time * 2.4) * 0.5) *
            Math.exp(-pointerDistanceSquared * 8.5);
          const hoverSignal =
            pointer.activity *
            (pointerCore * (0.18 + pointer.energy * 0.08) +
              pointerHalo * 0.04 +
              pointerRipple * (0.05 + pointer.energy * 0.035));
          let coupledRipple = 0;
          let coupledProximity = 0;

          for (let index = 0; index < figureCount; index += 1) {
            const body = figureBodies[index];
            const bodyOffsetX = (warpedX - body.x) * aspect;
            const bodyOffsetY = warpedY - body.y;
            const bodyDistanceSquared =
              bodyOffsetX * bodyOffsetX + bodyOffsetY * bodyOffsetY;
            const bodyDistance = Math.sqrt(bodyDistanceSquared);
            const energyEnvelope = Math.exp(-bodyDistanceSquared * 7.5);
            const bodyRipple =
              (0.5 +
                Math.cos(bodyDistance * 27 - time * 2.05 - index * 0.72) *
                  0.5) *
              energyEnvelope *
              body.energy;
            coupledRipple += bodyRipple * 0.085;
            coupledProximity = Math.max(
              coupledProximity,
              energyEnvelope * body.energy,
            );
          }

          const ambientWave =
            0.5 +
            Math.sin(
              warpedX * aspect * 5.1 + warpedY * 5.8 - time * 0.16,
            ) *
              0.5;
          const ambientTexture =
            0.028 +
            ambientWave * 0.026 +
            edgeCellNoise(column + 29, row + 37) * 0.018;
          const halo = smoothstep(0.012, 0.2, field);
          const body = smoothstep(0.09, 0.5, field);
          const core = smoothstep(0.34, 0.9, field);
          const pattern =
            0.94 +
            Math.sin(
              field * 8.5 +
                warpedX * aspect * 2.4 -
                warpedY * 2.1 -
                time * 0.23,
            ) *
              0.06;
          const organicSignal =
            (halo * 0.15 + body * 0.38 + core * 0.47) * pattern;
          const variation = 0.91 + edgeCellNoise(column, row + 11) * 0.09;
          const targetEnergy = clamp(
            ambientTexture +
              organicSignal * variation +
              hoverSignal +
              coupledRipple,
            0,
            1.15,
          );
          const energyIndex = row * columns + column;
          const previousEnergy = pixelEnergy[energyIndex];
          const response = targetEnergy > previousEnergy ? 0.14 : 0.052;
          const energy = reduceMotion
            ? targetEnergy
            : previousEnergy + (targetEnergy - previousEnergy) * response;
          pixelEnergy[energyIndex] = energy;

          const globalBreathing = 0.975 + Math.sin(time * 0.37) * 0.025;
          const offAlpha = activeTheme === "dark" ? 0.018 : 0.009;
          const maximumAlpha = activeTheme === "dark" ? 0.64 : 0.34;
          const tonalEnergy = Math.pow(
            energy,
            activeTheme === "dark" ? 1.08 : 1.2,
          );
          const alpha =
            offAlpha + maximumAlpha * tonalEnergy * globalBreathing;

          context.globalAlpha = alpha;
          const basePixelSize = cellSize - gap;
          const hoverScale =
            1 +
            pointer.activity *
              pointerCore *
              (0.18 + pointer.energy * 0.08) +
            coupledProximity * 0.16;
          const pixelSize = Math.min(cellSize - 0.35, basePixelSize * hoverScale);
          const pixelOffset = (cellSize - pixelSize) / 2;
          context.fillRect(
            horizontalOffset + column * cellSize + pixelOffset,
            verticalOffset + row * cellSize + pixelOffset,
            pixelSize,
            pixelSize,
          );
        }
      }

      context.globalAlpha = 1;
    };

    redrawRef.current = () => draw(performance.now());

    const updatePointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        pointer.targetActivity = 0;
        return;
      }

      const bounds = canvas.getBoundingClientRect();
      const inside =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;

      pointer.targetActivity = inside ? 1 : 0;

      if (inside && bounds.width > 0 && bounds.height > 0) {
        pointer.targetX = clamp((event.clientX - bounds.left) / bounds.width);
        pointer.targetY = clamp((event.clientY - bounds.top) / bounds.height);
      }

      if (reduceMotion) draw(performance.now());
    };

    const deactivatePointer = () => {
      pointer.targetActivity = 0;
      if (reduceMotion) draw(performance.now());
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) deactivatePointer();
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(bounds.width));
      const nextHeight = Math.max(1, Math.round(bounds.height));
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);

      if (nextWidth === width && nextHeight === height) return;

      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      draw(performance.now());
    };

    const animate = (timestamp: number) => {
      if (timestamp - lastFrame >= 1000 / 30) {
        draw(timestamp);
        lastFrame = timestamp;
      }
      frameId = window.requestAnimationFrame(animate);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerout", handlePointerOut);
    window.addEventListener("blur", deactivatePointer);
    window.addEventListener("scroll", deactivatePointer, { passive: true });

    if (!reduceMotion) {
      frameId = window.requestAnimationFrame(animate);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("blur", deactivatePointer);
      window.removeEventListener("scroll", deactivatePointer);
      redrawRef.current = null;
    };
  }, [reduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative -mt-16 flex min-h-[calc(100vh+4rem)] items-center overflow-hidden bg-zinc-50 pt-16 transition-colors duration-500 dark:bg-zinc-950">
      <PixelDisplay />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
        }}
        className="relative z-20 mx-auto grid w-full max-w-7xl items-center gap-14 px-6 pb-16 pt-28 lg:grid-cols-[1.08fr_.92fr] lg:gap-20 lg:pb-20 lg:pt-32"
      >
        <div className="text-center lg:text-left">
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mb-7">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 text-sm font-bold tracking-widest uppercase shadow-lg">
                <RocketLaunch weight="duotone" className="w-5 h-5 text-indigo-500" />
                {t("badge")}
            </span>
          </motion.div>
        
          <motion.h1
            variants={{ hidden: { opacity: 0, scale: 0.94 }, visible: { opacity: 1, scale: 1 } }}
            className="text-5xl font-black leading-[0.94] tracking-[-0.055em] text-zinc-900 sm:text-6xl md:text-7xl dark:text-white"
          >
            <span className="block drop-shadow-md">{t("title1")}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 drop-shadow-lg">
              {t("title2")}
            </span>
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
            className="mx-auto mt-7 max-w-2xl text-lg font-medium leading-relaxed text-zinc-600 lg:mx-0 dark:text-zinc-300"
          >
            {t("description")}
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <motion.a
              href={process.env.NEXT_PUBLIC_APP_URL || "https://planit-demo.web.app"}
              whileHover={{ y: -3, scale: 1.025 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-7 py-4 font-bold text-white shadow-xl transition-shadow duration-300 hover:shadow-2xl sm:w-auto dark:bg-white dark:text-zinc-900"
            >
              {t("ctaPrimary")}
              <ArrowRight size={19} weight="bold" />
            </motion.a>
            <motion.a
              href={PLAY_MARKET_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -3, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white/70 px-7 py-4 font-bold text-zinc-800 shadow-sm backdrop-blur-xl transition-[box-shadow,border-color,background-color] duration-300 hover:border-zinc-400 hover:bg-white/90 hover:shadow-xl sm:w-auto dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-white dark:hover:border-zinc-500 dark:hover:bg-zinc-900/90"
            >
              <AndroidRobotLogo className="h-[19px] w-[19px]" />
              {t("ctaSecondary")}
            </motion.a>
          </motion.div>
        </div>

        <div className="w-full">
          <FloatingSchedule />
        </div>
      </motion.div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

type PixelSpec = readonly [
  column: number,
  row: number,
  intensity: number,
];

type PixelPattern = {
  name: string;
  pixels: readonly PixelSpec[];
};

type ClusterSpec = {
  top: string;
  left?: string;
  right?: string;
  pattern: number;
  phase: number;
  desktopOnly?: boolean;
};

const PATTERN_LAYOUT_STORAGE_KEY = "planit:homepage-decoration-symbols-v2";

const PIXEL_PATTERNS: readonly PixelPattern[] = [
  {
    name: "check",
    pixels: [[0, 3, 0.78], [1, 4, 0.88], [2, 5, 1], [3, 4, 0.92], [4, 3, 0.9], [5, 2, 0.88], [6, 1, 0.84], [7, 0, 0.78]],
  },
  {
    name: "braces",
    pixels: [[2, 0, 0.72], [1, 0, 0.82], [1, 1, 0.9], [1, 2, 0.94], [0, 2, 1], [1, 3, 0.94], [1, 4, 0.9], [1, 5, 0.82], [2, 5, 0.72], [6, 0, 0.72], [7, 0, 0.82], [7, 1, 0.9], [7, 2, 0.94], [8, 2, 1], [7, 3, 0.94], [7, 4, 0.9], [7, 5, 0.82], [6, 5, 0.72]],
  },
  {
    name: "star",
    pixels: [[4, 0, 1], [4, 1, 0.92], [0, 2, 0.72], [1, 2, 0.8], [2, 2, 0.86], [3, 2, 0.94], [4, 2, 1], [5, 2, 0.94], [6, 2, 0.86], [7, 2, 0.8], [8, 2, 0.72], [3, 3, 0.92], [4, 3, 1], [5, 3, 0.92], [2, 4, 0.82], [3, 4, 0.9], [5, 4, 0.9], [6, 4, 0.82], [2, 5, 0.74], [6, 5, 0.74]],
  },
  {
    name: "calendar",
    pixels: [[2, 0, 0.9], [2, 1, 1], [6, 0, 0.9], [6, 1, 1], [1, 1, 0.78], [3, 1, 0.78], [4, 1, 0.78], [5, 1, 0.78], [7, 1, 0.78], [1, 2, 0.9], [7, 2, 0.9], [1, 3, 0.9], [3, 3, 1], [5, 3, 1], [7, 3, 0.9], [1, 4, 0.9], [7, 4, 0.9], [1, 5, 0.78], [2, 5, 0.78], [3, 5, 0.78], [4, 5, 0.78], [5, 5, 0.78], [6, 5, 0.78], [7, 5, 0.78]],
  },
  {
    name: "arrow",
    pixels: [[0, 3, 0.7], [1, 3, 0.76], [2, 3, 0.82], [3, 3, 0.88], [4, 3, 0.94], [5, 3, 1], [6, 3, 1], [7, 3, 0.94], [8, 3, 0.86], [5, 0, 0.74], [6, 1, 0.84], [7, 2, 0.94], [7, 4, 0.94], [6, 5, 0.84]],
  },
  {
    name: "bookmark",
    pixels: [[2, 0, 0.78], [3, 0, 0.82], [4, 0, 0.86], [5, 0, 0.82], [6, 0, 0.78], [2, 1, 0.9], [6, 1, 0.9], [2, 2, 0.94], [6, 2, 0.94], [2, 3, 1], [6, 3, 1], [2, 4, 0.94], [3, 4, 0.9], [6, 4, 0.94], [5, 4, 0.9], [4, 5, 1]],
  },
  {
    name: "clock",
    pixels: [[3, 0, 0.78], [4, 0, 0.82], [5, 1, 0.88], [6, 2, 0.94], [6, 3, 0.94], [5, 4, 0.88], [4, 5, 0.82], [3, 5, 0.78], [2, 4, 0.88], [1, 3, 0.94], [1, 2, 0.94], [2, 1, 0.88], [4, 1, 0.86], [4, 2, 0.94], [4, 3, 1], [5, 3, 0.9]],
  },
  {
    name: "sparkle",
    pixels: [[4, 0, 0.72], [4, 1, 0.82], [4, 2, 0.94], [0, 3, 0.68], [1, 3, 0.76], [2, 3, 0.86], [3, 3, 0.94], [4, 3, 1], [5, 3, 0.94], [6, 3, 0.86], [7, 3, 0.76], [8, 3, 0.68], [4, 4, 0.84], [4, 5, 0.72], [3, 2, 0.74], [5, 2, 0.74], [3, 4, 0.74], [5, 4, 0.74]],
  },
  {
    name: "checklist",
    pixels: [[0, 0, 0.82], [1, 1, 1], [2, 0, 0.9], [4, 0, 0.76], [5, 0, 0.8], [6, 0, 0.84], [7, 0, 0.8], [8, 0, 0.76], [0, 2, 0.82], [1, 3, 1], [2, 2, 0.9], [4, 2, 0.76], [5, 2, 0.8], [6, 2, 0.84], [7, 2, 0.8], [8, 2, 0.76], [0, 4, 0.82], [1, 5, 1], [2, 4, 0.9], [4, 4, 0.76], [5, 4, 0.8], [6, 4, 0.84], [7, 4, 0.8], [8, 4, 0.76]],
  },
  {
    name: "folder",
    pixels: [[0, 1, 0.82], [1, 1, 0.86], [1, 0, 0.9], [2, 0, 0.9], [3, 1, 0.92], [4, 1, 0.82], [5, 1, 0.82], [6, 1, 0.82], [7, 1, 0.82], [8, 1, 0.78], [0, 2, 0.94], [8, 2, 0.94], [0, 3, 1], [8, 3, 1], [0, 4, 0.94], [8, 4, 0.94], [0, 5, 0.78], [1, 5, 0.78], [2, 5, 0.78], [3, 5, 0.78], [4, 5, 0.78], [5, 5, 0.78], [6, 5, 0.78], [7, 5, 0.78], [8, 5, 0.78]],
  },
  {
    name: "code",
    pixels: [[3, 0, 0.72], [2, 1, 0.82], [1, 2, 0.92], [0, 3, 1], [1, 4, 0.92], [2, 5, 0.82], [5, 0, 0.72], [6, 1, 0.82], [7, 2, 0.92], [8, 3, 1], [7, 4, 0.92], [6, 5, 0.82]],
  },
  {
    name: "reminder",
    pixels: [[4, 0, 0.78], [3, 1, 0.86], [4, 1, 0.94], [5, 1, 0.86], [2, 2, 0.92], [6, 2, 0.92], [2, 3, 1], [6, 3, 1], [1, 4, 0.82], [2, 4, 0.86], [3, 4, 0.9], [4, 4, 0.94], [5, 4, 0.9], [6, 4, 0.86], [7, 4, 0.82], [4, 5, 1]],
  },
];

const CLUSTERS: readonly ClusterSpec[] = [
  { top: "3%", right: "2.5%", pattern: 0, phase: 0.18 },
  { top: "11%", left: "4%", pattern: 2, phase: 0.62 },
  { top: "19%", right: "8%", pattern: 6, phase: 0.36, desktopOnly: true },
  { top: "27%", left: "1.5%", pattern: 4, phase: 0.78 },
  { top: "35%", right: "2%", pattern: 1, phase: 0.48 },
  { top: "43%", left: "7%", pattern: 3, phase: 0.1, desktopOnly: true },
  { top: "51%", right: "4%", pattern: 7, phase: 0.7 },
  { top: "59%", left: "2.5%", pattern: 5, phase: 0.28 },
  { top: "67%", right: "9%", pattern: 8, phase: 0.88, desktopOnly: true },
  { top: "75%", left: "5%", pattern: 9, phase: 0.52 },
  { top: "84%", right: "2.5%", pattern: 10, phase: 0.22 },
  { top: "93%", left: "8%", pattern: 11, phase: 0.82, desktopOnly: true },
];

function getPixelSequencePhase(
  symbol: string,
  column: number,
  row: number,
  pixelIndex: number,
  pixelCount: number,
) {
  const byStroke = pixelIndex / Math.max(1, pixelCount - 1);

  switch (symbol) {
    case "braces":
    case "code":
      return column <= 4 ? row / 12 : 0.55 + row / 12;
    case "star":
    case "sparkle":
      return Math.min(1, Math.hypot(column - 4, row - 3) / 5);
    case "calendar":
    case "bookmark":
    case "checklist":
      return row / 5;
    case "arrow":
      return column / 8;
    case "clock":
      return pixelIndex < 12
        ? (pixelIndex / 11) * 0.72
        : 0.78 + ((pixelIndex - 12) / 4) * 0.22;
    case "reminder":
      return Math.abs(column - 4) / 4;
    default:
      return byStroke;
  }
}

const DEFAULT_PATTERN_LAYOUT = CLUSTERS.map((cluster) => cluster.pattern);

function isPatternLayout(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === CLUSTERS.length &&
    value.every(
      (pattern) =>
        Number.isInteger(pattern) &&
        pattern >= 0 &&
        pattern < PIXEL_PATTERNS.length,
    )
  );
}

function randomUnit() {
  const value = new Uint32Array(1);
  window.crypto.getRandomValues(value);
  return value[0] / 4294967296;
}

function shufflePatterns(patterns: number[]) {
  for (let index = patterns.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(randomUnit() * (index + 1));
    [patterns[index], patterns[swapIndex]] = [
      patterns[swapIndex],
      patterns[index],
    ];
  }

  return patterns;
}

function createRandomizedPatternLayout(previousLayout: readonly number[]) {
  const patternPool = Array.from(
    { length: CLUSTERS.length },
    (_, index) => index % PIXEL_PATTERNS.length,
  );

  for (let attempt = 0; attempt < 48; attempt += 1) {
    const candidate = shufflePatterns([...patternPool]);
    const movedFromPreviousSlot = candidate.every(
      (pattern, index) => pattern !== previousLayout[index],
    );
    const hasNoAdjacentDuplicates = candidate.every(
      (pattern, index) => index === 0 || pattern !== candidate[index - 1],
    );

    if (movedFromPreviousSlot && hasNoAdjacentDuplicates) {
      return candidate;
    }
  }

  return previousLayout.map(
    (pattern, index) =>
      (pattern + 1 + (index % (PIXEL_PATTERNS.length - 1))) %
      PIXEL_PATTERNS.length,
  );
}

export function HomepagePixelClusters() {
  const [patternLayout, setPatternLayout] = useState(DEFAULT_PATTERN_LAYOUT);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      let previousLayout: readonly number[] = DEFAULT_PATTERN_LAYOUT;

      try {
        const storedLayout = JSON.parse(
          window.sessionStorage.getItem(PATTERN_LAYOUT_STORAGE_KEY) ?? "null",
        );

        if (isPatternLayout(storedLayout)) {
          previousLayout = storedLayout;
        }
      } catch {
        previousLayout = DEFAULT_PATTERN_LAYOUT;
      }

      const nextLayout = createRandomizedPatternLayout(previousLayout);
      setPatternLayout(nextLayout);

      try {
        window.sessionStorage.setItem(
          PATTERN_LAYOUT_STORAGE_KEY,
          JSON.stringify(nextLayout),
        );
      } catch {
        // Decorations still randomize when session storage is unavailable.
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
    >
      {CLUSTERS.map((cluster, clusterIndex) => {
        const pattern = patternLayout[clusterIndex];
        const symbol = PIXEL_PATTERNS[pattern];
        const pixels = symbol.pixels;
        const revealDuration =
          12.5 + ((pattern + clusterIndex) % 4) * 1.25;

        return (
          <div
            key={`${cluster.top}-${cluster.left ?? cluster.right}`}
            data-decoration-pattern={pattern}
            data-decoration-symbol={symbol.name}
            style={{
              top: cluster.top,
              left: cluster.left,
              right: cluster.right,
            }}
            className={`homepage-pixel-cluster absolute ${
              cluster.desktopOnly ? "hidden md:block" : "block"
            }`}
          >
            <div className="homepage-pixel-symbol absolute inset-0">
              {pixels.map(([column, row, intensity], pixelIndex) => {
                const pixelPhase = getPixelSequencePhase(
                  symbol.name,
                  column,
                  row,
                  pixelIndex,
                  pixels.length,
                );
                const revealDelay =
                  cluster.phase * 0.35 + pixelPhase * 1.15;

                return (
                  <span
                    key={`${column}-${row}-${pixelIndex}`}
                    data-homepage-pixel="true"
                    className="homepage-grid-pixel absolute"
                    style={
                      {
                        left: `calc(var(--homepage-decoration-cell-size) * ${column})`,
                        top: `calc(var(--homepage-decoration-cell-size) * ${row})`,
                        animationDuration: `${revealDuration}s`,
                        animationDelay: `${revealDelay}s`,
                        "--pixel-color": "var(--brand)",
                        "--pixel-peak": intensity,
                      } as CSSProperties
                    }
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

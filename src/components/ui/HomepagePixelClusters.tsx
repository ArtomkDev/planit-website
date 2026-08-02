"use client";

import { motion, useReducedMotion } from "framer-motion";

type PixelSpec = readonly [column: number, row: number];

type ClusterSpec = {
  top: string;
  left?: string;
  right?: string;
  pattern: number;
  driftX: number;
  driftY: number;
  duration: number;
  desktopOnly?: boolean;
};

const GRID_STEP = 13;
const PIXEL_SIZE = GRID_STEP - 1.5;

const PIXEL_PATTERNS: readonly (readonly PixelSpec[])[] = [
  [
    [0, 2],
    [1, 0],
    [2, 3],
    [4, 1],
    [5, 4],
    [7, 2],
  ],
  [
    [0, 0],
    [0, 3],
    [2, 1],
    [3, 4],
    [5, 2],
    [7, 0],
  ],
  [
    [0, 4],
    [1, 2],
    [3, 0],
    [4, 3],
    [6, 1],
    [7, 4],
  ],
  [
    [0, 3],
    [2, 0],
    [3, 2],
    [5, 4],
    [7, 1],
  ],
  [
    [0, 1],
    [1, 4],
    [3, 2],
    [5, 0],
    [6, 3],
    [7, 1],
  ],
];

const CLUSTERS: readonly ClusterSpec[] = [
  { top: "3%", left: "2.5%", pattern: 0, driftX: 5, driftY: 7, duration: 10 },
  { top: "9%", right: "3.5%", pattern: 3, driftX: -6, driftY: 5, duration: 12 },
  { top: "16%", left: "8%", pattern: 1, driftX: 4, driftY: 8, duration: 11, desktopOnly: true },
  { top: "23%", right: "2%", pattern: 2, driftX: -5, driftY: 7, duration: 13 },
  { top: "30%", left: "3.5%", pattern: 4, driftX: 6, driftY: 5, duration: 12 },
  { top: "37%", right: "9%", pattern: 0, driftX: -4, driftY: 8, duration: 11, desktopOnly: true },
  { top: "44%", left: "1.5%", pattern: 3, driftX: 5, driftY: 6, duration: 12 },
  { top: "51%", right: "4.5%", pattern: 1, driftX: -5, driftY: 7, duration: 10 },
  { top: "58%", left: "7%", pattern: 2, driftX: 4, driftY: 6, duration: 13, desktopOnly: true },
  { top: "65%", right: "2.5%", pattern: 4, driftX: -6, driftY: 5, duration: 11 },
  { top: "72%", left: "3%", pattern: 0, driftX: 5, driftY: 8, duration: 13 },
  { top: "80%", right: "8%", pattern: 3, driftX: -4, driftY: 7, duration: 12, desktopOnly: true },
  { top: "88%", left: "9%", pattern: 1, driftX: 6, driftY: 5, duration: 10 },
  { top: "96%", right: "3.5%", pattern: 2, driftX: -5, driftY: 7, duration: 13 },
];

export function HomepagePixelClusters() {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
    >
      {CLUSTERS.map((cluster, clusterIndex) => {
        const pixels = PIXEL_PATTERNS[cluster.pattern];

        return (
          <motion.div
            key={`${cluster.top}-${cluster.left ?? cluster.right}`}
            initial={false}
            animate={
              reduceMotion
                ? { x: 0, y: 0 }
                : {
                    x: [0, cluster.driftX, 0],
                    y: [0, -cluster.driftY, 0],
                  }
            }
            transition={{
              duration: cluster.duration,
              delay: clusterIndex * 0.13,
              repeat: reduceMotion ? 0 : Infinity,
              ease: "easeInOut",
            }}
            style={{
              top: cluster.top,
              left: cluster.left,
              right: cluster.right,
            }}
            className={`absolute h-16 w-28 transform-gpu ${
              cluster.desktopOnly ? "hidden md:block" : "block"
            }`}
          >
            {pixels.map(([column, row], pixelIndex) => {
              const twinkleDuration =
                5.4 + ((clusterIndex + pixelIndex) % 5) * 0.42;
              const twinkleDelay =
                (clusterIndex * 1.17 + pixelIndex * 0.83) %
                twinkleDuration;

              return (
                <span
                  key={`${column}-${row}`}
                  data-homepage-pixel="true"
                  className="homepage-pixel-twinkle absolute"
                  style={{
                    left: column * GRID_STEP,
                    top: row * GRID_STEP,
                    width: PIXEL_SIZE,
                    height: PIXEL_SIZE,
                    animationDuration: `${twinkleDuration}s`,
                    animationDelay: `-${twinkleDelay}s`,
                  }}
                />
              );
            })}
          </motion.div>
        );
      })}
    </div>
  );
}

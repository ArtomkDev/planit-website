"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { createHeroChoreography } from "@/lib/hero-choreography";

const DISPLAY_COLORS = {
  light: [244, 91, 138],
  dark: [62, 247, 210],
} as const;

const TAU = Math.PI * 2;
const MAX_FIGURES = 7;
const MAX_LOBES = 48;
const MAX_SHOCKWAVES = 4;
const SIN_LOOKUP_SIZE = 4096;
const FALLOFF_LOOKUP_SIZE = 2048;
const FALLOFF_LIMIT = 9;
const FIELD_LOOKUP_SIZE = 2048;
const FIELD_LOOKUP_LIMIT = 1.35;
const ENERGY_LOOKUP_SIZE = 2048;
const ENERGY_LOOKUP_LIMIT = 1.15;
const ALPHA_BUCKET_COUNT = 64;
const FEATURE_REVEAL_DELAY = 0.4;
const FEATURE_REVEAL_DURATION = 0.9;
const FEATURE_CELL_FADE = 0.16;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeToMotionPreference(update: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", update);
  return () => media.removeEventListener("change", update);
}
const getMotionPreference = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerMotionPreference = () => true;

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

type FigureBody = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  energy: number;
};

type MatrixGrid = {
  compact: boolean;
  columns: number;
  rows: number;
  cellSize: number;
  gap: number;
  horizontalOffset: number;
  verticalOffset: number;
  aspect: number;
  columnX: Float32Array;
  columnSideStrength: Float32Array;
  rowY: Float32Array;
  rowWarpX: Float32Array;
  columnWarpY: Float32Array;
  textureNoise: Float32Array;
  variation: Float32Array;
  visible: Uint8Array;
  reveal: Float32Array;
  revealArrival: Float32Array | null;
  energy: Float32Array;
  alphaPixels: Uint8Array;
};

type PixelRenderer = {
  kind: "webgl" | "canvas2d";
  resize: (width: number, height: number, pixelRatio: number) => void;
  render: (
    grid: MatrixGrid,
    red: number,
    green: number,
    blue: number,
  ) => void;
  dispose: () => void;
};

const PIXEL_VERTEX_SHADER = `
  attribute vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const PIXEL_FRAGMENT_SHADER = `
  precision mediump float;

  uniform sampler2D u_alphaTexture;
  uniform vec2 u_canvasSize;
  uniform vec2 u_gridSize;
  uniform vec2 u_gridOffset;
  uniform float u_cellSize;
  uniform float u_gap;
  uniform vec3 u_color;

  void main() {
    vec2 screenPixel = vec2(
      gl_FragCoord.x,
      u_canvasSize.y - gl_FragCoord.y
    );
    vec2 gridPixel = screenPixel - u_gridOffset;
    vec2 cell = floor(gridPixel / u_cellSize);

    if (
      cell.x < 0.0 ||
      cell.y < 0.0 ||
      cell.x >= u_gridSize.x ||
      cell.y >= u_gridSize.y
    ) {
      discard;
    }

    float leadingGap = floor(u_gap * 0.5);
    float pixelSize = u_cellSize - u_gap;
    vec2 pixelInCell = mod(gridPixel, u_cellSize);

    if (
      pixelInCell.x < leadingGap ||
      pixelInCell.y < leadingGap ||
      pixelInCell.x >= leadingGap + pixelSize ||
      pixelInCell.y >= leadingGap + pixelSize
    ) {
      discard;
    }

    vec2 texturePosition = (cell + 0.5) / u_gridSize;
    float alpha = texture2D(u_alphaTexture, texturePosition).r;

    if (alpha <= 0.0) {
      discard;
    }

    gl_FragColor = vec4(u_color * alpha, alpha);
  }
`;

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createWebglPixelRenderer(
  canvas: HTMLCanvasElement,
): PixelRenderer | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
  });
  if (!gl) return null;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, PIXEL_VERTEX_SHADER);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    PIXEL_FRAGMENT_SHADER,
  );

  if (!vertexShader || !fragmentShader) {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  const positionBuffer = gl.createBuffer();
  const alphaTexture = gl.createTexture();
  const positionLocation = gl.getAttribLocation(program, "a_position");
  const alphaTextureLocation = gl.getUniformLocation(
    program,
    "u_alphaTexture",
  );
  const canvasSizeLocation = gl.getUniformLocation(program, "u_canvasSize");
  const gridSizeLocation = gl.getUniformLocation(program, "u_gridSize");
  const gridOffsetLocation = gl.getUniformLocation(program, "u_gridOffset");
  const cellSizeLocation = gl.getUniformLocation(program, "u_cellSize");
  const gapLocation = gl.getUniformLocation(program, "u_gap");
  const colorLocation = gl.getUniformLocation(program, "u_color");

  if (
    !positionBuffer ||
    !alphaTexture ||
    positionLocation < 0 ||
    !alphaTextureLocation ||
    !canvasSizeLocation ||
    !gridSizeLocation ||
    !gridOffsetLocation ||
    !cellSizeLocation ||
    !gapLocation ||
    !colorLocation
  ) {
    if (positionBuffer) gl.deleteBuffer(positionBuffer);
    if (alphaTexture) gl.deleteTexture(alphaTexture);
    gl.deleteProgram(program);
    return null;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]),
    gl.STATIC_DRAW,
  );
  gl.useProgram(program);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, alphaTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.uniform1i(alphaTextureLocation, 0);
  gl.disable(gl.BLEND);
  gl.disable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);

  let textureColumns = 0;
  let textureRows = 0;
  let pixelRatio = 1;

  return {
    kind: "webgl",
    resize: (_width, _height, nextPixelRatio) => {
      pixelRatio = nextPixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    render: (grid, red, green, blue) => {
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, alphaTexture);

      if (grid.columns !== textureColumns || grid.rows !== textureRows) {
        textureColumns = grid.columns;
        textureRows = grid.rows;
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.LUMINANCE,
          textureColumns,
          textureRows,
          0,
          gl.LUMINANCE,
          gl.UNSIGNED_BYTE,
          grid.alphaPixels,
        );
      } else {
        gl.texSubImage2D(
          gl.TEXTURE_2D,
          0,
          0,
          0,
          textureColumns,
          textureRows,
          gl.LUMINANCE,
          gl.UNSIGNED_BYTE,
          grid.alphaPixels,
        );
      }

      gl.uniform2f(canvasSizeLocation, canvas.width, canvas.height);
      gl.uniform2f(gridSizeLocation, grid.columns, grid.rows);
      gl.uniform2f(
        gridOffsetLocation,
        grid.horizontalOffset * pixelRatio,
        grid.verticalOffset * pixelRatio,
      );
      gl.uniform1f(cellSizeLocation, grid.cellSize * pixelRatio);
      gl.uniform1f(gapLocation, grid.gap * pixelRatio);
      gl.uniform3f(colorLocation, red / 255, green / 255, blue / 255);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
    dispose: () => {
      gl.deleteBuffer(positionBuffer);
      gl.deleteTexture(alphaTexture);
      gl.deleteProgram(program);
    },
  };
}

function createCanvasPixelRenderer(
  canvas: HTMLCanvasElement,
): PixelRenderer | null {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return null;

  let width = 0;
  let height = 0;
  let pixelRatio = 1;

  return {
    kind: "canvas2d",
    resize: (nextWidth, nextHeight, nextPixelRatio) => {
      width = nextWidth;
      height = nextHeight;
      pixelRatio = nextPixelRatio;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.imageSmoothingEnabled = false;
    },
    render: (grid, red, green, blue) => {
      const physicalCellSize = Math.round(grid.cellSize * pixelRatio);
      const physicalGap = Math.round(grid.gap * pixelRatio);
      const leadingGap = Math.floor(physicalGap / 2) / pixelRatio;
      const pixelSize =
        Math.max(1, physicalCellSize - physicalGap) / pixelRatio;

      context.globalAlpha = 1;
      context.clearRect(0, 0, width, height);
      context.fillStyle = `rgb(${red}, ${green}, ${blue})`;

      for (let row = 0; row < grid.rows; row += 1) {
        for (let column = 0; column < grid.columns; column += 1) {
          const cellIndex = row * grid.columns + column;
          const alpha = grid.alphaPixels[cellIndex];
          if (alpha === 0) continue;

          context.globalAlpha = alpha / 255;
          context.fillRect(
            grid.horizontalOffset + column * grid.cellSize + leadingGap,
            grid.verticalOffset + row * grid.cellSize + leadingGap,
            pixelSize,
            pixelSize,
          );
        }
      }

      context.globalAlpha = 1;
    },
    dispose: () => undefined,
  };
}

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

const SIN_LOOKUP = new Float32Array(SIN_LOOKUP_SIZE);
for (let index = 0; index < SIN_LOOKUP_SIZE; index += 1) {
  SIN_LOOKUP[index] = Math.sin((index / SIN_LOOKUP_SIZE) * TAU);
}
const SIN_LOOKUP_SCALE = SIN_LOOKUP_SIZE / TAU;

const FALLOFF_LOOKUP = new Float32Array(FALLOFF_LOOKUP_SIZE);
for (let index = 0; index < FALLOFF_LOOKUP_SIZE; index += 1) {
  FALLOFF_LOOKUP[index] = Math.exp(
    -((index / (FALLOFF_LOOKUP_SIZE - 1)) * FALLOFF_LIMIT),
  );
}
const FALLOFF_LOOKUP_SCALE =
  (FALLOFF_LOOKUP_SIZE - 1) / FALLOFF_LIMIT;

const FIELD_LOOKUP = new Float32Array(FIELD_LOOKUP_SIZE);
for (let index = 0; index < FIELD_LOOKUP_SIZE; index += 1) {
  const field = (index / (FIELD_LOOKUP_SIZE - 1)) * FIELD_LOOKUP_LIMIT;
  const halo = smoothstep(0.012, 0.2, field);
  const body = smoothstep(0.09, 0.5, field);
  const core = smoothstep(0.34, 0.9, field);
  FIELD_LOOKUP[index] = halo * 0.15 + body * 0.38 + core * 0.47;
}
const FIELD_LOOKUP_SCALE = (FIELD_LOOKUP_SIZE - 1) / FIELD_LOOKUP_LIMIT;

function createEnergyLookup(power: number) {
  const lookup = new Float32Array(ENERGY_LOOKUP_SIZE);

  for (let index = 0; index < ENERGY_LOOKUP_SIZE; index += 1) {
    const energy =
      (index / (ENERGY_LOOKUP_SIZE - 1)) * ENERGY_LOOKUP_LIMIT;
    lookup[index] = Math.pow(energy, power);
  }

  return lookup;
}

const ENERGY_LOOKUP = {
  light: createEnergyLookup(1.2),
  dark: createEnergyLookup(1.08),
} as const;
const ENERGY_LOOKUP_SCALE =
  (ENERGY_LOOKUP_SIZE - 1) / ENERGY_LOOKUP_LIMIT;

function fastSin(angle: number) {
  let wrapped = angle % TAU;
  if (wrapped < 0) wrapped += TAU;
  return SIN_LOOKUP[(wrapped * SIN_LOOKUP_SCALE) | 0];
}

function fastCos(angle: number) {
  return fastSin(angle + Math.PI / 2);
}

function fastFalloff(exponent: number) {
  if (exponent <= 0) return 1;
  if (exponent >= FALLOFF_LIMIT) return 0;
  return FALLOFF_LOOKUP[(exponent * FALLOFF_LOOKUP_SCALE) | 0];
}

type PixelDisplayProps = {
  variant?: "hero" | "feature";
  tornEdge?: "left" | "right";
};

export function PixelDisplay({
  variant = "hero",
  tornEdge = "left",
}: PixelDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const redrawRef = useRef<(() => void) | null>(null);
  const reduceMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    getServerMotionPreference,
  );
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
    redrawRef.current?.();
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initialRenderer =
      createWebglPixelRenderer(canvas) ?? createCanvasPixelRenderer(canvas);
    if (!initialRenderer) return;

    let renderer: PixelRenderer = initialRenderer;

    let frameId = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let lastFrame = 0;
    let grid: MatrixGrid | null = null;
    let canvasBounds = canvas.getBoundingClientRect();
    let figureBodies: FigureBody[] = [];
    let isIntersecting = variant === "hero";
    let hasStarted = variant === "hero" || reduceMotion;
    let visibleElapsed = 0;
    let isContextLost = false;
    let lastDrawAt = performance.now();
    const animationSeed = Math.random() * 1000;
    const figureSeeds = Array.from({ length: MAX_FIGURES }, (_, index) =>
      createFigureSeed(index, animationSeed),
    );
    const choreography = createHeroChoreography(animationSeed, MAX_FIGURES);
    const pairContact = new Uint8Array(MAX_FIGURES * MAX_FIGURES);
    const lastSplit = new Float32Array(MAX_FIGURES);
    const waveX = new Float32Array(MAX_SHOCKWAVES);
    const waveY = new Float32Array(MAX_SHOCKWAVES);
    const waveBorn = new Float32Array(MAX_SHOCKWAVES).fill(-100);
    const wavePower = new Float32Array(MAX_SHOCKWAVES);
    const waveRadius = new Float32Array(MAX_SHOCKWAVES);
    const waveEnvelope = new Float32Array(MAX_SHOCKWAVES);
    const activeWaveIndices = new Uint8Array(MAX_SHOCKWAVES);
    let nextWave = 0;
    const emitWave = (x: number, y: number, power: number) => {
      if (variant !== "hero" || reduceMotion) return;
      waveX[nextWave] = x;
      waveY[nextWave] = y;
      waveBorn[nextWave] = visibleElapsed;
      wavePower[nextWave] = power;
      nextWave = (nextWave + 1) % MAX_SHOCKWAVES;
    };
    const figureTargetX = new Float32Array(MAX_FIGURES);
    const figureTargetY = new Float32Array(MAX_FIGURES);
    const interactionEnergy = new Float32Array(MAX_FIGURES);
    const activeBodyIndices = new Uint8Array(MAX_FIGURES);
    const initialColor = DISPLAY_COLORS[themeRef.current];
    const currentColor = [initialColor[0], initialColor[1], initialColor[2]];

    const lobeX = new Float32Array(MAX_LOBES);
    const lobeY = new Float32Array(MAX_LOBES);
    const lobeInverseRadiusSquared = new Float32Array(MAX_LOBES);
    const lobeInverseRadius = new Float32Array(MAX_LOBES);
    const lobeOrganic = new Float32Array(MAX_LOBES);
    const lobePhase = new Float32Array(MAX_LOBES);
    const lobeInverseStretch = new Float32Array(MAX_LOBES);
    const lobeSqrtStretch = new Float32Array(MAX_LOBES);
    const lobeCosine = new Float32Array(MAX_LOBES);
    const lobeSine = new Float32Array(MAX_LOBES);
    const lobeStrength = new Float32Array(MAX_LOBES);
    const lobeMinimumX = new Float32Array(MAX_LOBES);
    const lobeMaximumX = new Float32Array(MAX_LOBES);
    const lobeMinimumY = new Float32Array(MAX_LOBES);
    const lobeMaximumY = new Float32Array(MAX_LOBES);
    const rowLobeIndices = new Uint8Array(MAX_LOBES);
    let lobeCount = 0;

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
      pressed: false,
    };

    const appendLobe = (
      x: number,
      y: number,
      radius: number,
      stretch: number,
      rotation: number,
      strength: number,
      organic = 0,
      phase = 0,
    ) => {
      const needsRevealContour =
        variant === "feature" &&
        !reduceMotion &&
        visibleElapsed < FEATURE_REVEAL_DELAY + FEATURE_REVEAL_DURATION;
      const lobeLimit = variant === "hero" ? MAX_LOBES : 24;
      if (lobeCount >= lobeLimit || (strength <= 0.001 && !needsRevealContour)) return;

      lobeX[lobeCount] = x;
      lobeY[lobeCount] = y;
      lobeInverseRadiusSquared[lobeCount] = 1 / (radius * radius);
      lobeInverseRadius[lobeCount] = 1 / radius;
      lobeOrganic[lobeCount] = organic;
      lobePhase[lobeCount] = phase;
      lobeInverseStretch[lobeCount] = 1 / stretch;
      lobeSqrtStretch[lobeCount] = Math.sqrt(stretch);
      lobeCosine[lobeCount] = Math.cos(rotation);
      lobeSine[lobeCount] = Math.sin(rotation);
      lobeStrength[lobeCount] = strength;
      lobeCount += 1;
    };

    const rebuildGrid = () => {
      const compact = width < 768;
      const targetCellSize = compact ? 11 : 13;
      const targetGap = compact ? 1.25 : 1.5;
      const cellSize = Math.round(targetCellSize * pixelRatio) / pixelRatio;
      const gap = Math.max(1, Math.round(targetGap * pixelRatio)) / pixelRatio;
      const columns = Math.max(
        1,
        variant === "feature"
          ? Math.floor(width / cellSize)
          : Math.ceil(width / cellSize),
      );
      const rows =
        variant === "feature"
          ? Math.max(1, Math.floor(height / cellSize))
          : Math.max(4, Math.ceil(height / cellSize));
      const horizontalOffset =
        Math.round(((width - columns * cellSize) / 2) * pixelRatio) /
        pixelRatio;
      const verticalOffset =
        Math.round(
          (height - rows * cellSize) * (variant === "feature" ? 0.5 : 1) * pixelRatio,
        ) / pixelRatio;
      const aspect = width / Math.max(height, 1);
      const cellCount = columns * rows;
      const columnX = new Float32Array(columns);
      const columnSideStrength = new Float32Array(columns);
      const rowY = new Float32Array(rows);
      const textureNoise = new Float32Array(cellCount);
      const variation = new Float32Array(cellCount);
      const visible = new Uint8Array(cellCount);
      const reveal = new Float32Array(cellCount);
      if (variant === "hero" || reduceMotion) reveal.fill(1);
      const energy = new Float32Array(cellCount);
      const previousGrid = grid;
      const tearDepthLimit = Math.max(2, Math.min(17, Math.floor(columns * 0.29)));
      const tearSeed = Math.floor(animationSeed);
      const cornerRadius = Math.min(6, Math.floor(columns / 4), Math.floor(rows / 4));

      for (let column = 0; column < columns; column += 1) {
        columnX[column] =
          (horizontalOffset + column * cellSize + cellSize / 2) / width;
        columnSideStrength[column] = smoothstep(
          0.08,
          0.95,
          Math.abs(columnX[column] - 0.5) * 2,
        );
      }

      for (let row = 0; row < rows; row += 1) {
        rowY[row] =
          (verticalOffset + row * cellSize + cellSize / 2) / height;

        // Broad cuts, stepped shelves and loose cells keep the tear pixel-aligned.
        // Compute the silhouette on resize so it stays still while the light moves.
        const broadCut =
          0.5 + Math.sin(rowY[row] * TAU * 1.7 + tearSeed * 0.13) * 0.5;
        const shelf = edgeCellNoise(Math.floor(row / 4) + tearSeed, 61);
        const tooth = edgeCellNoise(row + tearSeed, 83);
        const tearDepth = Math.round(
          clamp(
            tearDepthLimit * (0.17 + broadCut * 0.58) + shelf * 3 + tooth * 2,
            2,
            tearDepthLimit,
          ),
        );

        for (let column = 0; column < columns; column += 1) {
          const index = row * columns + column;
          const levelFromBottom = rows - row;
          let isVisible = true;

          if (variant === "feature") {
            const distanceFromEdge =
              tornEdge === "left" ? column : columns - column - 1;
            const fracture = edgeCellNoise(row + tearSeed, column + 107);

            if (distanceFromEdge < tearDepth - 2) {
              isVisible = distanceFromEdge >= tearDepth - 6 && fracture > 0.89;
            } else if (distanceFromEdge < tearDepth + 2) {
              isVisible = fracture > (tearDepth + 2 - distanceFromEdge) / 5;
            }

            const distanceFromOuterEdge =
              tornEdge === "left" ? columns - column - 1 : column;
            const distanceFromEnd = Math.min(row, rows - row - 1);
            if (distanceFromOuterEdge < cornerRadius && distanceFromEnd < cornerRadius) {
              const cornerX = cornerRadius - distanceFromOuterEdge - 0.5;
              const cornerY = cornerRadius - distanceFromEnd - 0.5;
              isVisible = isVisible &&
                cornerX * cornerX + cornerY * cornerY <= cornerRadius * cornerRadius;
            }

            if (previousGrid) {
              // Preserve the light field when the responsive grid changes size.
              const previousRow = Math.min(
                previousGrid.rows - 1,
                Math.floor((row / rows) * previousGrid.rows),
              );
              const previousColumn = Math.min(
                previousGrid.columns - 1,
                Math.floor((column / columns) * previousGrid.columns),
              );
              const previousIndex = previousRow * previousGrid.columns + previousColumn;
              reveal[index] = previousGrid.reveal[previousIndex];
              energy[index] = previousGrid.energy[previousIndex];
            }
          } else if (levelFromBottom <= 3) {
            const density = [0.58, 0.76, 0.9][levelFromBottom - 1];
            isVisible = edgeCellNoise(column, levelFromBottom) <= density;
          }

          visible[index] = isVisible ? 1 : 0;
          textureNoise[index] = edgeCellNoise(column + 29, row + 37);
          variation[index] = 0.91 + edgeCellNoise(column, row + 11) * 0.09;
        }
      }

      grid = {
        compact,
        columns,
        rows,
        cellSize,
        gap,
        horizontalOffset,
        verticalOffset,
        aspect,
        columnX,
        columnSideStrength,
        rowY,
        rowWarpX: new Float32Array(rows),
        columnWarpY: new Float32Array(columns),
        textureNoise,
        variation,
        visible,
        reveal,
        revealArrival: null,
        energy,
        alphaPixels: new Uint8Array(cellCount),
      };
    };

    const draw = (timestamp: number) => {
      const activeGrid = grid;
      if (isContextLost || !activeGrid || width === 0 || height === 0) return;
      if (!hasStarted) {
        renderer.render(activeGrid, currentColor[0], currentColor[1], currentColor[2]);
        return;
      }

      const {
        compact,
        columns,
        rows,
        aspect,
        columnX,
        columnSideStrength,
        rowY,
        rowWarpX,
        columnWarpY,
        textureNoise,
        variation,
        visible,
        reveal,
        energy: pixelEnergy,
        alphaPixels,
      } = activeGrid;
      const frameDelta = Math.min(
        0.08,
        Math.max(1 / 240, (timestamp - lastDrawAt) / 1000),
      );
      lastDrawAt = timestamp;
      const canAdvance = isIntersecting && !document.hidden;
      if (canAdvance && !reduceMotion) visibleElapsed += frameDelta;
      if (
        variant === "feature" &&
        !reduceMotion &&
        visibleElapsed < FEATURE_REVEAL_DELAY
      ) {
        renderer.render(activeGrid, currentColor[0], currentColor[1], currentColor[2]);
        return;
      }
      const featureRevealProgress = reduceMotion
        ? 1
        : clamp((visibleElapsed - FEATURE_REVEAL_DELAY) / FEATURE_REVEAL_DURATION);
      const time = reduceMotion
        ? 18
        : variant === "feature"
          ? Math.max(0, visibleElapsed - FEATURE_REVEAL_DELAY)
          : visibleElapsed;
      const activeTheme = themeRef.current;
      const targetColor = DISPLAY_COLORS[activeTheme];
      const colorBlend = reduceMotion
        ? 1
        : 1 - Math.exp(-frameDelta * 2.85);
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
      const figureCount = compact ? 5 : MAX_FIGURES;
      const formationScale = variant === "hero" && compact ? Math.min(1, aspect / 0.72) : 1;
      if (variant === "hero") choreography.sample(time, aspect, figureCount);

      for (let index = 0; index < figureCount; index += 1) {
        const figure = figureSeeds[index];
        if (variant === "hero") {
          figureTargetX[index] = choreography.poses[index].x;
          figureTargetY[index] = choreography.poses[index].y;
          continue;
        }
        const laneCenter = (index + 0.5) / figureCount;
        figureTargetX[index] = clamp(
          laneCenter +
            Math.sin(time * figure.speedX + figure.phaseX) *
              (compact ? 0.2 : 0.155) +
            Math.sin(time * 0.057 + figure.phaseY) * 0.045,
          0.025,
          0.975,
        );
        figureTargetY[index] =
          0.5 +
          Math.sin(time * figure.speedY + figure.phaseY) * 0.34 +
          Math.sin(time * 0.069 + figure.phaseX) * 0.055;
      }

      if (figureBodies.length !== figureCount) {
        figureBodies = Array.from({ length: figureCount }, (_, index) => ({
          x: figureTargetX[index],
          y: figureTargetY[index],
          velocityX: 0,
          velocityY: 0,
          energy: 0,
        }));
      }

      interactionEnergy.fill(0, 0, figureCount);
      let pointerCoupling = 0;

      if (reduceMotion) {
        for (let index = 0; index < figureCount; index += 1) {
          const body = figureBodies[index];
          body.x = figureTargetX[index];
          body.y = figureTargetY[index];
          body.velocityX = 0;
          body.velocityY = 0;
          body.energy = 0;
        }
      } else {
        for (let index = 0; index < figureCount; index += 1) {
          const body = figureBodies[index];
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

          const steering = variant === "hero" ? 3.6 : 2.8;
          body.velocityX +=
            (figureTargetX[index] - body.x) * steering * frameDelta;
          body.velocityY +=
            (figureTargetY[index] - body.y) * steering * frameDelta;

          if (pointerInfluence > 0) {
            const pointerPush =
              pointerInfluence * (pointer.pressed ? -1.3 : 1.05 + pointerSpeed * 0.55);
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
              (compact ? 1.15 : 1.28) *
              (variant === "hero" ? formationScale * 0.73 : 1);
            const proximity =
              1 - smoothstep(interactionRange * 0.38, interactionRange, distance);

            if (proximity <= 0) {
              pairContact[firstIndex * MAX_FIGURES + secondIndex] = 0;
              continue;
            }

            const directionX = offsetX / distance;
            const directionY = offsetY / distance;
            const relativeVelocity =
              (secondBody.velocityX - firstBody.velocityX) *
                aspect *
                directionX +
              (secondBody.velocityY - firstBody.velocityY) * directionY;
            // Shared targets are allowed to fuse; neighbouring streams still collide.
            const targetDistance = Math.hypot(
              (figureTargetX[secondIndex] - figureTargetX[firstIndex]) * aspect,
              figureTargetY[secondIndex] - figureTargetY[firstIndex],
            );
            const fusion = variant === "hero" ? 1 - smoothstep(0.04, 0.2, targetDistance) : 0;
            const contactIndex = firstIndex * MAX_FIGURES + secondIndex;
            if (variant === "hero") {
              const touching = distance < 0.15 * formationScale;
              if (touching && pairContact[contactIndex] === 0 && time > 2) {
                emitWave((firstBody.x + secondBody.x) / 2, (firstBody.y + secondBody.y) / 2, 0.12 + fusion * 0.12);
              }
              if (touching) pairContact[contactIndex] = 1;
              else if (distance > 0.23 * formationScale) pairContact[contactIndex] = 0;
            }
            const separationImpulse = proximity * (0.28 - fusion * 0.36) * frameDelta;
            const collisionImpulse =
              Math.max(0, -relativeVelocity) * proximity * 0.36 * (1 - fusion);
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

      lobeCount = 0;
      let activeBodyCount = 0;

      for (let index = 0; index < figureCount; index += 1) {
        const figure = figureSeeds[index];
        const body = figureBodies[index];
        const presence = reduceMotion
          ? 1
          : variant === "hero"
            ? smoothstep(0, 1, (time - index * 0.09) / 1.6)
            : smoothstep(0, 1, (time - index * 0.32) / 2.7);
        const splitWave =
          0.5 + 0.5 * Math.sin(time * figure.splitSpeed + figure.phaseSplit);
        const pose = variant === "hero" ? choreography.poses[index] : null;
        if (pose) {
          if (pose.split > 0.72 && lastSplit[index] <= 0.72 && time > 2) {
            emitWave(body.x, body.y, 0.15);
          }
          lastSplit[index] = pose.split;
          const speed = Math.hypot(body.velocityX * aspect, body.velocityY);
          const radius = figure.radius * 0.73 * pose.size * formationScale;
          const fork = radius * (0.45 + pose.split * 2.1);
          const angle = pose.spin + pose.skew * 0.9;
          const forkX = Math.cos(angle) * fork / aspect;
          const forkY = Math.sin(angle) * fork;
          const organic = 0.18 + pose.morph * 0.22;
          const phase = figure.phaseY + pose.morph * 3.1 + time * figure.splitSpeed * 0.7;

          appendLobe(
            body.x - forkX * 0.22, body.y - forkY * 0.22,
            radius * (1 - pose.split * 0.18),
            pose.stretch * (1 + Math.min(0.35, speed * 0.6)),
            angle, (0.87 + body.energy * 0.12) * presence, organic, phase,
          );
          appendLobe(
            body.x + forkX * (0.72 + pose.skew * 0.13),
            body.y + forkY * (0.72 - pose.skew * 0.13),
            radius * (0.38 + pose.morph * 0.28 + pose.split * 0.12),
            1.35 - pose.skew * 0.4, pose.budAngle * 0.67,
            (0.43 + pose.split * 0.35) * presence, organic * 0.85, phase + 2.3,
          );
          const neck = 1 - smoothstep(0.4, 0.87, pose.split);
          appendLobe(
            body.x + forkX * 0.32, body.y + forkY * 0.32,
            radius * (0.36 + neck * 0.09), 1.85, angle,
            neck * 0.4 * presence, organic * 0.7, phase + 1.1,
          );
          const budDistance = radius * (0.48 + pose.satellites * 1.25);
          appendLobe(
            body.x + Math.cos(pose.budAngle) * budDistance / aspect,
            body.y + Math.sin(pose.budAngle) * budDistance,
            radius * (0.35 + (1 - pose.morph) * 0.18),
            1.1 + pose.skew * 0.35, pose.budAngle,
            (0.24 + pose.satellites * 0.42) * presence, organic, phase - 1.7,
          );
          if (!reduceMotion) {
            const tailAngle = Math.atan2(body.velocityY, body.velocityX * aspect);
            const tailEnergy = clamp(speed * 3.5, 0, 0.6);
            for (let echo = 1; echo <= 2; echo += 1) {
              appendLobe(
                body.x - body.velocityX * echo * 0.3,
                body.y - body.velocityY * echo * 0.3,
                radius * (0.78 - echo * 0.14),
                1.4 + speed, tailAngle,
                tailEnergy * (1 - echo * 0.26) * presence, organic * 0.5, phase,
              );
            }
          }
          continue;
        }
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
        const breathing =
          0.94 + Math.sin(time * 0.22 + figure.phaseY) * 0.06;
        const baseRadius = figure.radius;
        const parentRadius =
          baseRadius *
          breathing *
          (1 - splitAmount * 0.045) *
          (1 + body.energy * 0.12);
        const childRadius =
          baseRadius *
          (0.71 + Math.sin(time * 0.19 + figure.phaseX) * 0.065) *
          (1 + body.energy * 0.08);

        appendLobe(
          body.x - splitX * 0.28,
          body.y - splitY * 0.28,
          parentRadius,
          figure.stretch * inertiaStretch,
          rotation,
          (0.96 + body.energy * 0.16) * presence,
        );
        appendLobe(
          body.x + splitX * 0.72,
          body.y + splitY * 0.72,
          childRadius,
          1.42 - (figure.stretch - 0.92) * 0.55,
          rotation + 0.72,
          (0.63 + splitAmount * 0.28 + body.energy * 0.11) * presence,
        );

        const bridgeStrength =
          (1 - smoothstep(0.52, 0.96, splitAmount)) * 0.42 * presence;

        if (bridgeStrength > 0.01) {
          appendLobe(
            body.x + splitX * 0.24,
            body.y + splitY * 0.24,
            baseRadius * 0.56,
            1.62,
            orbitAngle,
            bridgeStrength * (1 + body.energy * 0.3),
          );
        }

        if (index % 2 === 0) {
          const budWave =
            0.5 +
            0.5 *
              Math.sin(
                time * (figure.splitSpeed * 0.76) +
                  figure.phaseSplit +
                  2.3,
              );
          const budAmount = smoothstep(0.34, 0.88, budWave);
          const budAngle = orbitAngle + 2.2 + Math.sin(time * 0.11) * 0.28;
          const budDistance = figure.splitDistance * 0.78 * budAmount * formationScale;

          appendLobe(
            body.x + (Math.cos(budAngle) * budDistance) / aspect,
            body.y + Math.sin(budAngle) * budDistance,
            baseRadius * 0.6,
            1.12,
            budAngle,
            (0.34 + budAmount * 0.34 + body.energy * 0.09) * presence,
          );
        }

        if (variant === "feature" && body.energy > 0.002) {
          activeBodyIndices[activeBodyCount] = index;
          activeBodyCount += 1;
        }
      }

      if (pointer.activity > 0.002) {
        const pointerAngle = Math.atan2(
          pointer.velocityY,
          pointer.velocityX * aspect,
        );

        appendLobe(
          pointer.x - pointer.velocityX * 0.018,
          pointer.y - pointer.velocityY * 0.018,
          (compact ? 0.17 * formationScale : 0.2) +
            pointerSpeed * 0.018 +
            pointer.energy * 0.035,
          1.05 + pointerSpeed * 0.22 + pointer.energy * 0.24,
          pointerAngle,
          pointer.activity *
            (0.34 + pointerSpeed * 0.08 + pointer.energy * 0.14),
        );
      }

      const lobeCutoffScale = Math.sqrt(FALLOFF_LIMIT / 1.62);

      for (let index = 0; index < lobeCount; index += 1) {
        const radius = 1 / Math.sqrt(lobeInverseRadiusSquared[index]);
        const stretch = 1 / lobeInverseStretch[index];
        const organicExtent = 1 + lobeOrganic[index] * 1.7;
        const horizontalRadius = radius * lobeCutoffScale * stretch * organicExtent;
        const verticalRadius =
          (radius * lobeCutoffScale * organicExtent) / lobeSqrtStretch[index];
        const cosine = lobeCosine[index];
        const sine = lobeSine[index];
        const extentX =
          Math.sqrt(
            horizontalRadius * horizontalRadius * cosine * cosine +
              verticalRadius * verticalRadius * sine * sine,
          ) /
            aspect +
          (variant === "hero" ? 0.055 : 0.013) / aspect;
        const extentY =
          Math.sqrt(
            horizontalRadius * horizontalRadius * sine * sine +
              verticalRadius * verticalRadius * cosine * cosine,
          ) + (variant === "hero" ? 0.055 : 0.013);

        lobeMinimumX[index] = lobeX[index] - extentX;
        lobeMaximumX[index] = lobeX[index] + extentX;
        lobeMinimumY[index] = lobeY[index] - extentY;
        lobeMaximumY[index] = lobeY[index] + extentY;
      }

      for (let channel = 0; channel < 3; channel += 1) {
        currentColor[channel] +=
          (targetColor[channel] - currentColor[channel]) * colorBlend;
      }

      for (let row = 0; row < rows; row += 1) {
        rowWarpX[row] = variant === "hero"
          ? (fastSin(rowY[row] * 13.2 + time * 0.19) * 0.027
            + fastSin(rowY[row] * 23.7 - time * 0.13 + animationSeed) * 0.014) * formationScale / aspect
          : (fastSin(rowY[row] * 6.2 + time * 0.12) * 0.012) / aspect;
      }
      for (let column = 0; column < columns; column += 1) {
        columnWarpY[column] = variant === "hero"
          ? (fastSin(columnX[column] * aspect * 11.3 - time * 0.17) * 0.025
            + fastSin(columnX[column] * aspect * 21.1 + time * 0.11 + animationSeed) * 0.013) * formationScale
          : fastSin(columnX[column] * aspect * 3.7 - time * 0.095) * 0.012;
      }

      if (
        variant === "feature" &&
        !reduceMotion &&
        featureRevealProgress < 1 &&
        lobeCount > 0 &&
        activeGrid.revealArrival === null
      ) {
        // Use the hero's actual lobe contours to light the cells in expanding waves.
        // Normalize their arrival times so even the farthest cells appear quickly.
        const arrivals = new Float32Array(visible.length);
        let maximumDistance = 0;

        for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < columns; column += 1) {
            const cellIndex = row * columns + column;
            if (visible[cellIndex] === 0) continue;
            const warpedX = columnX[column] + rowWarpX[row];
            const warpedY = rowY[row] + columnWarpY[column];
            let nearestExponent = Infinity;

            for (let index = 0; index < lobeCount; index += 1) {
              const offsetX = (warpedX - lobeX[index]) * aspect;
              const offsetY = warpedY - lobeY[index];
              const rotatedX =
                offsetX * lobeCosine[index] + offsetY * lobeSine[index];
              const rotatedY =
                -offsetX * lobeSine[index] + offsetY * lobeCosine[index];
              const stretchedX = rotatedX * lobeInverseStretch[index];
              const stretchedY = rotatedY * lobeSqrtStretch[index];
              const exponent =
                (stretchedX * stretchedX + stretchedY * stretchedY) *
                lobeInverseRadiusSquared[index] * 1.62;
              nearestExponent = Math.min(nearestExponent, exponent);
            }

            const distance = Math.sqrt(nearestExponent);
            arrivals[cellIndex] = distance;
            maximumDistance = Math.max(maximumDistance, distance);
          }
        }

        const arrivalScale = (1 - FEATURE_CELL_FADE) / Math.max(maximumDistance, 0.001);
        for (let index = 0; index < arrivals.length; index += 1) {
          arrivals[index] *= arrivalScale;
        }
        activeGrid.revealArrival = arrivals;
      }

      const red = Math.round(currentColor[0]);
      const green = Math.round(currentColor[1]);
      const blue = Math.round(currentColor[2]);
      const pointerIsActive = pointer.activity > 0.002;
      let activeWaveCount = 0;
      if (variant === "hero" && !reduceMotion) {
        for (let index = 0; index < MAX_SHOCKWAVES; index += 1) {
          const age = visibleElapsed - waveBorn[index];
          if (age < 0 || age > 4.8) continue;
          waveRadius[index] = age * 0.27;
          waveEnvelope[index] = wavePower[index] * smoothstep(0, 0.18, age) * (1 - smoothstep(1.2, 4.8, age));
          activeWaveIndices[activeWaveCount++] = index;
        }
      }
      const globalBreathing = 0.975 + fastSin(time * 0.37) * 0.025;
      const offAlpha = activeTheme === "dark" ? 0.018 : 0.009;
      const maximumAlpha = activeTheme === "dark" ? 0.64 : 0.34;
      const tonalLookup = ENERGY_LOOKUP[activeTheme];
      const riseResponse = reduceMotion
        ? 1
        : 1 - Math.exp(-frameDelta * 4.55);
      const fallResponse = reduceMotion
        ? 1
        : 1 - Math.exp(-frameDelta * 1.6);

      for (let row = 0; row < rows; row += 1) {
        const warpedXOffset = rowWarpX[row];
        const baseY = rowY[row];
        let rowLobeCount = 0;

        for (let index = 0; index < lobeCount; index += 1) {
          if (
            baseY >= lobeMinimumY[index] &&
            baseY <= lobeMaximumY[index]
          ) {
            rowLobeIndices[rowLobeCount] = index;
            rowLobeCount += 1;
          }
        }

        for (let column = 0; column < columns; column += 1) {
          const cellIndex = row * columns + column;

          if (visible[cellIndex] === 0) {
            continue;
          }

          const warpedX = columnX[column] + warpedXOffset;
          const warpedY = baseY + columnWarpY[column];
          let field = 0;

          for (let rowLobeIndex = 0; rowLobeIndex < rowLobeCount; rowLobeIndex += 1) {
            const index = rowLobeIndices[rowLobeIndex];

            if (
              warpedX < lobeMinimumX[index] ||
              warpedX > lobeMaximumX[index]
            ) {
              continue;
            }

            const offsetX = (warpedX - lobeX[index]) * aspect;
            const offsetY = warpedY - lobeY[index];
            const rotatedX =
              offsetX * lobeCosine[index] + offsetY * lobeSine[index];
            const rotatedY =
              -offsetX * lobeSine[index] + offsetY * lobeCosine[index];
            const stretchedX = rotatedX * lobeInverseStretch[index];
            const stretchedY = rotatedY * lobeSqrtStretch[index];
            let exponent =
              (stretchedX * stretchedX + stretchedY * stretchedY) *
              lobeInverseRadiusSquared[index] *
              1.62;

            if (lobeOrganic[index] > 0 && exponent < FALLOFF_LIMIT * 2.6) {
              const phase = lobePhase[index];
              const warp = 1 + lobeOrganic[index] * (
                fastSin(stretchedY * lobeInverseRadius[index] * 2.9 + phase)
                + fastSin(stretchedX * lobeInverseRadius[index] * 3.7 - phase * 0.73) * 0.65
              );
              exponent *= warp;
            }

            if (exponent < FALLOFF_LIMIT) {
              field += lobeStrength[index] * fastFalloff(exponent);
            }
          }

          let pointerCore = 0;
          let hoverSignal = 0;

          if (pointerIsActive) {
            const pointerOffsetX = (warpedX - pointer.x) * aspect;
            const pointerOffsetY = warpedY - pointer.y;
            const pointerDistanceSquared =
              pointerOffsetX * pointerOffsetX +
              pointerOffsetY * pointerOffsetY;
            pointerCore = fastFalloff(pointerDistanceSquared * 19);
            const pointerHalo = fastFalloff(pointerDistanceSquared * 6.5);
            let pointerRipple = 0;

            if (pointerDistanceSquared * 8.5 < FALLOFF_LIMIT) {
              const pointerDistance = Math.sqrt(pointerDistanceSquared);
              pointerRipple =
                (0.5 +
                  fastCos(pointerDistance * 31 - time * 2.4) * 0.5) *
                fastFalloff(pointerDistanceSquared * 8.5);
            }

            hoverSignal =
              pointer.activity *
              (pointerCore * (0.18 + pointer.energy * 0.08) +
                pointerHalo * 0.04 +
                pointerRipple * (0.05 + pointer.energy * 0.035));
          }

          let coupledRipple = 0;

          for (let wave = 0; wave < activeWaveCount; wave += 1) {
            const index = activeWaveIndices[wave];
            const dx = (warpedX - waveX[index]) * aspect;
            const dy = warpedY - waveY[index];
            const distance = Math.sqrt(dx * dx + dy * dy);
            const front = distance - waveRadius[index];
            coupledRipple += fastFalloff(front * front * 1450) * waveEnvelope[index];
          }

          for (let activeIndex = 0; activeIndex < activeBodyCount; activeIndex += 1) {
            const figureIndex = activeBodyIndices[activeIndex];
            const body = figureBodies[figureIndex];
            const bodyOffsetX = (warpedX - body.x) * aspect;
            const bodyOffsetY = warpedY - body.y;
            const bodyDistanceSquared =
              bodyOffsetX * bodyOffsetX + bodyOffsetY * bodyOffsetY;
            const energyEnvelope = fastFalloff(bodyDistanceSquared * 7.5);

            if (energyEnvelope <= 0) continue;

            const bodyDistance = Math.sqrt(bodyDistanceSquared);
            const bodyRipple =
              (0.5 +
                fastCos(
                  bodyDistance * 27 - time * 2.05 - figureIndex * 0.72,
                ) *
                  0.5) *
              energyEnvelope *
              body.energy;
            coupledRipple += bodyRipple * 0.085;
          }

          const ambientWave =
            0.5 +
            fastSin(
              warpedX * aspect * 5.1 + warpedY * 5.8 - time * 0.16,
            ) *
              0.5;
          const ambientTexture =
            0.028 + ambientWave * 0.026 + textureNoise[cellIndex] * 0.018;
          const fieldLookupIndex = Math.min(
            FIELD_LOOKUP_SIZE - 1,
            (field * FIELD_LOOKUP_SCALE) | 0,
          );
          const pattern =
            0.94 +
            fastSin(
              field * 8.5 +
                warpedX * aspect * 2.4 -
                warpedY * 2.1 -
                time * 0.23,
            ) *
              0.06;
          const contour = variant === "hero"
            ? (0.5 + fastCos(field * 13.7 + warpedX * 7.3 - warpedY * 9.1 - time * 0.37) * 0.5) * smoothstep(0.08, 0.35, field) * (1 - smoothstep(0.55, 1.1, field)) * 0.06
            : 0;
          const organicSignal = FIELD_LOOKUP[fieldLookupIndex] * pattern + contour;
          const targetEnergy = clamp(
            ambientTexture +
              organicSignal * variation[cellIndex] +
              hoverSignal +
              coupledRipple,
            0,
            ENERGY_LOOKUP_LIMIT,
          );
          const previousEnergy = pixelEnergy[cellIndex];
          const response =
            targetEnergy > previousEnergy ? riseResponse : fallResponse;
          const energy =
            previousEnergy + (targetEnergy - previousEnergy) * response;
          pixelEnergy[cellIndex] = energy;

          const tonalIndex = Math.min(
            ENERGY_LOOKUP_SIZE - 1,
            (energy * ENERGY_LOOKUP_SCALE) | 0,
          );
          const animatedAlpha =
            maximumAlpha * tonalLookup[tonalIndex] * globalBreathing;
          const sideStrength = columnSideStrength[column];
          if (variant === "feature") {
            const arrival = activeGrid.revealArrival?.[cellIndex] ?? 1;
            const cellReveal = featureRevealProgress >= 1
              ? 1
              : smoothstep(arrival, arrival + FEATURE_CELL_FADE, featureRevealProgress);
            reveal[cellIndex] = Math.max(reveal[cellIndex], cellReveal);
          }
          const alpha =
            variant === "feature"
              ? (offAlpha +
                (activeTheme === "dark" ? 0.08 : 0.055) * sideStrength +
                animatedAlpha * (0.24 + sideStrength * 0.8)) * reveal[cellIndex]
              : offAlpha + animatedAlpha;
          const bucket = Math.min(
            ALPHA_BUCKET_COUNT - 1,
            Math.max(0, Math.round(alpha * (ALPHA_BUCKET_COUNT - 1))),
          );
          alphaPixels[cellIndex] = Math.round(
            (bucket * 255) / (ALPHA_BUCKET_COUNT - 1),
          );
        }
      }

      renderer.render(activeGrid, red, green, blue);
    };

    redrawRef.current = () => draw(performance.now());

    const updatePointer = (event: PointerEvent) => {
      if (event.pointerType === "touch" || reduceMotion) {
        pointer.targetActivity = 0;
        return;
      }

      canvasBounds = canvas.getBoundingClientRect();

      const inside =
        event.clientX >= canvasBounds.left &&
        event.clientX <= canvasBounds.right &&
        event.clientY >= canvasBounds.top &&
        event.clientY <= canvasBounds.bottom;

      pointer.targetActivity = inside ? 1 : 0;

      if (inside && canvasBounds.width > 0 && canvasBounds.height > 0) {
        pointer.targetX = clamp(
          (event.clientX - canvasBounds.left) / canvasBounds.width,
        );
        pointer.targetY = clamp(
          (event.clientY - canvasBounds.top) / canvasBounds.height,
        );
      }

      if (reduceMotion) draw(performance.now());
    };

    const deactivatePointer = () => {
      pointer.targetActivity = 0;
      pointer.pressed = false;
      if (reduceMotion) draw(performance.now());
    };

    const releasePointer = () => {
      if (!pointer.pressed) return;
      pointer.pressed = false;
      emitWave(pointer.x, pointer.y, 0.48);
    };

    const pressPointer = (event: PointerEvent) => {
      if (variant !== "hero" || reduceMotion || event.button !== 0 || event.pointerType === "touch") return;
      if (event.target instanceof Element && event.target.closest("a, button, input, select, textarea, [role='button']")) return;
      updatePointer(event);
      if (pointer.targetActivity === 0) return;
      pointer.pressed = true;
      emitWave(pointer.targetX, pointer.targetY, 0.28);
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) deactivatePointer();
    };

    const handleScroll = () => {
      canvasBounds = canvas.getBoundingClientRect();
      deactivatePointer();
    };

    const resize = () => {
      canvasBounds = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, canvas.clientWidth);
      const nextHeight = Math.max(1, canvas.clientHeight);
      const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      if (
        nextWidth === width &&
        nextHeight === height &&
        nextPixelRatio === pixelRatio
      ) {
        return;
      }

      width = nextWidth;
      height = nextHeight;
      pixelRatio = nextPixelRatio;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      rebuildGrid();

      if (!isContextLost) {
        renderer.resize(width, height, pixelRatio);
        draw(performance.now());
      }
    };

    const animate = (timestamp: number) => {
      frameId = 0;
      if (isContextLost || !isIntersecting || document.hidden) return;

      const targetFrameRate =
        pointer.targetActivity > 0 || pointer.activity > 0.02 ? 30 : 24;

      if (timestamp - lastFrame >= 1000 / targetFrameRate) {
        draw(timestamp);
        lastFrame = timestamp;
      }

      frameId = window.requestAnimationFrame(animate);
    };

    const syncAnimation = () => {
      const shouldAnimate =
        !reduceMotion &&
        !isContextLost &&
        isIntersecting &&
        !document.hidden;

      if (shouldAnimate && frameId === 0) {
        lastDrawAt = performance.now();
        lastFrame = performance.now();
        frameId = window.requestAnimationFrame(animate);
      } else if (!shouldAnimate && frameId !== 0) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && !isContextLost && isIntersecting) {
        lastDrawAt = performance.now();
        draw(performance.now());
      }
      syncAnimation();
    };

    const handleContextLost = (event: Event) => {
      if (renderer.kind !== "webgl") return;

      event.preventDefault();
      isContextLost = true;
      syncAnimation();
    };

    const handleContextRestored = () => {
      if (renderer.kind !== "webgl") return;

      const restoredRenderer = createWebglPixelRenderer(canvas);
      if (!restoredRenderer) return;

      renderer.dispose();
      renderer = restoredRenderer;
      isContextLost = false;
      renderer.resize(width, height, pixelRatio);
      draw(performance.now());
      syncAnimation();
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting &&
          (variant === "hero" || entry.intersectionRatio > 0);
        if (isIntersecting) {
          lastDrawAt = performance.now();
          if (!hasStarted) {
            hasStarted = true;
            lastDrawAt = performance.now();
          }
          draw(performance.now());
        }
        syncAnimation();
      },
      {
        rootMargin: "0px",
        threshold: variant === "feature" ? 0.001 : 0,
      },
    );
    intersectionObserver.observe(canvas);

    window.addEventListener("pointermove", updatePointer, { passive: true });
    if (variant === "hero" && !reduceMotion) {
      window.addEventListener("pointerdown", pressPointer, { passive: true });
      window.addEventListener("pointerup", releasePointer, { passive: true });
      window.addEventListener("pointercancel", deactivatePointer);
    }
    window.addEventListener("pointerout", handlePointerOut);
    window.addEventListener("blur", deactivatePointer);
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);
    syncAnimation();

    return () => {
      if (frameId !== 0) window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerdown", pressPointer);
      window.removeEventListener("pointerup", releasePointer);
      window.removeEventListener("pointercancel", deactivatePointer);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("blur", deactivatePointer);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      renderer.dispose();
      redrawRef.current = null;
    };
  }, [reduceMotion, variant, tornEdge]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        data-pixel-display={variant}
        className="h-full w-full [image-rendering:pixelated]"
      />
    </div>
  );
}


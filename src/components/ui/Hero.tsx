// components/ui/Hero.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { FloatingSchedule } from "@/components/ui/FloatingSchedule";
import { AndroidRobotLogo } from "@/components/ui/BrandIcons";
import { useTheme } from "@/components/providers/ThemeProvider";

const PLAY_MARKET_URL =
  "https://play.google.com/store/apps/details?id=com.artomk.planit";
const DISPLAY_COLORS = {
  light: [244, 91, 138],
  dark: [62, 247, 210],
} as const;

const TAU = Math.PI * 2;
const MAX_FIGURES = 7;
const MAX_LOBES = 24;
const SIN_LOOKUP_SIZE = 4096;
const FALLOFF_LOOKUP_SIZE = 2048;
const FALLOFF_LIMIT = 9;
const FIELD_LOOKUP_SIZE = 2048;
const FIELD_LOOKUP_LIMIT = 1.35;
const ENERGY_LOOKUP_SIZE = 2048;
const ENERGY_LOOKUP_LIMIT = 1.15;
const ALPHA_BUCKET_COUNT = 64;

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
  rowY: Float32Array;
  rowWarpX: Float32Array;
  columnWarpY: Float32Array;
  textureNoise: Float32Array;
  variation: Float32Array;
  visible: Uint8Array;
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
    let isIntersecting = true;
    let isContextLost = false;
    const animationStartedAt = performance.now();
    let lastDrawAt = animationStartedAt;
    const animationSeed = Math.random() * 1000;
    const figureSeeds = Array.from({ length: MAX_FIGURES }, (_, index) =>
      createFigureSeed(index, animationSeed),
    );
    const figureTargetX = new Float32Array(MAX_FIGURES);
    const figureTargetY = new Float32Array(MAX_FIGURES);
    const interactionEnergy = new Float32Array(MAX_FIGURES);
    const activeBodyIndices = new Uint8Array(MAX_FIGURES);
    const initialColor = DISPLAY_COLORS[themeRef.current];
    const currentColor = [initialColor[0], initialColor[1], initialColor[2]];

    const lobeX = new Float32Array(MAX_LOBES);
    const lobeY = new Float32Array(MAX_LOBES);
    const lobeInverseRadiusSquared = new Float32Array(MAX_LOBES);
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
    };

    const appendLobe = (
      x: number,
      y: number,
      radius: number,
      stretch: number,
      rotation: number,
      strength: number,
    ) => {
      if (lobeCount >= MAX_LOBES || strength <= 0.001) return;

      lobeX[lobeCount] = x;
      lobeY[lobeCount] = y;
      lobeInverseRadiusSquared[lobeCount] = 1 / (radius * radius);
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
      const columns = Math.ceil(width / cellSize);
      const rows = Math.max(4, Math.ceil(height / cellSize));
      const horizontalOffset =
        Math.round(((width - columns * cellSize) / 2) * pixelRatio) /
        pixelRatio;
      const verticalOffset =
        Math.round((height - rows * cellSize) * pixelRatio) / pixelRatio;
      const aspect = width / Math.max(height, 1);
      const cellCount = columns * rows;
      const columnX = new Float32Array(columns);
      const rowY = new Float32Array(rows);
      const textureNoise = new Float32Array(cellCount);
      const variation = new Float32Array(cellCount);
      const visible = new Uint8Array(cellCount);

      for (let column = 0; column < columns; column += 1) {
        columnX[column] =
          (horizontalOffset + column * cellSize + cellSize / 2) / width;
      }

      for (let row = 0; row < rows; row += 1) {
        rowY[row] =
          (verticalOffset + row * cellSize + cellSize / 2) / height;

        for (let column = 0; column < columns; column += 1) {
          const index = row * columns + column;
          const levelFromBottom = rows - row;
          let isVisible = true;

          if (levelFromBottom <= 3) {
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
        rowY,
        rowWarpX: new Float32Array(rows),
        columnWarpY: new Float32Array(columns),
        textureNoise,
        variation,
        visible,
        energy: new Float32Array(cellCount),
        alphaPixels: new Uint8Array(cellCount),
      };
    };

    const draw = (timestamp: number) => {
      const activeGrid = grid;
      if (isContextLost || !activeGrid || width === 0 || height === 0) return;

      const {
        compact,
        columns,
        rows,
        aspect,
        columnX,
        rowY,
        rowWarpX,
        columnWarpY,
        textureNoise,
        variation,
        visible,
        energy: pixelEnergy,
        alphaPixels,
      } = activeGrid;
      const time = reduceMotion ? 18 : (timestamp - animationStartedAt) / 1000;
      const frameDelta = Math.min(
        0.08,
        Math.max(1 / 240, (timestamp - lastDrawAt) / 1000),
      );
      lastDrawAt = timestamp;
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

      for (let index = 0; index < figureCount; index += 1) {
        const figure = figureSeeds[index];
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

          body.velocityX +=
            (figureTargetX[index] - body.x) * 2.8 * frameDelta;
          body.velocityY +=
            (figureTargetY[index] - body.y) * 2.8 * frameDelta;

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

      lobeCount = 0;
      let activeBodyCount = 0;

      for (let index = 0; index < figureCount; index += 1) {
        const figure = figureSeeds[index];
        const body = figureBodies[index];
        const presence = reduceMotion
          ? 1
          : smoothstep(0, 1, (time - index * 0.32) / 2.7);
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
        const breathing =
          0.94 + Math.sin(time * 0.22 + figure.phaseY) * 0.06;
        const parentRadius =
          figure.radius *
          breathing *
          (1 - splitAmount * 0.045) *
          (1 + body.energy * 0.12);
        const childRadius =
          figure.radius *
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
            figure.radius * 0.56,
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
          const budDistance = figure.splitDistance * 0.78 * budAmount;

          appendLobe(
            body.x + (Math.cos(budAngle) * budDistance) / aspect,
            body.y + Math.sin(budAngle) * budDistance,
            figure.radius * 0.6,
            1.12,
            budAngle,
            (0.34 + budAmount * 0.34 + body.energy * 0.09) * presence,
          );
        }

        if (body.energy > 0.002) {
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
          (compact ? 0.17 : 0.2) +
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
        const horizontalRadius = radius * lobeCutoffScale * stretch;
        const verticalRadius =
          (radius * lobeCutoffScale) / lobeSqrtStretch[index];
        const cosine = lobeCosine[index];
        const sine = lobeSine[index];
        const extentX =
          Math.sqrt(
            horizontalRadius * horizontalRadius * cosine * cosine +
              verticalRadius * verticalRadius * sine * sine,
          ) /
            aspect +
          0.013 / aspect;
        const extentY =
          Math.sqrt(
            horizontalRadius * horizontalRadius * sine * sine +
              verticalRadius * verticalRadius * cosine * cosine,
          ) + 0.013;

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
        rowWarpX[row] =
          (fastSin(rowY[row] * 6.2 + time * 0.12) * 0.012) / aspect;
      }
      for (let column = 0; column < columns; column += 1) {
        columnWarpY[column] =
          fastSin(columnX[column] * aspect * 3.7 - time * 0.095) * 0.012;
      }

      const red = Math.round(currentColor[0]);
      const green = Math.round(currentColor[1]);
      const blue = Math.round(currentColor[2]);
      const pointerIsActive = pointer.activity > 0.002;
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
            const exponent =
              (stretchedX * stretchedX + stretchedY * stretchedY) *
              lobeInverseRadiusSquared[index] *
              1.62;

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
          const organicSignal = FIELD_LOOKUP[fieldLookupIndex] * pattern;
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
          const alpha =
            offAlpha +
            maximumAlpha * tonalLookup[tonalIndex] * globalBreathing;
          const bucket = Math.min(
            ALPHA_BUCKET_COUNT - 1,
            Math.max(
              0,
              Math.round(alpha * (ALPHA_BUCKET_COUNT - 1)),
            ),
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
      if (event.pointerType === "touch") {
        pointer.targetActivity = 0;
        return;
      }

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
      if (reduceMotion) draw(performance.now());
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
      const nextWidth = Math.max(1, Math.round(canvasBounds.width));
      const nextHeight = Math.max(1, Math.round(canvasBounds.height));
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
        lastFrame = performance.now();
        frameId = window.requestAnimationFrame(animate);
      } else if (!shouldAnimate && frameId !== 0) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && !isContextLost && isIntersecting) {
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
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) draw(performance.now());
        syncAnimation();
      },
      { rootMargin: "160px 0px" },
    );
    intersectionObserver.observe(canvas);

    window.addEventListener("pointermove", updatePointer, { passive: true });
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
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("blur", deactivatePointer);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      renderer.dispose();
      redrawRef.current = null;
    };
  }, [reduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full [image-rendering:pixelated]"
      />
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
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.5 },
          },
        }}
        className="relative z-20 mx-auto grid w-full max-w-7xl items-center gap-14 px-6 pb-16 pt-24 lg:grid-cols-[1.06fr_.94fr] lg:gap-20 lg:pb-20 lg:pt-28"
      >
        <div className="mx-auto max-w-[610px] text-center lg:mx-0 lg:text-left">
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-700 dark:text-zinc-200">
              <span className="h-2 w-2 rounded-[2px] bg-[#F45B8A] dark:bg-[#3EF7D2]" />
              {t("badge")}
            </span>
          </motion.div>

          <motion.h1
            variants={{
              hidden: { opacity: 0, scale: 0.94 },
              visible: { opacity: 1, scale: 1 },
            }}
            className="text-5xl font-black leading-[0.94] tracking-[-0.055em] text-zinc-950 sm:text-6xl md:text-7xl dark:text-white"
          >
            <span className="block">{t("title1")}</span>
            <span className="block text-[#E94D7C] dark:text-[#3EF7D2]">
              {t("title2")}
            </span>
          </motion.h1>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: { opacity: 1, y: 0 },
            }}
            className="mx-auto mt-7 max-w-xl text-base font-medium leading-7 text-zinc-700 sm:text-lg lg:mx-0 dark:text-zinc-300"
          >
            {t("description")}
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: { opacity: 1, y: 0 },
            }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <motion.a
              href={
                process.env.NEXT_PUBLIC_APP_URL ||
                "https://planit-demo.web.app"
              }
              whileHover={{ y: -3, scale: 1.025 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-zinc-950 px-6 py-3.5 font-bold text-white shadow-[0_12px_28px_-16px_rgba(24,24,27,.75)] transition-colors hover:bg-zinc-800 sm:w-auto dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] border border-zinc-300 bg-white/75 px-6 py-3.5 font-bold text-zinc-900 backdrop-blur-md transition-colors hover:bg-white sm:w-auto dark:border-zinc-700 dark:bg-zinc-900/75 dark:text-white dark:hover:bg-zinc-900"
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

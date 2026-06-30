"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils/classNames";

const PLANE_SEGMENTS = 200;
const MAX_DRAWING_BUFFER_SIZE = 4096;
const CAMERA_DISTANCE = 4.2;
const IDLE_MOUSE_ACTIVITY = 0.055;
const IDLE_WAVE_ENERGY = 0.04;
const SETTLED_MOUSE_ACTIVITY = 0.01;

const vertexShader = `
  uniform float uTime;
  uniform vec2 uPlaneSize;
  uniform vec3 uMouse3D;
  uniform float uMouseActive;
  uniform float uRadius;
  uniform float uDepth;
  uniform float uHoverDepth;
  uniform float uWaveEnergy;
  uniform float uEnter;

  varying vec2 vUv;
  varying float vDepth;
  varying float vReveal;
  varying float vShockwave;
  varying float vWave;

  void main() {
    vUv = uv;

    float enterEase = 1.0 - pow(1.0 - clamp(uEnter, 0.0, 1.0), 3.0);
    vec3 displaced = vec3(position.xy * uPlaneSize * mix(0.92, 1.0, enterEase), 0.0);
    vec2 fromMouse = displaced.xy - uMouse3D.xy;
    float distanceToMouse = length(fromMouse);

    float normalizedDist = clamp(
      distanceToMouse / max(uRadius * 1.5, 0.0001),
      0.0,
      1.0
    );
    float falloff = 1.0 - smoothstep(0.0, 1.0, normalizedDist);
    falloff = smoothstep(0.0, 1.0, falloff);
    float bend = falloff * uMouseActive;

    float waveEnvelope = falloff * exp(-normalizedDist * 1.8);
    float wave = sin(normalizedDist * 18.0 - uTime * 11.0)
      * waveEnvelope
      * uWaveEnergy
      * uMouseActive;
    float pullHeight = uHoverDepth * max(0.0, bend + wave * 0.09);

    displaced.z = mix(-uDepth * 1.6, 0.0, enterEase) + pullHeight;

    vec2 radialDirection = fromMouse / max(distanceToMouse, 0.0001);
    float pinchForce = min(distanceToMouse * 0.3, uHoverDepth * 0.1);
    displaced.xy -= radialDirection
      * pinchForce
      * falloff
      * uMouseActive
      * (1.0 + wave * 0.16);

    vDepth = clamp(pullHeight / max(uHoverDepth, 0.0001), 0.0, 1.0);
    vWave = abs(wave);

    float aspect = uPlaneSize.x / max(uPlaneSize.y, 0.0001);
    vec2 revealPosition = (uv - 0.5) * vec2(aspect, 1.0);
    float revealDistance = length(revealPosition)
      / max(length(vec2(aspect, 1.0) * 0.5), 0.0001);
    float revealWave = sin(atan(revealPosition.y, revealPosition.x) * 4.0
      + revealDistance * 13.0
      - uTime * 1.1) * 0.025;
    float revealRadius = uEnter * 1.15 - 0.12 + revealWave;
    vReveal = (1.0 - smoothstep(revealRadius - 0.14, revealRadius + 0.14, revealDistance))
      * smoothstep(0.0, 0.08, uEnter);

    float shockwaveEnvelope = smoothstep(0.04, 0.16, uEnter)
      * (1.0 - smoothstep(0.72, 1.0, uEnter));
    float distanceToRevealFront = revealDistance - revealRadius;
    vShockwave = exp(-pow(distanceToRevealFront * 8.0, 2.0)) * shockwaveEnvelope;
    displaced.z += uDepth * 0.55 * vShockwave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const fragmentShader = `
  uniform vec2 uGridCount;
  uniform float uTheme;
  uniform float uEnter;

  varying vec2 vUv;
  varying float vDepth;
  varying float vReveal;
  varying float vShockwave;
  varying float vWave;

  void main() {
    float heightMix = smoothstep(0.0, 1.0, vDepth);

    vec2 gridUv = vUv * uGridCount;
    vec2 cellDistance = abs(fract(gridUv - 0.5) - 0.5);
    vec2 pixelWidth = max(fwidth(gridUv), vec2(0.0001));
    float pointDistance = length(cellDistance / pixelWidth);
    float coreRadius = mix(1.05, 2.65, heightMix)
      + vShockwave * 2.0
      + vWave * 0.7;
    float haloRadius = mix(2.6, 7.5, heightMix)
      + vShockwave * 6.5
      + vWave * 2.0;
    float pointCore = 1.0 - smoothstep(
      max(coreRadius - 0.72, 0.0),
      coreRadius + 0.72,
      pointDistance
    );
    float pointHalo = 1.0 - smoothstep(coreRadius * 0.72, haloRadius, pointDistance);

    vec3 lightBase = vec3(0.310, 0.325, 0.710);
    vec3 darkBase = vec3(0.285, 0.300, 0.520);
    vec3 cyan = vec3(0.130, 0.830, 0.930);
    vec3 pink = vec3(0.965, 0.260, 0.655);

    vec3 baseColor = mix(lightBase, darkBase, uTheme);
    float slopeMix = smoothstep(0.04, 0.58, vDepth);
    float peakMix = smoothstep(0.58, 1.0, vDepth);
    vec3 color = mix(baseColor, cyan, slopeMix);
    color = mix(color, pink, peakMix);

    vec3 shockwaveColor = mix(cyan, pink, 0.38);
    color = mix(color, shockwaveColor, vShockwave * 0.92);
    color = mix(color, cyan, vWave * 0.24);
    color *= 1.0 + heightMix * 0.45 + vShockwave * 0.55;

    float ambientGlow = smoothstep(0.2, 1.0, vDepth) * 0.15;
    vec3 ambientColor = mix(cyan, pink, smoothstep(0.35, 1.0, vDepth));
    color += ambientColor * ambientGlow * 0.35;

    float baseAlpha = mix(0.34, 0.30, uTheme);
    float coreAlpha = pointCore * mix(baseAlpha, 1.0, heightMix);
    float haloAlpha = pointHalo * (1.0 - pointCore)
      * mix(0.045, 0.56, heightMix);
    float shockwaveAlpha = pointHalo * vShockwave * 0.72;
    float enterAlpha = smoothstep(0.02, 0.38, uEnter);
    float finalAlpha = clamp(coreAlpha + haloAlpha + shockwaveAlpha, 0.0, 1.0)
      * vReveal
      * enterAlpha;

    if (finalAlpha < 0.002) discard;
    gl_FragColor = vec4(color, finalAlpha);
  }
`;

interface GridSurfaceProps {
  cellSize: number;
  maxDistortion: number;
  radius: number;
  response: number;
  isDark: boolean;
  reduceMotion: boolean;
  enterProgressRef: { current: number };
}

function GridSurface({
  cellSize,
  maxDistortion,
  radius,
  response,
  isDark,
  reduceMotion,
  enterProgressRef,
}: GridSurfaceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointerNdc = useRef(new THREE.Vector2());
  const targetMouse = useRef(new THREE.Vector3());
  const smoothedMouse = useRef(new THREE.Vector3());
  const pointerActive = useRef(false);
  const wasPointerActive = useRef(false);
  const [initialTheme] = useState(() => (isDark ? 1 : 0));

  const { camera, gl, invalidate } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const interactionPlane = useMemo(() => new THREE.Plane(), []);
  const intersection = useMemo(() => new THREE.Vector3(), []);
  const planeCenter = useMemo(() => new THREE.Vector3(), []);
  const planeWorldPosition = useMemo(() => new THREE.Vector3(), []);
  const planeWorldNormal = useMemo(() => new THREE.Vector3(), []);
  const planeWorldQuaternion = useMemo(() => new THREE.Quaternion(), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPlaneSize: { value: new THREE.Vector2(1, 1) },
      uGridCount: { value: new THREE.Vector2(1, 1) },
      uMouse3D: { value: new THREE.Vector3() },
      uMouseActive: { value: 0 },
      uRadius: { value: 1 },
      uDepth: { value: 1 },
      uHoverDepth: { value: 1 },
      uWaveEnergy: { value: 0 },
      uTheme: { value: initialTheme },
      uEnter: { value: 0 },
    }),
    [initialTheme],
  );

  useEffect(() => {
    const canvas = gl.domElement;

    const updatePointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        pointerActive.current = false;
        invalidate();
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      const wasInside = pointerActive.current;
      pointerActive.current = inside;
      if (inside && rect.width > 0 && rect.height > 0) {
        pointerNdc.current.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1,
        );
      }
      if (inside || wasInside) invalidate();
    };

    const deactivatePointer = () => {
      if (!pointerActive.current) return;
      pointerActive.current = false;
      invalidate();
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) deactivatePointer();
    };

    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerout", handlePointerOut);
    window.addEventListener("blur", deactivatePointer);
    window.addEventListener("scroll", deactivatePointer, { passive: true });

    return () => {
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("blur", deactivatePointer);
      window.removeEventListener("scroll", deactivatePointer);
    };
  }, [gl, invalidate]);

  useEffect(() => {
    invalidate();
  }, [cellSize, invalidate, isDark, maxDistortion, radius, reduceMotion]);

  useFrame((state, delta) => {
    const material = materialRef.current;
    const mesh = meshRef.current;
    if (!material || !mesh) return;

    const viewport = state.viewport.getCurrentViewport(camera, planeCenter);
    const overscan = 1.18;
    const planeWidth = viewport.width * overscan;
    const planeHeight = viewport.height * overscan;
    const worldUnitsPerPixel = viewport.height / Math.max(state.size.height, 1);

    material.uniforms.uPlaneSize.value.set(planeWidth, planeHeight);
    material.uniforms.uGridCount.value.set(
      Math.max(2, (state.size.width * overscan) / Math.max(cellSize, 8)),
      Math.max(2, (state.size.height * overscan) / Math.max(cellSize, 8)),
    );
    material.uniforms.uRadius.value = Math.max(radius * worldUnitsPerPixel, 0.001);
    material.uniforms.uDepth.value = THREE.MathUtils.clamp(
      maxDistortion * worldUnitsPerPixel * 5.5,
      0.001,
      CAMERA_DISTANCE * 0.42,
    );
    material.uniforms.uHoverDepth.value = THREE.MathUtils.clamp(
      maxDistortion * worldUnitsPerPixel * 3.6,
      0.001,
      CAMERA_DISTANCE * 0.3,
    );

    if (pointerActive.current) {
      mesh.getWorldPosition(planeWorldPosition);
      mesh.getWorldQuaternion(planeWorldQuaternion);
      planeWorldNormal.set(0, 0, 1).applyQuaternion(planeWorldQuaternion).normalize();
      interactionPlane.setFromNormalAndCoplanarPoint(planeWorldNormal, planeWorldPosition);

      raycaster.setFromCamera(pointerNdc.current, camera);
      if (raycaster.ray.intersectPlane(interactionPlane, intersection)) {
        targetMouse.current.copy(intersection);
        mesh.worldToLocal(targetMouse.current);
        if (
          reduceMotion ||
          (!wasPointerActive.current &&
            material.uniforms.uMouseActive.value < SETTLED_MOUSE_ACTIVITY)
        ) {
          smoothedMouse.current.copy(targetMouse.current);
        }
      }
    } else if (!reduceMotion) {
      const idleTime = state.clock.elapsedTime;
      targetMouse.current.set(
        Math.sin(idleTime * 0.17) * planeWidth * 0.16,
        Math.sin(idleTime * 0.13 + 1.2) * planeHeight * 0.14,
        0,
      );
    }

    const targetActive = pointerActive.current
      ? 1
      : reduceMotion
        ? 0
        : IDLE_MOUSE_ACTIVITY;
    const targetTheme = isDark ? 1 : 0;
    const easing = reduceMotion ? 1 : 1 - Math.exp(-response * delta);

    const mouseBeforeSmoothingX = smoothedMouse.current.x;
    const mouseBeforeSmoothingY = smoothedMouse.current.y;
    smoothedMouse.current.lerp(targetMouse.current, easing);

    const movementThisFrame = Math.hypot(
      smoothedMouse.current.x - mouseBeforeSmoothingX,
      smoothedMouse.current.y - mouseBeforeSmoothingY,
    );
    const pointerSpeedPixels =
      movementThisFrame / Math.max(worldUnitsPerPixel * Math.max(delta, 1 / 120), 0.0001);
    const targetWaveEnergy = reduceMotion
      ? 0
      : pointerActive.current
        ? THREE.MathUtils.clamp(pointerSpeedPixels / 900, 0, 1)
        : IDLE_WAVE_ENERGY;
    const waveResponse = targetWaveEnergy > material.uniforms.uWaveEnergy.value ? 18 : 5;
    material.uniforms.uWaveEnergy.value = THREE.MathUtils.lerp(
      material.uniforms.uWaveEnergy.value,
      targetWaveEnergy,
      reduceMotion ? 1 : 1 - Math.exp(-waveResponse * delta),
    );

    material.uniforms.uMouse3D.value.copy(smoothedMouse.current);
    material.uniforms.uMouseActive.value = THREE.MathUtils.lerp(
      material.uniforms.uMouseActive.value,
      targetActive,
      easing,
    );
    material.uniforms.uTheme.value = THREE.MathUtils.lerp(
      material.uniforms.uTheme.value,
      targetTheme,
      reduceMotion ? 1 : 1 - Math.exp(-7 * delta),
    );
    enterProgressRef.current = reduceMotion
      ? 1
      : THREE.MathUtils.damp(enterProgressRef.current, 1, 1.75, delta);
    if (enterProgressRef.current > 0.9995) enterProgressRef.current = 1;
    material.uniforms.uEnter.value = enterProgressRef.current;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    wasPointerActive.current = pointerActive.current;

    const isSettling =
      Math.abs(material.uniforms.uMouseActive.value - targetActive) > 0.001 ||
      Math.abs(material.uniforms.uTheme.value - targetTheme) > 0.001 ||
      Math.abs(material.uniforms.uEnter.value - 1) > 0.001 ||
      material.uniforms.uWaveEnergy.value > 0.001 ||
      smoothedMouse.current.distanceToSquared(targetMouse.current) > 0.000001;

    if (isSettling || (!reduceMotion && !pointerActive.current)) invalidate();
  });

  return (
    <mesh ref={meshRef} rotation={[-0.18, 0, 0]} frustumCulled={false}>
      <planeGeometry args={[1, 1, PLANE_SEGMENTS, PLANE_SEGMENTS]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export interface InteractiveGridPatternProps {
  className?: string;
  patternId?: string;
  cellSize?: number;
  maxDistortion?: number;
  radius?: number;
  response?: number;
  spring?: number;
  friction?: number;
}

export function InteractiveGridPattern({
  className,
  patternId,
  cellSize = 50,
  maxDistortion = 45,
  radius = 250,
  response,
  spring = 0.08,
  friction = 0.85,
}: InteractiveGridPatternProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawingBufferDpr, setDrawingBufferDpr] = useState<number | null>(null);
  const enterProgressRef = useRef(0);
  const reduceMotion = useReducedMotion() ?? false;
  const { theme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDpr = () => {
      const { width, height } = container.getBoundingClientRect();
      const longestSide = Math.max(width, height, 1);
      const safeDpr = Math.max(
        0.1,
        Math.min(window.devicePixelRatio, 1.25, MAX_DRAWING_BUFFER_SIZE / longestSide),
      );
      setDrawingBufferDpr((current) =>
        current !== null && Math.abs(current - safeDpr) < 0.01 ? current : safeDpr,
      );
    };

    updateDpr();
    const resizeObserver = new ResizeObserver(updateDpr);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const resolvedResponse = THREE.MathUtils.clamp(
    response ?? spring * 120 + (1 - friction) * 12,
    1,
    40,
  );

  return (
    <div
      ref={containerRef}
      id={patternId}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 z-0 h-full w-full", className)}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full"
      >
        {drawingBufferDpr !== null && (
          <Canvas
            frameloop="demand"
            dpr={drawingBufferDpr}
            camera={{
              position: [0, 0, CAMERA_DISTANCE],
              fov: 75,
              near: 0.1,
              far: 30,
            }}
            gl={{
              alpha: true,
              antialias: false,
              powerPreference: "high-performance",
            }}
            className="h-full w-full"
          >
            <GridSurface
              cellSize={cellSize}
              maxDistortion={maxDistortion}
              radius={radius}
              response={resolvedResponse}
              isDark={theme === "dark"}
              reduceMotion={reduceMotion}
              enterProgressRef={enterProgressRef}
            />
          </Canvas>
        )}
      </motion.div>
    </div>
  );
}

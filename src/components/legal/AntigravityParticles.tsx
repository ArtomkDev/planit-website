"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils/classNames";

const PARTICLE_COUNT = 32_761;
const PRIMARY_PARTICLE_COUNT = Math.floor(PARTICLE_COUNT * 0.25);
const FIELD_COVERAGE = 1.12;
const CAMERA_DISTANCE = 5;
const TRAIL_POINT_COUNT = 24;
const IDLE_MOUSE_ACTIVITY = 0.055;
const SETTLED_MOUSE_ACTIVITY = 0.01;

const vertexShader = `
  uniform float uTime;
  uniform float uFieldExtent;
  uniform float uMouseRadius;
  uniform float uMouseActive;
  uniform float uRippleStrength;
  uniform float uEnter;
  uniform float uPixelRatio;
  uniform vec3 uMouse3D;
  uniform vec3 uTrailPoints[${TRAIL_POINT_COUNT}];
  uniform float uTrailEnergy[${TRAIL_POINT_COUNT}];
  uniform float uTrailLinks[${TRAIL_POINT_COUNT}];
  uniform float uTrailPointCount;
  uniform float uTrailHeadEnergy;
  uniform vec2 uMouseVelocity;

  attribute vec3 aRandom;
  attribute float aPhase;
  attribute float aScale;

  varying float vElevation;
  varying float vSignedElevation;
  varying float vEnterOpacity;

  const float PI = 3.14159265359;

  float easeInOutQuintic(float t) {
    t = clamp(t, 0.0, 1.0);
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }

  float distanceToSegment(vec2 point, vec2 start, vec2 end, out float position) {
    vec2 segment = end - start;
    float segmentLengthSquared = dot(segment, segment);
    if (segmentLengthSquared < 0.000001) {
      position = 1.0;
      return length(point - end);
    }
    position = clamp(dot(point - start, segment) / segmentLengthSquared, 0.0, 1.0);
    return length(point - (start + segment * position));
  }

  vec2 mod289(vec2 value) {
    return value - floor(value * (1.0 / 289.0)) * 289.0;
  }

  vec3 mod289(vec3 value) {
    return value - floor(value * (1.0 / 289.0)) * 289.0;
  }

  vec3 permute(vec3 value) {
    return mod289(((value * 34.0) + 1.0) * value);
  }

  float simplexNoise(vec2 coordinate) {
    const vec4 constants = vec4(
      0.211324865405187,
      0.366025403784439,
      -0.577350269189626,
      0.024390243902439
    );

    vec2 cell = floor(coordinate + dot(coordinate, constants.yy));
    vec2 firstCorner = coordinate - cell + dot(cell, constants.xx);
    vec2 cornerOffset = firstCorner.x > firstCorner.y
      ? vec2(1.0, 0.0)
      : vec2(0.0, 1.0);
    vec4 otherCorners = firstCorner.xyxy + constants.xxzz;
    otherCorners.xy -= cornerOffset;

    cell = mod289(cell);
    vec3 permutation = permute(
      permute(cell.y + vec3(0.0, cornerOffset.y, 1.0))
      + cell.x
      + vec3(0.0, cornerOffset.x, 1.0)
    );

    vec3 attenuation = max(
      0.5 - vec3(
        dot(firstCorner, firstCorner),
        dot(otherCorners.xy, otherCorners.xy),
        dot(otherCorners.zw, otherCorners.zw)
      ),
      0.0
    );
    attenuation *= attenuation;
    attenuation *= attenuation;

    vec3 gradientX = 2.0 * fract(permutation * constants.www) - 1.0;
    vec3 gradientH = abs(gradientX) - 0.5;
    vec3 gradientOffset = floor(gradientX + 0.5);
    vec3 gradient = gradientX - gradientOffset;

    attenuation *= 1.79284291400159 - 0.85373472095314
      * (gradient * gradient + gradientH * gradientH);

    vec3 contribution;
    contribution.x = gradient.x * firstCorner.x
      + gradientH.x * firstCorner.y;
    contribution.yz = gradient.yz * otherCorners.xz
      + gradientH.yz * otherCorners.yw;
    return 130.0 * dot(attenuation, contribution);
  }

  void main() {
    vec3 basePosition = vec3(position.xy * uFieldExtent, 0.0);
    vec3 chaosPosition = vec3(aRandom.xy * uFieldExtent, aRandom.z);
    float stagger = fract(aPhase / 6.2831853) * 0.12;
    float particleEnter = clamp(
      (uEnter - stagger) / max(1.0 - stagger, 0.001),
      0.0,
      1.0
    );
    float enterMix = easeInOutQuintic(particleEnter);

    float satelliteMask = 1.0 - smoothstep(0.56, 0.74, aScale);
    float orbitSeed = fract(abs(
      aRandom.x * 0.754877666
      + aRandom.y * 0.569840296
      + aRandom.z * 0.438289
    ));
    float orbitTime = uTime * mix(0.22, 0.68, orbitSeed) + aPhase;
    vec2 orbitRadius = uFieldExtent * vec2(
      mix(0.004, 0.018, fract(abs(aRandom.x) * 0.73 + orbitSeed)),
      mix(0.003, 0.014, fract(abs(aRandom.y) * 0.61 + orbitSeed * 0.77))
    );
    vec2 orbitalDrift = vec2(
      cos(orbitTime) * orbitRadius.x
        + sin(orbitTime * 1.67 + aPhase * 0.31) * orbitRadius.x * 0.38,
      sin(orbitTime * 1.23 + aRandom.z) * orbitRadius.y
        + cos(orbitTime * 0.71 - aPhase * 0.53) * orbitRadius.y * 0.42
    ) * satelliteMask;
    float orbitalLift = (
      sin(orbitTime * 1.41 + aRandom.x * 2.7)
      + cos(orbitTime * 0.83 + aRandom.y * 2.1) * 0.45
    ) * orbitRadius.y * 0.65 * satelliteMask;
    vec3 livePosition = basePosition + vec3(orbitalDrift, orbitalLift);

    vec3 assembledPosition = mix(chaosPosition, livePosition, enterMix);
    vEnterOpacity = smoothstep(0.12, 0.72, enterMix);

    vec2 noiseCoordinate = livePosition.xy * 0.18
      + vec2(uTime * 0.025, -uTime * 0.018);
    float broadNoise = simplexNoise(noiseCoordinate);
    float detailNoise = simplexNoise(
      livePosition.xy * 0.36
      + vec2(-uTime * 0.036, uTime * 0.028)
      + broadNoise * 0.12
    );
    float organicFlow = broadNoise * 0.8 + detailNoise * 0.2;
    float idleBreath = organicFlow * 0.085
      + sin(uTime * 0.42 + organicFlow * 0.85) * 0.035;

    float safeRadius = max(uMouseRadius, 0.001);
    float ambientScale = max(safeRadius * 0.82, 0.001);
    vec2 ambientSourceA = vec2(
      sin(uTime * 0.17) * uFieldExtent * 0.28,
      cos(uTime * 0.13) * uFieldExtent * 0.22
    );
    vec2 ambientSourceB = vec2(
      cos(uTime * 0.11 + 2.1) * uFieldExtent * 0.34,
      sin(uTime * 0.15 + 0.8) * uFieldExtent * 0.25
    );
    vec2 ambientDeltaA = livePosition.xy - ambientSourceA;
    vec2 ambientDeltaB = livePosition.xy - ambientSourceB;
    float ambientDistanceA = length(ambientDeltaA) / ambientScale;
    float ambientDistanceB = length(ambientDeltaB) / ambientScale;
    float ambientEnvelopeA = exp(-ambientDistanceA * ambientDistanceA * 0.72);
    float ambientEnvelopeB = exp(-ambientDistanceB * ambientDistanceB * 0.78);
    float ambientPulseA = sin(
      ambientDistanceA * 2.85 - uTime * 0.52 + organicFlow * 0.24
    ) * ambientEnvelopeA;
    float ambientPulseB = sin(
      ambientDistanceB * 3.15 - uTime * 0.44 + detailNoise * 0.2
    ) * ambientEnvelopeB;
    float ambientElevation = ambientPulseA * 0.03 + ambientPulseB * 0.022;
    vec2 ambientTangentA = vec2(-ambientDeltaA.y, ambientDeltaA.x)
      / max(length(ambientDeltaA), 0.001);
    vec2 ambientTangentB = vec2(ambientDeltaB.y, -ambientDeltaB.x)
      / max(length(ambientDeltaB), 0.001);
    vec2 ambientDrift = ambientTangentA * ambientPulseA * 0.006
      + ambientTangentB * ambientPulseB * 0.0045;

    float mouseSpeed = length(uMouseVelocity);
    vec2 velocityDirection = uMouseVelocity / max(mouseSpeed, 0.001);
    float mouseDistance = length(livePosition.xy - uMouse3D.xy);
    float normalizedMouseDistance = mouseDistance / safeRadius;
    float cursorProximity = 1.0 - smoothstep(
      0.0,
      1.0,
      normalizedMouseDistance
    );

    float headRadius = safeRadius * mix(
      0.52,
      1.04,
      sqrt(clamp(uTrailHeadEnergy, 0.0, 1.0))
    );
    float normalizedPathDistance = mouseDistance / headRadius;
    float pathEnergy = uTrailHeadEnergy;
    vec2 pathDirection = velocityDirection;

    for (int pointIndex = 0; pointIndex < ${TRAIL_POINT_COUNT - 1}; pointIndex++) {
      float segmentActive = step(
        float(pointIndex + 2),
        uTrailPointCount
      );
      vec2 segmentStart = uTrailPoints[pointIndex].xy;
      vec2 segmentEnd = uTrailPoints[pointIndex + 1].xy;
      float segmentPosition = 0.0;
      float segmentDistance = distanceToSegment(
        livePosition.xy,
        segmentStart,
        segmentEnd,
        segmentPosition
      );
      float segmentEnergy = mix(
        uTrailEnergy[pointIndex],
        uTrailEnergy[pointIndex + 1],
        segmentPosition
      );
      float energyPresence = smoothstep(0.005, 0.06, segmentEnergy);
      float localRadius = safeRadius * mix(
        0.52,
        1.04,
        sqrt(clamp(segmentEnergy, 0.0, 1.0))
      );
      float segmentNormalizedDistance = mix(
        100000.0,
        segmentDistance / localRadius,
        segmentActive
          * uTrailLinks[pointIndex + 1]
          * energyPresence
      );

      if (segmentNormalizedDistance < normalizedPathDistance) {
        vec2 segmentVector = segmentEnd - segmentStart;
        float segmentLength = length(segmentVector);
        normalizedPathDistance = segmentNormalizedDistance;
        pathEnergy = segmentEnergy;
        if (segmentLength > 0.000001) {
          pathDirection = segmentVector / segmentLength;
        }
      }
    }

    float speedEnergy = 1.0 - exp(-mouseSpeed * 0.34);
    float globalInteractionEnergy = clamp(
      max(uRippleStrength, speedEnergy * uMouseActive),
      0.0,
      1.0
    );
    float interactionEnergy = globalInteractionEnergy
      * sqrt(clamp(pathEnergy, 0.0, 1.0));
    float turbulenceEnergy = clamp(
      speedEnergy * 0.78 + uRippleStrength * 0.32,
      0.0,
      1.0
    );
    float wakeNoise = simplexNoise(
      livePosition.xy * 0.54
      + vec2(uTime * 0.13, -uTime * 0.1)
      + organicFlow * 0.18
    );
    float wakeEnvelope = exp(
      -normalizedPathDistance * normalizedPathDistance * 0.7
    ) * interactionEnergy * turbulenceEnergy;
    vec2 pathNormal = vec2(-pathDirection.y, pathDirection.x);
    vec2 turbulentDrift = (
      pathNormal * wakeNoise + pathDirection * detailNoise * 0.25
    ) * wakeEnvelope * (0.018 + speedEnergy * 0.026);
    float turbulentElevation = wakeNoise
      * wakeEnvelope
      * (0.025 + speedEnergy * 0.045);

    float perturbedWaveDistance = normalizedPathDistance + organicFlow * 0.12;
    float wavePhase = perturbedWaveDistance * 2.65
      - uTime * 0.86
      + detailNoise * 0.12;
    float waveDecay = exp(-normalizedPathDistance * 0.68);
    float fluidRipple = sin(wavePhase)
      * waveDecay
      * interactionEnergy
      * (0.17 + speedEnergy * 0.22);

    float magneticPull = pow(cursorProximity, 1.7)
      * uMouseActive
      * (0.23 + speedEnergy * 0.34);

    float dragEnvelope = exp(
      -normalizedPathDistance * normalizedPathDistance * 0.85
    ) * interactionEnergy;
    vec2 directDrag = pathDirection
      * mouseSpeed
      * (0.018 + speedEnergy * 0.016)
      * dragEnvelope
      * uMouseActive;

    float springFrequency = 2.15 + aScale * 0.18;
    float springDecay = exp(-normalizedPathDistance * 0.72);
    float springOscillation = sin(
      uTime * springFrequency
      + PI * 0.5
    ) * springDecay;
    vec2 elasticReturn = pathDirection
      * springOscillation
      * interactionEnergy
      * (0.05 + speedEnergy * 0.09);

    vec2 organicDrift = vec2(broadNoise, -detailNoise) * 0.006;
    vec2 planarPosition = assembledPosition.xy
      + (
        organicDrift
        + ambientDrift
        + turbulentDrift
        + directDrag
        + elasticReturn
      ) * enterMix;

    float springElevation = springOscillation
      * interactionEnergy
      * 0.03;
    float interactionElevation = ambientElevation
      + magneticPull
      + fluidRipple
      + springElevation
      + turbulentElevation;
    float waveElevation = idleBreath + interactionElevation;
    vec3 displaced = vec3(
      planarPosition,
      assembledPosition.z + waveElevation * enterMix
    );

    vElevation = clamp(
      abs(idleBreath) * 0.55
      + magneticPull * 0.82
      + abs(fluidRipple) * 2.65
      + abs(springElevation) * 2.2
      + abs(ambientElevation) * 2.2
      + abs(turbulentElevation) * 2.1
      + length(ambientDrift) * 2.0
      + length(turbulentDrift) * 1.8
      + length(directDrag) * 1.4,
      0.0,
      1.0
    );
    vSignedElevation = interactionElevation * enterMix;

    vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
    float perspective = ${CAMERA_DISTANCE.toFixed(1)} / max(-viewPosition.z, 0.1);
    gl_PointSize = 1.8
      * aScale
      * uPixelRatio
      * perspective
      * (1.0 + vElevation * 1.12);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = `
  uniform float uTheme;

  varying float vElevation;
  varying float vSignedElevation;
  varying float vEnterOpacity;

  void main() {
    vec2 particleUv = gl_PointCoord - vec2(0.5);
    float distanceFromCenter = length(particleUv);
    float edgeWidth = max(fwidth(distanceFromCenter) * 0.72, 0.004);
    float crispCircle = 1.0 - smoothstep(
      0.5 - edgeWidth,
      0.5 + edgeWidth,
      distanceFromCenter
    );
    float brightCore = 1.0 - smoothstep(0.0, 0.36, distanceFromCenter);
    float heightMix = smoothstep(
      0.018,
      0.34,
      abs(vSignedElevation)
    );
    float heightDirection = smoothstep(
      -0.055,
      0.055,
      vSignedElevation
    );

    vec3 lightZinc = vec3(0.36, 0.36, 0.40);
    vec3 darkZinc = vec3(0.58, 0.58, 0.64);
    vec3 lowColor = vec3(0.243137, 0.968627, 0.823529);
    vec3 highColor = vec3(0.956863, 0.356863, 0.541176);

    vec3 baseColor = mix(lightZinc, darkZinc, uTheme);
    vec3 elevatedColor = mix(lowColor, highColor, heightDirection);
    vec3 color = mix(baseColor, elevatedColor, heightMix);

    float alpha = crispCircle * mix(0.34, 0.96, heightMix);
    alpha += brightCore * vElevation * 0.08;
    alpha *= vEnterOpacity;

    if (alpha < 0.002) discard;
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

interface ParticleFieldProps {
  isDark: boolean;
  enterProgressRef: { current: number };
}

function ParticleField({ isDark, enterProgressRef }: ParticleFieldProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointerNdc = useRef(new THREE.Vector2());
  const previousMouse = useRef(new THREE.Vector3());
  const smoothedMouse = useRef(new THREE.Vector3());
  const pointerVelocity = useRef(new THREE.Vector3());
  const sampledVelocity = useRef(new THREE.Vector3());
  const trailStepDirection = useRef(new THREE.Vector3());
  const lastTrailSample = useRef(new THREE.Vector3());
  const trailHistoryStart = useRef(0);
  const trailHistoryCount = useRef(0);
  const trailHeadEnergy = useRef(0);
  const intersection = useRef(new THREE.Vector3());
  const pointerActive = useRef(false);
  const wasPointerActive = useRef(false);
  const trailNeedsBreak = useRef(false);
  const hadPointerSample = useRef(false);
  const smoothingPointerEntry = useRef(false);
  const pointerEntrySmoothingTime = useRef(0);
  const idleMouse = useRef(new THREE.Vector3());
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const interactionPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    [],
  );
  const trailHistory = useMemo(
    () => Array.from(
      { length: TRAIL_POINT_COUNT - 1 },
      () => new THREE.Vector3(),
    ),
    [],
  );
  const trailUniformPoints = useMemo(
    () => Array.from(
      { length: TRAIL_POINT_COUNT },
      () => new THREE.Vector3(),
    ),
    [],
  );
  const trailHistoryEnergy = useMemo(
    () => new Float32Array(TRAIL_POINT_COUNT - 1),
    [],
  );
  const trailUniformEnergy = useMemo(
    () => new Float32Array(TRAIL_POINT_COUNT),
    [],
  );
  const trailHistoryLinks = useMemo(
    () => new Float32Array(TRAIL_POINT_COUNT - 1),
    [],
  );
  const trailUniformLinks = useMemo(
    () => new Float32Array(TRAIL_POINT_COUNT),
    [],
  );
  const { camera, gl, viewport } = useThree();

  const geometry = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const randomPositions = new Float32Array(PARTICLE_COUNT * 3);
    const phases = new Float32Array(PARTICLE_COUNT);
    const scales = new Float32Array(PARTICLE_COUNT);

    const primaryPositions = new Float32Array(PRIMARY_PARTICLE_COUNT * 2);
    const hash = (index: number, seed: number) => {
      const value = Math.sin(index * 12.9898 + seed) * 43758.5453;
      return value - Math.floor(value);
    };

    for (let index = 0; index < PRIMARY_PARTICLE_COUNT; index += 1) {
      const anchorOffset = index * 2;
      primaryPositions[anchorOffset] =
        (hash(index, 19.193) - 0.5) * FIELD_COVERAGE;
      primaryPositions[anchorOffset + 1] =
        (hash(index, 73.417) - 0.5) * FIELD_COVERAGE;
    }

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const offset = index * 3;
      const isSatellite = index >= PRIMARY_PARTICLE_COUNT;
      const satelliteIndex = index - PRIMARY_PARTICLE_COUNT;
      const anchorIndex = isSatellite
        ? satelliteIndex % PRIMARY_PARTICLE_COUNT
        : index;
      const anchorOffset = anchorIndex * 2;
      const scaleRandom = hash(index, 78.233);
      const satelliteAngle = hash(index, 109.427) * Math.PI * 2;
      const satelliteRadius = isSatellite
        ? 0.004 + hash(index, 149.893) * 0.016
        : 0;

      positions[offset] = primaryPositions[anchorOffset]
        + Math.cos(satelliteAngle) * satelliteRadius;
      positions[offset + 1] = primaryPositions[anchorOffset + 1]
        + Math.sin(satelliteAngle) * satelliteRadius;
      positions[offset + 2] = 0;
      randomPositions[offset] = (hash(index, 17.143) * 2 - 1) * 1.45;
      randomPositions[offset + 1] = (hash(index, 91.731) * 2 - 1) * 1.45;
      randomPositions[offset + 2] = (hash(index, 43.853) * 2 - 1) * 2.2;
      phases[index] = hash(index, 57.583) * Math.PI * 2;

      if (isSatellite) {
        scales[index] = 0.16 + Math.pow(scaleRandom, 1.65) * 0.38;
      } else {
        const hubBoost = hash(index, 131.317) > 0.94
          ? 0.42 + hash(index, 211.731) * 0.32
          : 0;
        scales[index] = 0.78 + scaleRandom * 0.5 + hubBoost;
      }
    }

    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    bufferGeometry.setAttribute(
      "aRandom",
      new THREE.BufferAttribute(randomPositions, 3),
    );
    bufferGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    bufferGeometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    return bufferGeometry;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFieldExtent: { value: 1 },
      uMouseRadius: { value: 1 },
      uMouseActive: { value: 0 },
      uRippleStrength: { value: 0 },
      uEnter: { value: 0 },
      uMouse3D: { value: new THREE.Vector3() },
      uTrailPoints: { value: trailUniformPoints },
      uTrailEnergy: { value: trailUniformEnergy },
      uTrailLinks: { value: trailUniformLinks },
      uTrailPointCount: { value: 1 },
      uTrailHeadEnergy: { value: 0 },
      uMouseVelocity: { value: new THREE.Vector2() },
      uPixelRatio: { value: 1 },
      uTheme: { value: 0 },
    }),
    [trailUniformEnergy, trailUniformLinks, trailUniformPoints],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;

    const extent = Math.max(viewport.width, viewport.height);
    material.uniforms.uFieldExtent.value = extent;
    material.uniforms.uMouseRadius.value = Math.min(viewport.width, viewport.height) * 0.27;
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
    material.uniforms.uTheme.value = isDark ? 1 : 0;
  }, [gl, isDark, viewport.height, viewport.width]);

  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const insideCanvas =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;

      const wasInsideCanvas = pointerActive.current;
      pointerActive.current = insideCanvas;
      if (!insideCanvas) {
        if (wasInsideCanvas) trailNeedsBreak.current = true;
        return;
      }

      pointerNdc.current.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
    };

    const deactivatePointer = () => {
      if (pointerActive.current) trailNeedsBreak.current = true;
      pointerActive.current = false;
      smoothingPointerEntry.current = false;
      pointerEntrySmoothingTime.current = 0;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointercancel", deactivatePointer);
    window.addEventListener("blur", deactivatePointer);
    document.addEventListener("mouseleave", deactivatePointer);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointercancel", deactivatePointer);
      window.removeEventListener("blur", deactivatePointer);
      document.removeEventListener("mouseleave", deactivatePointer);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const material = materialRef.current;
    if (!material) return;

    const frameDelta = Math.min(delta, 1 / 30);
    const velocityDelta = THREE.MathUtils.clamp(delta, 1 / 240, 0.1);
    const maxTrailLength = Math.max(
      Math.min(viewport.width, viewport.height) * 0.55,
      0.001,
    );
    const trailSampleSpacing = maxTrailLength / (TRAIL_POINT_COUNT - 1);

    raycaster.setFromCamera(pointerNdc.current, camera);
    if (
      pointerActive.current &&
      raycaster.ray.intersectPlane(interactionPlane, intersection.current)
    ) {
      const canSnapToPointer =
        material.uniforms.uMouseActive.value < SETTLED_MOUSE_ACTIVITY;

      if (!hadPointerSample.current) {
        if (canSnapToPointer) {
          smoothedMouse.current.copy(intersection.current);
        }
        previousMouse.current.copy(smoothedMouse.current);
        pointerVelocity.current.set(0, 0, 0);
        trailHistoryStart.current = 0;
        trailHistoryCount.current = 1;
        trailHeadEnergy.current = 0;
        trailHistory[0].copy(smoothedMouse.current);
        trailHistoryEnergy.fill(0, 0, 1);
        trailHistoryLinks.fill(0, 0, 1);
        lastTrailSample.current.copy(smoothedMouse.current);
        trailUniformPoints[0].copy(smoothedMouse.current);
        trailUniformEnergy.fill(0, 0, 1);
        trailUniformLinks.fill(0, 0, 1);
        material.uniforms.uTrailPointCount.value = 1;
        material.uniforms.uTrailHeadEnergy.value = 0;
        trailNeedsBreak.current = false;
        hadPointerSample.current = true;
        smoothingPointerEntry.current = !canSnapToPointer;
        pointerEntrySmoothingTime.current = 0;
      } else if (trailNeedsBreak.current || !wasPointerActive.current) {
        let historyStart = trailHistoryStart.current;
        let historyCount = trailHistoryCount.current;
        const historyCapacity = trailHistory.length;

        const appendHistoryPoint = (
          point: THREE.Vector3,
          energy: number,
          linkedFromPrevious: number,
        ) => {
          let writeIndex: number;
          if (historyCount < historyCapacity) {
            writeIndex = (historyStart + historyCount) % historyCapacity;
            historyCount += 1;
          } else {
            writeIndex = historyStart;
            historyStart = (historyStart + 1) % historyCapacity;
          }
          trailHistory[writeIndex].copy(point);
          trailHistoryEnergy.fill(energy, writeIndex, writeIndex + 1);
          trailHistoryLinks.fill(
            linkedFromPrevious,
            writeIndex,
            writeIndex + 1,
          );
        };

        const newestHistoryIndex = (
          historyStart + historyCount - 1
        ) % historyCapacity;
        if (
          trailHistory[newestHistoryIndex].distanceToSquared(
            smoothedMouse.current,
          ) > 0.00000001
        ) {
          appendHistoryPoint(smoothedMouse.current, trailHeadEnergy.current, 1);
        } else {
          trailHistoryEnergy.fill(
            Math.max(
              trailHistoryEnergy[newestHistoryIndex],
              trailHeadEnergy.current,
            ),
            newestHistoryIndex,
            newestHistoryIndex + 1,
          );
        }

        if (canSnapToPointer) {
          appendHistoryPoint(intersection.current, 0, 0);
          smoothedMouse.current.copy(intersection.current);
        } else {
          appendHistoryPoint(smoothedMouse.current, 0, 0);
        }
        trailHistoryStart.current = historyStart;
        trailHistoryCount.current = historyCount;
        previousMouse.current.copy(smoothedMouse.current);
        pointerVelocity.current.set(0, 0, 0);
        trailHeadEnergy.current = 0;
        lastTrailSample.current.copy(smoothedMouse.current);
        material.uniforms.uTrailHeadEnergy.value = 0;
        trailNeedsBreak.current = false;
        smoothingPointerEntry.current = !canSnapToPointer;
        pointerEntrySmoothingTime.current = 0;
      }

      smoothedMouse.current.lerp(
        intersection.current,
        1 - Math.exp(-frameDelta * 5.2),
      );
      if (smoothingPointerEntry.current) {
        pointerEntrySmoothingTime.current += frameDelta;

        sampledVelocity.current.set(0, 0, 0);
        pointerVelocity.current.set(0, 0, 0);
        previousMouse.current.copy(smoothedMouse.current);
        lastTrailSample.current.copy(smoothedMouse.current);

        if (
          smoothedMouse.current.distanceToSquared(intersection.current) <
            trailSampleSpacing * trailSampleSpacing * 0.0625 ||
          pointerEntrySmoothingTime.current > 0.45
        ) {
          smoothingPointerEntry.current = false;
          pointerEntrySmoothingTime.current = 0;
        }
      } else {
        sampledVelocity.current
          .copy(smoothedMouse.current)
          .sub(previousMouse.current)
          .multiplyScalar(1 / velocityDelta);
        sampledVelocity.current.clampLength(0, 3.5);
        pointerVelocity.current.lerp(
          sampledVelocity.current,
          1 - Math.exp(-frameDelta * 4.2),
        );
        previousMouse.current.copy(smoothedMouse.current);
      }

      trailStepDirection.current
        .copy(smoothedMouse.current)
        .sub(lastTrailSample.current);
      const distanceFromLastSample = trailStepDirection.current.length();
      const samplesToAdd = Math.min(
        Math.floor(distanceFromLastSample / trailSampleSpacing),
        TRAIL_POINT_COUNT,
      );
      const sampleEnergy = 1 - Math.exp(
        -pointerVelocity.current.length() * 0.78,
      );

      if (samplesToAdd > 0) {
        trailStepDirection.current.multiplyScalar(
          1 / distanceFromLastSample,
        );
        let historyStart = trailHistoryStart.current;
        let historyCount = trailHistoryCount.current;
        const historyCapacity = trailHistory.length;

        for (let sampleIndex = 0; sampleIndex < samplesToAdd; sampleIndex += 1) {
          lastTrailSample.current.addScaledVector(
            trailStepDirection.current,
            trailSampleSpacing,
          );

          let writeIndex: number;
          if (historyCount < historyCapacity) {
            writeIndex = (historyStart + historyCount) % historyCapacity;
            historyCount += 1;
          } else {
            writeIndex = historyStart;
            historyStart = (historyStart + 1) % historyCapacity;
          }
          trailHistory[writeIndex].copy(lastTrailSample.current);
          trailHistoryEnergy.fill(sampleEnergy, writeIndex, writeIndex + 1);
          trailHistoryLinks.fill(1, writeIndex, writeIndex + 1);
        }

        trailHistoryStart.current = historyStart;
        trailHistoryCount.current = historyCount;
      }
    } else {
      sampledVelocity.current.set(0, 0, 0);
      smoothingPointerEntry.current = false;
      pointerEntrySmoothingTime.current = 0;

      const idleTime = state.clock.elapsedTime;
      idleMouse.current.set(
        Math.sin(idleTime * 0.16) * viewport.width * 0.15,
        Math.sin(idleTime * 0.12 + 1.15) * viewport.height * 0.13,
        0,
      );
      smoothedMouse.current.lerp(
        idleMouse.current,
        1 - Math.exp(-frameDelta * 0.85),
      );
      previousMouse.current.copy(smoothedMouse.current);
    }

    if (!pointerActive.current) {
      pointerVelocity.current.multiplyScalar(Math.exp(-frameDelta * 2.2));
    }

    const pointerSpeed = pointerVelocity.current.length();
    const desiredHeadEnergy = pointerActive.current
      ? 1 - Math.exp(-pointerSpeed * 0.78)
      : 0;
    const headEnergyResponse = desiredHeadEnergy > trailHeadEnergy.current
      ? 6.0
      : 1.35;
    trailHeadEnergy.current = THREE.MathUtils.damp(
      trailHeadEnergy.current,
      desiredHeadEnergy,
      headEnergyResponse,
      frameDelta,
    );
    if (trailHeadEnergy.current < 0.001) {
      trailHeadEnergy.current = 0;
    }

    if (hadPointerSample.current) {
      let historyStart = trailHistoryStart.current;
      let historyCount = trailHistoryCount.current;
      const energyRetention = Math.exp(-frameDelta * 0.48);
      let strongestHistoryEnergy = 0;

      for (
        let historyIndex = 0;
        historyIndex < historyCount;
        historyIndex += 1
      ) {
        const sourceIndex = (historyStart + historyIndex) % trailHistory.length;
        const decayedEnergy = trailHistoryEnergy[sourceIndex]
          * energyRetention;
        trailHistoryEnergy.fill(
          decayedEnergy < 0.001 ? 0 : decayedEnergy,
          sourceIndex,
          sourceIndex + 1,
        );
        strongestHistoryEnergy = Math.max(
          strongestHistoryEnergy,
          trailHistoryEnergy[sourceIndex],
        );
      }

      while (historyCount > 2) {
        const nextOldestIndex = (historyStart + 1) % trailHistory.length;
        if (
          trailHistoryEnergy[historyStart] < 0.004
          && trailHistoryEnergy[nextOldestIndex] < 0.004
        ) {
          historyStart = nextOldestIndex;
          historyCount -= 1;
        } else {
          break;
        }
      }

      if (
        strongestHistoryEnergy < 0.004
        && trailHeadEnergy.current === 0
        && pointerSpeed < 0.01
      ) {
        historyStart = 0;
        historyCount = 1;
        trailHistory[0].copy(smoothedMouse.current);
        trailHistoryEnergy.fill(0, 0, 1);
        trailHistoryLinks.fill(0, 0, 1);
        lastTrailSample.current.copy(smoothedMouse.current);
      }

      trailHistoryStart.current = historyStart;
      trailHistoryCount.current = historyCount;

      let uniformPointCount = 0;
      for (
        let historyIndex = 0;
        historyIndex < historyCount;
        historyIndex += 1
      ) {
        const sourceIndex = (historyStart + historyIndex) % trailHistory.length;
        trailUniformPoints[uniformPointCount].copy(trailHistory[sourceIndex]);
        trailUniformEnergy.fill(
          trailHistoryEnergy[sourceIndex],
          uniformPointCount,
          uniformPointCount + 1,
        );
        trailUniformLinks.fill(
          trailHistoryLinks[sourceIndex],
          uniformPointCount,
          uniformPointCount + 1,
        );
        uniformPointCount += 1;
      }

      const newestTrailPoint = trailUniformPoints[uniformPointCount - 1];
      if (
        uniformPointCount < TRAIL_POINT_COUNT &&
        newestTrailPoint.distanceToSquared(smoothedMouse.current) > 0.00000001
      ) {
        trailUniformPoints[uniformPointCount].copy(smoothedMouse.current);
        trailUniformEnergy.fill(
          trailHeadEnergy.current,
          uniformPointCount,
          uniformPointCount + 1,
        );
        trailUniformLinks.fill(1, uniformPointCount, uniformPointCount + 1);
        uniformPointCount += 1;
      } else {
        trailUniformEnergy.fill(
          Math.max(
            trailUniformEnergy[uniformPointCount - 1],
            trailHeadEnergy.current,
          ),
          uniformPointCount - 1,
          uniformPointCount,
        );
      }
      material.uniforms.uTrailPointCount.value = uniformPointCount;
    }
    material.uniforms.uTrailHeadEnergy.value = trailHeadEnergy.current;

    enterProgressRef.current = THREE.MathUtils.damp(
      enterProgressRef.current,
      1,
      1.15,
      frameDelta,
    );
    if (enterProgressRef.current > 0.9995) enterProgressRef.current = 1;

    const pointerEnergy = pointerActive.current
      ? pointerSpeed / 3.2
      : 0;
    const motionStrength = THREE.MathUtils.clamp(pointerEnergy, 0, 1);

    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uEnter.value = enterProgressRef.current;
    material.uniforms.uMouse3D.value.copy(smoothedMouse.current);
    material.uniforms.uMouseVelocity.value.set(
      pointerVelocity.current.x,
      pointerVelocity.current.y,
    );
    material.uniforms.uMouseActive.value = THREE.MathUtils.damp(
      material.uniforms.uMouseActive.value,
      pointerActive.current ? 1 : IDLE_MOUSE_ACTIVITY,
      pointerActive.current ? 4.2 : 2.2,
      frameDelta,
    );
    material.uniforms.uRippleStrength.value = THREE.MathUtils.damp(
      material.uniforms.uRippleStrength.value,
      motionStrength,
      motionStrength > material.uniforms.uRippleStrength.value ? 4.4 : 0.85,
      frameDelta,
    );
    material.uniforms.uTheme.value = THREE.MathUtils.damp(
      material.uniforms.uTheme.value,
      isDark ? 1 : 0,
      4,
      frameDelta,
    );
    wasPointerActive.current = pointerActive.current;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
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
    </points>
  );
}

interface AntigravityParticlesProps {
  className?: string;
}

export function AntigravityParticles({ className }: AntigravityParticlesProps) {
  const { theme } = useTheme();
  const enterProgressRef = useRef(0);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none fixed inset-0 h-screen w-screen", className)}
    >
      <Canvas
        dpr={[1, 1.35]}
        camera={{
          position: [0, 0, CAMERA_DISTANCE],
          fov: 50,
          near: 0.1,
          far: 20,
        }}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        }}
        className="h-full w-full"
      >
        <ParticleField
          isDark={theme === "dark"}
          enterProgressRef={enterProgressRef}
        />
      </Canvas>
    </div>
  );
}

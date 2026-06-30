"use client";

import { motion } from "framer-motion";
import { RocketLaunch } from "@phosphor-icons/react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import * as THREE from "three";

const PARTICLE_COUNT = 14000;
const IDLE_MOUSE_ACTIVITY = 0.05;
const SETTLED_MOUSE_ACTIVITY = 0.01;

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const vertexShader = `
  uniform float uTime;
  uniform vec3 uMouse3D;
  uniform float uEnter;
  uniform float uMouseActive;
  
  attribute vec3 aRandom;

  varying vec3 vWorldPosition;
  varying float vHighlight;
  varying vec2 vUv;

  void main() {
    vUv = uv;

    vec3 basePos = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    float radius = length(basePos.xy);
    float angle = atan(basePos.y, basePos.x);
    
    float hole = smoothstep(25.0, 40.0, radius);
    float wave = sin(radius * 0.04 - uTime * 1.5) * 5.0 * hole;
    
    vec3 targetPos = basePos;
    targetPos.z += wave;

    float easeEnter = 1.0 - pow(1.0 - clamp(uEnter, 0.0, 1.0), 3.0);
    vec3 currentPos = mix(aRandom * 200.0, targetPos, easeEnter);

    vec3 dirToMouse = currentPos - uMouse3D;
    float distToMouse = length(dirToMouse);
    float influence = smoothstep(45.0, 5.0, distToMouse) * uMouseActive * hole;
    
    if (influence > 0.0) {
      currentPos += normalize(dirToMouse) * influence * 12.0;
      currentPos.z += influence * 15.0;
    }

    vWorldPosition = currentPos;
    vHighlight = influence;
    
    vec4 mvPosition = viewMatrix * vec4(currentPos, 1.0);
    mvPosition.xy += position.xy * (1.0 + influence * 2.5) * easeEnter;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vWorldPosition;
  varying float vHighlight;
  varying vec2 vUv;
  
  uniform float uTime;
  uniform float uTheme;

  void main() {
    float distToCenter = length(vUv - 0.5);
    if (distToCenter > 0.4) discard;
    
    float alpha = smoothstep(0.4, 0.1, distToCenter);
    
    float radius = length(vWorldPosition.xy);
    float t = clamp((radius - 30.0) / 90.0, 0.0, 1.0);

    vec3 c1 = vec3(0.957, 0.257, 0.641);
    vec3 c2 = vec3(0.243, 0.969, 0.824);
    vec3 c3 = vec3(0.388, 0.396, 0.945);
    
    vec3 color = mix(c1, c2, sin(t * 3.14 + uTime * 0.5) * 0.5 + 0.5);
    color = mix(color, c3, t);
    
    vec3 themeBase = mix(color, color * 0.6, uTheme);
    vec3 glow = mix(vec3(1.0), vec3(0.0), uTheme);
    
    vec3 finalColor = mix(themeBase, glow, vHighlight * 0.8);

    gl_FragColor = vec4(finalColor, alpha * (0.4 + vHighlight * 0.6));
  }
`;

interface ParticlesProps {
  enterProgressRef: { current: number };
}

function Particles({ enterProgressRef }: ParticlesProps) {
  const { gl } = useThree();
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  
  const mouse3D = useRef(new THREE.Vector3(0, 0, 0));
  const targetMouse3D = useRef(new THREE.Vector3(0, 0, 0));
  const globalMouse = useRef(new THREE.Vector2(0, 0));
  const isMouseActive = useRef(false);
  const wasMouseActive = useRef(false);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const interactionPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const intersectionTarget = useMemo(() => new THREE.Vector3(), []);

  const geometry = useMemo(() => {
    const geo = new THREE.CircleGeometry(0.5, 8);
    const randoms = new Float32Array(PARTICLE_COUNT * 3);
    const random = createSeededRandom(0x504c414e);
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) randoms[i] = (random() - 0.5) * 600.0;
    geo.setAttribute("aRandom", new THREE.InstancedBufferAttribute(randoms, 3));
    return geo;
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse3D: { value: new THREE.Vector3(0, 0, 0) },
    uEnter: { value: 0 },
    uTheme: { value: 0 },
    uMouseActive: { value: 0 }
  }), []);

  useEffect(() => {
    const canvas = gl.domElement;

    const updateMouse = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        isMouseActive.current = false;
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      isMouseActive.current = inside;
      if (!inside || rect.width <= 0 || rect.height <= 0) return;

      globalMouse.current.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
    };

    const deactivateMouse = () => {
      isMouseActive.current = false;
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) deactivateMouse();
    };

    window.addEventListener("pointermove", updateMouse, { passive: true });
    window.addEventListener("pointerout", handlePointerOut);
    window.addEventListener("blur", deactivateMouse);
    window.addEventListener("scroll", deactivateMouse, { passive: true });
    
    return () => {
      window.removeEventListener("pointermove", updateMouse);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("blur", deactivateMouse);
      window.removeEventListener("scroll", deactivateMouse);
    };
  }, [gl]);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    const mesh = meshRef.current;
    const random = createSeededRandom(0x4845524f);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = Math.sqrt(random()) * 70 + 35;
      const theta = random() * Math.PI * 2;
      dummy.position.set(radius * Math.cos(theta), radius * Math.sin(theta), 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const material = materialRef.current;
    if (!group || !material) return;
    const interactionWasSettled =
      material.uniforms.uMouseActive.value < SETTLED_MOUSE_ACTIVITY;

    enterProgressRef.current = THREE.MathUtils.damp(
      enterProgressRef.current,
      1,
      1.2,
      delta,
    );
    if (enterProgressRef.current > 0.9995) enterProgressRef.current = 1;
    material.uniforms.uEnter.value = enterProgressRef.current;
    material.uniforms.uTheme.value = THREE.MathUtils.damp(
      material.uniforms.uTheme.value,
      document.documentElement.classList.contains("dark") ? 0 : 1,
      5,
      delta,
    );
    material.uniforms.uMouseActive.value = THREE.MathUtils.damp(
      material.uniforms.uMouseActive.value,
      isMouseActive.current ? 1 : IDLE_MOUSE_ACTIVITY,
      isMouseActive.current ? 8 : 2,
      delta,
    );

    if (isMouseActive.current) {
      raycaster.setFromCamera(globalMouse.current, state.camera);
      if (raycaster.ray.intersectPlane(interactionPlane, intersectionTarget)) {
        targetMouse3D.current.copy(intersectionTarget);
        if (
          !wasMouseActive.current &&
          interactionWasSettled
        ) {
          mouse3D.current.copy(targetMouse3D.current);
        }
      }
    } else {
      const idleTime = state.clock.elapsedTime;
      targetMouse3D.current.set(
        Math.sin(idleTime * 0.18) * 34,
        Math.sin(idleTime * 0.13 + 1.1) * 24,
        0,
      );
    }

    mouse3D.current.lerp(
      targetMouse3D.current,
      1 - Math.exp(-delta * (isMouseActive.current ? 9.5 : 0.8)),
    );

    group.rotation.z -= delta * 0.02;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uMouse3D.value.copy(mouse3D.current);
    wasMouseActive.current = isMouseActive.current;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[geometry, undefined, PARTICLE_COUNT]}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent={true}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}

export function Hero() {
  const t = useTranslations("Hero");
  const enterProgressRef = useRef(0);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 150], fov: 50 }}>
          <Particles enterProgressRef={enterProgressRef} />
        </Canvas>
      </div>
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
        }}
        className="relative z-10 max-w-6xl mx-auto px-6 w-full text-center pointer-events-none"
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="pointer-events-auto mb-8">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 text-sm font-bold tracking-widest uppercase">
                <RocketLaunch weight="duotone" className="w-5 h-5 text-indigo-500" />
                {t("badge")}
            </span>
        </motion.div>
        
        <motion.h1
          variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
          className="text-6xl md:text-8xl lg:text-[8rem] font-black tracking-tighter text-zinc-900 dark:text-white leading-[0.9] pointer-events-auto"
        >
          <span className="block">{t("title1")}</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400">
            {t("title2")}
          </span>
        </motion.h1>
      </motion.div>
    </section>
  );
}

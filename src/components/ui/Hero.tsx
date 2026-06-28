"use client";

import { motion } from "framer-motion";
import { RocketLaunch, ArrowRight, ArrowDown } from "@phosphor-icons/react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import * as THREE from "three";

const PARTICLE_COUNT = 14000;

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

function Particles() {
  const { gl } = useThree();
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  
  const mouse3D = useRef(new THREE.Vector3(0, 0, 0));
  const targetMouse3D = useRef(new THREE.Vector3(0, 0, 0));
  const globalMouse = useRef(new THREE.Vector2(0, 0));
  const isMouseActive = useRef(false);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const interactionPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const intersectionTarget = useMemo(() => new THREE.Vector3(), []);

  const geometry = useMemo(() => {
    const geo = new THREE.CircleGeometry(0.5, 8);
    const randoms = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) randoms[i] = (Math.random() - 0.5) * 600.0;
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
    const updateMouse = (e: MouseEvent | null, active: boolean) => {
      isMouseActive.current = active;
      if (e) {
        const rect = gl.domElement.getBoundingClientRect();
        globalMouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        globalMouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      }
    };

    window.addEventListener("mousemove", (e) => updateMouse(e, true));
    window.addEventListener("mouseout", () => updateMouse(null, false));
    window.addEventListener("mouseover", () => updateMouse(null, true));
    
    return () => {
        window.removeEventListener("mousemove", (e) => updateMouse(e, true));
        window.removeEventListener("mouseout", () => updateMouse(null, false));
        window.removeEventListener("mouseover", () => updateMouse(null, true));
    };
  }, [gl]);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    const mesh = meshRef.current;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = Math.sqrt(Math.random()) * 70 + 35;
      const theta = Math.random() * Math.PI * 2;
      dummy.position.set(radius * Math.cos(theta), radius * Math.sin(theta), 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    materialRef.current.uniforms.uEnter.value = THREE.MathUtils.lerp(materialRef.current.uniforms.uEnter.value, 1.01, delta * 1.2);
    materialRef.current.uniforms.uTheme.value = THREE.MathUtils.lerp(materialRef.current.uniforms.uTheme.value, document.documentElement.classList.contains("dark") ? 0.0 : 1.0, delta * 5.0);
    materialRef.current.uniforms.uMouseActive.value = THREE.MathUtils.lerp(materialRef.current.uniforms.uMouseActive.value, isMouseActive.current ? 1.0 : 0.0, delta * 8.0);

    raycaster.setFromCamera(globalMouse.current, state.camera);
    if (raycaster.ray.intersectPlane(interactionPlane, intersectionTarget)) {
      mouse3D.current.lerp(intersectionTarget, 0.15);
    }

    group.rotation.z -= delta * 0.02;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uMouse3D.value.copy(mouse3D.current);
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

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 150], fov: 50 }}>
          <Particles />
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
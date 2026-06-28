"use client";

import { motion } from "framer-motion";
import { RocketLaunch, ArrowRight, ArrowDown } from "@phosphor-icons/react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import * as THREE from "three";

const PARTICLE_COUNT = 16000;

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
    
    float angle = atan(basePos.y, basePos.x);
    float radius = length(basePos.xy);
    
    float wave1 = sin(radius * 0.05 - uTime * 1.5) * 4.0;
    float wave2 = cos(angle * 5.0 + uTime * 1.2) * 5.0 * (radius / 80.0);
    float wave3 = sin(angle * 3.0 - uTime * 2.0) * 3.0;
    
    vec3 targetPos = basePos;
    targetPos.z += wave1 + wave2 + wave3;

    float easeEnter = 1.0 - pow(1.0 - clamp(uEnter, 0.0, 1.0), 4.0);
    
    float swirlPhase = (1.0 - easeEnter) * 20.0;
    mat2 rot = mat2(cos(swirlPhase), -sin(swirlPhase), sin(swirlPhase), cos(swirlPhase));

    vec3 currentLocalPos = mix(aRandom, targetPos, easeEnter);
    currentLocalPos.xy *= rot;

    vec4 worldPos4 = modelMatrix * vec4(currentLocalPos, 1.0);
    vec3 worldPos = worldPos4.xyz;

    vec3 dirToMouse = worldPos - uMouse3D;
    float distToMouse = length(dirToMouse);
    float influence = smoothstep(35.0, 0.0, distToMouse) * uMouseActive;
    
    if (influence > 0.0) {
      vec3 repel = normalize(dirToMouse) * 8.0;
      vec3 tangent = normalize(cross(dirToMouse, vec3(0.0, 0.0, 1.0)));
      vec3 twist = tangent * 25.0;
      vec3 lift = (modelMatrix * vec4(0.0, 0.0, 40.0, 0.0)).xyz;
      
      worldPos += (repel + twist + lift) * influence;
    }

    vWorldPosition = worldPos;
    vHighlight = influence;
    
    vec4 mvPosition = viewMatrix * vec4(worldPos, 1.0);
    mvPosition.xy += position.xy * (1.0 + influence * 5.0) * easeEnter;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vWorldPosition;
  varying float vHighlight;
  varying vec2 vUv;
  
  uniform float uTime;
  uniform float uEnter;
  uniform float uTheme;

  void main() {
    float distToCenter = length(vUv - 0.5);
    if (distToCenter > 0.5) discard;
    
    float alpha = smoothstep(0.5, 0.1, distToCenter) * smoothstep(0.0, 0.3, uEnter);
    
    float radius = length(vWorldPosition.xy);
    float t = clamp((radius - 30.0) / 70.0, 0.0, 1.0);

    vec3 colorPink = vec3(0.957, 0.257, 0.641);
    vec3 colorCyan = vec3(0.143, 0.969, 0.824);
    vec3 colorIndigo = vec3(0.388, 0.396, 0.945);
    
    vec3 baseColor = mix(colorCyan, colorIndigo, t + sin(vWorldPosition.z * 0.05 + uTime) * 0.5);
    baseColor = mix(baseColor, colorPink, cos(vWorldPosition.x * 0.02 - uTime * 0.3) * 0.5 + 0.5);
    
    vec3 finalColorDark = baseColor;
    vec3 finalColorLight = mix(baseColor * 0.7, vec3(0.1, 0.1, 0.7), 0.2);
    vec3 themeBaseColor = mix(finalColorDark, finalColorLight, uTheme);
    
    vec3 highlightColorDark = vec3(1.0, 1.0, 1.0);
    vec3 highlightColorLight = vec3(0.1, 0.1, 0.1);
    vec3 highlightColor = mix(highlightColorDark, highlightColorLight, uTheme);
    
    vec3 finalColor = mix(themeBaseColor, highlightColor, vHighlight * 0.9);

    gl_FragColor = vec4(finalColor, alpha * (0.5 + vHighlight * 0.5));
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
  const lastMousePos = useRef({ x: 0, y: 0 });
  const isMouseActive = useRef(false);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const interactionPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const planeNormal = useMemo(() => new THREE.Vector3(0, 0, 1), []);
  const intersectionTarget = useMemo(() => new THREE.Vector3(), []);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.7, 0.7);
    const randoms = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      randoms[i] = (Math.random() - 0.5) * 800.0;
    }
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
    lastMousePos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const updateMouseNDC = () => {
      const rect = gl.domElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      globalMouse.current.x = ((lastMousePos.current.x - rect.left) / rect.width) * 2 - 1;
      globalMouse.current.y = -((lastMousePos.current.y - rect.top) / rect.height) * 2 + 1;
    };

    const handleMouseMove = (e: MouseEvent) => {
      lastMousePos.current.x = e.clientX;
      lastMousePos.current.y = e.clientY;
      isMouseActive.current = true;
      updateMouseNDC();
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (!e.relatedTarget || e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        isMouseActive.current = false;
      }
    };

    const handleMouseEnter = () => {
      isMouseActive.current = true;
    };

    const handleScroll = () => {
      updateMouseNDC();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseLeave);
    window.addEventListener("mouseover", handleMouseEnter);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    updateMouseNDC();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
      window.removeEventListener("mouseover", handleMouseEnter);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [gl]);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    const mesh = meshRef.current;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = Math.sqrt(Math.random()) * 65 + 32;
      const theta = Math.random() * Math.PI * 2;
      
      const x = radius * Math.cos(theta);
      const y = radius * Math.sin(theta);
      const z = 0;

      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    if (materialRef.current.uniforms.uEnter.value < 1.0) {
      materialRef.current.uniforms.uEnter.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uEnter.value,
        1.05,
        delta * 1.5
      );
    }

    const isDark = document.documentElement.classList.contains("dark");
    materialRef.current.uniforms.uTheme.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uTheme.value,
      isDark ? 0.0 : 1.0,
      delta * 5.0
    );

    materialRef.current.uniforms.uMouseActive.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uMouseActive.value,
      isMouseActive.current ? 1.0 : 0.0,
      delta * 6.0
    );

    group.rotation.z -= delta * 0.03;
    group.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.25;
    group.rotation.y = Math.cos(state.clock.elapsedTime * 0.15) * 0.2;

    const scrollY = window.scrollY;
    const targetScale = 1 + scrollY * 0.0012;
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, targetScale, 0.08));

    const targetPosX = globalMouse.current.x * 6.0;
    const targetPosY = globalMouse.current.y * 6.0 - (scrollY * 0.02);
    group.position.x = THREE.MathUtils.lerp(group.position.x, targetPosX, 0.04);
    group.position.y = THREE.MathUtils.lerp(group.position.y, targetPosY, 0.04);

    planeNormal.set(0, 0, 1).applyQuaternion(group.quaternion);
    interactionPlane.setFromNormalAndCoplanarPoint(planeNormal, group.position);

    raycaster.setFromCamera(globalMouse.current, state.camera);
    const intersection = raycaster.ray.intersectPlane(interactionPlane, intersectionTarget);
    
    if (intersection) {
      targetMouse3D.current.copy(intersection);
    }

    mouse3D.current.lerp(targetMouse3D.current, 0.18);

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uMouse3D.value.copy(mouse3D.current);
    }
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
          blending={THREE.NormalBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
}

const Background3D = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <Canvas camera={{ position: [0, 0, 120], fov: 60 }} gl={{ alpha: true, antialias: true }}>
        <Particles />
      </Canvas>
    </div>
  );
};

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-[#09090b] transition-colors duration-500">
      <Background3D />
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 1.5,
            },
          },
        }}
        className="relative z-10 max-w-6xl mx-auto px-6 w-full pointer-events-none"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30, scale: 0.9 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
            },
          }}
          className="flex justify-center mb-12 pointer-events-auto"
        >
          <span className="relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-50/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 text-sm font-bold tracking-widest uppercase backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] transition-colors duration-500">
            <div className="absolute -inset-3 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-xl opacity-60" />
            <RocketLaunch weight="duotone" className="w-5 h-5 text-indigo-500 dark:text-indigo-400 relative" />
            <span className="relative">{t("badge")}</span>
          </span>
        </motion.div>
        
        <motion.h1
          variants={{
            hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
            },
          }}
          className="text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] font-black tracking-tighter text-center text-zinc-900 dark:text-white leading-[0.9] pointer-events-auto transition-colors duration-500"
        >
          <span className="block drop-shadow-sm dark:drop-shadow-none">{t("title1")}</span>{" "}
          <span className="relative inline-block mt-4">
            <span className="absolute -inset-6 blur-[80px] bg-indigo-500/20 dark:bg-indigo-500/30 rounded-full opacity-80 animate-pulse" />
            <span className="relative text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-300 drop-shadow-sm dark:drop-shadow-none">
              {t("title2")}
            </span>
          </span>
        </motion.h1>
        
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
            },
          }}
          className="mt-12 text-lg md:text-xl lg:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto text-center leading-relaxed font-medium pointer-events-auto transition-colors duration-500 drop-shadow-sm dark:drop-shadow-none"
        >
          {t("description")}
        </motion.p>
        
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
            },
          }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 pointer-events-auto"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold text-lg shadow-[0_0_80px_-20px_rgba(79,70,229,0.4)] dark:shadow-[0_0_80px_-20px_rgba(99,102,241,0.4)] transition-all duration-300"
          >
            <span className="relative flex items-center gap-3">
              {t("ctaPrimary")}
              <ArrowRight weight="bold" className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold text-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)] transition-all duration-300"
          >
            {t("ctaSecondary")}
          </motion.button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 1 }}
          className="mt-24 flex flex-col items-center gap-4 pointer-events-auto"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 transition-colors duration-500">{t("scrollLabel")}</span>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
            <ArrowDown weight="bold" className="w-5 h-5 text-zinc-400 dark:text-zinc-500 transition-colors duration-500" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
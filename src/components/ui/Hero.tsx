"use client";

import { motion } from "framer-motion";
import { RocketLaunch, ArrowRight, ArrowDown } from "@phosphor-icons/react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import * as THREE from "three";

const PARTICLE_COUNT = 8500;
const SPHERE_RADIUS = 22;

const vertexShader = `
  uniform float uTime;
  uniform vec3 uMouse3D;
  varying vec3 vWorldPosition;
  varying float vHighlight;

  void main() {
    vec3 instanceCenter = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    
    vec3 dirToMouse = instanceCenter - uMouse3D;
    float distToMouse = length(dirToMouse);
    
    float influence = 1.0 - smoothstep(0.0, 15.0, distToMouse);
    
    vec4 localPosition = vec4(position, 1.0);
    
    localPosition.z += sign(localPosition.z) * influence * 1.5;

    vec4 instancePos = instanceMatrix * localPosition;
    vec4 worldPos = modelMatrix * instancePos;

    if (influence > 0.0) {
      vec3 pushDir = normalize(dirToMouse);
      vec3 swirl = cross(pushDir, normalize(instanceCenter));
      
      worldPos.xyz += pushDir * influence * 4.0; 
      worldPos.xyz += swirl * influence * 2.5;   
    }

    float wave = sin(uTime * 1.2 + worldPos.x * 0.2) * cos(uTime * 0.8 + worldPos.y * 0.2);
    worldPos.xyz += normalize(worldPos.xyz) * wave * 0.8;

    vWorldPosition = worldPos.xyz;
    vHighlight = influence;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = `
  varying vec3 vWorldPosition;
  varying float vHighlight;

  void main() {
    float t = ((vWorldPosition.x + vWorldPosition.y) / 40.0) + 0.5;
    t = clamp(t, 0.0, 1.0);

    vec3 colorPink = vec3(0.957, 0.357, 0.541); // #F45B8A
    vec3 colorCyan = vec3(0.243, 0.969, 0.824); // #3EF7D2

    vec3 baseColor = mix(colorPink, colorCyan, t);
    vec3 finalColor = mix(baseColor, vec3(1.0, 1.0, 1.0), vHighlight * 0.85);

    float dist = length(vWorldPosition);
    float alpha = smoothstep(28.0, 14.0, dist) * smoothstep(2.0, 8.0, dist);

    alpha = clamp(alpha + vHighlight * 0.5, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, alpha * 0.95);
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

  const geometry = useMemo(() => {
    const geom = new THREE.CapsuleGeometry(0.012, 0.45, 4, 4);
    geom.rotateX(Math.PI / 2);
    return geom;
  }, []);

  const uniforms = useMemo(() => ({ 
    uTime: { value: 0 },
    uMouse3D: { value: new THREE.Vector3(0, 0, 0) } 
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
      updateMouseNDC();
    };

    const handleScroll = () => {
      updateMouseNDC();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    updateMouseNDC();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [gl]);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    const mesh = meshRef.current;
    const target = new THREE.Vector3();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = SPHERE_RADIUS * Math.pow(Math.random(), 0.55);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      dummy.position.set(x, y, z);

      const tangent = new THREE.Vector3(-z, y * 0.1, x).normalize();
      const inward = new THREE.Vector3(-x, -y, -z).normalize();
      const direction = new THREE.Vector3().copy(tangent).lerp(inward, 0.15).normalize();

      target.copy(dummy.position).add(direction);
      dummy.lookAt(target);

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const vector = new THREE.Vector3(globalMouse.current.x, globalMouse.current.y, 0.5);
    vector.unproject(state.camera);
    const dir = vector.sub(state.camera.position).normalize();
    const distance = -state.camera.position.z / dir.z; 
    const pos = state.camera.position.clone().add(dir.multiplyScalar(distance));
    
    targetMouse3D.current.copy(pos);
    mouse3D.current.lerp(targetMouse3D.current, 0.08);

    group.rotation.y += delta * 0.1;
    group.rotation.x += delta * 0.04;

    const scrollY = window.scrollY;
    const targetScale = 1 + scrollY * 0.002;
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, targetScale, 0.08));

    const targetPosX = globalMouse.current.x * 1.5;
    const targetPosY = globalMouse.current.y * 1.5 - (scrollY * 0.015);
    
    group.position.x = THREE.MathUtils.lerp(group.position.x, targetPosX, 0.05);
    group.position.y = THREE.MathUtils.lerp(group.position.y, targetPosY, 0.05);

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
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 42], fov: 60 }} gl={{ alpha: true, antialias: true }}>
        <Particles />
      </Canvas>
    </div>
  );
};

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950 dark:bg-black">
      <Background3D />
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.08,
              delayChildren: 0.2,
            },
          },
        }}
        className="relative z-10 max-w-6xl mx-auto px-6 w-full pointer-events-none"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
            },
          }}
          className="flex justify-center mb-12 pointer-events-auto"
        >
          <span className="relative inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 text-sm font-bold tracking-wide backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]">
            <div className="absolute -inset-3 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-xl opacity-60" />
            <RocketLaunch weight="duotone" className="w-5 h-5 text-indigo-500 dark:text-indigo-400 relative" />
            <span className="relative">{t("badge")}</span>
          </span>
        </motion.div>
        
        <motion.h1
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
            },
          }}
          className="text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] font-black tracking-tighter text-center text-zinc-900 dark:text-white leading-[0.85] pointer-events-auto"
        >
          <span className="block">{t("title1")}</span>{" "}
          <span className="relative inline-block mt-2">
            <span className="absolute -inset-4 blur-[60px] bg-indigo-500/20 dark:bg-indigo-500/15 rounded-full opacity-70" />
            <span className="relative text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 dark:from-indigo-400 dark:via-indigo-500 dark:to-cyan-400">
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
              transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.25 },
            },
          }}
          className="mt-10 text-lg md:text-xl lg:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto text-center leading-relaxed font-medium pointer-events-auto"
        >
          {t("description")}
        </motion.p>
        
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 },
            },
          }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-5 pointer-events-auto"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold text-lg shadow-[0_0_80px_-20px_rgba(79,70,229,0.6)] dark:shadow-[0_0_80px_-20px_rgba(79,70,229,0.4)] transition-all duration-300"
          >
            <span className="relative flex items-center gap-3">
              {t("ctaPrimary")}
              <ArrowRight weight="bold" className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold text-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:border-zinc-700 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)] transition-all duration-300"
          >
            {t("ctaSecondary")}
          </motion.button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-32 flex flex-col items-center gap-4 pointer-events-auto"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">{t("scrollLabel")}</span>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
            <ArrowDown weight="bold" className="w-5 h-5 text-zinc-400 dark:text-zinc-600" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shaders";

const PARTICLE_COUNT = 45000;

const SHAPE_PALETTES: Record<number, number> = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 0,
};

function Particles() {
  const { gl } = useThree();
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  
  const smoothedMouse = useRef(new THREE.Vector2(0, 0));
  const globalMouse = useRef(new THREE.Vector2(0, 0));
  const lastMousePos = useRef({ x: 0, y: 0 });
  const mouseActive = useRef(0);
  const targetMouseActive = useRef(0);
  const entrance = useRef(0);
  const isInitialized = useRef(false);

  const initialShape = useMemo(() => Math.floor(Math.random() * 6), []);
  const initialPalette = SHAPE_PALETTES[initialShape];

  const shape1 = useRef(initialShape);
  const shape2 = useRef(initialShape);
  const palette1 = useRef(initialPalette);
  const palette2 = useRef(initialPalette);
  const morph = useRef(0);
  const targetMorph = useRef(0);
  const explosion = useRef(0);
  const targetExplosion = useRef(0);
  const rotationSpeedMultiplier = useRef(1);

  const randomRotX = useMemo(() => Math.random() * Math.PI * 2, []);
  const randomRotY = useMemo(() => Math.random() * Math.PI * 2, []);
  const randomRotZ = useMemo(() => Math.random() * Math.PI * 2, []);

  const geometry = useMemo(() => {
    const geom = new THREE.CapsuleGeometry(0.012, 0.45, 4, 8);
    geom.rotateX(Math.PI / 2);

    const seeds = new Float32Array(PARTICLE_COUNT * 3);
    const randomDirs = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      seeds[i * 3] = Math.random();
      seeds[i * 3 + 1] = Math.random();
      seeds[i * 3 + 2] = Math.random();

      const randDir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();

      randomDirs[i * 3] = randDir.x;
      randomDirs[i * 3 + 1] = randDir.y;
      randomDirs[i * 3 + 2] = randDir.z;
    }

    geom.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 3));
    geom.setAttribute("aRandomDir", new THREE.InstancedBufferAttribute(randomDirs, 3));

    return geom;
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse2D: { value: new THREE.Vector2(0, 0) },
    uCameraPos: { value: new THREE.Vector3(0, 0, 50) },
    uMouseActive: { value: 0 },
    uEntrance: { value: 0 },
    uShape1: { value: initialShape },
    uShape2: { value: initialShape },
    uPalette1: { value: initialPalette },
    uPalette2: { value: initialPalette },
    uMorph: { value: 0 },
    uExplosion: { value: 0 },
    uAspect: { value: 1.0 }
  }), [initialShape, initialPalette]);

  useEffect(() => {
    const updateMouseNDC = () => {
      const rect = gl.domElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      globalMouse.current.x = ((lastMousePos.current.x - rect.left) / rect.width) * 2 - 1;
      globalMouse.current.y = -((lastMousePos.current.y - rect.top) / rect.height) * 2 + 1;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseActive.current = 1;
      lastMousePos.current.x = e.clientX;
      lastMousePos.current.y = e.clientY;
      updateMouseNDC();
    };

    const handleMouseLeave = () => {
      targetMouseActive.current = 0;
    };

    const handleMouseEnter = () => {
      targetMouseActive.current = 1;
    };

    const handleScroll = () => {
      updateMouseNDC();
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    updateMouseNDC();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [gl]);

  useEffect(() => {
    const dummy = new THREE.Matrix4();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      meshRef.current.setMatrixAt(i, dummy);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      targetExplosion.current = 1.0;
      setTimeout(() => {
        shape1.current = shape2.current;
        palette1.current = palette2.current;

        let nextShape = Math.floor(Math.random() * 6);
        while (nextShape === shape1.current) {
          nextShape = Math.floor(Math.random() * 6);
        }
        
        shape2.current = nextShape;
        palette2.current = SHAPE_PALETTES[nextShape];
        
        rotationSpeedMultiplier.current = (nextShape === 1 || nextShape === 2) ? 0.05 : 1.0;

        morph.current = 0;
        targetMorph.current = 1;
        targetExplosion.current = 0.0;
      }, 600);
    }, 8000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    if (!isInitialized.current) {
      group.rotation.set(randomRotX, randomRotY, randomRotZ);
      if (initialShape === 1 || initialShape === 2) {
        group.rotation.set(0, 0, 0);
        rotationSpeedMultiplier.current = 0.05;
      }
      isInitialized.current = true;
    }

    entrance.current = THREE.MathUtils.damp(entrance.current, 1, 3.5, delta);
    mouseActive.current = THREE.MathUtils.lerp(mouseActive.current, targetMouseActive.current, 0.15);
    explosion.current = THREE.MathUtils.damp(explosion.current, targetExplosion.current, 10.0, delta);
    morph.current = THREE.MathUtils.damp(morph.current, targetMorph.current, 4.0, delta);
    smoothedMouse.current.lerp(globalMouse.current, 0.2);

    const targetRotSpeed = (explosion.current * 1.5) + (0.08 * rotationSpeedMultiplier.current);
    
    if (rotationSpeedMultiplier.current < 1.0) {
      group.rotation.x = THREE.MathUtils.damp(group.rotation.x, 0, 2.0, delta);
      group.rotation.y = THREE.MathUtils.damp(group.rotation.y, 0, 2.0, delta);
      group.rotation.z = THREE.MathUtils.damp(group.rotation.z, 0, 2.0, delta);
    } else {
      group.rotation.y += delta * targetRotSpeed;
      group.rotation.x += delta * (targetRotSpeed * 0.5);
      group.rotation.z += delta * (targetRotSpeed * 0.2);
    }

    const scrollY = window.scrollY;
    const targetScale = 1 + scrollY * 0.002;
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, targetScale, 0.08));

    const targetPosX = globalMouse.current.x * 3.0 * mouseActive.current;
    const targetPosY = (globalMouse.current.y * 3.0 * mouseActive.current) - (scrollY * 0.02);
    
    group.position.x = THREE.MathUtils.lerp(group.position.x, targetPosX, 0.05);
    group.position.y = THREE.MathUtils.lerp(group.position.y, targetPosY, 0.05);

    if (materialRef.current) {
      const rect = gl.domElement.getBoundingClientRect();
      const aspect = rect.width / rect.height;

      materialRef.current.uniforms.uAspect.value = aspect;
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uMouse2D.value.copy(smoothedMouse.current);
      materialRef.current.uniforms.uCameraPos.value.copy(state.camera.position);
      materialRef.current.uniforms.uMouseActive.value = mouseActive.current;
      materialRef.current.uniforms.uEntrance.value = entrance.current;
      materialRef.current.uniforms.uShape1.value = shape1.current;
      materialRef.current.uniforms.uShape2.value = shape2.current;
      materialRef.current.uniforms.uPalette1.value = palette1.current;
      materialRef.current.uniforms.uPalette2.value = palette2.current;
      materialRef.current.uniforms.uMorph.value = morph.current;
      materialRef.current.uniforms.uExplosion.value = explosion.current;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[geometry, undefined as any, PARTICLE_COUNT]} frustumCulled={false}>
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

export const Hero3D = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 50], fov: 60 }} gl={{ alpha: true, antialias: true }}>
        <Particles />
      </Canvas>
    </div>
  );
};
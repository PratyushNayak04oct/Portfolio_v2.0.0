'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import ReactorModel from './ReactorModel';
import ReactorAnnotations from './ReactorAnnotations';
import ReactorPower from './ReactorPower';
import ReactorFallback from './ReactorFallback';
import { useLabStore, labActions } from '@/lib/labStore';
import { reactorScroll } from '@/lib/reactorScroll';
import { useDampedPointer } from '@/hooks/useDampedPointer';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { isLowPowerDevice, isWebGLAvailable } from '@/lib/webgl';
import { damp } from '@/lib/motion';

function ReactorRig({ reducedMotion }) {
  const group = useRef(null);
  const pointer = useDampedPointer(damp.reactor);
  const { camera } = useThree();
  const camCurrent = useRef({ z: 3.5, fov: 32 });

  useFrame((_, delta) => {
    if (!group.current) return;
    const t = reactorScroll.target;
    const k = reducedMotion ? 1 : 1 - Math.exp(-6 * delta);

    // Soft hover parallax — kept small so it doesn't fight top-front reveal
    const tx = pointer.current.x * 0.08;
    const ty = -pointer.current.y * 0.055;
    group.current.rotation.y += (tx - group.current.rotation.y) * k;
    group.current.rotation.x += (ty - group.current.rotation.x) * k;

    if (t?.camera) {
      camCurrent.current.z += ((t.camera.z ?? 3.6) - camCurrent.current.z) * k;
      camCurrent.current.fov += ((t.camera.fov ?? 34) - camCurrent.current.fov) * k;
      camera.position.z = camCurrent.current.z;
      camera.fov = camCurrent.current.fov;
      camera.updateProjectionMatrix();
    }
  });

  return (
    <group ref={group}>
      <ReactorModel reducedMotion={reducedMotion} />
    </group>
  );
}

function SceneContent({ reducedMotion, lowPower }) {
  return (
    <>
      <ambientLight intensity={0.6} color="#c8d8e8" />
      <hemisphereLight intensity={0.55} color="#e8f0f6" groundColor="#081018" />
      <directionalLight position={[2.5, 3, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-2.5, 1, 3]} intensity={0.45} color="#7aa8c8" />

      <ReactorRig reducedMotion={reducedMotion} />

      {!lowPower && (
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.22}
          scale={10}
          blur={2.4}
          far={3.5}
          color="#030a10"
        />
      )}

      {!reducedMotion && (
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={lowPower ? 0.18 : 0.28}
            luminanceThreshold={0.58}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </>
  );
}

export default function ReactorScene() {
  const { webgl } = useLabStore();
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const lowPower = useMemo(
    () => isMobile || (typeof window !== 'undefined' && isLowPowerDevice()),
    [isMobile],
  );

  useEffect(() => {
    labActions.setWebgl(isWebGLAvailable());
  }, []);

  if (!webgl) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[3]">
        <div className="absolute inset-0 flex items-center justify-center">
          <ReactorFallback />
        </div>
        <ReactorPower />
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[3]">
      <div className="absolute inset-0">
        <Canvas
          className="reactor-canvas"
          dpr={lowPower ? [1, 1.35] : [1, 1.75]}
          camera={{ position: [0, 0, 3.15], fov: 30, near: 0.1, far: 50 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.08;
          }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <SceneContent reducedMotion={reducedMotion} lowPower={lowPower} />
          </Suspense>
        </Canvas>
      </div>
      <ReactorAnnotations />
      <ReactorPower />
    </div>
  );
}

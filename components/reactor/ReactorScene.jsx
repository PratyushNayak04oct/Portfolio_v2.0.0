'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
  const camCurrent = useRef({ z: 3.15, fov: 30 });
  const lastFov = useRef(30);

  useFrame((_, delta) => {
    if (!group.current) return;
    const t = reactorScroll.target;
    const d = Math.min(delta, 1 / 30);
    const k = reducedMotion ? 1 : 1 - Math.exp(-7 * d);

    // Tiny hover — large tilt was a major lag feel on dense meshes
    const tx = pointer.current.x * 0.045;
    const ty = -pointer.current.y * 0.03;
    group.current.rotation.y += (tx - group.current.rotation.y) * k;
    group.current.rotation.x += (ty - group.current.rotation.x) * k;

    if (t?.camera) {
      camCurrent.current.z += ((t.camera.z ?? 3.6) - camCurrent.current.z) * k;
      camCurrent.current.fov += ((t.camera.fov ?? 34) - camCurrent.current.fov) * k;
      camera.position.z = camCurrent.current.z;
      if (Math.abs(camCurrent.current.fov - lastFov.current) > 0.02) {
        camera.fov = camCurrent.current.fov;
        camera.updateProjectionMatrix();
        lastFov.current = camCurrent.current.fov;
      }
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
      <ambientLight intensity={0.62} color="#c8d8e8" />
      <hemisphereLight intensity={0.5} color="#e8f0f6" groundColor="#081018" />
      <directionalLight position={[2.5, 3, 5]} intensity={1.15} color="#ffffff" />
      <directionalLight position={[-2.5, 1, 3]} intensity={0.4} color="#7aa8c8" />

      <ReactorRig reducedMotion={reducedMotion} />

      {!reducedMotion && !lowPower && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom
            intensity={0.22}
            luminanceThreshold={0.62}
            luminanceSmoothing={0.85}
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
          dpr={lowPower ? [1, 1.25] : [1, 1.5]}
          camera={{ position: [0, 0, 3.15], fov: 30, near: 0.1, far: 50 }}
          gl={{
            antialias: !lowPower,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          performance={{ min: 0.5 }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.06;
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

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
import { getReactorTarget } from '@/data/reactorStory';
import { useDampedPointer } from '@/hooks/useDampedPointer';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { isLowPowerDevice, isWebGLAvailable } from '@/lib/webgl';
import { damp } from '@/lib/motion';

function ReactorRig({ targetRef, reducedMotion }) {
  const group = useRef(null);
  const pointer = useDampedPointer(damp.reactor);
  const { camera } = useThree();
  const camCurrent = useRef({ z: 3.4, fov: 32 });

  useFrame((_, delta) => {
    if (!group.current) return;
    const t = targetRef.current;
    const k = reducedMotion ? 1 : 1 - Math.exp(-2 * delta);

    // Soft hover parallax only — never tips into a side view
    const tx = pointer.current.x * 0.1;
    const ty = -pointer.current.y * 0.07;
    group.current.rotation.y += (tx - group.current.rotation.y) * k;
    group.current.rotation.x += (ty - group.current.rotation.x) * k;

    if (t?.camera) {
      camCurrent.current.z += ((t.camera.z ?? 3.8) - camCurrent.current.z) * k;
      camCurrent.current.fov += ((t.camera.fov ?? 34) - camCurrent.current.fov) * k;
      camera.position.z = camCurrent.current.z;
      camera.fov = camCurrent.current.fov;
      camera.updateProjectionMatrix();
    }
  });

  return (
    <group ref={group}>
      <ReactorModel targetRef={targetRef} reducedMotion={reducedMotion} />
    </group>
  );
}

function SceneContent({ targetRef, reducedMotion, lowPower }) {
  return (
    <>
      <ambientLight intensity={0.55} color="#c5e4f0" />
      <hemisphereLight intensity={0.5} color="#e8f4fa" groundColor="#081018" />
      <directionalLight position={[2.5, 3, 5]} intensity={1.15} color="#ffffff" />
      <directionalLight position={[-2.5, 1, 3]} intensity={0.4} color="#5aa8e0" />

      <ReactorRig targetRef={targetRef} reducedMotion={reducedMotion} />

      {!lowPower && (
        <ContactShadows
          position={[0, -1.7, 0]}
          opacity={0.25}
          scale={12}
          blur={2.6}
          far={4}
          color="#030a10"
        />
      )}

      {!reducedMotion && (
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={lowPower ? 0.2 : 0.3}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </>
  );
}

export default function ReactorScene() {
  const { activeSection, webgl } = useLabStore();
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const targetRef = useRef(getReactorTarget('hero'));
  const lowPower = useMemo(
    () => isMobile || (typeof window !== 'undefined' && isLowPowerDevice()),
    [isMobile],
  );

  useEffect(() => {
    labActions.setWebgl(isWebGLAvailable());
  }, []);

  useEffect(() => {
    targetRef.current = getReactorTarget(activeSection);
  }, [activeSection]);

  if (!webgl) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[5]">
        <div className="absolute inset-0 flex items-center justify-center">
          <ReactorFallback />
        </div>
        <ReactorPower />
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[5]">
      <div className="absolute inset-0">
        <Canvas
          className="reactor-canvas"
          dpr={lowPower ? [1, 1.35] : [1, 1.75]}
          camera={{ position: [0, 0, 3.4], fov: 32, near: 0.1, far: 50 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <SceneContent
              targetRef={targetRef}
              reducedMotion={reducedMotion}
              lowPower={lowPower}
            />
          </Suspense>
        </Canvas>
      </div>
      <ReactorAnnotations />
      <ReactorPower />
    </div>
  );
}

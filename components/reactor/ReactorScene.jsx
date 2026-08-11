'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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

function ReactorRig({ reducedMotion, lowPower }) {
  const group = useRef(null);
  const pointer = useDampedPointer(damp.reactor);
  const { camera, invalidate } = useThree();
  const camCurrent = useRef({ z: 3.15, fov: 30 });
  const lastFov = useRef(30);
  const frameSkip = useRef(0);

  /* eslint-disable react-hooks/immutability */
  useFrame((_, delta) => {
    if (!group.current) return;
    // On low-power devices, update every other frame
    if (lowPower) {
      frameSkip.current ^= 1;
      if (frameSkip.current === 0) return;
    }

    const t = reactorScroll.target;
    const d = Math.min(delta, 1 / 30);
    const k = reducedMotion ? 1 : 1 - Math.exp(-7 * d);

    if (!lowPower && !reducedMotion) {
      const tx = pointer.current.x * 0.035;
      const ty = -pointer.current.y * 0.024;
      group.current.rotation.y += (tx - group.current.rotation.y) * k;
      group.current.rotation.x += (ty - group.current.rotation.x) * k;
    }

    if (t?.camera) {
      camCurrent.current.z += ((t.camera.z ?? 3.6) - camCurrent.current.z) * k;
      camCurrent.current.fov += ((t.camera.fov ?? 34) - camCurrent.current.fov) * k;
      camera.position.z = camCurrent.current.z;
      if (Math.abs(camCurrent.current.fov - lastFov.current) > 0.05) {
        camera.fov = camCurrent.current.fov;
        camera.updateProjectionMatrix();
        lastFov.current = camCurrent.current.fov;
      }
    }
    invalidate();
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <group ref={group}>
      <ReactorModel reducedMotion={reducedMotion} />
    </group>
  );
}

function SceneContent({ reducedMotion, lowPower }) {
  return (
    <>
      <ambientLight intensity={0.48} color="#d0d6de" />
      <hemisphereLight intensity={0.28} color="#e8e0d6" groundColor="#081018" />
      <directionalLight
        position={[2.5, 3, 5]}
        intensity={lowPower ? 0.85 : 1.0}
        color="#fff4ea"
      />
      <directionalLight position={[-2.0, 1.0, 2.5]} intensity={0.28} color="#d4a078" />
      <ReactorRig reducedMotion={reducedMotion} lowPower={lowPower} />
    </>
  );
}

export default function ReactorScene() {
  const webgl = useLabStore((s) => s.webgl);
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const [pageVisible, setPageVisible] = useState(true);
  const lowPower = useMemo(
    () => isMobile || (typeof window !== 'undefined' && isLowPowerDevice()),
    [isMobile],
  );

  useEffect(() => {
    labActions.setWebgl(isWebGLAvailable());
  }, []);

  useEffect(() => {
    const onVis = () => setPageVisible(document.visibilityState === 'visible');
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
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
          dpr={1}
          frameloop={pageVisible ? 'always' : 'never'}
          camera={{ position: [0, 0, 3.15], fov: 30, near: 0.1, far: 36 }}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          performance={{ min: 0.25, debounce: 300 }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            gl.setPixelRatio(1);
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.95;
          }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <SceneContent reducedMotion={reducedMotion} lowPower={lowPower} />
          </Suspense>
        </Canvas>
      </div>
      {!lowPower ? <ReactorAnnotations /> : null}
      <ReactorPower />
    </div>
  );
}

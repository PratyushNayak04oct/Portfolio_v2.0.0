'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import ReactorLayers from './ReactorLayers';
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
  const camCurrent = useRef({ z: 5.2, fov: 42 });

  useFrame((_, delta) => {
    if (!group.current) return;
    const t = targetRef.current;
    const k = reducedMotion ? 1 : 1 - Math.exp(-1.8 * delta);

    const tx = pointer.current.x * 0.25;
    const ty = -pointer.current.y * 0.18;
    group.current.rotation.y += (tx - group.current.rotation.y) * k;
    group.current.rotation.x += (ty - group.current.rotation.x) * k;

    if (t?.camera) {
      camCurrent.current.z += (t.camera.z - camCurrent.current.z) * k;
      camCurrent.current.fov += (t.camera.fov - camCurrent.current.fov) * k;
      camera.position.z = camCurrent.current.z;
      camera.fov = camCurrent.current.fov;
      camera.updateProjectionMatrix();
    }
  });

  return (
    <group ref={group}>
      <ReactorLayers targetRef={targetRef} reducedMotion={reducedMotion} />
    </group>
  );
}

function SceneContent({ targetRef, reducedMotion, lowPower }) {
  return (
    <>
      <ambientLight intensity={0.25} color="#63c7d9" />
      <directionalLight
        position={[4, 3, 5]}
        intensity={0.65}
        color="#e8f0f4"
      />
      <directionalLight
        position={[-3, -2, 2]}
        intensity={0.25}
        color="#2678ff"
      />

      <ReactorRig targetRef={targetRef} reducedMotion={reducedMotion} />

      {!lowPower && (
        <ContactShadows
          position={[0, -1.6, 0]}
          opacity={0.35}
          scale={8}
          blur={2.5}
          far={3}
        />
      )}

      {!reducedMotion && !lowPower && (
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.35}
            luminanceThreshold={0.7}
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
    const ok = isWebGLAvailable();
    labActions.setWebgl(ok);
  }, []);

  useEffect(() => {
    targetRef.current = getReactorTarget(activeSection);
  }, [activeSection]);

  if (!webgl) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[5]">
        <ReactorFallback />
        <ReactorPower />
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[5]">
      <div className="absolute inset-0 lg:left-[45%]">
        <Canvas
          className="reactor-canvas"
          dpr={lowPower ? [1, 1.25] : [1, 1.75]}
          camera={{ position: [0, 0, 5.2], fov: 42, near: 0.1, far: 50 }}
          gl={{
            antialias: !lowPower,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
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

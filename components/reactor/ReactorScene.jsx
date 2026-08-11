'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
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

  /* eslint-disable react-hooks/immutability */
  useFrame((_, delta) => {
    if (!group.current) return;
    const t = reactorScroll.target;
    const d = Math.min(delta, 1 / 30);
    const k = reducedMotion ? 1 : 1 - Math.exp(-7 * d);

    const tx = pointer.current.x * 0.04;
    const ty = -pointer.current.y * 0.028;
    group.current.rotation.y += (tx - group.current.rotation.y) * k;
    group.current.rotation.x += (ty - group.current.rotation.x) * k;

    if (t?.camera) {
      camCurrent.current.z += ((t.camera.z ?? 3.6) - camCurrent.current.z) * k;
      camCurrent.current.fov += ((t.camera.fov ?? 34) - camCurrent.current.fov) * k;
      camera.position.z = camCurrent.current.z;
      if (Math.abs(camCurrent.current.fov - lastFov.current) > 0.04) {
        camera.fov = camCurrent.current.fov;
        camera.updateProjectionMatrix();
        lastFov.current = camCurrent.current.fov;
      }
    }
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <group ref={group}>
      <ReactorModel reducedMotion={reducedMotion} />
    </group>
  );
}

function MetalEnvironment() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const envScene = new RoomEnvironment();
    const envMap = pmrem.fromScene(envScene, 0.04).texture;
    scene.environment = envMap;
    envScene.dispose?.();
    return () => {
      scene.environment = null;
      envMap.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return null;
}

function SceneContent({ reducedMotion, lowPower }) {
  return (
    <>
      <MetalEnvironment />
      <ambientLight intensity={0.42} color="#d8dde4" />
      <hemisphereLight intensity={0.35} color="#efe6dc" groundColor="#081018" />
      <directionalLight position={[2.5, 3, 5]} intensity={lowPower ? 0.95 : 1.15} color="#fff6ee" />
      <directionalLight position={[-2.2, 1.2, 2.8]} intensity={0.55} color="#ffb280" />
      <ReactorRig reducedMotion={reducedMotion} />
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
          camera={{ position: [0, 0, 3.15], fov: 30, near: 0.1, far: 40 }}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          performance={{ min: 0.3, debounce: 250 }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            gl.setPixelRatio(1);
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
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

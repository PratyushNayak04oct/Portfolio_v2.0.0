'use client';

import { Suspense, useState, useSyncExternalStore } from 'react';
import { Canvas } from '@react-three/fiber';
import BrunoModel from './BrunoModel';
import { useBrunoController } from './BrunoController';
import { useLabStore } from '@/lib/labStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const subscribeNoop = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

function BrunoCanvas({ state }) {
  const isMobile = useIsMobile();
  return (
    <Canvas
      dpr={isMobile ? [1, 1.2] : [1, 1.5]}
      camera={{ position: [1.85, 1.15, 2.55], fov: 28 }}
      gl={{
        antialias: !isMobile,
        alpha: true,
        toneMappingExposure: 1.25,
        powerPreference: 'high-performance',
      }}
      performance={{ min: 0.5 }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <ambientLight intensity={0.7} color="#e8eef2" />
      <directionalLight position={[2.5, 3.5, 2]} intensity={1.45} color="#fff6e8" />
      <directionalLight position={[-2, 1.2, 1]} intensity={0.55} color="#ffd2a0" />
      <directionalLight position={[0, 2, -2]} intensity={0.3} color="#8ad4e8" />
      <Suspense fallback={null}>
        <BrunoModel state={state} />
      </Suspense>
    </Canvas>
  );
}

export default function BrunoScene() {
  const { webgl, loaded } = useLabStore();
  const { state, triggerInteraction } = useBrunoController();
  const reducedMotion = usePrefersReducedMotion();
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientMounted,
    getServerMounted,
  );
  const [hello, setHello] = useState(false);

  if (!mounted || !loaded) return null;

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-30 w-[200px] md:bottom-5 md:right-5 md:w-[260px]">
      <button
        type="button"
        data-cursor="interactive"
        onClick={triggerInteraction}
        onPointerEnter={(e) => {
          setHello(true);
          if (e.pointerType === 'mouse' && !reducedMotion) triggerInteraction();
        }}
        onPointerLeave={() => setHello(false)}
        aria-label="Hi, my name is B.R.U.N.O."
        className="pointer-events-auto group relative block w-full overflow-visible text-left"
      >
        <span
          className={`pointer-events-none absolute -top-11 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan/35 bg-secondary/92 px-3 py-1.5 font-mono text-tech uppercase tracking-[0.14em] text-cyan shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 ${
            hello
              ? 'translate-y-0 opacity-100'
              : 'translate-y-2 opacity-0'
          }`}
        >
          Hi, My Name is B.R.U.N.O.
        </span>

        <div className="relative h-[170px] md:h-[220px]">
          {webgl ? (
            <BrunoCanvas state={state} />
          ) : (
            <div
              className="flex h-full items-end justify-center pb-2"
              aria-hidden="true"
            >
              <div className="h-20 w-24 rounded-t-[40%] border border-cyan/25 bg-gradient-to-b from-surface/80 to-transparent" />
            </div>
          )}
        </div>
      </button>
    </div>
  );
}

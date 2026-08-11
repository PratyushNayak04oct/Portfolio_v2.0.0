'use client';

import { Suspense, useState, useSyncExternalStore } from 'react';
import { Canvas } from '@react-three/fiber';
import BrunoModel from './BrunoModel';
import { useBrunoController } from './BrunoController';
import { useLabStore } from '@/lib/labStore';
import { useIsMobile } from '@/hooks/useMediaQuery';

const subscribeNoop = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

function BrunoCanvas({ state }) {
  const isMobile = useIsMobile();
  return (
    <Canvas
      dpr={isMobile ? [1, 1.15] : [1, 1.4]}
      camera={{ position: [1.85, 1.15, 2.55], fov: 30 }}
      gl={{
        antialias: !isMobile,
        alpha: true,
        toneMappingExposure: 1.28,
        powerPreference: 'high-performance',
      }}
      performance={{ min: 0.5 }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <ambientLight intensity={0.58} color="#e4eaf0" />
      <directionalLight position={[2.8, 3.8, 2.2]} intensity={1.5} color="#fff8f0" />
      <directionalLight position={[-2.2, 1.4, 1]} intensity={0.4} color="#c8d8e8" />
      <directionalLight position={[1, 2, -1.5]} intensity={0.35} color="#e8c878" />
      <Suspense fallback={null}>
        <BrunoModel state={state} />
      </Suspense>
    </Canvas>
  );
}

/** Companion dock — lives in the site footer (not fixed overlay). */
export default function BrunoScene() {
  const { webgl, loaded } = useLabStore();
  const { state, onHoverStart, onHoverEnd, onTap } = useBrunoController();
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientMounted,
    getServerMounted,
  );
  const [hello, setHello] = useState(false);

  if (!mounted) return null;

  return (
    <div
      className={`pointer-events-none relative z-10 mx-auto w-[140px] transition-opacity duration-700 ease-out sm:mx-0 sm:w-[168px] md:w-[190px] ${
        loaded ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <button
        type="button"
        data-cursor="interactive"
        onClick={onTap}
        onPointerEnter={() => {
          setHello(true);
          onHoverStart();
        }}
        onPointerLeave={() => {
          setHello(false);
          onHoverEnd();
        }}
        aria-label="Hi, my name is B.R.U.N.O."
        className="pointer-events-auto group relative block w-full overflow-visible text-left"
      >
        <span
          className={`pointer-events-none absolute -top-9 left-1/2 z-10 max-w-[90vw] -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan/35 bg-secondary/92 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-cyan shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 sm:text-tech sm:tracking-[0.14em] ${
            hello ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          }`}
        >
          Hi, My Name is B.R.U.N.O.
        </span>

        <div className="relative h-[120px] sm:h-[140px] md:h-[155px]">
          {webgl ? (
            <BrunoCanvas state={state} />
          ) : (
            <div
              className="flex h-full items-end justify-center pb-2"
              aria-hidden="true"
            >
              <div className="h-12 w-14 rounded-t-[40%] border border-cyan/25 bg-gradient-to-b from-surface/80 to-transparent sm:h-14 sm:w-16" />
            </div>
          )}
        </div>
      </button>
    </div>
  );
}

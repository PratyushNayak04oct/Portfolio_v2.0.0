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
      dpr={isMobile ? [1, 1.2] : [1, 1.4]}
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
      className={`pointer-events-none fixed z-30 w-[150px] transition-opacity duration-700 ease-out safe-pad-b sm:w-[172px] md:w-[210px] ${
        loaded ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        right: 'max(0.75rem, env(safe-area-inset-right))',
        bottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
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
          className={`pointer-events-none absolute -top-9 left-1/2 z-10 max-w-[90vw] -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan/35 bg-secondary/92 px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-cyan shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 sm:-top-10 sm:px-3 sm:py-1.5 sm:text-tech sm:tracking-[0.14em] ${
            hello ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          }`}
        >
          Hi, My Name is B.R.U.N.O.
        </span>

        <div className="relative h-[128px] sm:h-[150px] md:h-[175px]">
          {webgl ? (
            <BrunoCanvas state={state} />
          ) : (
            <div
              className="flex h-full items-end justify-center pb-2"
              aria-hidden="true"
            >
              <div className="h-14 w-16 rounded-t-[40%] border border-cyan/25 bg-gradient-to-b from-surface/80 to-transparent sm:h-16 sm:w-20" />
            </div>
          )}
        </div>
      </button>
    </div>
  );
}

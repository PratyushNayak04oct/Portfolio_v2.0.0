'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import BrunoModel from './BrunoModel';
import { useBrunoController } from './BrunoController';
import { useLabStore } from '@/lib/labStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

function BrunoCanvas({ state }) {
  const isMobile = useIsMobile();
  return (
    <Canvas
      dpr={isMobile ? [1, 1.2] : [1, 1.4]}
      camera={{ position: [1.6, 1.05, 2.35], fov: 30 }}
      gl={{
        antialias: !isMobile,
        alpha: true,
        toneMappingExposure: 1.2,
        powerPreference: 'high-performance',
      }}
      performance={{ min: 0.5 }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <ambientLight intensity={0.65} color="#c5e4f0" />
      <directionalLight position={[2.5, 3.5, 2]} intensity={1.25} color="#ffffff" />
      <directionalLight position={[-2, 1, -1]} intensity={0.35} color="#7ec8ff" />
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
  const [mounted, setMounted] = useState(false);
  const [hello, setHello] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !loaded) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-30 w-[150px] md:bottom-6 md:right-6 md:w-[190px]">
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
        {/* Greeting tooltip */}
        <span
          className={`pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan/30 bg-secondary/90 px-3 py-1.5 font-mono text-tech uppercase tracking-[0.14em] text-cyan shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-300 ${
            hello
              ? 'translate-y-0 opacity-100'
              : 'translate-y-2 opacity-0'
          }`}
        >
          Hi, My Name is B.R.U.N.O.
        </span>

        <div className="relative h-[130px] md:h-[160px]">
          {webgl ? (
            <BrunoCanvas state={state} />
          ) : (
            <div
              className="flex h-full items-end justify-center pb-2"
              aria-hidden="true"
            >
              <div className="h-16 w-20 rounded-t-[40%] border border-cyan/25 bg-gradient-to-b from-surface/80 to-transparent" />
            </div>
          )}
        </div>
      </button>
    </div>
  );
}

'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import BrunoModel from './BrunoModel';
import { useBrunoController } from './BrunoController';
import { useLabStore } from '@/lib/labStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import StatusIndicator from '@/components/ui/StatusIndicator';

/** Section-driven stage positions — BRUNO travels with the visitor */
const STAGE = {
  about: {
    className:
      'left-4 bottom-6 md:left-10 md:bottom-10 lg:left-[8%] lg:bottom-16',
  },
  experience: {
    className:
      'left-1/2 bottom-6 -translate-x-1/2 md:bottom-10 lg:left-[22%] lg:translate-x-0 lg:bottom-14',
  },
  projects: {
    className:
      'right-4 bottom-6 md:right-10 md:bottom-12 lg:right-[6%] lg:bottom-20',
  },
  lab: {
    className:
      'right-4 bottom-[28%] md:right-12 lg:right-[18%] lg:bottom-[32%]',
  },
  contact: {
    className:
      'left-1/2 bottom-8 -translate-x-1/2 md:bottom-12 lg:left-[58%] lg:translate-x-0 lg:bottom-16',
  },
};

function BrunoCanvas({ state, reducedMotion }) {
  const isMobile = useIsMobile();
  return (
    <Canvas
      dpr={isMobile ? [1, 1.35] : [1, 1.7]}
      camera={{ position: [2.1, 1.35, 2.9], fov: 32 }}
      gl={{ antialias: true, alpha: true, toneMappingExposure: 1.3 }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <ambientLight intensity={0.7} color="#c5e4f0" />
      <hemisphereLight intensity={0.6} color="#e8f4f8" groundColor="#1a2430" />
      <directionalLight position={[3, 4, 2]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-2, 1, -1]} intensity={0.45} color="#7ec8ff" />
      <Suspense fallback={null}>
        <BrunoModel state={state} />
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.5}
          scale={5}
          blur={2.2}
          far={2.5}
        />
        {!reducedMotion && (
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.55}
              luminanceThreshold={0.4}
              luminanceSmoothing={0.8}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}

export default function BrunoScene() {
  const { activeSection, brunoStatus, webgl } = useLabStore();
  const { state, triggerInteraction } = useBrunoController();
  const reducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  const visible = useMemo(
    () =>
      ['about', 'experience', 'projects', 'lab', 'contact'].includes(
        activeSection,
      ),
    [activeSection],
  );

  const stage = STAGE[activeSection] || STAGE.about;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div
      className={`fixed z-30 w-[200px] transition-all duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:w-[260px] ${stage.className} ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <button
        type="button"
        data-cursor="interactive"
        onClick={triggerInteraction}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') triggerInteraction();
        }}
        aria-label="Interact with B.R.U.N.O. — tap or hover to play"
        className="glass-panel group block w-full overflow-hidden rounded-2xl text-left shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-transform duration-500 hover:-translate-y-1"
      >
        <div className="relative h-[160px] md:h-[200px]">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                'radial-gradient(circle at 50% 70%, rgba(38,120,255,0.22), transparent 55%)',
            }}
          />
          {webgl ? (
            <BrunoCanvas state={state} reducedMotion={reducedMotion} />
          ) : (
            <div
              className="flex h-full items-end justify-center p-4"
              aria-hidden="true"
            >
              <div className="h-20 w-28 rounded-t-[40%] border border-cyan/30 bg-gradient-to-b from-surface to-primary" />
            </div>
          )}
        </div>
        <div className="border-t border-white/5 px-4 py-3">
          <p className="font-mono text-tech uppercase tracking-[0.16em] text-ink">
            B.R.U.N.O.
          </p>
          <StatusIndicator label="STATUS" value={brunoStatus} className="mt-1" />
        </div>
      </button>
    </div>
  );
}

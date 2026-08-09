'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import BrunoModel from './BrunoModel';
import { useBrunoController } from './BrunoController';
import { useLabStore } from '@/lib/labStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import StatusIndicator from '@/components/ui/StatusIndicator';

function BrunoCanvas({ state }) {
  const isMobile = useIsMobile();
  return (
    <Canvas
      dpr={isMobile ? [1, 1.25] : [1, 1.6]}
      camera={{ position: [1.8, 1.2, 2.8], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.35} color="#63c7d9" />
      <directionalLight position={[3, 4, 2]} intensity={0.8} />
      <Suspense fallback={null}>
        <BrunoModel state={state} />
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.4}
          scale={4}
          blur={2}
          far={2}
        />
      </Suspense>
    </Canvas>
  );
}

export default function BrunoScene() {
  const { activeSection, brunoStatus, webgl } = useLabStore();
  const { state, triggerInteraction } = useBrunoController();

  const visible = ['about', 'experience', 'projects', 'lab', 'contact'].includes(
    activeSection,
  );

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-30 w-[180px] transition-opacity duration-700 md:bottom-8 md:right-8 md:w-[240px] ${
        visible ? 'opacity-100' : 'opacity-0'
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
        className="block w-full overflow-hidden border border-line/70 bg-secondary/50 text-left"
      >
        <div className="h-[140px] md:h-[180px]">
          {webgl ? (
            <BrunoCanvas state={state} />
          ) : (
            <div
              className="flex h-full items-end justify-center bg-primary p-4"
              aria-hidden="true"
            >
              <div className="h-16 w-24 rounded-t-full bg-surface border border-line" />
            </div>
          )}
        </div>
        <div className="border-t border-line/60 px-3 py-2">
          <p className="font-mono text-tech uppercase text-ink">B.R.U.N.O.</p>
          <StatusIndicator label="STATUS" value={brunoStatus} className="mt-1" />
        </div>
      </button>
    </div>
  );
}

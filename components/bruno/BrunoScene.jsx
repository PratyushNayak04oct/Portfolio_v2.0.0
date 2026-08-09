'use client';

import { Suspense, useState, useSyncExternalStore } from 'react';
import { Canvas } from '@react-three/fiber';
import BrunoModel from './BrunoModel';
import { useBrunoController } from './BrunoController';
import { brunoMenuActions } from '@/data/brunoStates';
import { useLabStore } from '@/lib/labStore';
import { useIsMobile } from '@/hooks/useMediaQuery';

const subscribeNoop = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

function BrunoCanvas({ state, facing }) {
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
      <ambientLight intensity={0.55} color="#dce4ec" />
      <directionalLight position={[2.8, 3.8, 2.2]} intensity={1.55} color="#ffffff" />
      <directionalLight position={[-2.2, 1.4, 1]} intensity={0.45} color="#9ec8ff" />
      <directionalLight position={[0.5, 2, -2]} intensity={0.35} color="#ff7070" />
      <Suspense fallback={null}>
        <BrunoModel state={state} facing={facing} />
      </Suspense>
    </Canvas>
  );
}

export default function BrunoScene() {
  const { webgl, loaded } = useLabStore();
  const { state, runOffset, playAction } = useBrunoController();
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientMounted,
    getServerMounted,
  );
  const [menuOpen, setMenuOpen] = useState(false);

  if (!mounted || !loaded) return null;

  // Face left while running outward, right when returning
  const facing = runOffset < -8 ? -1 : 1;

  return (
    <div
      className="pointer-events-none fixed bottom-3 right-3 z-30 w-[200px] md:bottom-5 md:right-5 md:w-[260px]"
      style={{
        transform: `translate3d(${runOffset}px, 0, 0)`,
        transition: runOffset === 0 ? 'transform 0.35s ease' : 'none',
        willChange: 'transform',
      }}
      onPointerEnter={() => setMenuOpen(true)}
      onPointerLeave={() => setMenuOpen(false)}
    >
      {/* Action menu */}
      <div
        className={`pointer-events-auto absolute bottom-[calc(100%+10px)] right-0 z-20 flex flex-col items-end gap-1.5 transition-all duration-300 ${
          menuOpen
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-2 opacity-0'
        }`}
      >
        <p className="mb-1 rounded-full border border-cyan/30 bg-secondary/90 px-3 py-1 font-mono text-tech uppercase tracking-[0.14em] text-cyan backdrop-blur-md">
          Hi, I&apos;m B.R.U.N.O.
        </p>
        <div className="flex flex-wrap justify-end gap-1.5">
          {brunoMenuActions.map((action) => (
            <button
              key={action.id}
              type="button"
              data-cursor="interactive"
              onClick={() => playAction(action.id)}
              className="rounded-full border border-white/10 bg-primary/90 px-3 py-1.5 font-mono text-tech uppercase tracking-[0.12em] text-ink-secondary shadow-[0_6px_18px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors duration-200 hover:border-cyan/40 hover:text-cyan"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="pointer-events-auto relative h-[170px] md:h-[220px]"
        role="img"
        aria-label="B.R.U.N.O. mechanical companion"
      >
        {webgl ? (
          <BrunoCanvas state={state} facing={facing} />
        ) : (
          <div
            className="flex h-full items-end justify-center pb-2"
            aria-hidden="true"
          >
            <div className="h-20 w-24 rounded-t-[40%] border border-cyan/25 bg-gradient-to-b from-surface/80 to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}

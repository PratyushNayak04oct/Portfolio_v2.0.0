'use client';

import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Canvas } from '@react-three/fiber';
import BrunoModel from './BrunoModel';
import { BRUNO_STATES } from '@/data/brunoStates';
import { useLabStore } from '@/lib/labStore';
import { useIsMobile } from '@/hooks/useMediaQuery';

const subscribeNoop = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

function BrunoCanvas() {
  const isMobile = useIsMobile();
  return (
    <Canvas
      dpr={1}
      camera={{ position: [1.85, 1.15, 2.55], fov: 30 }}
      gl={{
        antialias: false,
        alpha: true,
        toneMappingExposure: 1.12,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      performance={{ min: 0.35, debounce: 250 }}
      frameloop="always"
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.setPixelRatio(1);
      }}
    >
      <ambientLight intensity={0.55} color="#e4eaf0" />
      <directionalLight position={[2.8, 3.8, 2.2]} intensity={1.35} color="#fff8f0" />
      <directionalLight position={[-2.2, 1.4, 1]} intensity={0.35} color="#c8d8e8" />
      <Suspense fallback={null}>
        <BrunoModel state={BRUNO_STATES.Wag} />
      </Suspense>
    </Canvas>
  );
}

/** Companion dock — happy wag only, greeting on hover. */
export default function BrunoScene() {
  const webgl = useLabStore((s) => s.webgl);
  const loaded = useLabStore((s) => s.loaded);
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientMounted,
    getServerMounted,
  );
  const rootRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [hello, setHello] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '80px', threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={rootRef}
      className={`pointer-events-none relative z-10 mx-auto w-[168px] transition-opacity duration-700 ease-out sm:mx-0 sm:w-[200px] md:w-[230px] ${
        loaded ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="pointer-events-auto relative">
        <button
          type="button"
          data-cursor="interactive"
          onPointerEnter={() => setHello(true)}
          onPointerLeave={() => setHello(false)}
          onFocus={() => setHello(true)}
          onBlur={() => setHello(false)}
          aria-label="Hi my name is B.R.U.N.O. Thank you for visiting the website."
          className="group relative block w-full overflow-visible text-left"
        >
          <span
            className={`pointer-events-none absolute bottom-[92%] left-1/2 z-10 w-[min(92vw,220px)] -translate-x-1/2 rounded-2xl border border-cyan/35 bg-secondary/94 px-3 py-2 text-center font-mono text-[0.58rem] leading-snug tracking-[0.04em] text-cyan shadow-[0_10px_28px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-300 sm:text-[0.62rem] ${
              hello ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            Hi my name is B.R.U.N.O.
            <span className="mt-1 block text-ink-secondary normal-case tracking-normal">
              Thank you for visiting the website.
            </span>
          </span>

          <div className="relative h-[148px] sm:h-[172px] md:h-[196px]">
            {webgl && inView ? (
              <BrunoCanvas />
            ) : (
              <div
                className="flex h-full items-end justify-center pb-2"
                aria-hidden="true"
              >
                <div className="h-14 w-16 rounded-t-[40%] border border-cyan/25 bg-gradient-to-b from-surface/80 to-transparent sm:h-16 sm:w-[4.5rem]" />
              </div>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}

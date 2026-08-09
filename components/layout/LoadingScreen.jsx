'use client';

import { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { labActions, useLabStore } from '@/lib/labStore';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// Warm the reactor asset during the core ignition sequence
useGLTF.preload('/models/reactor.glb?v=8');

const TICK_MS = 2400;
const FAILSAFE_MS = 7000;

function easeInCubic(t) {
  return t * t * t;
}

function getDockPoint() {
  const slot = document.querySelector('[data-hero="reactor-slot"]');
  if (slot) {
    const r = slot.getBoundingClientRect();
    return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.48 };
  }
  // Fallback: hero reactor sits on the right half
  return {
    x: window.innerWidth * (window.innerWidth >= 1024 ? 0.72 : 0.5),
    y: window.innerHeight * 0.52,
  };
}

export default function LoadingScreen() {
  const { loaded, coreDocked } = useLabStore();
  const reduced = usePrefersReducedMotion();
  const [hide, setHide] = useState(false);
  const [phase, setPhase] = useState('tick'); // tick | climax | reveal | fly | done
  const [glow, setGlow] = useState(0.35);
  const [chromeOpacity, setChromeOpacity] = useState(1);
  const [veilOpacity, setVeilOpacity] = useState(1);
  const coreRef = useRef(null);
  const finished = useRef(false);

  useEffect(() => {
    if (reduced) {
      labActions.setLoaded(true);
      labActions.setCoreDocked(true);
      setHide(true);
      return undefined;
    }

    const started = performance.now();
    let raf = 0;
    let climaxAt = 0;
    let flyStarted = 0;
    let flyFrom = { x: 0, y: 0 };
    let flyTo = { x: 0, y: 0 };
    let localPhase = 'tick';

    const finishFly = () => {
      if (finished.current) return;
      finished.current = true;
      localPhase = 'done';
      setPhase('done');
      labActions.setCoreDocked(true);
      setVeilOpacity(0);
      window.setTimeout(() => setHide(true), 420);
    };

    const tick = (now) => {
      if (localPhase === 'tick') {
        const t = Math.min(1, (now - started) / TICK_MS);
        // Accelerating bomb ticks — on/off glow that gets faster
        const freq = 2.2 + easeInCubic(t) * 10;
        const pulse = (Math.sin(t * Math.PI * 2 * freq) + 1) * 0.5;
        const amp = 0.25 + t * 0.55;
        setGlow(0.2 + pulse * amp);

        if (coreRef.current) {
          const scale = 1 + pulse * 0.08 * (0.4 + t);
          coreRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
        }

        if (t >= 1) {
          localPhase = 'climax';
          climaxAt = now;
          setPhase('climax');
          setGlow(1);
          if (coreRef.current) {
            coreRef.current.style.transform = 'translate(-50%, -50%) scale(1.28)';
          }
        }
      } else if (localPhase === 'climax') {
        const c = Math.min(1, (now - climaxAt) / 420);
        setGlow(0.85 + c * 0.15);
        if (c >= 1) {
          localPhase = 'reveal';
          setPhase('reveal');
          setChromeOpacity(0);
          // Site comes online under the flying core
          labActions.setLoaded(true);
          climaxAt = now;
        }
      } else if (localPhase === 'reveal') {
        const r = Math.min(1, (now - climaxAt) / 380);
        setVeilOpacity(1 - r * 0.92);
        setGlow(1);
        if (r >= 1) {
          localPhase = 'fly';
          setPhase('fly');
          flyStarted = now;
          const rect = coreRef.current?.getBoundingClientRect();
          flyFrom = {
            x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
            y: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
          };
          flyTo = getDockPoint();
        }
      } else if (localPhase === 'fly') {
        const f = Math.min(1, (now - flyStarted) / 950);
        // Ease out cubic toward reactor dock
        const e = 1 - (1 - f) ** 3;
        const x = flyFrom.x + (flyTo.x - flyFrom.x) * e;
        const y = flyFrom.y + (flyTo.y - flyFrom.y) * e;
        const scale = 1.28 - e * 0.72;
        setGlow(1 - e * 0.35);
        setVeilOpacity(Math.max(0, 0.08 * (1 - e)));

        if (coreRef.current) {
          coreRef.current.style.left = `${x}px`;
          coreRef.current.style.top = `${y}px`;
          coreRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
          coreRef.current.style.opacity = String(1 - e * 0.15);
        }

        if (f >= 1) {
          finishFly();
          return;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    const failsafe = window.setTimeout(() => {
      labActions.setLoaded(true);
      finishFly();
    }, FAILSAFE_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
    };
  }, [reduced]);

  useEffect(() => {
    if (coreDocked && loaded && !hide) {
      const t = window.setTimeout(() => setHide(true), 300);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [coreDocked, loaded, hide]);

  if (hide) return null;

  const intensity = Math.min(1, Math.max(0, glow));

  return (
    <div
      className={`fixed inset-0 z-[200] ${
        phase === 'fly' || phase === 'done' || loaded
          ? 'pointer-events-none'
          : ''
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading laboratory"
    >
      {/* Opaque veil — fades as site reveals */}
      <div
        className="absolute inset-0 bg-deepest transition-opacity duration-300"
        style={{ opacity: veilOpacity }}
      />

      {/* Chrome copy — disappears after climax */}
      <div
        className="absolute inset-x-0 top-[18%] flex flex-col items-center transition-opacity duration-400"
        style={{ opacity: chromeOpacity }}
      >
        <p className="font-mono text-tech uppercase tracking-[0.22em] text-ink-muted">
          Midnight Lab // Core Ignition
        </p>
      </div>

      {/* Palladium triangle core — ticking bomb → fly into reactor */}
      <div
        ref={coreRef}
        className="absolute left-1/2 top-1/2 will-change-transform"
        style={{
          width: 'min(28vw, 180px)',
          height: 'min(28vw, 180px)',
          transform: 'translate(-50%, -50%)',
          filter: `drop-shadow(0 0 ${18 + intensity * 48}px rgba(200,230,255,${0.35 + intensity * 0.55})) drop-shadow(0 0 ${40 + intensity * 80}px rgba(99,199,217,${0.2 + intensity * 0.45}))`,
        }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="pd-core" x1="20%" y1="10%" x2="80%" y2="90%">
              <stop offset="0%" stopColor="#f4f8fc" />
              <stop offset="45%" stopColor="#c8dcec" />
              <stop offset="100%" stopColor="#8eb4d0" />
            </linearGradient>
            <filter id="pd-soft">
              <feGaussianBlur stdDeviation="1.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <polygon
            points="50,12 88,82 12,82"
            fill="url(#pd-core)"
            stroke={`rgba(220,240,255,${0.45 + intensity * 0.5})`}
            strokeWidth="1.5"
            filter="url(#pd-soft)"
            opacity={0.75 + intensity * 0.25}
          />
          <polygon
            points="50,28 74,72 26,72"
            fill={`rgba(230,245,255,${0.15 + intensity * 0.55})`}
            stroke={`rgba(180,220,245,${0.3 + intensity * 0.5})`}
            strokeWidth="0.8"
          />
        </svg>
      </div>

      <p
        className="absolute bottom-[16%] left-1/2 -translate-x-1/2 font-mono text-tech uppercase tracking-[0.2em] text-cyan transition-opacity duration-400"
        style={{ opacity: chromeOpacity * (0.5 + intensity * 0.5) }}
      >
        {phase === 'tick' ? 'Charging' : phase === 'climax' ? 'Critical' : 'Docking'}
      </p>
    </div>
  );
}

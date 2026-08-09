'use client';

import { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { labActions, useLabStore } from '@/lib/labStore';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import CoreEmblem from '@/components/ui/CoreEmblem';

useGLTF.preload('/models/reactor.glb?v=9');

const TICK_MS = 4800;
const CLIMAX_MS = 900;
const REVEAL_MS = 700;
const FLY_MS = 2000;
const SETTLE_MS = 420;
const FAILSAFE_MS = 14000;

function easeInCubic(t) {
  return t * t * t;
}

function easeInOutQuint(t) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function quadBezier(p0, p1, p2, t) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

function getNavDockPoint() {
  const slot = document.querySelector('[data-nav-core]');
  if (slot) {
    const r = slot.getBoundingClientRect();
    return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.5 };
  }
  // Fallback: top-left brand area
  return { x: 56, y: 36 };
}

export default function LoadingScreen() {
  const { loaded, coreDocked } = useLabStore();
  const reduced = usePrefersReducedMotion();
  const [hide, setHide] = useState(false);
  const [phase, setPhase] = useState('tick');
  const [glow, setGlow] = useState(0.35);
  const [progress, setProgress] = useState(0);
  const [chromeOpacity, setChromeOpacity] = useState(1);
  const [veilOpacity, setVeilOpacity] = useState(1);
  const [loaderOpacity, setLoaderOpacity] = useState(1);
  const [coreSize, setCoreSize] = useState(168);
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
    let phaseAt = 0;
    let flyStarted = 0;
    let settleStarted = 0;
    let flyFrom = { x: 0, y: 0 };
    let flyTo = { x: 0, y: 0 };
    let flyCtrl = { x: 0, y: 0 };
    let localPhase = 'tick';

    const finishAll = () => {
      if (finished.current) return;
      finished.current = true;
      localPhase = 'done';
      setPhase('done');
      labActions.setCoreDocked(true);
      setVeilOpacity(0);
      setLoaderOpacity(0);
      window.setTimeout(() => setHide(true), 380);
    };

    const tick = (now) => {
      if (localPhase === 'tick') {
        const t = Math.min(1, (now - started) / TICK_MS);
        const freq = 1.6 + easeInCubic(t) * 9;
        const pulse = (Math.sin(t * Math.PI * 2 * freq) + 1) * 0.5;
        const amp = 0.28 + t * 0.6;
        setGlow(0.2 + pulse * amp);
        setProgress(Math.round(easeInCubic(t) * 88));
        setCoreSize(160 + pulse * 12);

        if (coreRef.current) {
          const scale = 1 + pulse * 0.06 * (0.4 + t);
          const rot = Math.sin(t * Math.PI * 2 * freq * 0.35) * 3 * t;
          coreRef.current.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rot}deg)`;
        }

        if (t >= 1) {
          localPhase = 'climax';
          phaseAt = now;
          setPhase('climax');
          setGlow(1);
          setProgress(96);
        }
      } else if (localPhase === 'climax') {
        const c = Math.min(1, (now - phaseAt) / CLIMAX_MS);
        setGlow(0.92 + c * 0.08);
        setProgress(96 + Math.round(c * 4));
        setCoreSize(172 + c * 18);

        if (coreRef.current) {
          coreRef.current.style.transform = `translate(-50%, -50%) scale(${1.12 + c * 0.2}) rotate(${c * -8}deg)`;
        }

        if (c >= 1) {
          localPhase = 'reveal';
          phaseAt = now;
          setPhase('reveal');
          setChromeOpacity(0);
          setLoaderOpacity(0);
          labActions.setLoaded(true);
        }
      } else if (localPhase === 'reveal') {
        const r = Math.min(1, (now - phaseAt) / REVEAL_MS);
        const e = easeInOutQuint(r);
        setVeilOpacity(1 - e * 0.96);
        setGlow(1);
        setProgress(100);

        if (r >= 1) {
          localPhase = 'fly';
          setPhase('fly');
          flyStarted = now;
          const rect = coreRef.current?.getBoundingClientRect();
          flyFrom = {
            x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
            y: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
          };
          flyTo = getNavDockPoint();
          flyCtrl = {
            x: lerp(flyFrom.x, flyTo.x, 0.35),
            y: Math.min(flyFrom.y, flyTo.y) - Math.min(120, window.innerHeight * 0.12),
          };
        }
      } else if (localPhase === 'fly') {
        const f = Math.min(1, (now - flyStarted) / FLY_MS);
        const e = easeInOutQuint(f);
        const pos = quadBezier(flyFrom, flyCtrl, flyTo, e);
        const size = lerp(180, 34, e);
        const rot = -10 + e * 22;

        setGlow(1 - e * 0.25);
        setVeilOpacity(Math.max(0, 0.05 * (1 - e)));
        setCoreSize(size);

        if (coreRef.current) {
          coreRef.current.style.left = `${pos.x}px`;
          coreRef.current.style.top = `${pos.y}px`;
          coreRef.current.style.transform = `translate(-50%, -50%) scale(1) rotate(${rot}deg)`;
          coreRef.current.style.opacity = '1';
        }

        if (f >= 1) {
          localPhase = 'settle';
          settleStarted = now;
          setPhase('settle');
        }
      } else if (localPhase === 'settle') {
        const s = Math.min(1, (now - settleStarted) / SETTLE_MS);
        const pop = easeOutBack(s);
        setGlow(0.75 + (1 - s) * 0.2);
        setCoreSize(34 + (1 - pop) * 4);

        if (coreRef.current) {
          coreRef.current.style.left = `${flyTo.x}px`;
          coreRef.current.style.top = `${flyTo.y}px`;
          coreRef.current.style.transform = `translate(-50%, -50%) scale(${0.92 + pop * 0.08}) rotate(0deg)`;
          coreRef.current.style.opacity = String(1 - s * 0.9);
        }

        if (s >= 1) {
          finishAll();
          return;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    const failsafe = window.setTimeout(() => {
      labActions.setLoaded(true);
      finishAll();
    }, FAILSAFE_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
    };
  }, [reduced]);

  useEffect(() => {
    if (coreDocked && loaded && !hide) {
      const t = window.setTimeout(() => setHide(true), 220);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [coreDocked, loaded, hide]);

  if (hide) return null;

  const intensity = Math.min(1, Math.max(0, glow));

  return (
    <div
      className={`fixed inset-0 z-[200] ${
        phase === 'fly' || phase === 'settle' || phase === 'done' || loaded
          ? 'pointer-events-none'
          : ''
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading laboratory"
    >
      <div className="absolute inset-0 bg-deepest" style={{ opacity: veilOpacity }} />

      <div
        className="absolute inset-x-0 top-[15%] flex flex-col items-center"
        style={{ opacity: chromeOpacity }}
      >
        <p className="font-mono text-tech uppercase tracking-[0.22em] text-ink-muted">
          Midnight Lab // Core Ignition
        </p>
      </div>

      {/* Flying / pulsing core emblem */}
      <div
        ref={coreRef}
        className="absolute left-1/2 top-[46%] will-change-transform"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <CoreEmblem size={coreSize} glow={intensity} />
      </div>

      {/* Loader under the core */}
      <div
        className="absolute left-1/2 top-[46%] w-[min(52vw,240px)] -translate-x-1/2"
        style={{
          marginTop: coreSize * 0.58 + 28,
          opacity: loaderOpacity * chromeOpacity,
        }}
      >
        <div className="h-[2px] w-full overflow-hidden rounded-full bg-line/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue via-cyan to-teal transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between font-mono text-tech uppercase tracking-[0.16em] text-ink-muted">
          <span>
            {phase === 'tick'
              ? 'Charging'
              : phase === 'climax'
                ? 'Critical'
                : 'Online'}
          </span>
          <span className="text-cyan">{progress}%</span>
        </div>
      </div>
    </div>
  );
}

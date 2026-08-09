'use client';

import { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { labActions, useLabStore } from '@/lib/labStore';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import CoreEmblem from '@/components/ui/CoreEmblem';

useGLTF.preload('/models/reactor.glb?v=13');

const TICK_MS = 5200;
const CLIMAX_MS = 1050;
const REVEAL_MS = 850;
const FLY_MS = 2200;
const SETTLE_MS = 500;
const FAILSAFE_MS = 16000;

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
      className={`fixed inset-0 z-[200] overflow-hidden ${
        phase === 'fly' || phase === 'settle' || phase === 'done' || loaded
          ? 'pointer-events-none'
          : ''
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading laboratory"
    >
      {/* Cinematic workshop veil */}
      <div className="absolute inset-0" style={{ opacity: veilOpacity }}>
        <div className="absolute inset-0 bg-[#05080b]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 55% 50% at 50% 48%, rgba(40,140,220,0.28), transparent 62%), radial-gradient(ellipse 80% 70% at 50% 100%, rgba(20,40,60,0.55), transparent 55%), radial-gradient(ellipse 40% 35% at 18% 22%, rgba(242,140,91,0.12), transparent 70%), radial-gradient(ellipse 35% 30% at 82% 18%, rgba(242,160,80,0.1), transparent 65%)',
          }}
        />
        {/* Warm bokeh orbs */}
        {[
          { l: '12%', t: '18%', s: 90, o: 0.18 },
          { l: '78%', t: '14%', s: 70, o: 0.14 },
          { l: '88%', t: '62%', s: 110, o: 0.12 },
          { l: '8%', t: '70%', s: 80, o: 0.1 },
          { l: '62%', t: '78%', s: 60, o: 0.11 },
          { l: '28%', t: '82%', s: 50, o: 0.09 },
        ].map((b, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: b.l,
              top: b.t,
              width: b.s,
              height: b.s,
              opacity: b.o * chromeOpacity,
              background:
                'radial-gradient(circle, rgba(255,180,90,0.85), rgba(255,120,40,0.15) 45%, transparent 70%)',
              filter: 'blur(8px)',
            }}
          />
        ))}
        {/* Fine dust / sparkle field */}
        <div
          className="absolute inset-0 opacity-[0.14] mix-blend-screen"
          style={{
            backgroundImage:
              'radial-gradient(1px 1px at 20% 30%, rgba(200,230,255,0.8), transparent), radial-gradient(1px 1px at 70% 40%, rgba(255,200,120,0.6), transparent), radial-gradient(1.2px 1.2px at 40% 70%, rgba(180,220,255,0.7), transparent), radial-gradient(1px 1px at 85% 75%, rgba(255,220,160,0.5), transparent), radial-gradient(1px 1px at 55% 20%, rgba(200,240,255,0.65), transparent)',
          }}
        />
        {/* Soft vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 55% at 50% 48%, transparent 30%, rgba(5,8,11,0.55) 75%, rgba(5,8,11,0.92) 100%)',
          }}
        />
        {/* Core bloom wash */}
        <div
          className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: `${40 + intensity * 55}vmin`,
            height: `${40 + intensity * 55}vmin`,
            background: `radial-gradient(circle, rgba(120,210,255,${0.18 + intensity * 0.35}), rgba(40,140,220,${0.08 + intensity * 0.12}) 40%, transparent 70%)`,
            filter: 'blur(4px)',
          }}
        />
      </div>

      <div
        className="absolute inset-x-0 top-[14%] flex flex-col items-center"
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
        <CoreEmblem size={coreSize} glow={intensity} triangleOnly />
      </div>

      {/* Loader under the core */}
      <div
        className="absolute left-1/2 top-[46%] w-[min(52vw,260px)] -translate-x-1/2"
        style={{
          marginTop: coreSize * 0.58 + 32,
          opacity: loaderOpacity * chromeOpacity,
        }}
      >
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10 shadow-[0_0_24px_rgba(99,199,217,0.15)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue via-cyan to-teal shadow-[0_0_12px_rgba(99,199,217,0.55)] transition-[width] duration-150"
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

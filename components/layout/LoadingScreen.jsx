'use client';

import { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { labActions, useLabStore } from '@/lib/labStore';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

useGLTF.preload('/models/reactor.glb?v=8');

/** Longer ignition so the ticking + dock read as a sequence */
const TICK_MS = 4800;
const CLIMAX_MS = 900;
const REVEAL_MS = 700;
const FLY_MS = 2200;
const SETTLE_MS = 480;
const FAILSAFE_MS = 14000;

function easeInCubic(t) {
  return t * t * t;
}

function easeInOutQuint(t) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

function easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Quadratic bezier through an elevated control point for a cinematic arc */
function quadBezier(p0, p1, p2, t) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

function getDockPoint() {
  const slot = document.querySelector('[data-hero="reactor-slot"]');
  if (slot) {
    const r = slot.getBoundingClientRect();
    return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.48 };
  }
  return {
    x: window.innerWidth * (window.innerWidth >= 1024 ? 0.72 : 0.5),
    y: window.innerHeight * 0.52,
  };
}

export default function LoadingScreen() {
  const { loaded, coreDocked } = useLabStore();
  const reduced = usePrefersReducedMotion();
  const [hide, setHide] = useState(false);
  const [phase, setPhase] = useState('tick');
  const [glow, setGlow] = useState(0.35);
  const [chromeOpacity, setChromeOpacity] = useState(1);
  const [veilOpacity, setVeilOpacity] = useState(1);
  const [ringScale, setRingScale] = useState(0.4);
  const [ringOpacity, setRingOpacity] = useState(0);
  const [trail, setTrail] = useState([]);
  const coreRef = useRef(null);
  const finished = useRef(false);
  const trailBuf = useRef([]);

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
      setRingOpacity(0);
      setTrail([]);
      window.setTimeout(() => setHide(true), 520);
    };

    const tick = (now) => {
      if (localPhase === 'tick') {
        const t = Math.min(1, (now - started) / TICK_MS);
        const freq = 1.6 + easeInCubic(t) * 9;
        const pulse = (Math.sin(t * Math.PI * 2 * freq) + 1) * 0.5;
        const amp = 0.28 + t * 0.6;
        setGlow(0.18 + pulse * amp);
        setRingScale(0.55 + pulse * 0.35 + t * 0.4);
        setRingOpacity(0.12 + pulse * 0.35 * t);

        if (coreRef.current) {
          const scale = 1 + pulse * 0.1 * (0.45 + t);
          const rot = Math.sin(t * Math.PI * 2 * freq * 0.5) * 4 * t;
          coreRef.current.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rot}deg)`;
        }

        if (t >= 1) {
          localPhase = 'climax';
          phaseAt = now;
          setPhase('climax');
          setGlow(1);
          setRingOpacity(0.85);
          setRingScale(1.1);
        }
      } else if (localPhase === 'climax') {
        const c = Math.min(1, (now - phaseAt) / CLIMAX_MS);
        const bloom = easeInOutQuint(c);
        setGlow(0.9 + bloom * 0.1);
        setRingScale(1.1 + bloom * 1.8);
        setRingOpacity(0.85 * (1 - bloom * 0.35));

        if (coreRef.current) {
          const s = 1.15 + bloom * 0.35;
          coreRef.current.style.transform = `translate(-50%, -50%) scale(${s}) rotate(${bloom * -12}deg)`;
        }

        if (c >= 1) {
          localPhase = 'reveal';
          phaseAt = now;
          setPhase('reveal');
          setChromeOpacity(0);
          labActions.setLoaded(true);
        }
      } else if (localPhase === 'reveal') {
        const r = Math.min(1, (now - phaseAt) / REVEAL_MS);
        const e = easeInOutQuint(r);
        setVeilOpacity(1 - e * 0.94);
        setGlow(1);
        setRingOpacity(0.55 * (1 - e));

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
          // High arc control point — lifts then settles into the reactor
          flyCtrl = {
            x: lerp(flyFrom.x, flyTo.x, 0.42) + (flyTo.x > flyFrom.x ? -40 : 40),
            y: Math.min(flyFrom.y, flyTo.y) - Math.min(window.innerHeight * 0.22, 180),
          };
          trailBuf.current = [];
        }
      } else if (localPhase === 'fly') {
        const f = Math.min(1, (now - flyStarted) / FLY_MS);
        const e = easeInOutQuint(f);
        const pos = quadBezier(flyFrom, flyCtrl, flyTo, e);

        // Soft scale: large → slightly undershoot → settle size
        const scaleCurve = 1.45 - e * 0.95 + Math.sin(e * Math.PI) * 0.08;
        const rot = -18 + e * 38 + Math.sin(e * Math.PI) * 10;
        setGlow(1 - e * 0.28);
        setVeilOpacity(Math.max(0, 0.06 * (1 - e)));
        setRingScale(0.7 + e * 0.5);
        setRingOpacity(0.35 * (1 - e));

        if (coreRef.current) {
          coreRef.current.style.left = `${pos.x}px`;
          coreRef.current.style.top = `${pos.y}px`;
          coreRef.current.style.transform = `translate(-50%, -50%) scale(${scaleCurve}) rotate(${rot}deg)`;
          coreRef.current.style.opacity = '1';
        }

        // Ghost trail for motion richness (throttled)
        if (f < 0.96 && Math.floor(f * 40) !== Math.floor((f - 0.01) * 40)) {
          trailBuf.current = [
            { x: pos.x, y: pos.y, s: scaleCurve * 0.85, o: 0.35, id: now },
            ...trailBuf.current.slice(0, 5),
          ];
          setTrail(trailBuf.current);
        }

        if (f >= 1) {
          localPhase = 'settle';
          settleStarted = now;
          setPhase('settle');
          setTrail([]);
        }
      } else if (localPhase === 'settle') {
        const s = Math.min(1, (now - settleStarted) / SETTLE_MS);
        const elastic = easeOutElastic(s);
        const scale = 0.5 + elastic * 0.08;
        setGlow(0.72 + (1 - s) * 0.28);
        setRingOpacity(0.45 * (1 - s));
        setRingScale(1.2 + s * 0.6);

        if (coreRef.current) {
          coreRef.current.style.left = `${flyTo.x}px`;
          coreRef.current.style.top = `${flyTo.y}px`;
          coreRef.current.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(0deg)`;
          coreRef.current.style.opacity = String(1 - s * 0.85);
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
      const t = window.setTimeout(() => setHide(true), 280);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [coreDocked, loaded, hide]);

  if (hide) return null;

  const intensity = Math.min(1, Math.max(0, glow));
  const status =
    phase === 'tick'
      ? 'Charging core'
      : phase === 'climax'
        ? 'Critical ignition'
        : phase === 'reveal'
          ? 'Systems online'
          : phase === 'fly'
            ? 'Guiding core'
            : 'Docking';

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
      <div
        className="absolute inset-0 bg-deepest"
        style={{ opacity: veilOpacity }}
      />

      {/* Expanding energy rings */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/40"
        style={{
          width: `${ringScale * 42}vmin`,
          height: `${ringScale * 42}vmin`,
          opacity: ringOpacity * 0.7,
          boxShadow: `0 0 ${40 + intensity * 60}px rgba(99,199,217,${0.15 + intensity * 0.25})`,
          transition: 'none',
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/20"
        style={{
          width: `${ringScale * 28}vmin`,
          height: `${ringScale * 28}vmin`,
          opacity: ringOpacity,
        }}
      />

      <div
        className="absolute inset-x-0 top-[16%] flex flex-col items-center"
        style={{ opacity: chromeOpacity }}
      >
        <p className="font-mono text-tech uppercase tracking-[0.22em] text-ink-muted">
          Midnight Lab // Core Ignition
        </p>
      </div>

      {/* Motion trail ghosts */}
      {trail.map((g) => (
        <div
          key={g.id}
          className="pointer-events-none absolute"
          style={{
            left: g.x,
            top: g.y,
            width: 'min(22vw, 140px)',
            height: 'min(22vw, 140px)',
            transform: `translate(-50%, -50%) scale(${g.s})`,
            opacity: g.o,
            filter: 'blur(1px)',
          }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <polygon
              points="50,12 88,82 12,82"
              fill="rgba(200,230,255,0.35)"
              stroke="rgba(99,199,217,0.4)"
              strokeWidth="1"
            />
          </svg>
        </div>
      ))}

      <div
        ref={coreRef}
        className="absolute left-1/2 top-1/2 will-change-transform"
        style={{
          width: 'min(30vw, 200px)',
          height: 'min(30vw, 200px)',
          transform: 'translate(-50%, -50%)',
          filter: `drop-shadow(0 0 ${22 + intensity * 56}px rgba(220,240,255,${0.4 + intensity * 0.55})) drop-shadow(0 0 ${50 + intensity * 100}px rgba(99,199,217,${0.25 + intensity * 0.5}))`,
        }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="pd-core" x1="18%" y1="8%" x2="82%" y2="92%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#d8ebf8" />
              <stop offset="100%" stopColor="#7eafcc" />
            </linearGradient>
            <radialGradient id="pd-hot" cx="50%" cy="42%" r="55%">
              <stop offset="0%" stopColor={`rgba(255,255,255,${0.55 + intensity * 0.4})`} />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          <polygon
            points="50,10 90,84 10,84"
            fill="url(#pd-core)"
            stroke={`rgba(230,245,255,${0.5 + intensity * 0.5})`}
            strokeWidth="1.6"
            opacity={0.8 + intensity * 0.2}
          />
          <polygon points="50,10 90,84 10,84" fill="url(#pd-hot)" />
          <polygon
            points="50,26 76,74 24,74"
            fill={`rgba(236,248,255,${0.12 + intensity * 0.55})`}
            stroke={`rgba(190,225,245,${0.35 + intensity * 0.5})`}
            strokeWidth="0.9"
          />
        </svg>
      </div>

      <p
        className="absolute bottom-[14%] left-1/2 -translate-x-1/2 font-mono text-tech uppercase tracking-[0.2em] text-cyan"
        style={{ opacity: chromeOpacity * (0.45 + intensity * 0.55) }}
      >
        {status}
      </p>
    </div>
  );
}

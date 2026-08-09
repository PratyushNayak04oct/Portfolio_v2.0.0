'use client';

import { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { labActions, useLabStore } from '@/lib/labStore';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import CoreEmblem from '@/components/ui/CoreEmblem';

useGLTF.preload('/models/reactor.glb?v=18');

const TICK_MS = 5200;
const CLIMAX_MS = 1050;
const REVEAL_MS = 1400;
const FLY_MS = 2000;
const SETTLE_MS = 650;
const FAILSAFE_MS = 16000;
const BASE_CORE = 168;

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
  return { x: 56, y: 36 };
}

export default function LoadingScreen() {
  const { loaded, coreDocked } = useLabStore();
  const reduced = usePrefersReducedMotion();
  const [hide, setHide] = useState(false);
  const [phase, setPhase] = useState('tick');
  const [progress, setProgress] = useState(0);
  const [chromeOpacity, setChromeOpacity] = useState(1);
  const [veilOpacity, setVeilOpacity] = useState(1);
  const [loaderOpacity, setLoaderOpacity] = useState(1);
  const coreRef = useRef(null);
  const emblemWrapRef = useRef(null);
  const auraRef = useRef(null);
  const bloomRef = useRef(null);
  const progressBarRef = useRef(null);
  const progressLabelRef = useRef(null);
  const statusLabelRef = useRef(null);
  const finished = useRef(false);
  const glowRef = useRef(0.35);

  useEffect(() => {
    if (reduced) {
      labActions.setLoaded(true);
      labActions.setCoreDocked(true);
      const id = window.setTimeout(() => setHide(true), 0);
      return () => window.clearTimeout(id);
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
    let lastUi = 0;
    let lastProgress = -1;

    // Warm store early so ClientShell can begin booting WebGL mid-charge
    window.setTimeout(() => {
      if (!finished.current) labActions.setLoaded(true);
    }, 900);

    const paintGlow = (g) => {
      glowRef.current = g;
      const el = emblemWrapRef.current;
      if (el) {
        // Pulse glow via CSS filter — avoids re-rendering CoreEmblem every frame
        el.style.filter = `drop-shadow(0 0 ${12 + g * 28}px rgba(100,210,255,${0.45 + g * 0.45})) drop-shadow(0 0 ${28 + g * 50}px rgba(40,160,230,${0.25 + g * 0.35}))`;
        el.style.opacity = String(0.85 + g * 0.15);
      }
      if (bloomRef.current) {
        bloomRef.current.style.opacity = String(0.35 + g * 0.55);
        // Scale bloom with transform only (no width/height thrash)
        const s = 0.85 + g * 0.55;
        bloomRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${s})`;
      }
    };

    const paintProgress = (p, label) => {
      const rounded = Math.round(p);
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${rounded}%`;
      }
      if (rounded !== lastProgress) {
        lastProgress = rounded;
        if (progressLabelRef.current) {
          progressLabelRef.current.textContent = `${rounded}%`;
        }
        // Throttle React progress updates — aura/CSS don't depend on them
        setProgress(rounded);
      }
      if (label && statusLabelRef.current) {
        statusLabelRef.current.textContent = label;
      }
    };

    const finishAll = () => {
      if (finished.current) return;
      finished.current = true;
      localPhase = 'done';
      setPhase('done');
      labActions.setCoreDocked(true);
      setVeilOpacity(0);
      setLoaderOpacity(0);
      window.setTimeout(() => setHide(true), 720);
    };

    const tick = (now) => {
      if (localPhase === 'tick') {
        const t = Math.min(1, (now - started) / TICK_MS);
        // Gentler charge pulse — avoids high-freq thrash near climax
        const freq = 1.35 + easeInCubic(t) * 5.5;
        const pulse = (Math.sin(t * Math.PI * 2 * freq) + 1) * 0.5;
        const amp = 0.22 + t * 0.5;
        const glow = 0.22 + pulse * amp;
        paintGlow(glow);
        paintProgress(easeInCubic(t) * 88, 'Charging');

        if (coreRef.current) {
          const scale = 1 + pulse * 0.045 * (0.35 + t);
          const rot = Math.sin(t * Math.PI * 2 * freq * 0.28) * 2.2 * t;
          coreRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${scale}) rotate(${rot}deg)`;
        }
        if (auraRef.current) {
          // Keep aura size fixed; only fade/breathe opacity (no layout)
          const breath = 0.55 + pulse * 0.35;
          auraRef.current.style.opacity = String(breath);
          auraRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${1 + pulse * 0.04})`;
        }

        if (t >= 1) {
          localPhase = 'climax';
          phaseAt = now;
          setPhase('climax');
          paintGlow(1);
          paintProgress(96, 'Critical');
        }
      } else if (localPhase === 'climax') {
        const c = Math.min(1, (now - phaseAt) / CLIMAX_MS);
        paintGlow(0.92 + c * 0.08);
        paintProgress(96 + c * 4, 'Critical');

        if (coreRef.current) {
          coreRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${1.1 + c * 0.16}) rotate(${c * -6}deg)`;
        }
        if (auraRef.current) {
          // Soften aura during climax so CSS spin + core don't fight
          auraRef.current.style.opacity = String(0.85 - c * 0.35);
          auraRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${1.05 + c * 0.12})`;
          if (c > 0.55) auraRef.current.classList.add('loader-aura--calm');
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
        // Update veil at ~30fps to cut React churn
        if (now - lastUi > 32) {
          lastUi = now;
          setVeilOpacity(1 - e * 0.78);
        }
        paintGlow(1);
        paintProgress(100, 'Online');
        if (auraRef.current) {
          auraRef.current.style.opacity = String(Math.max(0, 0.5 * (1 - e)));
        }

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
          if (auraRef.current) auraRef.current.style.opacity = '0';
        }
      } else if (localPhase === 'fly') {
        const f = Math.min(1, (now - flyStarted) / FLY_MS);
        const e = easeInOutQuint(f);
        const pos = quadBezier(flyFrom, flyCtrl, flyTo, e);
        const sizeScale = lerp(1, 34 / BASE_CORE, e);
        const rot = -10 + e * 22;

        paintGlow(1 - e * 0.25);
        if (now - lastUi > 32) {
          lastUi = now;
          setVeilOpacity(Math.max(0, 0.22 * (1 - e)));
        }

        if (coreRef.current) {
          coreRef.current.style.left = `${pos.x}px`;
          coreRef.current.style.top = `${pos.y}px`;
          coreRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${sizeScale}) rotate(${rot}deg)`;
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
        paintGlow(0.75 + (1 - s) * 0.2);
        const sizeScale = (34 + (1 - pop) * 4) / BASE_CORE;

        if (coreRef.current) {
          coreRef.current.style.left = `${flyTo.x}px`;
          coreRef.current.style.top = `${flyTo.y}px`;
          coreRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${0.92 * sizeScale + pop * 0.08 * sizeScale}) rotate(0deg)`;
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
      const t = window.setTimeout(() => setHide(true), 700);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [coreDocked, loaded, hide]);

  if (hide) return null;

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
              'radial-gradient(ellipse 55% 50% at 50% 48%, rgba(40,140,220,0.32), transparent 62%), radial-gradient(ellipse 80% 70% at 50% 100%, rgba(20,40,60,0.6), transparent 55%), radial-gradient(ellipse 40% 35% at 18% 22%, rgba(242,140,91,0.16), transparent 70%), radial-gradient(ellipse 35% 30% at 82% 18%, rgba(242,160,80,0.14), transparent 65%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-[-20%] bottom-[-5%] h-[55%]"
          style={{
            opacity: 0.22 * chromeOpacity,
            backgroundImage:
              'linear-gradient(rgba(99,199,217,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(99,199,217,0.12) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            transform: 'perspective(500px) rotateX(62deg)',
            maskImage:
              'linear-gradient(to top, rgba(0,0,0,0.85), transparent 75%)',
            WebkitMaskImage:
              'linear-gradient(to top, rgba(0,0,0,0.85), transparent 75%)',
          }}
        />
        {/* Fewer bokeh orbs — less paint during charge */}
        {[
          { l: '12%', t: '18%', s: 90, o: 0.18 },
          { l: '78%', t: '14%', s: 70, o: 0.14 },
          { l: '88%', t: '62%', s: 100, o: 0.12 },
          { l: '8%', t: '70%', s: 80, o: 0.1 },
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
                i % 2 === 0
                  ? 'radial-gradient(circle, rgba(255,180,90,0.85), rgba(255,120,40,0.15) 45%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(120,210,255,0.7), rgba(40,140,220,0.12) 45%, transparent 70%)',
              filter: 'blur(8px)',
              animation: `softPulse ${6 + (i % 2)}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
        <div
          className="absolute inset-0 opacity-[0.16] mix-blend-screen"
          style={{
            backgroundImage:
              'radial-gradient(1px 1px at 20% 30%, rgba(200,230,255,0.8), transparent), radial-gradient(1px 1px at 70% 40%, rgba(255,200,120,0.6), transparent), radial-gradient(1.2px 1.2px at 40% 70%, rgba(180,220,255,0.7), transparent), radial-gradient(1px 1px at 85% 75%, rgba(255,220,160,0.5), transparent)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 55% at 50% 48%, transparent 30%, rgba(5,8,11,0.55) 75%, rgba(5,8,11,0.92) 100%)',
          }}
        />
        <div
          ref={bloomRef}
          className="absolute left-1/2 top-[46%] rounded-full will-change-transform"
          style={{
            width: '55vmin',
            height: '55vmin',
            background:
              'radial-gradient(circle, rgba(120,210,255,0.35), rgba(40,140,220,0.12) 40%, transparent 70%)',
            filter: 'blur(4px)',
            opacity: 0.5,
            transform: 'translate3d(-50%, -50%, 0) scale(1)',
          }}
        />
      </div>

      <div
        className="absolute inset-x-0 top-[max(1.5rem,env(safe-area-inset-top))] flex justify-center px-4 pt-8 sm:pt-10"
        style={{ opacity: chromeOpacity }}
      >
        <p className="text-center font-mono text-[0.65rem] uppercase tracking-[0.28em] text-ink-secondary sm:text-tech sm:tracking-[0.22em]">
          Midnight Lab
          <span className="mx-2 text-cyan/50">·</span>
          Core Ignition
        </p>
      </div>

      {/* Fixed-size core host — pulse via transform only (keeps aura smooth) */}
      <div
        ref={coreRef}
        className="absolute left-1/2 top-[46%] will-change-transform"
        style={{ transform: 'translate3d(-50%, -50%, 0)' }}
      >
        <div
          className="relative flex items-center justify-center"
          style={{ width: BASE_CORE, height: BASE_CORE }}
        >
          <div
            ref={auraRef}
            className="loader-aura"
            style={{
              width: BASE_CORE * 1.9,
              height: BASE_CORE * 1.9,
              opacity: chromeOpacity > 0 ? 0.75 : 0,
            }}
          >
            <span className="loader-aura__ring loader-aura__ring--c" />
            <span className="loader-aura__ring loader-aura__ring--a">
              <span className="loader-aura__spark" />
            </span>
            <span className="loader-aura__ring loader-aura__ring--b">
              <span className="loader-aura__spark loader-aura__spark--warm" />
            </span>
          </div>
          <div ref={emblemWrapRef} className="relative z-[1]">
            <CoreEmblem size={BASE_CORE} glow={0.7} triangleOnly />
          </div>
        </div>
      </div>

      <div
        className="absolute left-1/2 top-[46%] w-[min(78vw,280px)] -translate-x-1/2 px-1"
        style={{
          marginTop: BASE_CORE * 0.58 + 28,
          opacity: loaderOpacity * chromeOpacity,
        }}
      >
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10 shadow-[0_0_24px_rgba(99,199,217,0.15)]">
          <div
            ref={progressBarRef}
            className="h-full rounded-full bg-gradient-to-r from-blue via-cyan to-teal shadow-[0_0_12px_rgba(99,199,217,0.55)]"
            style={{ width: `${progress}%`, willChange: 'width' }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-secondary sm:text-tech">
          <span ref={statusLabelRef}>Charging</span>
          <span ref={progressLabelRef} className="text-cyan">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}

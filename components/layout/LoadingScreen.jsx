'use client';

import { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { labActions, useLabStore } from '@/lib/labStore';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import CoreEmblem from '@/components/ui/CoreEmblem';

useGLTF.preload('/models/reactor.glb?v=23');

const TICK_MS = 7200;
const CLIMAX_MS = 1200;
const REVEAL_MS = 1800;
const FLY_MS = 2200;
const SETTLE_MS = 800;
const FAILSAFE_MS = 20000;
const BASE_CORE = 148;
const AURA_SIZE = 'min(72vmin, 320px)';

function easeInCubic(t) {
  return t * t * t;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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
  const loaded = useLabStore((s) => s.loaded);
  const coreDocked = useLabStore((s) => s.coreDocked);
  const reduced = usePrefersReducedMotion();
  const [hide, setHide] = useState(false);
  /** Only used for a11y — keep React out of the hot path */
  const [phase, setPhase] = useState('tick');

  const shellRef = useRef(null);
  const veilRef = useRef(null);
  const chromeRef = useRef(null);
  const loaderUiRef = useRef(null);
  const auraHostRef = useRef(null);
  const coreRef = useRef(null);
  const haloRef = useRef(null);
  const bloomRef = useRef(null);
  const progressBarRef = useRef(null);
  const progressLabelRef = useRef(null);
  const statusLabelRef = useRef(null);
  const finished = useRef(false);

  useEffect(() => {
    if (reduced) {
      labActions.setLoaded(true);
      labActions.setCoreDocked(true);
      const id = window.setTimeout(() => setHide(true), 0);
      return () => window.clearTimeout(id);
    }

    // Lock page scroll under the loader (prevents scrollbar + Lenis scroll)
    document.documentElement.classList.add('loader-lock');
    window.scrollTo(0, 0);

    const started = performance.now();
    let raf = 0;
    let phaseAt = 0;
    let flyStarted = 0;
    let settleStarted = 0;
    let flyFrom = { x: 0, y: 0 };
    let flyTo = { x: 0, y: 0 };
    let flyCtrl = { x: 0, y: 0 };
    let localPhase = 'tick';
    let lastProgress = -1;
    let warmed = false;

    const finishAll = () => {
      if (finished.current) return;
      finished.current = true;
      localPhase = 'done';
      if (shellRef.current) {
        shellRef.current.dataset.phase = 'done';
        shellRef.current.classList.add('pointer-events-none');
      }
      setPhase('done');
      labActions.setCoreDocked(true);
      document.documentElement.classList.remove('loader-lock');
      if (veilRef.current) veilRef.current.style.opacity = '0';
      if (auraHostRef.current) auraHostRef.current.style.opacity = '0';
      if (shellRef.current) shellRef.current.style.opacity = '0';
      window.setTimeout(() => setHide(true), 900);
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
      }
      if (label && statusLabelRef.current) {
        statusLabelRef.current.textContent = label;
      }
    };

    const tick = (now) => {
      if (localPhase === 'tick') {
        const t = Math.min(1, (now - started) / TICK_MS);
        // Slow build → fast burst: frequency & amplitude ease in (not linear thrash)
        const build = t * t; // ease-in quadratic
        const burst = build * build; // sharper near end
        const freq = 0.75 + build * 1.8 + burst * 2.2;
        const pulse = (Math.sin(t * Math.PI * 2 * freq) + 1) * 0.5;
        // Soft envelope: gentle early, strong late — never harsh steps
        const amp = 0.16 + build * 0.38 + burst * 0.32;
        const glow = 0.2 + pulse * amp;

        if (haloRef.current) {
          const hs = 0.82 + glow * 0.6;
          haloRef.current.style.opacity = String(0.22 + glow * 0.78);
          haloRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${hs})`;
        }
        if (bloomRef.current) {
          bloomRef.current.style.opacity = String(0.18 + glow * 0.58);
          bloomRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${0.88 + glow * 0.5})`;
        }
        if (coreRef.current) {
          const scale = 1 + pulse * (0.025 + build * 0.04);
          const rot = Math.sin(t * Math.PI * 2 * freq * 0.22) * (1.2 + build * 1.4);
          coreRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${scale}) rotate(${rot}deg)`;
        }

        paintProgress(easeInCubic(t) * 88, 'Charging');

        // Do NOT boot WebGL during the charge — that hitch kills the climax feel.
        // Warm-boot happens under the opaque veil at climax start instead.

        if (t >= 1) {
          localPhase = 'climax';
          phaseAt = now;
          // Avoid React setState mid-RAF when possible — update DOM class via ref
          if (shellRef.current) {
            shellRef.current.dataset.phase = 'climax';
          }
          paintProgress(96, 'Critical');
          if (auraHostRef.current) {
            auraHostRef.current.classList.add('loader-aura-host--fade');
          }
          // Boot GL under full veil so parse/compile hitch is hidden
          if (!warmed) {
            warmed = true;
            requestAnimationFrame(() => {
              labActions.setWarmBoot(true);
            });
          }
        }
      } else if (localPhase === 'climax') {
        const c = Math.min(1, (now - phaseAt) / CLIMAX_MS);
        const glow = 0.92 + c * 0.08;

        if (haloRef.current) {
          haloRef.current.style.opacity = String(0.85 + c * 0.15);
          haloRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${1.25 + c * 0.2})`;
        }
        if (bloomRef.current) {
          bloomRef.current.style.opacity = String(0.65 + c * 0.25);
          bloomRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${1.2 + c * 0.25})`;
        }
        if (coreRef.current) {
          coreRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${1.1 + c * 0.14}) rotate(${c * -6}deg)`;
        }
        paintProgress(96 + c * 4, 'Critical');

        if (c >= 1) {
          localPhase = 'reveal';
          phaseAt = now;
          if (shellRef.current) shellRef.current.dataset.phase = 'reveal';
          if (!warmed) {
            warmed = true;
            labActions.setWarmBoot(true);
          }
          // Reveal site under the dissolving veil
          labActions.setLoaded(true);
          if (chromeRef.current) chromeRef.current.style.opacity = '0';
          if (loaderUiRef.current) loaderUiRef.current.style.opacity = '0';
          if (auraHostRef.current) auraHostRef.current.style.opacity = '0';
        }
      } else if (localPhase === 'reveal') {
        const r = Math.min(1, (now - phaseAt) / REVEAL_MS);
        const e = easeInOutCubic(r);

        if (veilRef.current) {
          // Keep a soft film longer so hero eases in underneath
          veilRef.current.style.opacity = String(1 - e * 0.88);
        }
        if (haloRef.current) {
          haloRef.current.style.opacity = String(1 - e * 0.15);
        }
        if (coreRef.current) {
          coreRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${1.24}) rotate(-6deg)`;
        }
        paintProgress(100, 'Online');

        if (r >= 1) {
          localPhase = 'fly';
          if (shellRef.current) {
            shellRef.current.dataset.phase = 'fly';
            shellRef.current.classList.add('pointer-events-none');
          }
          flyStarted = now;
          const rect = coreRef.current?.getBoundingClientRect();
          flyFrom = {
            x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
            y: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
          };
          flyTo = getNavDockPoint();
          flyCtrl = {
            x: lerp(flyFrom.x, flyTo.x, 0.38),
            y: Math.min(flyFrom.y, flyTo.y) - Math.min(140, window.innerHeight * 0.14),
          };
        }
      } else if (localPhase === 'fly') {
        const f = Math.min(1, (now - flyStarted) / FLY_MS);
        const e = easeInOutCubic(f);
        const pos = quadBezier(flyFrom, flyCtrl, flyTo, e);
        const sizeScale = lerp(1, 34 / BASE_CORE, e);
        const rot = -6 + e * 18;

        if (veilRef.current) {
          veilRef.current.style.opacity = String(Math.max(0, 0.12 * (1 - e)));
        }
        if (haloRef.current) {
          haloRef.current.style.opacity = String(0.85 * (1 - e * 0.7));
          haloRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${1.1 - e * 0.4})`;
        }
        if (bloomRef.current) {
          bloomRef.current.style.opacity = String(0.4 * (1 - e));
        }
        if (coreRef.current) {
          coreRef.current.style.left = `${pos.x}px`;
          coreRef.current.style.top = `${pos.y}px`;
          coreRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${sizeScale}) rotate(${rot}deg)`;
        }

        if (f >= 1) {
          localPhase = 'settle';
          settleStarted = now;
          if (shellRef.current) shellRef.current.dataset.phase = 'settle';
        }
      } else if (localPhase === 'settle') {
        const s = Math.min(1, (now - settleStarted) / SETTLE_MS);
        const pop = easeOutBack(s);
        const sizeScale = (34 / BASE_CORE) * (0.92 + pop * 0.08);

        if (coreRef.current) {
          coreRef.current.style.left = `${flyTo.x}px`;
          coreRef.current.style.top = `${flyTo.y}px`;
          coreRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${sizeScale}) rotate(0deg)`;
          coreRef.current.style.opacity = String(1 - s * 0.92);
        }
        if (haloRef.current) {
          haloRef.current.style.opacity = String(0.25 * (1 - s));
        }
        if (veilRef.current) {
          veilRef.current.style.opacity = '0';
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
      labActions.setWarmBoot(true);
      labActions.setLoaded(true);
      finishAll();
    }, FAILSAFE_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
      document.documentElement.classList.remove('loader-lock');
    };
  }, [reduced]);

  useEffect(() => {
    if (hide) {
      document.documentElement.classList.remove('loader-lock');
    }
  }, [hide]);

  useEffect(() => {
    if (coreDocked && loaded && !hide) {
      const t = window.setTimeout(() => setHide(true), 850);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [coreDocked, loaded, hide]);

  if (hide) return null;

  return (
    <div
      ref={shellRef}
      className={`fixed inset-0 z-[200] h-[100dvh] max-h-[100dvh] w-screen overflow-hidden overscroll-none transition-opacity duration-700 ease-out ${
        phase === 'fly' || phase === 'settle' || phase === 'done' || loaded
          ? 'pointer-events-none'
          : ''
      }`}
      data-phase={phase}
      role="status"
      aria-live="polite"
      aria-label="Loading laboratory"
    >
      <div ref={veilRef} className="absolute inset-0">
        <div className="absolute inset-0 bg-[#05080b]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 55% 50% at 50% 48%, rgba(40,140,220,0.3), transparent 62%), radial-gradient(ellipse 80% 70% at 50% 100%, rgba(20,40,60,0.55), transparent 55%)',
          }}
        />
        <div
          ref={bloomRef}
          className="loader-bloom absolute left-1/2 top-[46%] rounded-full"
          style={{
            width: '52vmin',
            height: '52vmin',
            background:
              'radial-gradient(circle, rgba(120,210,255,0.38), rgba(40,140,220,0.12) 42%, transparent 70%)',
            opacity: 0.4,
            transform: 'translate3d(-50%, -50%, 0) scale(1)',
          }}
        />
      </div>

      <div
        ref={chromeRef}
        className="absolute inset-x-0 top-[max(1.5rem,env(safe-area-inset-top))] flex justify-center px-4 pt-8 transition-opacity duration-500 sm:pt-10"
      >
        <p className="text-center font-mono text-[0.65rem] uppercase tracking-[0.28em] text-ink-secondary sm:text-tech sm:tracking-[0.22em]">
          Midnight Lab
          <span className="mx-2 text-cyan/50">·</span>
          Core Ignition
        </p>
      </div>

      {/* Pure CSS orbits — never mutated by the tick RAF (prevents hitching) */}
      <div
        ref={auraHostRef}
        className="loader-aura-host pointer-events-none absolute left-1/2 top-[46%]"
        style={{
          width: AURA_SIZE,
          height: AURA_SIZE,
        }}
        aria-hidden="true"
      >
        <div className="loader-aura">
          {/* Clockwise */}
          <span className="loader-aura__ring loader-aura__ring--cw">
            <span className="loader-aura__tick" />
            <span className="loader-aura__tick loader-aura__tick--2" />
            <span className="loader-aura__spark" />
          </span>
          {/* Anti-clockwise */}
          <span className="loader-aura__ring loader-aura__ring--ccw">
            <span className="loader-aura__tick loader-aura__tick--warm" />
            <span className="loader-aura__tick loader-aura__tick--warm loader-aura__tick--2" />
            <span className="loader-aura__spark loader-aura__spark--warm" />
          </span>
        </div>
      </div>

      {/* Core + ticking glow halo (sibling to aura) */}
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
            ref={haloRef}
            className="loader-core-halo"
            aria-hidden="true"
          />
          <div className="relative z-[1]">
            <CoreEmblem size={BASE_CORE} glow={0.95} triangleOnly />
          </div>
        </div>
      </div>

      <div
        ref={loaderUiRef}
        className="absolute left-1/2 top-[46%] w-[min(78vw,280px)] -translate-x-1/2 px-1 transition-opacity duration-500"
        style={{ marginTop: BASE_CORE * 0.58 + 28 }}
      >
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
          <div
            ref={progressBarRef}
            className="h-full rounded-full bg-gradient-to-r from-blue via-cyan to-teal"
            style={{ width: '0%' }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-secondary sm:text-tech">
          <span ref={statusLabelRef}>Charging</span>
          <span ref={progressLabelRef} className="text-cyan">
            0%
          </span>
        </div>
      </div>
    </div>
  );
}

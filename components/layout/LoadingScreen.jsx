'use client';

import { useEffect, useRef, useState } from 'react';
import { labActions, useLabStore } from '@/lib/labStore';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const BOOT_MS = 1600;
const FAILSAFE_MS = 2800;

export default function LoadingScreen() {
  const { loaded } = useLabStore();
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);
  const [hide, setHide] = useState(false);
  const finished = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (finished.current) return;
      finished.current = true;
      setProgress(100);
      labActions.setLoaded(true);
    };

    if (reduced) {
      finish();
      setHide(true);
      return undefined;
    }

    const started = performance.now();
    let raf = 0;

    const tick = (now) => {
      const t = Math.min(1, (now - started) / BOOT_MS);
      // Ease-out progress — calm, never stalls
      const eased = 1 - (1 - t) ** 2;
      setProgress(Math.round(eased * 100));

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        finish();
      }
    };

    raf = requestAnimationFrame(tick);

    // Absolute failsafe so the lab never traps the visitor
    const failsafe = window.setTimeout(finish, FAILSAFE_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
    };
  }, [reduced]);

  useEffect(() => {
    if (!loaded) return undefined;
    const t = window.setTimeout(() => setHide(true), reduced ? 0 : 500);
    return () => window.clearTimeout(t);
  }, [loaded, reduced]);

  if (hide) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-deepest transition-opacity duration-500 ${
        loaded ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading laboratory"
    >
      <p className="font-mono text-tech uppercase tracking-[0.2em] text-ink-muted">
        Midnight Lab // Boot
      </p>
      <p className="mt-6 font-display text-sub text-ink">Initializing systems</p>
      <div className="mt-10 h-px w-48 overflow-hidden bg-line">
        <div
          className="h-full bg-gradient-to-r from-blue to-cyan"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-4 font-mono text-tech text-cyan">{progress}%</p>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useLabStore } from '@/lib/labStore';

export default function ReactorPower() {
  const { power, reactorStatus, systemOnline } = useLabStore();
  const [display, setDisplay] = useState(power);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setDisplay((d) => {
        const next = d + (power - d) * 0.08;
        if (Math.abs(power - next) < 0.15) return power;
        raf = requestAnimationFrame(tick);
        return next;
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [power]);

  return (
    <div className="pointer-events-none absolute bottom-6 left-6 z-20 font-mono text-tech uppercase tracking-[0.16em] text-ink-muted md:bottom-10 md:left-10">
      <p className="text-cyan">
        {systemOnline ? 'SYSTEM ONLINE' : `POWER ${Math.round(display)}%`}
      </p>
      <p className="mt-2 text-ink-secondary">{reactorStatus}</p>
      <div className="mt-3 h-px w-32 overflow-hidden bg-line">
        <div
          className="h-full bg-gradient-to-r from-blue to-cyan transition-[width] duration-500 ease-out"
          style={{ width: `${display}%` }}
        />
      </div>
    </div>
  );
}

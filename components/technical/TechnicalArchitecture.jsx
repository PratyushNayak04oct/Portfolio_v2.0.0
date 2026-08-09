'use client';

import { useEffect, useRef, useState } from 'react';
import { getGsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const nodes = ['CLIENT', 'NEXT.JS', 'API', 'BACKEND', 'DATABASE'];

export default function TechnicalArchitecture() {
  const [active, setActive] = useState(0);
  const lineRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      setActive(nodes.length - 1);
      return undefined;
    }
    const { gsap } = getGsap();
    const tween = gsap.to(
      {},
      {
        scrollTrigger: {
          trigger: '#lab',
          start: 'top 60%',
          end: 'center center',
          scrub: 0.6,
          onUpdate: (self) => {
            setActive(
              Math.min(
                nodes.length - 1,
                Math.floor(self.progress * nodes.length),
              ),
            );
            if (lineRef.current) {
              lineRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        },
      },
    );
    return () => tween.kill();
  }, [reduced]);

  return (
    <div className="glass-panel rounded-2xl p-7 md:p-8">
      <p className="font-mono text-tech uppercase tracking-[0.16em] text-cyan">
        Architecture
      </p>
      <div className="relative mt-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div
          ref={lineRef}
          className="pointer-events-none absolute top-1/2 left-0 hidden h-px w-full origin-left bg-gradient-to-r from-blue to-teal md:block"
          style={{ transform: 'scaleX(0)' }}
        />
        {nodes.map((node, i) => (
          <div
            key={node}
            className="relative z-10 flex items-center gap-3 md:flex-col md:gap-3"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-500 ${
                i <= active
                  ? 'border-cyan/60 bg-surface text-cyan shadow-[0_0_20px_rgba(99,199,217,0.2)]'
                  : 'border-line bg-primary/80 text-ink-muted'
              }`}
            >
              <span className="font-mono text-tech">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <p
              className={`font-mono text-tech uppercase tracking-[0.12em] transition-colors duration-500 ${
                i <= active ? 'text-ink' : 'text-ink-muted'
              }`}
            >
              {node}
            </p>
            {i < nodes.length - 1 ? (
              <span className="text-ink-muted md:hidden">↓</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

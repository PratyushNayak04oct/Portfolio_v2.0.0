'use client';

import { useEffect, useRef, useState } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { damp } from '@/lib/motion';

export default function CustomCursor() {
  const isDesktop = useIsDesktop();
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const [mode, setMode] = useState('default');
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!isDesktop) return undefined;

    document.documentElement.classList.add('has-custom-cursor');

    const onMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    const onOver = (e) => {
      const el = e.target.closest('[data-cursor]');
      if (!el) {
        setMode('default');
        setLabel('');
        return;
      }
      const type = el.getAttribute('data-cursor') || 'interactive';
      setMode(type);
      setLabel(el.getAttribute('data-cursor-label') || '');
    };

    let raf = 0;
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * damp.cursor;
      pos.current.y += (target.current.y - pos.current.y) * damp.cursor;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, true);
    raf = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver, true);
      cancelAnimationFrame(raf);
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  const interactive = mode === 'interactive' || mode === 'project';

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
      <div
        ref={dotRef}
        className="absolute top-0 left-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        className={`absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/50 transition-[width,height,opacity] duration-300 ease-out ${
          interactive ? 'h-12 w-12 opacity-80' : 'h-8 w-8 opacity-40'
        }`}
        style={{ willChange: 'transform' }}
      />
      {mode === 'project' && label ? (
        <div
          ref={labelRef}
          className="absolute top-6 left-6 font-mono text-tech uppercase text-cyan"
          style={{ willChange: 'transform' }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
}

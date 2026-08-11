'use client';

import { useEffect, useRef, useState } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { damp } from '@/lib/motion';

/**
 * Lightweight custom cursor — RAF only while the pointer is moving.
 * (mdx.so-style: intentional motion, not constant GPU work)
 */
export default function CustomCursor() {
  const isDesktop = useIsDesktop();
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const [mode, setMode] = useState('default');
  const moving = useRef(false);
  const idleTimer = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!isDesktop) return undefined;

    document.documentElement.classList.add('has-custom-cursor');

    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * damp.cursor;
      pos.current.y += (target.current.y - pos.current.y) * damp.cursor;
      const t = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      if (dotRef.current) dotRef.current.style.transform = t;
      if (ringRef.current) ringRef.current.style.transform = t;

      const dx = Math.abs(target.current.x - pos.current.x);
      const dy = Math.abs(target.current.y - pos.current.y);
      if (dx < 0.15 && dy < 0.15) {
        moving.current = false;
        raf.current = 0;
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (!moving.current) {
        moving.current = true;
        raf.current = requestAnimationFrame(tick);
      }
      window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
        moving.current = false;
      }, 120);
    };

    const onMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      kick();
    };

    const onOver = (e) => {
      const el = e.target.closest('[data-cursor]');
      if (!el) {
        setMode('default');
        return;
      }
      setMode(el.getAttribute('data-cursor') || 'interactive');
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, true);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver, true);
      window.clearTimeout(idleTimer.current);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  const interactive = mode === 'interactive' || mode === 'project';

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
      <div
        ref={dotRef}
        className="absolute top-0 left-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/90"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        className={`absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/40 transition-[width,height,opacity] duration-300 ease-out ${
          interactive ? 'h-12 w-12 opacity-80' : 'h-9 w-9 opacity-45'
        }`}
        style={{ willChange: 'transform' }}
      />
    </div>
  );
}

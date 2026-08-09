'use client';

import { useEffect, useRef } from 'react';
import { damp } from '@/lib/motion';

/**
 * Smoothly lags behind the pointer for physical weight.
 * Returns a ref: { x, y } in -1..1 normalized space.
 */
export function useDampedPointer(factor = damp.pointer) {
  const current = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  useEffect(() => {
    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      target.current.x = nx;
      target.current.y = ny;
    };

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * factor;
      current.current.y += (target.current.y - current.current.y) * factor;
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [factor]);

  return current;
}

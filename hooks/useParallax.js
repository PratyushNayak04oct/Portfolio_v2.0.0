'use client';

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Smooth scroll parallax for a DOM node.
 * @param {number} strength - px shift at full section scroll (keep subtle)
 */
export function useParallax(strength = 40) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return undefined;

    let raf = 0;
    let current = 0;
    let target = 0;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const view = window.innerHeight || 1;
      const progress = (view / 2 - (rect.top + rect.height / 2)) / view;
      target = progress * strength;
    };

    const tick = () => {
      current += (target - current) * 0.08;
      el.style.transform = `translate3d(0, ${current}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced, strength]);

  return ref;
}

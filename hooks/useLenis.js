'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { getGsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

let lenisInstance = null;

export function getLenis() {
  return lenisInstance;
}

/**
 * Smooth scroll via Lenis, synced with GSAP ScrollTrigger + the RAF ticker
 * so reactor / BRUNO transforms stay locked to scroll.
 */
export function useLenis() {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return undefined;

    const { gsap, ScrollTrigger } = getGsap();

    const lenis = new Lenis({
      lerp: 0.075,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.15,
      wheelMultiplier: 0.92,
    });

    lenisInstance = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisInstance = null;
      ScrollTrigger.refresh();
    };
  }, [reducedMotion]);
}

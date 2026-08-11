'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { getGsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useLabStore } from '@/lib/labStore';

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
  const { loaded } = useLabStore();

  useEffect(() => {
    if (reducedMotion) return undefined;

    const { gsap, ScrollTrigger } = getGsap();

    const lenis = new Lenis({
      lerp: 0.055,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.05,
      wheelMultiplier: 0.82,
    });

    lenisInstance = lenis;
    lenis.scrollTo(0, { immediate: true });

    // Keep Lenis stopped until the loader hands off
    if (!loaded) lenis.stop();
    else lenis.start();

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

  useEffect(() => {
    if (!lenisInstance) return;
    if (loaded) lenisInstance.start();
    else lenisInstance.stop();
  }, [loaded]);
}

'use client';

import { useEffect } from 'react';
import { getLenis } from '@/hooks/useLenis';

/**
 * Always start at the top on full page load / reload.
 * Prevents browser scroll restoration from leaving the visitor mid-page.
 */
export function useScrollReset() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const reset = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      }
    };

    reset();
    // After Lenis mounts / layout paints
    const t1 = window.setTimeout(reset, 0);
    const t2 = window.setTimeout(reset, 120);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);
}

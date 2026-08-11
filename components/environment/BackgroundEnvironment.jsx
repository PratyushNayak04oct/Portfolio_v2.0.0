'use client';

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Lightweight atmosphere — no backdrop-filter blurs / per-shape RAF
 * (those were a major fan/GPU cost).
 */
export default function BackgroundEnvironment() {
  const layerRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    let raf = 0;
    let y = 0;
    let target = 0;
    let pending = false;

    const paint = () => {
      pending = false;
      y += (target - y) * 0.12;
      if (layerRef.current) {
        layerRef.current.style.transform = `translate3d(0, ${y * 0.035}px, 0)`;
      }
      if (Math.abs(target - y) > 0.4) {
        raf = requestAnimationFrame(paint);
        pending = true;
      }
    };

    const onScroll = () => {
      target = window.scrollY;
      if (!pending) {
        pending = true;
        raf = requestAnimationFrame(paint);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-deepest" />
      <div className="absolute inset-0 bg-primary/[0.98]" />
      <div
        ref={layerRef}
        className="absolute inset-[-12%] will-change-transform opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 74% 28%, rgba(90,160,255,0.08), transparent 70%), radial-gradient(ellipse 55% 48% at 16% 78%, rgba(60,200,180,0.05), transparent 68%), radial-gradient(ellipse 48% 42% at 50% 50%, rgba(180,210,240,0.03), transparent 75%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(200,230,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(200,230,255,0.35) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage:
            'radial-gradient(ellipse 78% 68% at 50% 40%, black, transparent)',
        }}
      />
    </div>
  );
}

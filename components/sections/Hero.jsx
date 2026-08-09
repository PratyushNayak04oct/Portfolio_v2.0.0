'use client';

import { useEffect, useRef } from 'react';
import { site } from '@/data/site';
import MagneticButton from '@/components/ui/MagneticButton';
import { getGsap } from '@/lib/gsap';
import { duration, ease } from '@/lib/motion';
import { useLabStore } from '@/lib/labStore';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export default function Hero() {
  const root = useRef(null);
  const { loaded } = useLabStore();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!loaded || !root.current) return undefined;

    const { gsap } = getGsap();

    if (reduced) {
      gsap.set(root.current.querySelectorAll('[data-hero]'), { autoAlpha: 1, y: 0, filter: 'none' });
      return undefined;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: ease.soft } });

      tl.fromTo(
        '[data-hero="ambient"]',
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: duration.section },
      )
        .fromTo(
          '[data-hero="meta"]',
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: duration.text },
          '-=0.4',
        )
        .fromTo(
          '[data-hero="brand"]',
          { autoAlpha: 0, y: 24, filter: 'blur(6px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: duration.text },
          '-=0.2',
        )
        .fromTo(
          '[data-hero="line"]',
          { autoAlpha: 0, y: 36 },
          { autoAlpha: 1, y: 0, duration: duration.text, stagger: 0.12 },
          '-=0.15',
        )
        .fromTo(
          '[data-hero="support"]',
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: duration.text },
          '-=0.25',
        )
        .fromTo(
          '[data-hero="cta"]',
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: duration.button },
          '-=0.2',
        )
        .fromTo(
          '[data-hero="reactor-slot"]',
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: duration.cinematic },
          '-=0.6',
        );
    }, root);

    return () => ctx.revert();
  }, [loaded, reduced]);

  return (
    <section
      id="hero"
      ref={root}
      className="relative z-10 flex min-h-[100svh] items-center pt-24 pb-16"
    >
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-12 gap-6 px-5 md:px-8">
        <div className="col-span-12 flex flex-col justify-center lg:col-span-6">
          <p
            data-hero="meta"
            className="font-mono text-tech uppercase text-ink-muted opacity-0"
          >
            LAB.COORD // 00.01 — MIDNIGHT
          </p>

          <p
            data-hero="brand"
            className="mt-6 font-display text-sub font-medium tracking-[0.08em] text-ink opacity-0"
          >
            {site.brand}
          </p>

          <p className="mt-2 font-mono text-tech uppercase text-cyan opacity-90">
            {site.roles.join(' · ')}
          </p>

          <h1 className="mt-8 font-display font-medium text-ink">
            <span data-hero="line" className="block text-hero opacity-0">
              I BUILD
            </span>
            <span data-hero="line" className="block text-hero opacity-0">
              DIGITAL SYSTEMS.
            </span>
          </h1>

          <p
            data-hero="support"
            className="mt-6 max-w-md text-ink-secondary opacity-0"
          >
            And experiences that feel alive.
          </p>

          <div data-hero="cta" className="mt-10 flex flex-wrap gap-4 opacity-0">
            <MagneticButton href="#projects">
              Explore my work <span aria-hidden="true">→</span>
            </MagneticButton>
            <MagneticButton href="#contact" variant="ghost">
              Let&apos;s connect <span aria-hidden="true">↗</span>
            </MagneticButton>
          </div>
        </div>

        <div
          data-hero="reactor-slot"
          className="relative col-span-12 flex min-h-[42vh] items-center justify-center opacity-0 lg:col-span-6 lg:min-h-[70vh]"
        >
          <div data-hero="ambient" className="absolute inset-0 opacity-0">
            <div
              className="absolute left-1/2 top-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              style={{
                background:
                  'radial-gradient(circle, color-mix(in srgb, var(--blue) 35%, transparent), transparent 70%)',
                animation: 'softPulse 6s ease-in-out infinite',
              }}
            />
          </div>
          {/* Reactor canvas mounts globally; this reserves visual space */}
          <div className="pointer-events-none relative z-10 h-full w-full" />
        </div>
      </div>
    </section>
  );
}

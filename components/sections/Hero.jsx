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
      gsap.set(root.current.querySelectorAll('[data-hero]'), {
        autoAlpha: 1,
        y: 0,
        filter: 'none',
      });
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
          {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: duration.text,
          },
          '-=0.2',
        )
        .fromTo(
          '[data-hero="role"]',
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: duration.text },
          '-=0.35',
        )
        .fromTo(
          '[data-hero="line"]',
          { autoAlpha: 0, y: 36 },
          { autoAlpha: 1, y: 0, duration: duration.text, stagger: 0.14 },
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
      className="relative z-20 flex min-h-[100svh] items-center pt-28 pb-20"
    >
      <div className="content-grid grid w-full grid-cols-12 gap-10 lg:gap-12">
        <div className="copy-above-reactor copy-plate col-span-12 flex flex-col justify-center lg:col-span-6">
          <p
            data-hero="meta"
            className="text-depth-soft font-mono text-tech uppercase tracking-[0.18em] text-ink-secondary opacity-0"
          >
            LAB.COORD // 00.01 — MIDNIGHT
          </p>

          <p
            data-hero="brand"
            className="text-depth text-shimmer mt-8 font-display text-sub font-medium tracking-[0.08em] text-ink opacity-0"
          >
            {site.fullName}
          </p>

          <p
            data-hero="role"
            className="text-depth-soft mt-3 font-mono text-tech uppercase tracking-[0.14em] text-cyan opacity-0"
          >
            {site.roles.join(' · ')}
          </p>

          <h1 className="text-depth mt-10 font-display font-medium text-ink">
            <span data-hero="line" className="block text-hero opacity-0">
              I BUILD
            </span>
            <span
              data-hero="line"
              className="mt-1 block text-hero opacity-0"
            >
              DIGITAL SYSTEMS.
            </span>
          </h1>

          <p
            data-hero="support"
            className="text-depth-soft mt-8 max-w-md text-sub leading-relaxed text-ink-secondary opacity-0"
          >
            And experiences that feel alive.
          </p>

          <div data-hero="cta" className="mt-12 flex flex-wrap gap-5 opacity-0">
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
          className="relative col-span-12 flex min-h-[40vh] items-center justify-center opacity-0 lg:col-span-6 lg:min-h-[65vh]"
        >
          <div data-hero="ambient" className="absolute inset-0 opacity-0">
            <div
              className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              style={{
                background:
                  'radial-gradient(circle, color-mix(in srgb, var(--cyan) 45%, transparent), color-mix(in srgb, var(--blue) 25%, transparent) 45%, transparent 72%)',
                animation: 'softPulse 7s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

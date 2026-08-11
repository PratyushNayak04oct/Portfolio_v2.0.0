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

    // Rise with the veil dissolve — no blur filters (those hitch the handoff)
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: ease.soft },
        delay: 0.35,
      });

      tl.fromTo(
        '[data-hero="ambient"]',
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: duration.section * 1.15 },
      )
        .fromTo(
          '[data-hero="meta"]',
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: duration.text * 1.1 },
          '-=0.45',
        )
        .fromTo(
          '[data-hero="brand"]',
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: duration.text * 1.15 },
          '-=0.25',
        )
        .fromTo(
          '[data-hero="role"]',
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: duration.text },
          '-=0.4',
        )
        .fromTo(
          '[data-hero="line"]',
          { autoAlpha: 0, y: 36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: duration.text * 1.2,
            stagger: 0.14,
          },
          '-=0.2',
        )
        .fromTo(
          '[data-hero="support"]',
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: duration.text * 1.05 },
          '-=0.3',
        )
        .fromTo(
          '[data-hero="cta"]',
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: duration.button * 1.1 },
          '-=0.25',
        )
        .fromTo(
          '[data-hero="reactor-slot"]',
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: duration.cinematic * 1.15 },
          '-=0.7',
        );
    }, root);

    return () => ctx.revert();
  }, [loaded, reduced]);

  return (
    <section
      id="hero"
      ref={root}
      className="relative z-20 flex min-h-[100svh] items-center pt-24 pb-16 sm:pt-28 sm:pb-20"
    >
      <div className="content-grid grid w-full grid-cols-12 gap-6 sm:gap-10 lg:gap-12">
        <div className="copy-above-reactor copy-plate col-span-12 flex flex-col justify-center lg:col-span-6">
          <p
            data-hero="meta"
            className="text-depth-soft font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-secondary opacity-0 sm:text-tech sm:tracking-[0.18em]"
          >
            LAB.COORD // 00.01 — MIDNIGHT
          </p>

          <p
            data-hero="brand"
            className="text-depth mt-5 font-display text-[clamp(1.15rem,3.5vw,1.75rem)] font-medium tracking-[0.06em] text-ink opacity-0 sm:mt-8 sm:tracking-[0.08em]"
            style={{ color: 'var(--text-primary)', WebkitTextFillColor: 'var(--text-primary)' }}
          >
            {site.fullName}
          </p>

          <p
            data-hero="role"
            className="text-depth-soft mt-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-cyan opacity-0 sm:mt-3 sm:text-tech sm:tracking-[0.14em]"
          >
            {site.roles.join(' · ')}
          </p>

          <h1
            className="text-depth mt-7 font-display font-medium text-ink sm:mt-10"
            style={{ color: 'var(--text-primary)', WebkitTextFillColor: 'var(--text-primary)' }}
          >
            <span data-hero="line" className="block text-hero text-tech-scan will-change-transform opacity-0">
              I BUILD
            </span>
            <span
              data-hero="line"
              className="mt-1 block break-words text-hero will-change-transform opacity-0 [overflow-wrap:anywhere]"
            >
              DIGITAL SYSTEMS.
            </span>
          </h1>

          <p
            data-hero="support"
            className="text-depth-soft mt-8 max-w-md text-sub leading-relaxed text-ink-secondary will-change-transform opacity-0"
          >
            <span className="text-tech-glow">And experiences that feel alive.</span>
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
          className="relative col-span-12 flex min-h-[12vh] items-center justify-center opacity-0 sm:min-h-[28vh] lg:col-span-6 lg:min-h-[65vh]"
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

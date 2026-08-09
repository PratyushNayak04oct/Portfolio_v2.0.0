'use client';

import { useEffect, useRef } from 'react';
import MagneticButton from '@/components/ui/MagneticButton';
import { useLabStore } from '@/lib/labStore';
import { getGsap } from '@/lib/gsap';
import { duration, ease } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { site } from '@/data/site';

export default function Contact() {
  const root = useRef(null);
  const { systemOnline, power } = useLabStore();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!root.current) return undefined;
    const { gsap } = getGsap();

    if (reduced) {
      gsap.set(root.current.querySelectorAll('[data-cta]'), {
        autoAlpha: 1,
        y: 0,
      });
      return undefined;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-cta]',
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: duration.cinematic,
          ease: ease.soft,
          stagger: 0.12,
          scrollTrigger: {
            trigger: root.current,
            start: 'top 65%',
          },
        },
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      id="contact"
      ref={root}
      className="relative z-10 flex min-h-[92svh] items-center section-space"
    >
      <div className="content-grid grid w-full grid-cols-12 gap-10 lg:gap-12">
        <div className="col-span-12 lg:col-span-8">
          <p
            data-cta
            className="font-mono text-tech uppercase tracking-[0.16em] text-cyan opacity-0"
          >
            06 — Final sequence
          </p>
          <h2 className="mt-8 font-display font-medium text-ink">
            <span data-cta className="block text-statement opacity-0">
              LET&apos;S BUILD
            </span>
            <span data-cta className="mt-2 block text-statement opacity-0">
              SOMETHING
            </span>
            <span data-cta className="mt-2 block text-statement opacity-0">
              REMARKABLE.
            </span>
          </h2>
          <p
            data-cta
            className="mt-10 max-w-lg text-sub leading-relaxed text-ink-secondary opacity-0"
          >
            Have an idea? Let&apos;s turn it into something real.
          </p>
          <div data-cta className="mt-12 opacity-0">
            <MagneticButton href={`mailto:${site.email}`}>
              Start a project <span aria-hidden="true">↗</span>
            </MagneticButton>
          </div>
        </div>

        <div
          data-cta
          className="col-span-12 opacity-0 lg:col-span-3 lg:col-start-10"
        >
          <div className="glass-panel rounded-2xl p-7 md:p-8">
            <p className="font-mono text-tech uppercase tracking-[0.16em] text-ink-muted">
              Reactor power
            </p>
            <p className="mt-4 font-display text-project text-ink">
              {Math.round(power)}%
            </p>
            <p className="mt-3 font-mono text-tech uppercase tracking-[0.14em] text-teal">
              {systemOnline || power >= 100 ? '● SYSTEM ONLINE' : '● POWERING'}
            </p>
            <p className="mt-8 font-mono text-tech uppercase tracking-[0.12em] text-ink-muted">
              B.R.U.N.O. // Beside the core
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

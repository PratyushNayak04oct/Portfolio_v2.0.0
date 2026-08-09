'use client';

import { useEffect, useRef } from 'react';
import { experience } from '@/data/experience';
import SectionHeading from '@/components/typography/SectionHeading';
import { getGsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export default function Experience() {
  const lineRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !lineRef.current) return undefined;
    const { gsap } = getGsap();
    const tween = gsap.fromTo(
      lineRef.current,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '#experience',
          start: 'top 60%',
          end: 'bottom 40%',
          scrub: 0.6,
        },
      },
    );
    return () => tween.kill();
  }, [reduced]);

  return (
    <section id="experience" className="relative z-10 py-28 md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <SectionHeading
          eyebrow="02 — Experience"
          title="A cinematic timeline."
          subtitle="Roles shaped by systems thinking, clarity, and delivery."
        />

        <div className="relative mt-16 grid grid-cols-12 gap-8">
          <div className="absolute top-0 bottom-0 left-4 w-px bg-line md:left-1/2">
            <div
              ref={lineRef}
              className="origin-top h-full w-full bg-gradient-to-b from-blue via-cyan to-teal"
              style={{ transform: 'scaleY(0)' }}
            />
          </div>

          {experience.map((item, i) => (
            <article
              key={item.year + item.role}
              className={`col-span-12 md:col-span-5 ${
                i % 2 === 0 ? 'md:col-start-1 md:pr-12' : 'md:col-start-8'
              }`}
            >
              <p className="font-mono text-tech text-cyan">{item.year}</p>
              <h3 className="mt-3 font-display text-project text-ink">
                {item.role}
              </h3>
              <p className="mt-2 font-mono text-meta uppercase text-ink-muted">
                {item.company}
              </p>
              <p className="mt-4 text-ink-secondary">{item.summary}</p>
              <ul className="mt-5 space-y-2">
                {item.highlights.map((h) => (
                  <li
                    key={h}
                    className="font-mono text-tech uppercase text-ink-muted"
                  >
                    — {h}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

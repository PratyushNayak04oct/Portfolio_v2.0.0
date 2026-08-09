'use client';

import { useEffect, useRef } from 'react';
import { experience } from '@/data/experience';
import SectionHeading from '@/components/typography/SectionHeading';
import AnimatedText from '@/components/typography/AnimatedText';
import { getGsap } from '@/lib/gsap';
import { duration, ease } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useParallax } from '@/hooks/useParallax';

export default function Experience() {
  const lineRef = useRef(null);
  const listRef = useRef(null);
  const headingRef = useParallax(28);
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
          end: 'bottom 35%',
          scrub: 0.75,
        },
      },
    );
    return () => tween.kill();
  }, [reduced]);

  useEffect(() => {
    if (reduced || !listRef.current) return undefined;
    const { gsap } = getGsap();
    const cards = listRef.current.querySelectorAll('[data-exp-card]');
    const tween = gsap.fromTo(
      cards,
      { autoAlpha: 0, y: 48, filter: 'blur(6px)' },
      {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: duration.section,
        ease: ease.soft,
        stagger: 0.16,
        scrollTrigger: {
          trigger: listRef.current,
          start: 'top 78%',
        },
      },
    );
    return () => tween.kill();
  }, [reduced]);

  return (
    <section id="experience" className="relative z-20 section-space">
      <div className="content-grid">
        <div ref={headingRef} className="will-change-transform">
          <SectionHeading
            eyebrow="02 — Experience"
            title="A cinematic timeline."
            subtitle="Roles shaped by systems thinking, clarity, and delivery."
          />
        </div>

        <div
          ref={listRef}
          className="relative mt-14 grid grid-cols-12 gap-x-6 gap-y-12 sm:mt-20 sm:gap-x-8 sm:gap-y-16 md:mt-24"
        >
          <div className="absolute top-0 bottom-0 left-4 w-px bg-line/70 md:left-1/2">
            <div
              ref={lineRef}
              className="h-full w-full origin-top bg-gradient-to-b from-blue via-cyan to-teal"
              style={{ transform: 'scaleY(0)' }}
            />
          </div>

          {experience.map((item, i) => (
            <article
              key={item.year + item.role}
              data-exp-card
              className={`col-span-12 opacity-0 md:col-span-5 ${
                i % 2 === 0 ? 'md:col-start-1 md:pr-14' : 'md:col-start-8'
              }`}
            >
              <div className="glass-soft rounded-2xl p-7 md:p-8">
                <p className="font-mono text-tech text-cyan">{item.year}</p>
                <AnimatedText
                  as="h3"
                  mode="rise"
                  delay={0.05}
                  className="mt-4 font-display text-project text-ink"
                >
                  {item.role}
                </AnimatedText>
                <p className="mt-2 font-mono text-meta uppercase text-ink-secondary">
                  {item.company}
                </p>
                <AnimatedText
                  as="p"
                  mode="blur"
                  delay={0.08}
                  className="mt-5 leading-relaxed text-ink-secondary"
                >
                  {item.summary}
                </AnimatedText>
                <ul className="mt-6 space-y-3">
                  {item.highlights.map((h) => (
                    <li
                      key={h}
                      className="font-mono text-tech uppercase tracking-[0.12em] text-ink-muted"
                    >
                      — {h}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

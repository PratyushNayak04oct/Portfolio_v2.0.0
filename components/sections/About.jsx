'use client';

import SectionHeading from '@/components/typography/SectionHeading';
import AnimatedText from '@/components/typography/AnimatedText';
import { useParallax } from '@/hooks/useParallax';

export default function About() {
  const parallax = useParallax(36);

  return (
    <section id="about" className="relative z-10 section-space">
      <div className="content-grid grid grid-cols-12 gap-x-8 gap-y-14 lg:gap-x-12">
        <div ref={parallax} className="col-span-12 will-change-transform lg:col-span-7">
          <SectionHeading eyebrow="01 — About" title="I BUILD SYSTEMS." />
          <AnimatedText
            as="p"
            delay={0.12}
            className="mt-10 max-w-xl text-sub leading-relaxed text-ink-secondary"
          >
            From enterprise applications to interactive web experiences, I enjoy
            turning complex problems into intuitive digital products.
          </AnimatedText>
        </div>

        <div className="col-span-12 lg:col-span-4 lg:col-start-9">
          <div className="glass-panel rounded-2xl p-8 md:p-10">
            <div className="flex flex-col gap-8">
              <AnimatedText
                as="p"
                className="font-mono text-tech uppercase tracking-[0.16em] text-ink-muted"
              >
                Systems Engineer
              </AnimatedText>
              <AnimatedText
                as="p"
                delay={0.08}
                className="font-mono text-tech uppercase tracking-[0.16em] text-ink-muted"
              >
                Creative Developer
              </AnimatedText>
              <AnimatedText
                as="p"
                delay={0.16}
                className="font-mono text-tech uppercase tracking-[0.16em] text-cyan"
              >
                Midnight Lab Operator
              </AnimatedText>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

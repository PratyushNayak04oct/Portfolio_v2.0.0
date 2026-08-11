'use client';

import SectionHeading from '@/components/typography/SectionHeading';
import AnimatedText from '@/components/typography/AnimatedText';
import { useParallax } from '@/hooks/useParallax';

export default function About() {
  const parallax = useParallax(36);

  return (
    <section id="about" className="relative z-20 section-space">
      <div className="content-grid grid grid-cols-12 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-14 lg:gap-x-12">
        <div
          ref={parallax}
          className="copy-above-reactor copy-plate col-span-12 will-change-transform lg:col-span-7"
        >
          <SectionHeading eyebrow="01 — About" title="I BUILD SYSTEMS." />
          <AnimatedText
            as="p"
            mode="words"
            delay={0.12}
            stagger={0.028}
            className="text-depth-soft mt-6 max-w-xl text-[clamp(1.05rem,2.4vw,1.75rem)] leading-relaxed text-ink-secondary sm:mt-10 sm:text-sub"
          >
            From enterprise applications to interactive web experiences, I enjoy turning complex problems into intuitive digital products.
          </AnimatedText>
        </div>

        <div className="col-span-12 lg:col-span-4 lg:col-start-9">
          <div className="glass-panel rounded-2xl p-8 md:p-10">
            <div className="flex flex-col gap-8">
              <AnimatedText
                as="p"
                className="font-mono text-tech uppercase tracking-[0.16em] text-ink-secondary"
              >
                Creative Developer
              </AnimatedText>
              <AnimatedText
                as="p"
                delay={0.08}
                className="font-mono text-tech uppercase tracking-[0.16em] text-ink-secondary"
              >
                Interactive Experiences
              </AnimatedText>
              <AnimatedText
                as="p"
                delay={0.16}
                mode="chars"
                stagger={0.03}
                className="hud-blink font-mono text-tech uppercase tracking-[0.16em] text-cyan text-tech-glow"
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

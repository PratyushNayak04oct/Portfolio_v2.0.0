'use client';

import SectionHeading from '@/components/typography/SectionHeading';
import AnimatedText from '@/components/typography/AnimatedText';

export default function About() {
  return (
    <section id="about" className="relative z-10 py-28 md:py-36">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-8 px-5 md:px-8">
        <div className="col-span-12 lg:col-span-7">
          <SectionHeading eyebrow="01 — About" title="I BUILD SYSTEMS." />
          <AnimatedText
            as="p"
            delay={0.12}
            className="mt-8 max-w-2xl text-sub text-ink-secondary"
          >
            From enterprise applications to interactive web experiences, I enjoy
            turning complex problems into intuitive digital products.
          </AnimatedText>
        </div>
        <div className="col-span-12 flex flex-col justify-end gap-6 lg:col-span-4 lg:col-start-9">
          <AnimatedText
            as="p"
            className="font-mono text-tech uppercase text-ink-muted"
          >
            Systems Engineer
          </AnimatedText>
          <AnimatedText
            as="p"
            delay={0.08}
            className="font-mono text-tech uppercase text-ink-muted"
          >
            Creative Developer
          </AnimatedText>
          <AnimatedText
            as="p"
            delay={0.16}
            className="font-mono text-tech uppercase text-cyan"
          >
            Midnight Lab Operator
          </AnimatedText>
        </div>
      </div>
    </section>
  );
}

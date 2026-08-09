'use client';

import { skillGroups, philosophy } from '@/data/skills';
import SectionHeading from '@/components/typography/SectionHeading';
import SkillsNodeGraph from '@/components/technical/SkillsNodeGraph';
import AnimatedText from '@/components/typography/AnimatedText';
import { useParallax } from '@/hooks/useParallax';

export default function Skills() {
  const headingRef = useParallax(24);

  return (
    <section id="skills" className="relative z-20 section-space">
      <div className="content-grid">
        <div ref={headingRef} className="will-change-transform">
          <SectionHeading
            eyebrow="03 — Capabilities"
            title="Systems, interfaces, and creative technology."
          />
        </div>

        <div className="mt-16 grid grid-cols-12 gap-5 md:mt-20 md:gap-6">
          {skillGroups.map((group) => (
            <div
              key={group.id}
              className="glass-soft col-span-12 rounded-2xl p-7 sm:col-span-6 lg:col-span-3"
            >
              <AnimatedText
                as="h3"
                className="font-mono text-tech uppercase tracking-[0.16em] text-cyan"
              >
                {group.title}
              </AnimatedText>
              <ul className="mt-6 space-y-4">
                {group.items.map((item) => (
                  <li key={item} className="font-display text-sub text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-12 gap-10 md:mt-24 lg:gap-14">
          <div className="col-span-12 lg:col-span-7">
            <div className="glass-panel overflow-hidden rounded-2xl">
              <SkillsNodeGraph />
            </div>
          </div>
          <div className="col-span-12 space-y-10 lg:col-span-5">
            {philosophy.map((item) => (
              <div key={item.title}>
                <AnimatedText
                  as="h3"
                  className="font-mono text-tech uppercase tracking-[0.16em] text-ink"
                >
                  {item.title}
                </AnimatedText>
                <AnimatedText
                  as="p"
                  delay={0.05}
                  className="mt-3 max-w-md leading-relaxed text-ink-secondary"
                >
                  {item.copy}
                </AnimatedText>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

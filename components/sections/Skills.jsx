'use client';

import { skillGroups, philosophy } from '@/data/skills';
import SectionHeading from '@/components/typography/SectionHeading';
import SkillsNodeGraph from '@/components/technical/SkillsNodeGraph';
import AnimatedText from '@/components/typography/AnimatedText';

export default function Skills() {
  return (
    <section id="skills" className="relative z-10 py-28 md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <SectionHeading
          eyebrow="03 — Capabilities"
          title="Systems, interfaces, and creative technology."
        />

        <div className="mt-16 grid grid-cols-12 gap-6">
          {skillGroups.map((group) => (
            <div
              key={group.id}
              className="col-span-12 border-t border-line pt-6 sm:col-span-6 lg:col-span-3"
            >
              <AnimatedText
                as="h3"
                className="font-mono text-tech uppercase text-cyan"
              >
                {group.title}
              </AnimatedText>
              <ul className="mt-5 space-y-3">
                {group.items.map((item) => (
                  <li key={item} className="font-display text-sub text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7">
            <SkillsNodeGraph />
          </div>
          <div className="col-span-12 space-y-8 lg:col-span-5">
            {philosophy.map((item) => (
              <div key={item.title}>
                <AnimatedText
                  as="h3"
                  className="font-mono text-tech uppercase text-ink"
                >
                  {item.title}
                </AnimatedText>
                <AnimatedText
                  as="p"
                  delay={0.05}
                  className="mt-2 text-ink-secondary"
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

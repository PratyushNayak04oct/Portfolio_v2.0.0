'use client';

import { useState } from 'react';
import SectionHeading from '@/components/typography/SectionHeading';
import TechnicalArchitecture from '@/components/technical/TechnicalArchitecture';
import AnimatedText from '@/components/typography/AnimatedText';

const experiments = [
  {
    id: 'webgl',
    title: 'WebGL Light Fields',
    tag: 'Three.js',
    copy: 'Soft volumetric accents without neon overload.',
  },
  {
    id: 'mcp',
    title: 'MCP Tooling Surfaces',
    tag: 'AI / MCP',
    copy: 'Experimental interfaces for agent-tool orchestration.',
  },
  {
    id: 'motion',
    title: 'Mechanical Scroll Rig',
    tag: 'GSAP',
    copy: 'Weighted, inertia-led section storytelling.',
  },
  {
    id: 'blender',
    title: 'Asset Pipeline Notes',
    tag: 'Blender',
    copy: 'From blockout to web-optimized GLB workflows.',
  },
];

export default function Lab() {
  const [active, setActive] = useState(experiments[0].id);
  const current = experiments.find((e) => e.id === active) || experiments[0];

  return (
    <section id="lab" className="relative z-10 py-28 md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <SectionHeading
          eyebrow="05 — Lab"
          title="LAB"
          subtitle="Experiments in WebGL, motion, AI tooling, and real-time systems."
        />

        <div className="mt-16 grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-5">
            <ul className="space-y-2">
              {experiments.map((exp) => {
                const on = exp.id === active;
                return (
                  <li key={exp.id}>
                    <button
                      type="button"
                      data-cursor="interactive"
                      onClick={() => setActive(exp.id)}
                      onMouseEnter={() => setActive(exp.id)}
                      className={`flex w-full items-center justify-between border px-4 py-4 text-left transition-all duration-400 ${
                        on
                          ? 'border-cyan/40 bg-surface/70'
                          : 'border-line/60 bg-transparent hover:border-line'
                      }`}
                    >
                      <span className="font-display text-sub text-ink">
                        {exp.title}
                      </span>
                      <span className="font-mono text-tech uppercase text-ink-muted">
                        {exp.tag}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <AnimatedText as="p" className="mt-8 max-w-md text-ink-secondary">
              {current.copy}
            </AnimatedText>
          </div>

          <div className="col-span-12 lg:col-span-7">
            <div className="relative mb-8 aspect-[16/10] overflow-hidden border border-line/70 bg-primary">
              <div
                className="absolute inset-0 transition-opacity duration-700"
                style={{
                  background:
                    active === 'webgl'
                      ? 'radial-gradient(circle at 60% 40%, rgba(38,120,255,0.35), transparent 55%), #081118'
                      : active === 'mcp'
                        ? 'linear-gradient(135deg, rgba(25,182,165,0.2), transparent 50%), #081118'
                        : active === 'motion'
                          ? 'linear-gradient(120deg, rgba(99,199,217,0.2), transparent 45%), #081118'
                          : 'radial-gradient(circle at 30% 70%, rgba(242,140,91,0.15), transparent 50%), #081118',
                }}
              />
              <div className="absolute inset-0 flex items-end p-6">
                <p className="font-mono text-tech uppercase text-cyan">
                  Experiment // {current.tag}
                </p>
              </div>
              {/* Subtle interactive grid */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(99,199,217,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,199,217,0.3) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
            </div>
            <TechnicalArchitecture />
          </div>
        </div>
      </div>
    </section>
  );
}

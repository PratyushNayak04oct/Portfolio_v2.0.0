'use client';

import { useState } from 'react';
import SectionHeading from '@/components/typography/SectionHeading';
import TechnicalArchitecture from '@/components/technical/TechnicalArchitecture';
import AnimatedText from '@/components/typography/AnimatedText';
import { useParallax } from '@/hooks/useParallax';

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
  const headingRef = useParallax(22);

  return (
    <section id="lab" className="relative z-20 section-space">
      <div className="content-grid">
        <div ref={headingRef} className="will-change-transform">
          <SectionHeading
            eyebrow="05 — Lab"
            title="LAB"
            subtitle="Experiments in WebGL, motion, AI tooling, and real-time systems."
          />
        </div>

        <div className="mt-16 grid grid-cols-12 gap-10 md:mt-20 lg:gap-14">
          <div className="col-span-12 lg:col-span-5">
            <ul className="space-y-3">
              {experiments.map((exp) => {
                const on = exp.id === active;
                return (
                  <li key={exp.id}>
                    <button
                      type="button"
                      data-cursor="interactive"
                      onClick={() => setActive(exp.id)}
                      onMouseEnter={() => setActive(exp.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-5 py-5 text-left transition-all duration-400 ${
                        on
                          ? 'glass-panel'
                          : 'border border-transparent hover:border-line/80 hover:bg-secondary/30'
                      }`}
                    >
                      <span className="font-display text-sub text-ink">
                        {exp.title}
                      </span>
                      <span className="font-mono text-tech uppercase text-ink-secondary">
                        {exp.tag}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <AnimatedText
              as="p"
              className="mt-10 max-w-md leading-relaxed text-ink-secondary"
            >
              {current.copy}
            </AnimatedText>
          </div>

          <div className="col-span-12 space-y-6 lg:col-span-7">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/5 bg-primary">
              <div
                className="absolute inset-0 transition-opacity duration-700"
                style={{
                  background:
                    active === 'webgl'
                      ? 'radial-gradient(circle at 60% 40%, rgba(38,120,255,0.4), transparent 55%), #081118'
                      : active === 'mcp'
                        ? 'linear-gradient(135deg, rgba(25,182,165,0.25), transparent 50%), #081118'
                        : active === 'motion'
                          ? 'linear-gradient(120deg, rgba(99,199,217,0.25), transparent 45%), #081118'
                          : 'radial-gradient(circle at 30% 70%, rgba(242,140,91,0.18), transparent 50%), #081118',
                }}
              />
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(99,199,217,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(99,199,217,0.35) 1px, transparent 1px)',
                  backgroundSize: '44px 44px',
                }}
              />
              <div className="absolute inset-0 flex items-end p-7">
                <p className="font-mono text-tech uppercase tracking-[0.16em] text-cyan">
                  Experiment // {current.tag}
                </p>
              </div>
            </div>
            <TechnicalArchitecture />
          </div>
        </div>
      </div>
    </section>
  );
}

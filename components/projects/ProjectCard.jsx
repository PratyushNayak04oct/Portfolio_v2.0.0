'use client';

import Link from 'next/link';

export default function ProjectCard({ project, index }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      data-cursor="project"
      data-cursor-label="VIEW PROJECT ↗"
      className="group relative flex h-full min-w-[88vw] flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-secondary/25 p-7 transition-[border-color,transform,background] duration-500 ease-out hover:border-cyan/35 hover:bg-secondary/40 md:min-w-[40vw] md:p-9"
    >
      <div>
        <p className="font-mono text-tech uppercase tracking-[0.16em] text-ink-muted">
          {String(index + 1).padStart(2, '0')} — {project.year}
        </p>
        <h3 className="mt-5 font-display text-project text-ink transition-transform duration-500 ease-out group-hover:translate-x-[3px]">
          {project.title}
        </h3>
        <p className="mt-5 max-w-md leading-relaxed text-ink-secondary">
          {project.description}
        </p>
      </div>

      <div className="mt-12">
        <div className="relative mb-7 aspect-[16/10] overflow-hidden rounded-xl bg-surface">
          <div
            className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, var(--blue) ${22 + index * 8}%, #15232e), #0d1820 55%, color-mix(in srgb, var(--teal) 20%, #081118))`,
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(99,199,217,0.28),transparent_52%)]" />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="font-mono text-tech uppercase tracking-[0.12em] text-ink-muted"
            >
              {tech}
            </span>
          ))}
        </div>
        <p className="mt-5 font-sans text-nav uppercase tracking-[0.14em] text-cyan transition-transform duration-500 group-hover:translate-x-1">
          View case study →
        </p>
      </div>
    </Link>
  );
}

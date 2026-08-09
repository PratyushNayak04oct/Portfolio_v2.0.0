'use client';

import Link from 'next/link';

export default function ProjectCard({ project, index }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      data-cursor="project"
      data-cursor-label="VIEW PROJECT ↗"
      className="group relative flex h-full min-w-[85vw] flex-col justify-between border border-line/70 bg-secondary/30 p-6 transition-[border-color,transform] duration-500 ease-out hover:border-cyan/40 md:min-w-[42vw] md:p-8"
    >
      <div>
        <p className="font-mono text-tech uppercase text-ink-muted">
          {String(index + 1).padStart(2, '0')} — {project.year}
        </p>
        <h3 className="mt-4 font-display text-project text-ink transition-transform duration-500 ease-out group-hover:translate-x-[2px]">
          {project.title}
        </h3>
        <p className="mt-4 max-w-md text-ink-secondary">{project.description}</p>
      </div>

      <div className="mt-10">
        <div className="relative mb-6 aspect-[16/10] overflow-hidden bg-surface">
          <div
            className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, var(--blue) ${20 + index * 8}%, #111f28), #0d1820 55%, color-mix(in srgb, var(--teal) 18%, #081118))`,
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(99,199,217,0.2),transparent_50%)]" />
        </div>
        <div className="flex flex-wrap gap-2">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="font-mono text-tech uppercase text-ink-muted"
            >
              {tech}
            </span>
          ))}
        </div>
        <p className="mt-4 font-sans text-nav uppercase tracking-[0.14em] text-cyan transition-transform duration-500 group-hover:translate-x-1">
          View case study →
        </p>
      </div>
    </Link>
  );
}

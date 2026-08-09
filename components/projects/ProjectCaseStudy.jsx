import MagneticButton from '@/components/ui/MagneticButton';

export default function ProjectCaseStudy({ project }) {
  if (!project) return null;

  const blocks = [
    { title: 'Overview', body: project.description },
    { title: 'Challenge', body: project.problem },
    { title: 'Solution', body: project.solution },
    { title: 'Architecture', body: project.architecture },
    { title: 'Interaction', body: project.interaction },
  ];

  return (
    <article className="relative z-10">
      <header className="relative min-h-[70svh] overflow-hidden border-b border-line/60">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, color-mix(in srgb, var(--blue) 28%, #081118), #05080b 55%, color-mix(in srgb, var(--teal) 12%, #081118))',
          }}
        />
        <div className="relative mx-auto flex min-h-[70svh] max-w-[1400px] flex-col justify-end px-5 py-20 md:px-8">
          <p className="font-mono text-tech uppercase text-cyan">
            {project.year} — {project.category}
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-hero font-medium text-ink">
            {project.title}
          </h1>
          <p className="mt-6 max-w-2xl text-ink-secondary">{project.description}</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-10 px-5 py-20 md:px-8">
        <div className="col-span-12 space-y-14 lg:col-span-8">
          {blocks.map((block) => (
            <section key={block.title}>
              <h2 className="font-mono text-tech uppercase text-cyan">
                {block.title}
              </h2>
              <p className="mt-4 max-w-2xl text-sub text-ink-secondary">
                {block.body}
              </p>
            </section>
          ))}

          <section>
            <h2 className="font-mono text-tech uppercase text-cyan">Result</h2>
            <ul className="mt-4 space-y-3">
              {project.results.map((r) => (
                <li key={r} className="text-ink-secondary">
                  — {r}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="col-span-12 lg:col-span-4">
          <div className="glass-panel sticky top-28 rounded-xl p-6">
            <h2 className="font-mono text-tech uppercase text-ink-muted">
              Technology
            </h2>
            <ul className="mt-4 space-y-2">
              {project.technologies.map((t) => (
                <li key={t} className="font-display text-sub text-ink">
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3">
              <MagneticButton href={project.liveUrl} target="_blank" rel="noreferrer">
                Live project ↗
              </MagneticButton>
              <MagneticButton
                href={project.sourceUrl}
                variant="ghost"
                target="_blank"
                rel="noreferrer"
              >
                Source code ↗
              </MagneticButton>
              <MagneticButton href="/#projects" variant="ghost">
                ← Back to work
              </MagneticButton>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}

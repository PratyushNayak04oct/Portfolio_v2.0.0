'use client';

/**
 * Sparse Iron-Man-ish HUD ticks — pointer-events none, never covers content.
 */
export default function TechMicro() {
  return (
    <div className="tech-micro" aria-hidden="true">
      <span className="tech-micro__corner tech-micro__corner--tl" />
      <span className="tech-micro__corner tech-micro__corner--tr" />
      <span className="tech-micro__corner tech-micro__corner--bl" />
      <span className="tech-micro__corner tech-micro__corner--br" />
      <span className="tech-micro__scan" />
      <span className="tech-micro__tick tech-micro__tick--a" />
      <span className="tech-micro__tick tech-micro__tick--b" />
      <span className="tech-micro__tick tech-micro__tick--c" />
    </div>
  );
}

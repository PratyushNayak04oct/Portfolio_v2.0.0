'use client';

export default function BackgroundEnvironment() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-deepest" />

      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 70% 40%, color-mix(in srgb, var(--blue) 18%, transparent), transparent 70%), radial-gradient(ellipse 60% 50% at 20% 80%, color-mix(in srgb, var(--teal) 10%, transparent), transparent 65%)',
        }}
      />

      <div
        className="absolute -right-[20%] top-[10%] h-[50vh] w-[50vw] rounded-full opacity-30 blur-3xl motion-safe:animate-[ambientDrift_28s_ease-in-out_infinite_alternate]"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--cyan) 22%, transparent), transparent 70%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(color-mix(in srgb, var(--cyan) 40%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--cyan) 40%, transparent) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)',
        }}
      />

      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <span
            key={i}
            className="absolute h-px w-px rounded-full bg-cyan/40 motion-safe:animate-[particleFloat_20s_ease-in-out_infinite_alternate]"
            style={{
              left: `${8 + ((i * 17) % 84)}%`,
              top: `${12 + ((i * 23) % 76)}%`,
              opacity: 0.15 + (i % 5) * 0.05,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${18 + (i % 7) * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

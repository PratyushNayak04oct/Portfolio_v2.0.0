'use client';

import { useLabStore } from '@/lib/labStore';
import { getReactorTarget } from '@/data/reactorStory';

export default function ReactorAnnotations() {
  const { activeSection } = useLabStore();
  const target = getReactorTarget(activeSection);
  const labels = target.annotations || [];

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 hidden lg:block"
      aria-hidden="true"
    >
      {labels.map((label, i) => (
        <div
          key={`${activeSection}-${label}`}
          className="absolute font-mono text-tech uppercase tracking-[0.16em] text-ink-muted transition-all duration-700 ease-out"
          style={{
            top: i === 0 ? '18%' : '72%',
            left: i === 0 ? '8%' : 'auto',
            right: i === 0 ? 'auto' : '10%',
            opacity: 0.85,
            transform: 'translateY(0)',
          }}
        >
          <span className="mb-1 block h-px w-8 bg-cyan/50" />
          {label}
        </div>
      ))}
    </div>
  );
}

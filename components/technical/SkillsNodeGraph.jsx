'use client';

import { useState } from 'react';
import { skillLinks, skillNodes } from '@/data/skills';

export default function SkillsNodeGraph() {
  const [active, setActive] = useState(null);
  const nodeMap = Object.fromEntries(skillNodes.map((n) => [n.id, n]));

  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden bg-primary/40"
      role="img"
      aria-label="Interactive skill relationship graph"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {skillLinks.map(([a, b]) => {
          const na = nodeMap[a];
          const nb = nodeMap[b];
          if (!na || !nb) return null;
          const lit = !active || active === a || active === b;
          return (
            <line
              key={`${a}-${b}`}
              x1={na.x * 100}
              y1={na.y * 100}
              x2={nb.x * 100}
              y2={nb.y * 100}
              stroke={lit ? 'rgba(99,199,217,0.55)' : 'rgba(34,52,63,0.55)'}
              strokeWidth={lit ? 0.4 : 0.22}
              className="transition-[stroke,stroke-width] duration-500"
            />
          );
        })}
      </svg>

      {skillNodes.map((node) => {
        const lit = !active || active === node.id;
        return (
          <button
            key={node.id}
            type="button"
            data-cursor="interactive"
            onMouseEnter={() => setActive(node.id)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(node.id)}
            onBlur={() => setActive(null)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-4 py-2.5 font-mono text-tech uppercase tracking-[0.14em] transition-all duration-500 ${
              lit
                ? 'border-cyan/50 bg-surface/90 text-ink shadow-[0_0_24px_rgba(99,199,217,0.18)]'
                : 'border-line bg-primary/60 text-ink-muted'
            }`}
            style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
          >
            {node.label}
          </button>
        );
      })}
    </div>
  );
}

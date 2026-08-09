import { sections } from '@/data/site';
import { reactorStory } from '@/data/reactorStory';

/**
 * Mutable scroll-driven reactor target.
 * Written by ScrollTrigger; read every frame by the R3F scene (no React lag).
 */
export const reactorScroll = {
  progress: 0,
  sectionId: 'hero',
  target: structuredClone(reactorStory.hero),
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(t) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/** In-place numeric blend into `out` (avoids per-scroll allocations / GC hitching) */
function blendInto(out, a, b, t) {
  if (!out || !a || !b) return;
  for (const key of Object.keys(a)) {
    const av = a[key];
    const bv = b[key];
    if (typeof av === 'number' && typeof bv === 'number') {
      out[key] = lerp(av, bv, t);
    } else if (av && bv && typeof av === 'object' && !Array.isArray(av)) {
      if (!out[key] || typeof out[key] !== 'object') out[key] = {};
      blendInto(out[key], av, bv, t);
    } else {
      out[key] = t < 0.5 ? av : bv;
    }
  }
}

/**
 * Continuous story blend from document scroll progress (0–1).
 * Mutates reactorScroll.target in place.
 */
export function updateReactorScroll(scrollProgress) {
  const n = sections.length;
  reactorScroll.progress = scrollProgress;

  if (n < 2) return reactorScroll.target;

  const scaled = Math.min(1, Math.max(0, scrollProgress)) * (n - 1);
  const i0 = Math.floor(scaled);
  const i1 = Math.min(n - 1, i0 + 1);
  const local = smoothstep(scaled - i0);
  const a = reactorStory[sections[i0]] || reactorStory.hero;
  const b = reactorStory[sections[i1]] || a;

  blendInto(reactorScroll.target, a, b, local);

  const idx = Math.round(Math.min(1, Math.max(0, scrollProgress)) * (n - 1));
  reactorScroll.sectionId = sections[idx] || 'hero';
  return reactorScroll.target;
}

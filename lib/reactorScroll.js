import { sections } from '@/data/site';
import { reactorStory } from '@/data/reactorStory';

/**
 * Mutable scroll-driven reactor target.
 * Written by ScrollTrigger; read every frame by the R3F scene (no React lag).
 */
export const reactorScroll = {
  progress: 0,
  /** Extra-smoothed progress used for butterier section blends */
  smoothProgress: 0,
  sectionId: 'hero',
  target: structuredClone(reactorStory.hero),
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Quintic smootherstep — softer handoffs between sections */
function smootherstep(t) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

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
 * Section-weighted progress from real section tops so short/long
 * sections don't make the reactor jump unevenly.
 */
export function getWeightedScrollProgress() {
  if (typeof window === 'undefined') return 0;

  const tops = [];
  for (let i = 0; i < sections.length; i += 1) {
    const el = document.getElementById(sections[i]);
    if (!el) continue;
    tops.push(el.getBoundingClientRect().top + window.scrollY);
  }

  if (tops.length < 2) return 0;

  // Sample a bit below the viewport top so transitions feel centered
  const y = window.scrollY + window.innerHeight * 0.28;
  const first = tops[0];
  const last = tops[tops.length - 1];
  if (y <= first) return 0;
  if (y >= last) return 1;

  let i0 = 0;
  for (let i = 0; i < tops.length - 1; i += 1) {
    if (y >= tops[i] && y <= tops[i + 1]) {
      i0 = i;
      break;
    }
    if (y > tops[i]) i0 = i;
  }

  const i1 = Math.min(tops.length - 1, i0 + 1);
  const span = Math.max(1, tops[i1] - tops[i0]);
  const local = smootherstep((y - tops[i0]) / span);
  return (i0 + local) / (tops.length - 1);
}

/**
 * Continuous story blend. Prefer weighted section progress when available.
 */
export function updateReactorScroll(scrollProgress, opts = {}) {
  const weighted =
    opts.weighted ??
    (typeof window !== 'undefined' ? getWeightedScrollProgress() : scrollProgress);

  // Mild EMA so Lenis + section edges don't create hard steps
  const blend = opts.instant
    ? weighted
    : lerp(reactorScroll.smoothProgress || weighted, weighted, 0.2);

  reactorScroll.progress = scrollProgress;
  reactorScroll.smoothProgress = blend;

  const n = sections.length;
  if (n < 2) return reactorScroll.target;

  const scaled = Math.min(1, Math.max(0, blend)) * (n - 1);
  const i0 = Math.floor(scaled);
  const i1 = Math.min(n - 1, i0 + 1);
  const local = smootherstep(scaled - i0);
  const a = reactorStory[sections[i0]] || reactorStory.hero;
  const b = reactorStory[sections[i1]] || a;

  blendInto(reactorScroll.target, a, b, local);

  const idx = Math.round(Math.min(1, Math.max(0, blend)) * (n - 1));
  reactorScroll.sectionId = sections[idx] || 'hero';
  return reactorScroll.target;
}

/** Shared motion tokens — calm, weighted, non-aggressive */

export const duration = {
  tiny: 0.28,
  button: 0.35,
  card: 0.55,
  text: 0.7,
  section: 0.95,
  cinematic: 1.35,
};

export const ease = {
  out: 'power2.out',
  inOut: 'power2.inOut',
  soft: 'power3.out',
  mechanical: 'power1.inOut',
};

/** CSS cubic-bezier strings for Tailwind/transitions */
export const cssEase = {
  out: 'cubic-bezier(0.22, 1, 0.36, 1)',
  inOut: 'cubic-bezier(0.45, 0, 0.55, 1)',
  soft: 'cubic-bezier(0.16, 1, 0.3, 1)',
};

export const damp = {
  cursor: 0.14,
  reactor: 0.07,
  pointer: 0.1,
  parallax: 0.08,
};

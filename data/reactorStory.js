/**
 * Scroll story (front-facing always):
 * - Hero: large, front face, assembled (right)
 * - Moves around the viewport while scrolling
 * - Contact: full component reveal / explosion
 * - Scroll up reverses via the same section targets
 */

const assembled = {
  outerShell: { z: 0, scale: 1, opacity: 1, radial: 0 },
  ring01: { z: 0, rotation: 0 },
  ring02: { z: 0, rotation: 0 },
  ring03: { z: 0, rotation: 0 },
  coolingSystem: { z: 0, radial: 0 },
  magneticContainment: { z: 0, opacity: 1 },
  energyConduits: { intensity: 0.4, sequential: 0.2 },
  coreHousing: { z: 0 },
  core: { rotationSpeed: 0.06, emissive: 1.2 },
  emitter: { pulse: 0.22, intensity: 1.05 },
  camera: { z: 3.8, fov: 34 },
  /** Keep near-zero so the triangle always faces the camera */
  facing: { x: 0, y: 0 },
};

export const reactorStory = {
  hero: {
    ...structuredClone(assembled),
    layout: { x: 1.2, y: 0.08, scale: 1.55 },
    camera: { z: 3.4, fov: 32 },
    power: 12,
    status: 'FRONT FACE // STABLE',
    annotations: ['CORE / TRIANGLE', 'SYSTEM BOOT'],
  },
  about: {
    ...structuredClone(assembled),
    // Drift upper-left, still assembled / slight breath
    outerShell: { z: 0.04, scale: 1, opacity: 1, radial: 0.02 },
    layout: { x: -1.05, y: 0.55, scale: 1.15 },
    camera: { z: 3.7, fov: 34 },
    power: 25,
    status: 'NAVIGATING LAB',
    annotations: ['OUTER SHELL', 'TRACKING'],
  },
  experience: {
    ...structuredClone(assembled),
    outerShell: { z: 0.08, scale: 1.01, opacity: 1, radial: 0.04 },
    layout: { x: 1.1, y: -0.35, scale: 1.05 },
    camera: { z: 3.9, fov: 34 },
    power: 40,
    status: 'IN TRANSIT',
    annotations: ['PATH // EXPERIENCE', 'SYSTEM STABLE'],
  },
  skills: {
    ...structuredClone(assembled),
    outerShell: { z: 0.12, scale: 1.02, opacity: 0.98, radial: 0.06 },
    ring01: { z: 0.06, rotation: 0.04 },
    layout: { x: -0.9, y: -0.45, scale: 0.95 },
    camera: { z: 4.0, fov: 35 },
    power: 55,
    status: 'STANDBY',
    annotations: ['CAPABILITIES', 'CORE READY'],
  },
  projects: {
    ...structuredClone(assembled),
    outerShell: { z: 0.18, scale: 1.03, opacity: 0.96, radial: 0.1 },
    ring01: { z: 0.12, rotation: 0.06 },
    ring02: { z: -0.08, rotation: -0.04 },
    layout: { x: 0.95, y: 0.4, scale: 0.9 },
    camera: { z: 4.1, fov: 35 },
    power: 65,
    status: 'PRIMING REVEAL',
    annotations: ['WORK ARCHIVE', 'HOLDING'],
  },
  lab: {
    ...structuredClone(assembled),
    // Begin opening as we approach contact
    outerShell: { z: 0.28, scale: 1.05, opacity: 0.92, radial: 0.16 },
    ring01: { z: 0.22, rotation: 0.1 },
    ring02: { z: -0.18, rotation: -0.08 },
    ring03: { z: 0.3, rotation: 0.1 },
    coolingSystem: { z: 0.1, radial: 0.18 },
    coreHousing: { z: -0.16 },
    energyConduits: { intensity: 0.75, sequential: 0.7 },
    layout: { x: 0.15, y: 0.1, scale: 0.95 },
    camera: { z: 3.9, fov: 34 },
    power: 82,
    status: 'PRE-DISASSEMBLY',
    annotations: ['LAB MODE', 'UNLOCKING'],
  },
  contact: {
    ...structuredClone(assembled),
    // Full smooth component reveal at center
    outerShell: { z: 0.62, scale: 1.1, opacity: 0.85, radial: 0.42 },
    ring01: { z: 0.55, rotation: 0.16 },
    ring02: { z: -0.48, rotation: -0.14 },
    ring03: { z: 0.7, rotation: 0.18 },
    coolingSystem: { z: 0.24, radial: 0.45 },
    magneticContainment: { z: -0.28, opacity: 1 },
    energyConduits: { intensity: 1, sequential: 1 },
    coreHousing: { z: -0.55 },
    core: { rotationSpeed: 0.2, emissive: 1.7 },
    emitter: { pulse: 0.4, intensity: 1.45 },
    layout: { x: 0, y: 0, scale: 1.05 },
    camera: { z: 3.6, fov: 33 },
    power: 100,
    status: 'FULL ASSEMBLY REVEAL',
    annotations: ['ALL COMPONENTS', 'SYSTEM ONLINE'],
  },
};

export function getReactorTarget(sectionId) {
  return reactorStory[sectionId] || reactorStory.hero;
}

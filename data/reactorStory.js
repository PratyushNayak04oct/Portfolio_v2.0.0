/**
 * Scroll story:
 * - Hero: enlarged reactor, then gradually shrinks while scrolling
 * - Front-facing while traveling
 * - Lab → Contact: top-front reveal so layers read clearly (not full side)
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
  core: { rotationSpeed: 0.12, emissive: 1.35 },
  emitter: { pulse: 0.32, intensity: 1.2 },
  camera: { z: 3.6, fov: 34 },
  facing: { x: 0, y: 0 },
};

export const reactorStory = {
  hero: {
    ...structuredClone(assembled),
    // Large hero presence — shrinks gradually as the page scrolls
    layout: { x: 1.15, y: 0.04, scale: 1.42 },
    camera: { z: 3.15, fov: 30 },
    power: 12,
    status: 'FRONT FACE // STABLE',
    annotations: ['CORE / PALLADIUM', 'SYSTEM BOOT'],
  },
  about: {
    ...structuredClone(assembled),
    outerShell: { z: 0.04, scale: 1, opacity: 1, radial: 0.02 },
    layout: { x: -0.95, y: 0.48, scale: 0.95 },
    camera: { z: 3.45, fov: 32 },
    power: 25,
    status: 'NAVIGATING LAB',
    annotations: ['OUTER SHELL', 'TRACKING'],
  },
  experience: {
    ...structuredClone(assembled),
    outerShell: { z: 0.08, scale: 1.01, opacity: 1, radial: 0.04 },
    layout: { x: 0.95, y: -0.28, scale: 0.72 },
    camera: { z: 3.7, fov: 33 },
    power: 40,
    status: 'IN TRANSIT',
    annotations: ['PATH // EXPERIENCE', 'SYSTEM STABLE'],
  },
  skills: {
    ...structuredClone(assembled),
    outerShell: { z: 0.12, scale: 1.02, opacity: 0.98, radial: 0.06 },
    ring01: { z: 0.06, rotation: 0.08 },
    layout: { x: -0.82, y: -0.38, scale: 0.58 },
    camera: { z: 3.85, fov: 34 },
    power: 55,
    status: 'STANDBY',
    annotations: ['CAPABILITIES', 'CORE READY'],
  },
  projects: {
    ...structuredClone(assembled),
    outerShell: { z: 0.18, scale: 1.03, opacity: 0.96, radial: 0.1 },
    ring01: { z: 0.12, rotation: 0.1 },
    ring02: { z: -0.08, rotation: -0.08 },
    layout: { x: 0.85, y: 0.32, scale: 0.52 },
    camera: { z: 3.95, fov: 34 },
    power: 65,
    status: 'PRIMING REVEAL',
    annotations: ['WORK ARCHIVE', 'HOLDING'],
  },
  lab: {
    ...structuredClone(assembled),
    // Top-front preview — begin wider separation toward contact
    outerShell: { z: 0.48, scale: 1.06, opacity: 0.9, radial: 0.32 },
    ring01: { z: 0.4, rotation: 0.2 },
    ring02: { z: -0.36, rotation: -0.16 },
    ring03: { z: 0.52, rotation: 0.2 },
    coolingSystem: { z: 0.2, radial: 0.36 },
    coreHousing: { z: -0.36 },
    energyConduits: { intensity: 0.85, sequential: 0.8 },
    layout: { x: 0.12, y: 0.08, scale: 0.62 },
    camera: { z: 3.7, fov: 33 },
    facing: { x: 0.36, y: -0.3 },
    power: 82,
    status: 'TOP-FRONT REVEAL',
    annotations: ['LAB MODE', 'UNLOCKING'],
  },
  contact: {
    ...structuredClone(assembled),
    // Wider explode so every layer reads clearly
    outerShell: { z: 1.05, scale: 1.14, opacity: 0.82, radial: 0.72 },
    ring01: { z: 0.88, rotation: 0.28 },
    ring02: { z: -0.82, rotation: -0.24 },
    ring03: { z: 1.12, rotation: 0.3 },
    coolingSystem: { z: 0.48, radial: 0.78 },
    magneticContainment: { z: -0.52, opacity: 1 },
    energyConduits: { intensity: 1, sequential: 1 },
    coreHousing: { z: -0.92 },
    core: { rotationSpeed: 0.35, emissive: 2.2 },
    emitter: { pulse: 0.45, intensity: 1.6 },
    layout: { x: 0, y: 0.02, scale: 0.74 },
    camera: { z: 3.55, fov: 33 },
    facing: { x: 0.46, y: -0.38 },
    power: 100,
    status: 'FULL ASSEMBLY REVEAL',
    annotations: ['ALL COMPONENTS', 'SYSTEM ONLINE'],
  },
};

export function getReactorTarget(sectionId) {
  return reactorStory[sectionId] || reactorStory.hero;
}

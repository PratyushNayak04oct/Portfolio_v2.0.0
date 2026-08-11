/**
 * Scroll story:
 * - Hero: modest reactor presence, shrinks while scrolling
 * - Front-facing while traveling
 * - Lab → Contact: wide layer separation so every part reads clearly
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
  core: { rotationSpeed: 0, emissive: 1.35 },
  emitter: { pulse: 0.32, intensity: 1.2 },
  camera: { z: 3.6, fov: 34 },
  facing: { x: 0, y: 0 },
};

export const reactorStory = {
  hero: {
    ...structuredClone(assembled),
    layout: { x: 1.1, y: 0.04, scale: 1.22 },
    camera: { z: 3.2, fov: 30 },
    power: 12,
    status: 'FRONT FACE // STABLE',
    annotations: ['CORE / PALLADIUM', 'SYSTEM BOOT'],
  },
  about: {
    ...structuredClone(assembled),
    outerShell: { z: 0.06, scale: 1, opacity: 1, radial: 0.04 },
    layout: { x: -0.95, y: 0.48, scale: 0.9 },
    camera: { z: 3.5, fov: 32 },
    power: 25,
    status: 'NAVIGATING LAB',
    annotations: ['OUTER SHELL', 'TRACKING'],
  },
  experience: {
    ...structuredClone(assembled),
    outerShell: { z: 0.12, scale: 1.01, opacity: 1, radial: 0.08 },
    layout: { x: 0.95, y: -0.28, scale: 0.68 },
    camera: { z: 3.75, fov: 33 },
    power: 40,
    status: 'IN TRANSIT',
    annotations: ['PATH // EXPERIENCE', 'SYSTEM STABLE'],
  },
  skills: {
    ...structuredClone(assembled),
    outerShell: { z: 0.18, scale: 1.02, opacity: 0.98, radial: 0.12 },
    ring01: { z: 0.1, rotation: 0.1 },
    layout: { x: -0.82, y: -0.38, scale: 0.56 },
    camera: { z: 3.9, fov: 34 },
    power: 55,
    status: 'STANDBY',
    annotations: ['CAPABILITIES', 'CORE READY'],
  },
  projects: {
    ...structuredClone(assembled),
    outerShell: { z: 0.28, scale: 1.03, opacity: 0.96, radial: 0.18 },
    ring01: { z: 0.18, rotation: 0.12 },
    ring02: { z: -0.14, rotation: -0.1 },
    layout: { x: 0.85, y: 0.32, scale: 0.5 },
    camera: { z: 4.0, fov: 34 },
    power: 65,
    status: 'PRIMING REVEAL',
    annotations: ['WORK ARCHIVE', 'HOLDING'],
  },
  lab: {
    ...structuredClone(assembled),
    // Spacious preview — layers pull apart for readability
    outerShell: { z: 0.72, scale: 1.08, opacity: 0.88, radial: 0.48 },
    ring01: { z: 0.58, rotation: 0.22 },
    ring02: { z: -0.52, rotation: -0.2 },
    ring03: { z: 0.74, rotation: 0.24 },
    coolingSystem: { z: 0.32, radial: 0.52 },
    magneticContainment: { z: -0.28, opacity: 1 },
    coreHousing: { z: -0.52 },
    energyConduits: { intensity: 0.9, sequential: 0.85 },
    layout: { x: 0.1, y: 0.06, scale: 0.58 },
    camera: { z: 3.75, fov: 33 },
    facing: { x: 0.38, y: -0.32 },
    power: 82,
    status: 'TOP-FRONT REVEAL',
    annotations: ['LAB MODE', 'UNLOCKING'],
  },
  contact: {
    ...structuredClone(assembled),
    // Widest explode + smaller final presence so each component is clear
    outerShell: { z: 1.45, scale: 1.18, opacity: 0.8, radial: 0.95 },
    ring01: { z: 1.2, rotation: 0.32 },
    ring02: { z: -1.1, rotation: -0.28 },
    ring03: { z: 1.5, rotation: 0.34 },
    coolingSystem: { z: 0.7, radial: 1.05 },
    magneticContainment: { z: -0.75, opacity: 1 },
    energyConduits: { intensity: 1, sequential: 1 },
    coreHousing: { z: -1.25 },
    core: { rotationSpeed: 0, emissive: 2.2 },
    emitter: { pulse: 0.45, intensity: 1.6 },
    layout: { x: 0, y: 0.02, scale: 0.55 },
    camera: { z: 3.65, fov: 33 },
    facing: { x: 0.48, y: -0.4 },
    power: 100,
    status: 'FULL ASSEMBLY REVEAL',
    annotations: ['ALL COMPONENTS', 'SYSTEM ONLINE'],
  },
};

export function getReactorTarget(sectionId) {
  return reactorStory[sectionId] || reactorStory.hero;
}

/**
 * Section-driven reactor layer targets.
 * Positions are relative offsets; values lerp smoothly in useFrame.
 */

export const reactorPowerBySection = {
  hero: 12,
  about: 25,
  experience: 40,
  skills: 55,
  projects: 65,
  lab: 82,
  contact: 100,
};

/** Default assembled state */
const assembled = {
  outerShell: { z: 0, scale: 1, opacity: 1, radial: 0 },
  ring01: { z: 0, rotation: 0 },
  ring02: { z: 0, rotation: 0 },
  ring03: { z: 0, rotation: 0 },
  coolingSystem: { z: 0, radial: 0 },
  magneticContainment: { z: 0, opacity: 1 },
  energyConduits: { intensity: 0.35, sequential: 0 },
  coreHousing: { z: 0 },
  core: { rotationSpeed: 0.15, emissive: 0.45 },
  emitter: { pulse: 0.3, intensity: 0.5 },
  camera: { z: 5.2, fov: 42 },
};

export const reactorStory = {
  hero: {
    ...structuredClone(assembled),
    power: 12,
    status: 'INITIALIZING',
    annotations: ['SYSTEM BOOT', 'CORE / STANDBY'],
  },
  about: {
    ...structuredClone(assembled),
    outerShell: { z: 0.18, scale: 1.02, opacity: 0.95, radial: 0.08 },
    power: 25,
    status: 'SHELL SEPARATING',
    annotations: ['OUTER SHELL', 'ENERGY CONTAINMENT'],
  },
  experience: {
    ...structuredClone(assembled),
    outerShell: { z: 0.28, scale: 1.04, opacity: 0.9, radial: 0.12 },
    ring01: { z: 0.22, rotation: 0.08 },
    ring02: { z: -0.18, rotation: -0.05 },
    ring03: { z: 0.35, rotation: 0.1 },
    power: 40,
    status: 'RINGS DEPLOYED',
    annotations: ['RING ARRAY', 'MAGNETIC CONTAINMENT'],
  },
  skills: {
    ...structuredClone(assembled),
    outerShell: { z: 0.35, scale: 1.06, opacity: 0.85, radial: 0.18 },
    ring01: { z: 0.32, rotation: 0.12 },
    ring02: { z: -0.28, rotation: -0.08 },
    ring03: { z: 0.48, rotation: 0.14 },
    coolingSystem: { z: 0.1, radial: 0.22 },
    magneticContainment: { z: -0.15, opacity: 1 },
    energyConduits: { intensity: 0.65, sequential: 0.5 },
    power: 55,
    status: 'INTERNAL SYSTEMS',
    annotations: ['COOLING SYSTEM', 'ENERGY CONDUITS'],
  },
  projects: {
    ...structuredClone(assembled),
    outerShell: { z: 0.42, scale: 1.08, opacity: 0.8, radial: 0.24 },
    ring01: { z: 0.4, rotation: 0.15 },
    ring02: { z: -0.35, rotation: -0.1 },
    ring03: { z: 0.55, rotation: 0.18 },
    coolingSystem: { z: 0.15, radial: 0.3 },
    coreHousing: { z: -0.35 },
    energyConduits: { intensity: 0.8, sequential: 0.75 },
    core: { rotationSpeed: 0.25, emissive: 0.7 },
    power: 65,
    status: 'CORE HOUSING',
    annotations: ['CORE HOUSING', 'SYSTEM STABLE'],
  },
  lab: {
    ...structuredClone(assembled),
    outerShell: { z: 0.5, scale: 1.1, opacity: 0.75, radial: 0.3 },
    ring01: { z: 0.48, rotation: 0.18 },
    ring02: { z: -0.42, rotation: -0.12 },
    ring03: { z: 0.62, rotation: 0.2 },
    coolingSystem: { z: 0.2, radial: 0.38 },
    coreHousing: { z: -0.5 },
    magneticContainment: { z: -0.25, opacity: 0.9 },
    energyConduits: { intensity: 0.95, sequential: 1 },
    core: { rotationSpeed: 0.35, emissive: 0.9 },
    emitter: { pulse: 0.55, intensity: 0.9 },
    camera: { z: 4.6, fov: 40 },
    power: 82,
    status: 'CORE EXPOSED',
    annotations: ['CORE / 07', 'EMITTER ACTIVE'],
  },
  contact: {
    ...structuredClone(assembled),
    outerShell: { z: 0.08, scale: 1.01, opacity: 1, radial: 0.02 },
    ring01: { z: 0.04, rotation: 0.04 },
    ring02: { z: -0.03, rotation: -0.02 },
    ring03: { z: 0.06, rotation: 0.03 },
    coolingSystem: { z: 0.02, radial: 0.04 },
    coreHousing: { z: -0.05 },
    energyConduits: { intensity: 1, sequential: 1 },
    core: { rotationSpeed: 0.2, emissive: 1 },
    emitter: { pulse: 0.4, intensity: 1 },
    power: 100,
    status: 'SYSTEM ONLINE',
    annotations: ['POWER 100%', 'SYSTEM ONLINE'],
  },
};

export function getReactorTarget(sectionId) {
  return reactorStory[sectionId] || reactorStory.hero;
}

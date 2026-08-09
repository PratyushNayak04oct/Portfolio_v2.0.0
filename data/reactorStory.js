/**
 * Scroll story:
 * Hero  → enlarged, front-facing, assembled
 * Scroll → gradually smaller + layers reveal
 * Contact → regular size, reassembled / online
 */

const assembledLayers = {
  outerShell: { z: 0, scale: 1, opacity: 1, radial: 0 },
  ring01: { z: 0, rotation: 0 },
  ring02: { z: 0, rotation: 0 },
  ring03: { z: 0, rotation: 0 },
  coolingSystem: { z: 0, radial: 0 },
  magneticContainment: { z: 0, opacity: 1 },
  energyConduits: { intensity: 0.4, sequential: 0.2 },
  coreHousing: { z: 0 },
  core: { rotationSpeed: 0.08, emissive: 1.2 },
  emitter: { pulse: 0.25, intensity: 1.1 },
  camera: { z: 4.2, fov: 36 },
  /** Model orientation — hero is front face */
  facing: { x: 0, y: 0 },
};

export const reactorStory = {
  hero: {
    ...structuredClone(assembledLayers),
    // Large, front-facing, hero composition (right side)
    layout: { x: 1.15, y: 0.05, scale: 1.55 },
    facing: { x: 0, y: 0 },
    camera: { z: 3.6, fov: 34 },
    power: 12,
    status: 'INITIALIZING',
    annotations: ['SYSTEM BOOT', 'FRONT FACE / ONLINE'],
  },
  about: {
    ...structuredClone(assembledLayers),
    outerShell: { z: 0.16, scale: 1.02, opacity: 0.95, radial: 0.08 },
    layout: { x: 0.7, y: 0.02, scale: 1.28 },
    facing: { x: 0.08, y: -0.12 },
    camera: { z: 3.9, fov: 35 },
    power: 25,
    status: 'SHELL SEPARATING',
    annotations: ['OUTER SHELL', 'ENERGY CONTAINMENT'],
  },
  experience: {
    ...structuredClone(assembledLayers),
    outerShell: { z: 0.3, scale: 1.04, opacity: 0.9, radial: 0.14 },
    ring01: { z: 0.26, rotation: 0.08 },
    ring02: { z: -0.2, rotation: -0.06 },
    ring03: { z: 0.36, rotation: 0.1 },
    layout: { x: 0.28, y: 0, scale: 1.1 },
    facing: { x: 0.14, y: -0.22 },
    camera: { z: 4.1, fov: 36 },
    power: 40,
    status: 'RINGS DEPLOYED',
    annotations: ['RING ARRAY', 'MAGNETIC CONTAINMENT'],
  },
  skills: {
    ...structuredClone(assembledLayers),
    outerShell: { z: 0.4, scale: 1.06, opacity: 0.85, radial: 0.2 },
    ring01: { z: 0.36, rotation: 0.12 },
    ring02: { z: -0.3, rotation: -0.1 },
    ring03: { z: 0.48, rotation: 0.14 },
    coolingSystem: { z: 0.12, radial: 0.24 },
    magneticContainment: { z: -0.12, opacity: 1 },
    energyConduits: { intensity: 0.7, sequential: 0.6 },
    // Approaching regular size
    layout: { x: 0.08, y: 0, scale: 1.0 },
    facing: { x: 0.2, y: -0.28 },
    camera: { z: 4.2, fov: 36 },
    power: 55,
    status: 'INTERNAL SYSTEMS',
    annotations: ['COOLING SYSTEM', 'ENERGY CONDUITS'],
  },
  projects: {
    ...structuredClone(assembledLayers),
    outerShell: { z: 0.5, scale: 1.08, opacity: 0.8, radial: 0.28 },
    ring01: { z: 0.44, rotation: 0.15 },
    ring02: { z: -0.38, rotation: -0.12 },
    ring03: { z: 0.58, rotation: 0.17 },
    coolingSystem: { z: 0.16, radial: 0.32 },
    coreHousing: { z: -0.34 },
    energyConduits: { intensity: 0.85, sequential: 0.85 },
    core: { rotationSpeed: 0.18, emissive: 1.5 },
    layout: { x: 0, y: 0.02, scale: 0.95 },
    facing: { x: 0.28, y: -0.35 },
    camera: { z: 4.0, fov: 35 },
    power: 65,
    status: 'CORE HOUSING',
    annotations: ['CORE HOUSING', 'TRIANGLE CORE'],
  },
  lab: {
    ...structuredClone(assembledLayers),
    outerShell: { z: 0.58, scale: 1.1, opacity: 0.75, radial: 0.36 },
    ring01: { z: 0.52, rotation: 0.18 },
    ring02: { z: -0.45, rotation: -0.14 },
    ring03: { z: 0.66, rotation: 0.2 },
    coolingSystem: { z: 0.2, radial: 0.4 },
    coreHousing: { z: -0.5 },
    magneticContainment: { z: -0.22, opacity: 0.95 },
    energyConduits: { intensity: 1, sequential: 1 },
    core: { rotationSpeed: 0.25, emissive: 1.8 },
    emitter: { pulse: 0.4, intensity: 1.5 },
    // Regular display size, fully revealed
    layout: { x: 0, y: 0, scale: 0.92 },
    facing: { x: 0.32, y: -0.4 },
    camera: { z: 3.8, fov: 34 },
    power: 82,
    status: 'CORE EXPOSED',
    annotations: ['CORE / TRIANGLE', 'EMITTER ACTIVE'],
  },
  contact: {
    ...structuredClone(assembledLayers),
    outerShell: { z: 0.05, scale: 1.01, opacity: 1, radial: 0.02 },
    ring01: { z: 0.03, rotation: 0.03 },
    ring02: { z: -0.02, rotation: -0.02 },
    ring03: { z: 0.04, rotation: 0.03 },
    coolingSystem: { z: 0.02, radial: 0.03 },
    coreHousing: { z: -0.03 },
    energyConduits: { intensity: 0.9, sequential: 1 },
    core: { rotationSpeed: 0.12, emissive: 1.6 },
    emitter: { pulse: 0.3, intensity: 1.35 },
    layout: { x: 0, y: -0.04, scale: 1.0 },
    facing: { x: 0.12, y: -0.18 },
    camera: { z: 4.2, fov: 36 },
    power: 100,
    status: 'SYSTEM ONLINE',
    annotations: ['POWER 100%', 'SYSTEM ONLINE'],
  },
};

export function getReactorTarget(sectionId) {
  return reactorStory[sectionId] || reactorStory.hero;
}

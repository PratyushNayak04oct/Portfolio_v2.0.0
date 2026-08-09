'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_URL = '/models/reactor.glb?v=4';

/**
 * Front-facing Blender reactor (triangle core toward camera).
 * Base +PI/2 X corrects Blender Z-up → glTF Y-up so the face isn't edge-on.
 */
export default function ReactorModel({ targetRef, reducedMotion }) {
  const { scene } = useGLTF(MODEL_URL);
  const root = useRef(null);
  const groups = useRef({});
  const lights = useRef({});

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = true;
      obj.receiveShadow = true;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        if (!m) return;
        const name = `${m.name || ''} ${obj.name || ''}`.toLowerCase();
        const isGlow =
          name.includes('glow') ||
          name.includes('acrylic') ||
          obj.name.includes('LightRing') ||
          obj.name.includes('Acrylic') ||
          obj.name.includes('TriangleCore') ||
          obj.name.includes('CoreEnergy') ||
          obj.name.includes('Magnetic') ||
          obj.name.includes('Conduit');
        const isCopper =
          name.includes('copper') ||
          obj.name.includes('Coil') ||
          obj.name.includes('Copper') ||
          obj.name.includes('DetailWire');

        if (isGlow || (m.emissive && m.emissive.r + m.emissive.g + m.emissive.b > 0.02)) {
          m.emissive = new THREE.Color('#5ec8e8');
          m.emissiveIntensity = obj.name.includes('Triangle') ? 1.55 : 0.9;
          m.toneMapped = true;
        } else if (isCopper && m.color) {
          m.color = new THREE.Color('#d48452');
          m.metalness = 0.92;
          m.roughness = 0.28;
        } else if (m.color) {
          const col = m.color.clone();
          col.offsetHSL(0, 0.02, 0.05);
          m.color = col;
          m.metalness = Math.min(1, (m.metalness ?? 0.8) + 0.04);
          m.roughness = Math.max(0.18, (m.roughness ?? 0.35) - 0.04);
        }
      });
    });
    return c;
  }, [scene]);

  useEffect(() => {
    const map = {
      outerShell: [],
      ring01: [],
      ring02: [],
      ring03: [],
      coolingSystem: [],
      magneticContainment: [],
      energyConduits: [],
      coreHousing: [],
      core: [],
      emitter: [],
      backPlate: [],
    };

    cloned.traverse((obj) => {
      if (!obj.isMesh) return;
      const n = obj.name || '';
      if (
        n.startsWith('OuterCage') ||
        n.startsWith('CagePost') ||
        n.startsWith('Coil') ||
        n.startsWith('Acrylic') ||
        n.startsWith('BallJoint') ||
        n.startsWith('Interconnect') ||
        n.startsWith('Copper') ||
        n.startsWith('DetailWire')
      ) {
        map.outerShell.push(obj);
      } else if (n === 'Ring01') map.ring01.push(obj);
      else if (n === 'Ring02') map.ring02.push(obj);
      else if (n === 'Ring03') map.ring03.push(obj);
      else if (n.startsWith('CoolingFin')) map.coolingSystem.push(obj);
      else if (n.startsWith('Magnetic')) map.magneticContainment.push(obj);
      else if (n.startsWith('Conduit')) map.energyConduits.push(obj);
      else if (
        n.startsWith('CoreBar') ||
        n.startsWith('Perforated') ||
        n.startsWith('PerfHole') ||
        n.startsWith('TriFrame')
      ) {
        map.coreHousing.push(obj);
      } else if (n.includes('Triangle') || n.includes('CoreEnergy')) {
        map.core.push(obj);
      } else if (n.startsWith('LightRing')) map.emitter.push(obj);
      else if (
        n.startsWith('BackPlate') ||
        n.startsWith('HeatSink') ||
        n.startsWith('Screw') ||
        n.startsWith('Cable')
      ) {
        map.backPlate.push(obj);
      }
    });

    groups.current = map;
  }, [cloned]);

  const current = useRef({
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
    layout: { x: 1.2, y: 0.08, scale: 1.55 },
    facing: { x: 0, y: 0 },
  });

  useFrame((state, delta) => {
    const t = targetRef.current;
    if (!t || !root.current) return;
    const dampAmt = reducedMotion ? 1 : 1 - Math.exp(-2.0 * delta);
    const c = current.current;

    const lerpKey = (key, props) => {
      props.forEach((p) => {
        if (typeof t[key]?.[p] === 'number') {
          c[key][p] += (t[key][p] - c[key][p]) * dampAmt;
        }
      });
    };

    lerpKey('outerShell', ['z', 'scale', 'opacity', 'radial']);
    lerpKey('ring01', ['z', 'rotation']);
    lerpKey('ring02', ['z', 'rotation']);
    lerpKey('ring03', ['z', 'rotation']);
    lerpKey('coolingSystem', ['z', 'radial']);
    lerpKey('magneticContainment', ['z', 'opacity']);
    lerpKey('energyConduits', ['intensity', 'sequential']);
    lerpKey('coreHousing', ['z']);
    lerpKey('core', ['rotationSpeed', 'emissive']);
    lerpKey('emitter', ['pulse', 'intensity']);
    lerpKey('layout', ['x', 'y', 'scale']);
    lerpKey('facing', ['x', 'y']);

    root.current.position.x = c.layout.x;
    root.current.position.y = c.layout.y;
    root.current.scale.setScalar(c.layout.scale);

    // Facing stays front; tiny optional offsets only (kept ~0 in story)
    root.current.rotation.x = c.facing.x;
    root.current.rotation.y = c.facing.y;

    const breath = reducedMotion
      ? 0
      : Math.sin(state.clock.elapsedTime * 0.5) * 0.1 * c.emitter.pulse;

    /**
     * After Blender Yup export, reactor depth is on local Y.
     * Parent R_x(π/2) maps that depth toward the camera (world Z).
     */
    const shiftDepth = (list, depth, spin = 0) => {
      list.forEach((obj) => {
        if (obj.userData.baseY === undefined) obj.userData.baseY = obj.position.y;
        obj.position.y = obj.userData.baseY + depth;
        if (spin) obj.rotation.y += spin * delta;
      });
    };

    const g = groups.current;
    shiftDepth(g.outerShell || [], c.outerShell.z);
    shiftDepth(g.ring01 || [], c.ring01.z, 0.035 + c.ring01.rotation);
    shiftDepth(g.ring02 || [], c.ring02.z, -(0.03 + Math.abs(c.ring02.rotation)));
    shiftDepth(g.ring03 || [], c.ring03.z, 0.04 + c.ring03.rotation);
    shiftDepth(g.coolingSystem || [], c.coolingSystem.z);
    shiftDepth(g.magneticContainment || [], c.magneticContainment.z);
    shiftDepth(g.coreHousing || [], c.coreHousing.z);
    shiftDepth(g.core || [], c.coreHousing.z * 0.35, c.core.rotationSpeed);
    shiftDepth(g.emitter || [], c.ring01.z * 0.4);
    shiftDepth(g.backPlate || [], c.coreHousing.z * 0.22);

    // Radial expand in the disc plane (glTF X / Z)
    (g.outerShell || []).forEach((obj) => {
      if (
        !obj.name.startsWith('Coil') &&
        !obj.name.startsWith('Acrylic') &&
        !obj.name.startsWith('Ball') &&
        !obj.name.startsWith('Copper')
      ) {
        return;
      }
      if (!obj.userData.basePos) obj.userData.basePos = obj.position.clone();
      const b = obj.userData.basePos;
      const len = Math.hypot(b.x, b.z) || 1;
      const f = 1 + c.outerShell.radial * 0.34;
      obj.position.x = (b.x / len) * len * f;
      obj.position.z = (b.z / len) * len * f;
    });

    cloned.traverse((obj) => {
      if (!obj.isMesh) return;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        if (!m?.emissive || (m.emissiveIntensity ?? 0) < 0.25) return;
        const base = obj.name.includes('Triangle') ? 1.45 : 0.85;
        m.emissiveIntensity = base + c.emitter.intensity * 0.12 + breath;
      });
    });

    if (lights.current.core) {
      lights.current.core.intensity = 1.35 + c.emitter.intensity * 0.3 + breath;
    }
  });

  return (
    <group ref={root}>
      {/* Correct Blender face (+Z) so triangle faces the camera, not the rim */}
      <group rotation={[Math.PI / 2, 0, 0]} scale={0.78}>
        <primitive object={cloned} />
      </group>
      <pointLight
        ref={(el) => {
          lights.current.core = el;
        }}
        color="#7ad4ef"
        intensity={1.5}
        distance={8}
        decay={2}
        position={[0, 0, 0.55]}
      />
      <pointLight color="#3a7fd4" intensity={0.45} distance={6} position={[0, 0, 1.1]} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);

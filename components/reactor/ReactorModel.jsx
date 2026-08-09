'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Blender Mark-I inspired reactor with triangular core.
 * Orientation + scale driven by scroll targets.
 */
export default function ReactorModel({ targetRef, reducedMotion }) {
  const { scene } = useGLTF('/models/reactor.glb?v=3');
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

        if (isGlow || (m.emissive && m.emissive.r + m.emissive.g + m.emissive.b > 0.02)) {
          m.emissive = new THREE.Color('#5ec8e8');
          // Restrained glow — readable, not neon blast
          m.emissiveIntensity = obj.name.includes('Triangle') ? 1.6 : 0.95;
          m.toneMapped = true;
        } else if (m.color) {
          const col = m.color.clone();
          col.offsetHSL(0, 0.02, 0.06);
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
        n.startsWith('Interconnect')
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
    core: { rotationSpeed: 0.08, emissive: 1.2 },
    emitter: { pulse: 0.25, intensity: 1.1 },
    layout: { x: 1.15, y: 0.05, scale: 1.55 },
    facing: { x: 0, y: 0 },
  });

  useFrame((state, delta) => {
    const t = targetRef.current;
    if (!t || !root.current) return;
    const damp = reducedMotion ? 1 : 1 - Math.exp(-2.1 * delta);
    const c = current.current;

    const lerpKey = (key, props) => {
      props.forEach((p) => {
        if (typeof t[key]?.[p] === 'number') {
          c[key][p] += (t[key][p] - c[key][p]) * damp;
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
    // Front-facing in hero (facing ~0); gentle tilt while revealing
    root.current.rotation.x = c.facing.x;
    root.current.rotation.y = c.facing.y;

    const breath = reducedMotion
      ? 0
      : Math.sin(state.clock.elapsedTime * 0.55) * 0.12 * c.emitter.pulse;

    const shift = (list, z, rotZ = 0) => {
      list.forEach((obj) => {
        if (obj.userData.baseZ === undefined) obj.userData.baseZ = obj.position.z;
        obj.position.z = obj.userData.baseZ + z;
        if (rotZ) obj.rotation.z += rotZ * delta;
      });
    };

    const g = groups.current;
    shift(g.outerShell || [], c.outerShell.z);
    shift(g.ring01 || [], c.ring01.z, 0.04 + c.ring01.rotation);
    shift(g.ring02 || [], c.ring02.z, -(0.03 + Math.abs(c.ring02.rotation)));
    shift(g.ring03 || [], c.ring03.z, 0.05 + c.ring03.rotation);
    shift(g.coolingSystem || [], c.coolingSystem.z);
    shift(g.magneticContainment || [], c.magneticContainment.z);
    shift(g.coreHousing || [], c.coreHousing.z);
    shift(g.core || [], c.coreHousing.z * 0.35, c.core.rotationSpeed);
    shift(g.emitter || [], c.ring01.z * 0.45);
    shift(g.backPlate || [], c.coreHousing.z * 0.2);

    (g.outerShell || []).forEach((obj) => {
      if (
        !obj.name.startsWith('Coil') &&
        !obj.name.startsWith('Acrylic') &&
        !obj.name.startsWith('Ball')
      ) {
        return;
      }
      if (!obj.userData.basePos) obj.userData.basePos = obj.position.clone();
      const b = obj.userData.basePos;
      const len = Math.hypot(b.x, b.y) || 1;
      const f = 1 + c.outerShell.radial * 0.32;
      obj.position.x = (b.x / len) * len * f;
      obj.position.y = (b.y / len) * len * f;
    });

    cloned.traverse((obj) => {
      if (!obj.isMesh) return;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        if (!m?.emissive || (m.emissiveIntensity ?? 0) < 0.3) return;
        const base = obj.name.includes('Triangle') ? 1.5 : 0.9;
        m.emissiveIntensity = base + c.emitter.intensity * 0.15 + breath;
      });
    });

    if (lights.current.core) {
      lights.current.core.intensity = 1.4 + c.emitter.intensity * 0.35 + breath;
    }
  });

  return (
    <group ref={root}>
      <group scale={0.78}>
        <primitive object={cloned} />
      </group>
      <pointLight
        ref={(el) => {
          lights.current.core = el;
        }}
        color="#7ad4ef"
        intensity={1.6}
        distance={8}
        decay={2}
        position={[0, 0, 0.5]}
      />
      <pointLight color="#3a7fd4" intensity={0.55} distance={6} position={[0, 0, 1.1]} />
    </group>
  );
}

useGLTF.preload('/models/reactor.glb?v=3');

'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { reactorScroll } from '@/lib/reactorScroll';
import { useLabStore } from '@/lib/labStore';

const MODEL_URL = '/models/reactor.glb?v=8';

/**
 * Front-facing Blender reactor (palladium triangle core toward camera).
 * Base +PI/2 X corrects Blender Z-up → glTF Y-up so the face isn't edge-on.
 * Layout/layers follow scroll progress with near-direct sync (minimal lag).
 */
export default function ReactorModel({ reducedMotion }) {
  const { coreDocked } = useLabStore();
  const { scene } = useGLTF(MODEL_URL);
  const root = useRef(null);
  const groups = useRef({});
  const lights = useRef({});
  const glowMats = useRef([]);
  const palladiumMats = useRef([]);

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    const glow = [];
    const palladium = [];
    c.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = true;
      obj.receiveShadow = true;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        if (!m) return;
        const name = `${m.name || ''} ${obj.name || ''}`.toLowerCase();
        const isPalladium =
          name.includes('palladium') ||
          obj.name.includes('TriangleCore') ||
          obj.name.includes('Palladium');
        const isSheen =
          obj.name.includes('PalladiumSheen') || obj.name.includes('CoreEnergy');
        const isGlow =
          name.includes('glow') ||
          name.includes('acrylic') ||
          obj.name.includes('LightRing') ||
          obj.name.includes('Acrylic') ||
          obj.name.includes('Magnetic') ||
          obj.name.includes('Conduit');
        // Circle bars the copper windings revolve on
        const isCoilBar =
          obj.name.startsWith('CoilBlock') ||
          obj.name.startsWith('CoilBar') ||
          obj.name.startsWith('CoilForm') ||
          obj.name.startsWith('CoilBobbin');
        const isCopper =
          !isCoilBar &&
          (name.includes('copper') ||
            obj.name.includes('CoilWire') ||
            obj.name.includes('Copper'));

        if (isPalladium) {
          m.color = new THREE.Color('#e8eef5');
          m.metalness = 1;
          m.roughness = 0.08;
          m.emissive = new THREE.Color('#b8d4e8');
          m.emissiveIntensity = 0.35;
          m.toneMapped = true;
          palladium.push({ m, sheen: false });
        } else if (isSheen) {
          m.emissive = new THREE.Color('#d8f0ff');
          m.emissiveIntensity = 2.4;
          m.toneMapped = true;
          m.transparent = true;
          m.opacity = 0.55;
          glow.push({ m, base: 2.1 });
        } else if (isGlow || (m.emissive && m.emissive.r + m.emissive.g + m.emissive.b > 0.02)) {
          m.emissive = new THREE.Color('#5ec8e8');
          m.emissiveIntensity = 0.85;
          m.toneMapped = true;
          glow.push({ m, base: 0.8 });
        } else if (isCoilBar && m.color) {
          m.color = new THREE.Color('#9aa6b2');
          m.metalness = 0.96;
          m.roughness = 0.2;
          if (m.emissive) m.emissiveIntensity = 0;
        } else if (isCopper && m.color) {
          m.color = new THREE.Color('#b8734a');
          m.metalness = 0.9;
          m.roughness = 0.32;
        } else if (m.color) {
          m.color = new THREE.Color('#8a96a3');
          m.metalness = Math.min(1, (m.metalness ?? 0.85) + 0.08);
          m.roughness = Math.max(0.16, (m.roughness ?? 0.3) - 0.06);
        }
      });
    });
    glowMats.current = glow;
    palladiumMats.current = palladium;
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
      } else if (
        n.includes('Triangle') ||
        n.includes('CoreEnergy') ||
        n.includes('Palladium')
      ) {
        map.core.push(obj);
        // Hidden until loading-screen core docks into the reactor
        obj.visible = false;
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

  useEffect(() => {
    (groups.current.core || []).forEach((obj) => {
      obj.visible = !!coreDocked;
    });
  }, [coreDocked]);

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
    layout: { x: 1.15, y: 0.04, scale: 1.42 },
    facing: { x: 0, y: 0 },
  });

  useFrame((state, delta) => {
    const t = reactorScroll.target;
    if (!t || !root.current) return;

    // Cinematic follow — soft enough to feel butter, tight enough to stay on scroll
    const layoutK = reducedMotion ? 1 : 1 - Math.exp(-5.5 * delta);
    const layerK = reducedMotion ? 1 : 1 - Math.exp(-4.2 * delta);
    const c = current.current;

    const lerpKey = (key, props, k) => {
      props.forEach((p) => {
        if (typeof t[key]?.[p] === 'number') {
          c[key][p] += (t[key][p] - c[key][p]) * k;
        }
      });
    };

    lerpKey('outerShell', ['z', 'scale', 'opacity', 'radial'], layerK);
    lerpKey('ring01', ['z', 'rotation'], layerK);
    lerpKey('ring02', ['z', 'rotation'], layerK);
    lerpKey('ring03', ['z', 'rotation'], layerK);
    lerpKey('coolingSystem', ['z', 'radial'], layerK);
    lerpKey('magneticContainment', ['z', 'opacity'], layerK);
    lerpKey('energyConduits', ['intensity', 'sequential'], layerK);
    lerpKey('coreHousing', ['z'], layerK);
    lerpKey('core', ['rotationSpeed', 'emissive'], layerK);
    lerpKey('emitter', ['pulse', 'intensity'], layerK);
    lerpKey('layout', ['x', 'y', 'scale'], layoutK);
    lerpKey('facing', ['x', 'y'], layoutK);

    root.current.position.x = c.layout.x;
    root.current.position.y = c.layout.y;
    root.current.scale.setScalar(c.layout.scale);
    root.current.rotation.x = c.facing.x;
    root.current.rotation.y = c.facing.y;

    const breath = reducedMotion
      ? 0
      : Math.sin(state.clock.elapsedTime * 0.5) * 0.08 * c.emitter.pulse;

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

    palladiumMats.current.forEach(({ m }) => {
      m.emissiveIntensity = 0.28 + c.core.emissive * 0.12 + breath * 0.4;
    });
    glowMats.current.forEach(({ m, base }) => {
      m.emissiveIntensity = base + c.emitter.intensity * 0.1 + breath;
    });

    if (lights.current.core) {
      lights.current.core.intensity = 1.2 + c.emitter.intensity * 0.28 + breath;
    }
  });

  return (
    <group ref={root}>
      <group rotation={[Math.PI / 2, 0, 0]} scale={0.62}>
        <primitive object={cloned} />
      </group>
      <pointLight
        ref={(el) => {
          lights.current.core = el;
        }}
        color="#c8e4f5"
        intensity={1.35}
        distance={7}
        decay={2}
        position={[0, 0, 0.5]}
      />
      <pointLight color="#6a9cc8" intensity={0.4} distance={5.5} position={[0, 0, 1.0]} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);

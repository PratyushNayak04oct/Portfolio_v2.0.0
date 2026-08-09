'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { reactorScroll } from '@/lib/reactorScroll';

const MODEL_URL = '/models/reactor.glb?v=18';

/** Shiny brown-red copper — bright metallic with gold sheen */
function makeLustrousCopper(source) {
  const m = new THREE.MeshPhysicalMaterial({
    color: '#c24a22',
    metalness: 1,
    roughness: 0.045,
    emissive: new THREE.Color('#6a220c'),
    emissiveIntensity: 0.08,
    envMapIntensity: 3.1,
    clearcoat: 0.9,
    clearcoatRoughness: 0.04,
    reflectivity: 1,
    ior: 1.32,
    sheen: 0.65,
    sheenRoughness: 0.14,
    sheenColor: new THREE.Color('#f0a050'),
    toneMapped: true,
  });
  if (source?.name) m.name = source.name;
  return m;
}

function applySteel(m) {
  m.color = new THREE.Color('#9aa6b4');
  m.metalness = 0.96;
  m.roughness = 0.22;
  if (m.emissive) m.emissiveIntensity = 0;
  if ('envMapIntensity' in m) m.envMapIntensity = 1.3;
  m.needsUpdate = true;
}

function applySilver(m) {
  m.color = new THREE.Color('#d5dee6');
  m.metalness = 1;
  m.roughness = 0.12;
  if (m.emissive) m.emissiveIntensity = 0;
  if ('envMapIntensity' in m) m.envMapIntensity = 1.6;
  m.needsUpdate = true;
}

function applyGold(m) {
  m.color = new THREE.Color('#c9a24a');
  m.metalness = 1;
  m.roughness = 0.18;
  if (m.emissive) {
    m.emissive.set('#3a2a08');
    m.emissiveIntensity = 0.04;
  }
  if ('envMapIntensity' in m) m.envMapIntensity = 1.7;
  m.needsUpdate = true;
}

/**
 * Front-facing Blender reactor with inverted double-triangle core.
 * Base +PI/2 X corrects Blender Z-up → glTF Y-up.
 */
export default function ReactorModel({ reducedMotion }) {
  const { scene } = useGLTF(MODEL_URL);
  const root = useRef(null);
  const groups = useRef({});
  const lights = useRef({});
  const glowMats = useRef([]);
  const steelCoreMats = useRef([]);

  const prepared = useMemo(() => {
    const c = scene.clone(true);
    const glow = [];
    const steelCore = [];
    c.traverse((obj) => {
      if (!obj.isMesh) return;
      // Remove loose cables + a few rings (declutter); gold rings stay
      if (/^Cable[_-]?\d*$/i.test(obj.name) || obj.name.startsWith('Cable')) {
        obj.visible = false;
        return;
      }
      if (
        obj.name === 'Ring02' ||
        obj.name === 'LightRingMid' ||
        obj.name === 'PerforatedInnerRing' ||
        obj.name === 'MagneticRing'
      ) {
        obj.visible = false;
        return;
      }
      // Shadows off — major hover/scroll lag source on dense meshes
      obj.castShadow = false;
      obj.receiveShadow = false;
      obj.frustumCulled = true;

      const srcMats = Array.isArray(obj.material) ? obj.material : [obj.material];
      // Clone per mesh so glow/acrylic never tint shared copper materials blue
      const mats = srcMats.map((m) => (m ? m.clone() : m));
      obj.material = Array.isArray(obj.material) ? mats : mats[0];

      mats.forEach((m) => {
        if (!m) return;
        const name = `${m.name || ''} ${obj.name || ''}`.toLowerCase();
        const isPlate =
          obj.name.startsWith('CorePlate') ||
          obj.name === 'CoreWell' ||
          obj.name.startsWith('CoreBolt');
        const isTriangleCore =
          obj.name === 'TriangleCore' ||
          obj.name.includes('CoreTriangleAura') ||
          obj.name === 'CoreGlass' ||
          obj.name === 'CoreInnerRing' ||
          obj.name.startsWith('CoreCross');
        const isCoilBar =
          obj.name.startsWith('CoilBlock') ||
          obj.name.startsWith('CoilBar') ||
          obj.name.startsWith('CoilForm');
        const isCopper =
          !isCoilBar &&
          (name.includes('copper') ||
            obj.name.includes('CoilWire') ||
            obj.name.startsWith('Copper') ||
            obj.name.startsWith('DetailWire') ||
            /coilwire|copper|winding/i.test(obj.name));
        const isGold =
          !isCopper &&
          (obj.name.startsWith('GoldRing') ||
            obj.name.startsWith('BallJoint') ||
            obj.name.startsWith('Screw') ||
            name.includes('gold') ||
            name.includes('brass'));
        const isSilver =
          !isCopper &&
          !isGold &&
          ((obj.name.startsWith('Ring') && !obj.name.startsWith('GoldRing')) ||
            obj.name.startsWith('Interconnect') ||
            obj.name.startsWith('CagePost') ||
            name.includes('silver'));
        const isGlow =
          !isCopper &&
          !isGold &&
          (name.includes('glow') ||
            name.includes('acrylic') ||
            obj.name.includes('LightRing') ||
            obj.name.includes('Acrylic') ||
            obj.name.includes('Magnetic') ||
            obj.name.includes('Conduit'));
        const hasGlowEmissive =
          !isCopper &&
          m.emissive &&
          m.emissive.r + m.emissive.g + m.emissive.b > 0.02;

        if (isTriangleCore) {
          const hot = obj.name === 'TriangleCore';
          m.emissive = new THREE.Color(hot ? '#e8f9ff' : '#4ec8ff');
          m.emissiveIntensity = hot ? 4.2 : 2.4;
          m.toneMapped = false;
          if (m.color) m.color = new THREE.Color(hot ? '#d0f0ff' : '#2a6a90');
          glow.push({ m, base: hot ? 4.0 : 2.2 });
        } else if (isCopper) {
          const copper = makeLustrousCopper(m);
          const idx = mats.indexOf(m);
          if (idx >= 0) mats[idx] = copper;
          if (Array.isArray(obj.material)) obj.material[idx] = copper;
          else obj.material = copper;
        } else if (isPlate && m.color) {
          applySteel(m);
          if (obj.name.startsWith('CoreBolt') || obj.name === 'CoreWell') {
            m.color = new THREE.Color('#2a3036');
            m.roughness = 0.32;
          } else {
            applySilver(m);
          }
          steelCore.push(m);
        } else if (isGlow || hasGlowEmissive) {
          m.emissive = new THREE.Color('#4ec8ff');
          m.emissiveIntensity = 0.9;
          m.toneMapped = true;
          glow.push({ m, base: 0.85 });
        } else if (isGold && m.color) {
          applyGold(m);
        } else if (isSilver && m.color) {
          applySilver(m);
        } else if (isCoilBar && m.color) {
          applySteel(m);
        } else if (m.color) {
          const col = m.color;
          const looksCopper =
            col.r > 0.4 && col.g > 0.18 && col.g < 0.55 && col.b < 0.28;
          if (looksCopper) {
            const copper = makeLustrousCopper(m);
            const idx = mats.indexOf(m);
            if (idx >= 0) mats[idx] = copper;
            if (Array.isArray(obj.material)) obj.material[idx] = copper;
            else obj.material = copper;
          } else {
            applySteel(m);
          }
        }
      });
    });
    return { scene: c, glow, steelCore };
  }, [scene]);

  const cloned = prepared.scene;

  useEffect(() => {
    glowMats.current = prepared.glow;
    steelCoreMats.current = prepared.steelCore;
  }, [prepared]);

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
      } else if (n === 'Ring01' || n === 'GoldRing_Outer') map.ring01.push(obj);
      else if (n === 'Ring02') map.ring02.push(obj);
      else if (n === 'Ring03' || n === 'GoldRing_Inner') map.ring03.push(obj);
      else if (n === 'GoldRing_Halo') map.emitter.push(obj);
      else if (n.startsWith('CoolingFin')) map.coolingSystem.push(obj);
      else if (n.startsWith('Magnetic')) map.magneticContainment.push(obj);
      else if (n.startsWith('Conduit')) map.energyConduits.push(obj);
      else if (n.startsWith('Perforated') || n.startsWith('PerfHole')) {
        map.coreHousing.push(obj);
      } else if (
        n.includes('Triangle') ||
        n.startsWith('CorePlate') ||
        n.startsWith('CoreWell') ||
        n.startsWith('CoreGlass') ||
        n.startsWith('CoreInner') ||
        n.startsWith('CoreCross') ||
        n.startsWith('CoreBolt') ||
        n.includes('CoreTriangle')
      ) {
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
    core: { rotationSpeed: 0.12, emissive: 1.35 },
    emitter: { pulse: 0.32, intensity: 1.2 },
    layout: { x: 1.1, y: 0.04, scale: 1.22 },
    facing: { x: 0, y: 0 },
  });

  useFrame((state, delta) => {
    const t = reactorScroll.target;
    if (!t || !root.current) return;

    // Cap delta to avoid spiral-of-death hitching on hover frame drops
    const d = Math.min(delta, 1 / 30);
    const layoutK = reducedMotion ? 1 : 1 - Math.exp(-5.8 * d);
    const layerK = reducedMotion ? 1 : 1 - Math.exp(-4.8 * d);
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
      : Math.sin(state.clock.elapsedTime * 0.85) * 0.12 * c.emitter.pulse;

    const shiftDepth = (list, depth, spin = 0) => {
      list.forEach((obj) => {
        if (obj.userData.baseY === undefined) obj.userData.baseY = obj.position.y;
        obj.position.y = obj.userData.baseY + depth;
        if (spin) obj.rotation.y += spin * d;
      });
    };

    const g = groups.current;
    shiftDepth(g.outerShell || [], c.outerShell.z);
    shiftDepth(g.ring01 || [], c.ring01.z, 0.065 + c.ring01.rotation);
    shiftDepth(g.ring02 || [], c.ring02.z, -(0.055 + Math.abs(c.ring02.rotation)));
    shiftDepth(g.ring03 || [], c.ring03.z, 0.075 + c.ring03.rotation);
    shiftDepth(g.coolingSystem || [], c.coolingSystem.z);
    shiftDepth(g.magneticContainment || [], c.magneticContainment.z);
    shiftDepth(g.coreHousing || [], c.coreHousing.z);
    shiftDepth(g.core || [], c.coreHousing.z * 0.35, c.core.rotationSpeed * 0.55);
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
      const f = 1 + c.outerShell.radial * 0.62;
      obj.position.x = (b.x / len) * len * f;
      obj.position.z = (b.z / len) * len * f;
    });

    glowMats.current.forEach(({ m, base }) => {
      m.emissiveIntensity = base + c.emitter.intensity * 0.1 + breath;
    });

    if (lights.current.core) {
      lights.current.core.intensity = 1.15 + c.emitter.intensity * 0.22 + breath;
    }
  });

  return (
    <group ref={root}>
      <group rotation={[Math.PI / 2, 0, 0]} scale={0.58}>
        <primitive object={cloned} />
      </group>
      <pointLight
        ref={(el) => {
          lights.current.core = el;
        }}
        color="#8adfff"
        intensity={0.6}
        distance={3.8}
        decay={2}
        position={[0, 0, 0.5]}
      />
      {/* Warm + gold rim lights so copper reads bright and shiny */}
      <pointLight color="#ff8a40" intensity={1.25} distance={5} decay={2} position={[0.9, 0.25, 0.9]} />
      <pointLight color="#f0a050" intensity={0.7} distance={4.4} decay={2} position={[-0.85, -0.1, 0.75]} />
      <pointLight color="#e8f0f8" intensity={0.28} distance={4} position={[0, 0.4, 1.1]} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);

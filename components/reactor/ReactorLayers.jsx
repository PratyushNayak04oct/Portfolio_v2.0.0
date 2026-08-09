'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COIL_COUNT = 10;

function makeMetal(color, metalness = 0.88, roughness = 0.32) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
    envMapIntensity: 1.2,
  });
}

function makeGlow(emissive, intensity = 2.2, opacity = 0.95) {
  return new THREE.MeshStandardMaterial({
    color: '#0c2434',
    emissive,
    emissiveIntensity: intensity,
    metalness: 0.15,
    roughness: 0.25,
    transparent: opacity < 1,
    opacity,
  });
}

/**
 * Original energy core inspired by the layered Mark-I style reference:
 * perforated cage, copper coil modules, acrylic light segments,
 * concentric emissive rings, mesh hub, heat-sink back plate.
 */
export default function ReactorLayers({ targetRef, reducedMotion }) {
  const outerShell = useRef(null);
  const ring01 = useRef(null);
  const ring02 = useRef(null);
  const ring03 = useRef(null);
  const cooling = useRef(null);
  const magnetic = useRef(null);
  const conduits = useRef(null);
  const coreHousing = useRef(null);
  const core = useRef(null);
  const emitter = useRef(null);
  const backPlate = useRef(null);
  const coreLight = useRef(null);
  const rimLight = useRef(null);

  const mats = useMemo(
    () => ({
      cage: makeMetal('#3a4652', 0.92, 0.28),
      graphite: makeMetal('#2c3640', 0.78, 0.42),
      silver: makeMetal('#c5d0d8', 0.95, 0.18),
      copper: makeMetal('#8a4a28', 1, 0.12),
      copperDark: makeMetal('#6b351c', 1, 0.18),
      acrylic: makeGlow('#4db8ff', 2.8, 0.88),
      ringGlow: makeGlow('#5fd4ff', 3.4, 1),
      ringGlowInner: makeGlow('#7ae0ff', 3.8, 1),
      core: new THREE.MeshStandardMaterial({
        color: '#1a3d55',
        emissive: '#6ad8ff',
        emissiveIntensity: 2.6,
        metalness: 0.35,
        roughness: 0.2,
      }),
      mesh: makeMetal('#5a6874', 0.7, 0.45),
      wireRed: makeMetal('#c23b3b', 0.4, 0.55),
      wireBlack: makeMetal('#1a1f24', 0.5, 0.5),
      wireTan: makeMetal('#c4a57a', 0.45, 0.55),
      amber: makeMetal('#f2a06a', 0.75, 0.3),
    }),
    [],
  );

  const coils = useMemo(
    () =>
      Array.from({ length: COIL_COUNT }, (_, i) => ({
        angle: (i / COIL_COUNT) * Math.PI * 2 - Math.PI / 2,
      })),
    [],
  );

  const current = useRef({
    outerShell: { z: 0, scale: 1, opacity: 1, radial: 0 },
    ring01: { z: 0, rotation: 0 },
    ring02: { z: 0, rotation: 0 },
    ring03: { z: 0, rotation: 0 },
    coolingSystem: { z: 0, radial: 0 },
    magneticContainment: { z: 0, opacity: 1 },
    energyConduits: { intensity: 0.55, sequential: 0.2 },
    coreHousing: { z: 0 },
    core: { rotationSpeed: 0.12, emissive: 1.8 },
    emitter: { pulse: 0.35, intensity: 2.2 },
  });

  useFrame((state, delta) => {
    const t = targetRef.current;
    if (!t) return;

    const damp = reducedMotion ? 1 : 1 - Math.exp(-2.4 * delta);
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

    const breath = reducedMotion
      ? 0
      : Math.sin(state.clock.elapsedTime * 0.65) * 0.25 * c.emitter.pulse;

    if (outerShell.current) {
      outerShell.current.position.z = c.outerShell.z;
      outerShell.current.scale.setScalar(c.outerShell.scale);
      outerShell.current.children.forEach((child) => {
        if (!child.userData.baseAngle && child.userData.baseAngle !== 0) return;
        const a = child.userData.baseAngle;
        const r = 1.42 + c.outerShell.radial;
        child.position.x = Math.cos(a) * r;
        child.position.y = Math.sin(a) * r;
      });
    }

    if (ring01.current) {
      ring01.current.position.z = 0.08 + c.ring01.z;
      ring01.current.rotation.z += delta * (0.05 + c.ring01.rotation);
    }
    if (ring02.current) {
      ring02.current.position.z = 0.04 + c.ring02.z;
      ring02.current.rotation.z -= delta * (0.04 + Math.abs(c.ring02.rotation));
    }
    if (ring03.current) {
      ring03.current.position.z = c.ring03.z;
      ring03.current.rotation.z += delta * (0.07 + c.ring03.rotation);
    }
    if (cooling.current) {
      cooling.current.position.z = c.coolingSystem.z;
      cooling.current.scale.setScalar(1 + c.coolingSystem.radial * 0.28);
    }
    if (magnetic.current) {
      magnetic.current.position.z = 0.02 + c.magneticContainment.z;
    }
    if (coreHousing.current) {
      coreHousing.current.position.z = -0.02 + c.coreHousing.z;
    }
    if (backPlate.current) {
      backPlate.current.position.z = -0.22 + c.coreHousing.z * 0.35;
    }
    if (core.current) {
      core.current.rotation.z += delta * c.core.rotationSpeed;
      mats.core.emissiveIntensity = c.core.emissive + breath;
    }

    mats.acrylic.emissiveIntensity = 2.2 + c.emitter.intensity * 0.35 + breath;
    mats.ringGlow.emissiveIntensity = 2.8 + c.emitter.intensity * 0.4 + breath;
    mats.ringGlowInner.emissiveIntensity =
      3.2 + c.emitter.intensity * 0.5 + breath;

    if (coreLight.current) {
      coreLight.current.intensity = 2.8 + c.emitter.intensity + breath * 2;
    }
    if (rimLight.current) {
      rimLight.current.intensity = 1.2 + c.emitter.intensity * 0.4;
    }

    if (conduits.current) {
      conduits.current.children.forEach((child, i) => {
        const gate = c.energyConduits.sequential;
        const on = i / Math.max(1, conduits.current.children.length - 1) <= gate;
        if (child.material?.emissiveIntensity !== undefined) {
          child.material.emissiveIntensity = on
            ? 1.8 + c.energyConduits.intensity
            : 0.35;
        }
      });
    }
  });

  return (
    <group rotation={[0.42, -0.48, 0.08]} scale={1.15}>
      {/* Perforated outer cage rings */}
      <group ref={outerShell}>
        <mesh material={mats.cage} position={[0, 0, 0.12]}>
          <torusGeometry args={[1.55, 0.045, 12, 80]} />
        </mesh>
        <mesh material={mats.cage} position={[0, 0, -0.08]}>
          <torusGeometry args={[1.55, 0.045, 12, 80]} />
        </mesh>

        {/* Cage posts + coil / acrylic modules */}
        {coils.map((coil, i) => {
          const a = coil.angle;
          const r = 1.42;
          return (
            <group
              key={`mod-${i}`}
              userData={{ baseAngle: a }}
              position={[Math.cos(a) * r, Math.sin(a) * r, 0.02]}
              rotation={[0, 0, a]}
            >
              {/* Copper coil block */}
              <mesh material={mats.copperDark} position={[0, 0, 0]}>
                <boxGeometry args={[0.22, 0.34, 0.28]} />
              </mesh>
              {/* Wound copper look — stacked torus slices */}
              {[-0.08, -0.04, 0, 0.04, 0.08].map((z, wi) => (
                <mesh
                  key={wi}
                  material={mats.copper}
                  position={[0, 0, z]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <torusGeometry args={[0.13, 0.028, 8, 20]} />
                </mesh>
              ))}

              {/* Acrylic light segment (between coils, offset angularly) */}
              <mesh
                material={mats.acrylic}
                position={[0.28, 0, 0.02]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <boxGeometry args={[0.26, 0.1, 0.2]} />
              </mesh>

              {/* Ball-joint connector */}
              <mesh material={mats.silver} position={[0.18, 0.2, 0.08]}>
                <sphereGeometry args={[0.035, 12, 12]} />
              </mesh>
              <mesh material={mats.graphite} position={[0.18, 0.14, 0.08]}>
                <cylinderGeometry args={[0.012, 0.012, 0.1, 8]} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Mid structural rings */}
      <mesh ref={ring01} material={mats.graphite}>
        <torusGeometry args={[1.12, 0.04, 14, 72]} />
      </mesh>
      <mesh ref={ring02} material={mats.silver}>
        <torusGeometry args={[0.96, 0.028, 12, 64]} />
      </mesh>
      {/* Perforated mid ring */}
      <group ref={ring03}>
        <mesh material={mats.cage}>
          <torusGeometry args={[0.8, 0.035, 12, 64]} />
        </mesh>
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return (
            <mesh
              key={`perf-${i}`}
              position={[Math.cos(a) * 0.8, Math.sin(a) * 0.8, 0]}
              rotation={[0, 0, a]}
              material={mats.graphite}
            >
              <cylinderGeometry args={[0.02, 0.02, 0.05, 8]} />
            </mesh>
          );
        })}
      </group>

      {/* Cooling fins */}
      <group ref={cooling}>
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return (
            <mesh
              key={`fin-${i}`}
              position={[Math.cos(a) * 1.05, Math.sin(a) * 1.05, 0.1]}
              rotation={[0, 0, a]}
              material={mats.graphite}
            >
              <boxGeometry args={[0.06, 0.2, 0.025]} />
            </mesh>
          );
        })}
      </group>

      {/* Magnetic containment */}
      <mesh ref={magnetic} material={mats.ringGlow}>
        <torusGeometry args={[0.62, 0.022, 10, 64]} />
      </mesh>

      {/* Energy conduits */}
      <group ref={conduits}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={`conduit-${i}`}
              position={[Math.cos(a) * 0.48, Math.sin(a) * 0.48, 0.06]}
              rotation={[0, 0, a]}
              material={makeGlow('#19b6a5', 1.2)}
            >
              <boxGeometry args={[0.035, 0.22, 0.03]} />
            </mesh>
          );
        })}
      </group>

      {/* Core housing + concentric light rings (signature look) */}
      <group ref={coreHousing}>
        <mesh material={mats.graphite} position={[0, 0, 0.02]}>
          <cylinderGeometry args={[0.5, 0.52, 0.12, 48]} />
        </mesh>

        {/* Three concentric cyan rings */}
        <mesh ref={emitter} material={mats.ringGlowInner} position={[0, 0, 0.1]}>
          <torusGeometry args={[0.18, 0.028, 12, 64]} />
        </mesh>
        <mesh material={mats.ringGlow} position={[0, 0, 0.1]}>
          <torusGeometry args={[0.28, 0.03, 12, 64]} />
        </mesh>
        <mesh material={mats.acrylic} position={[0, 0, 0.1]}>
          <torusGeometry args={[0.38, 0.032, 12, 64]} />
        </mesh>

        {/* Mesh hub */}
        <mesh material={mats.mesh} position={[0, 0, 0.12]}>
          <circleGeometry args={[0.12, 32]} />
        </mesh>
        <mesh material={mats.core} position={[0, 0, 0.08]}>
          <circleGeometry args={[0.1, 32]} />
        </mesh>
      </group>

      {/* Glowing core sphere (subtle depth) */}
      <group ref={core} position={[0, 0, 0.05]}>
        <mesh material={mats.core}>
          <sphereGeometry args={[0.14, 32, 32]} />
        </mesh>
      </group>

      {/* Heat-sink back plate */}
      <group ref={backPlate} position={[0, 0, -0.22]}>
        <mesh material={mats.graphite}>
          <cylinderGeometry args={[1.35, 1.35, 0.1, 48]} />
        </mesh>
        {[0.35, 0.55, 0.75, 0.95, 1.15].map((r, i) => (
          <mesh
            key={`sink-${i}`}
            material={mats.cage}
            position={[0, 0, -0.02]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[r, 0.018, 8, 48]} />
          </mesh>
        ))}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh
              key={`screw-${i}`}
              material={mats.silver}
              position={[Math.cos(a) * 0.42, Math.sin(a) * 0.42, -0.06]}
            >
              <cylinderGeometry args={[0.035, 0.035, 0.04, 6]} />
            </mesh>
          );
        })}
      </group>

      {/* Power cables */}
      <group position={[-1.2, -1.05, -0.05]} rotation={[0.2, 0.4, -0.6]}>
        <mesh material={mats.wireRed} position={[0, 0, 0]}>
          <capsuleGeometry args={[0.035, 0.55, 4, 8]} />
        </mesh>
        <mesh material={mats.wireBlack} position={[0.08, 0.02, 0]}>
          <capsuleGeometry args={[0.035, 0.6, 4, 8]} />
        </mesh>
        <mesh material={mats.wireTan} position={[0.16, -0.01, 0]}>
          <capsuleGeometry args={[0.04, 0.65, 4, 8]} />
        </mesh>
      </group>

      {/* Amber accents */}
      {[0, 2.5, 5].map((a, i) => (
        <mesh
          key={`amber-${i}`}
          material={mats.amber}
          position={[Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0.16]}
        >
          <sphereGeometry args={[0.03, 10, 10]} />
        </mesh>
      ))}

      <pointLight
        ref={coreLight}
        color="#7adfff"
        intensity={3.2}
        distance={8}
        decay={2}
      />
      <pointLight
        ref={rimLight}
        color="#2678ff"
        intensity={1.4}
        distance={6}
        position={[0, 0, 0.4]}
        decay={2}
      />
      <spotLight
        color="#e8f0f4"
        intensity={1.1}
        position={[2.5, 2.2, 3]}
        angle={0.55}
        penumbra={0.6}
      />
    </group>
  );
}

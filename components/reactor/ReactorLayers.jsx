'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SEGMENT_COUNT = 8;

function metalMaterial(color = '#1a242c', metalness = 0.85, roughness = 0.35) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
  });
}

function emissiveMaterial(color, intensity = 0.8) {
  return new THREE.MeshStandardMaterial({
    color: '#0a1520',
    emissive: color,
    emissiveIntensity: intensity,
    metalness: 0.2,
    roughness: 0.4,
    transparent: true,
    opacity: 0.92,
  });
}

/** Original layered energy core — not a Marvel prop replica */
export default function ReactorLayers({ targetRef, reducedMotion }) {
  const group = useRef(null);
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
  const coreLight = useRef(null);

  const mats = useMemo(
    () => ({
      titanium: metalMaterial('#141c22', 0.9, 0.28),
      graphite: metalMaterial('#0e1419', 0.7, 0.45),
      silver: metalMaterial('#8a9aa6', 0.95, 0.22),
      copper: metalMaterial('#b56a45', 0.85, 0.4),
      cyan: emissiveMaterial('#63c7d9', 0.7),
      blue: emissiveMaterial('#2678ff', 0.9),
      core: new THREE.MeshStandardMaterial({
        color: '#06304a',
        emissive: '#63c7d9',
        emissiveIntensity: 1.2,
        metalness: 0.3,
        roughness: 0.25,
      }),
    }),
    [],
  );

  const segments = useMemo(() => {
    return Array.from({ length: SEGMENT_COUNT }, (_, i) => {
      const angle = (i / SEGMENT_COUNT) * Math.PI * 2;
      return { angle, isCoil: i % 2 === 0 };
    });
  }, []);

  const current = useRef({
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
  });

  useFrame((state, delta) => {
    const t = targetRef.current;
    if (!t || !group.current) return;

    const damp = reducedMotion ? 1 : 1 - Math.exp(-2.2 * delta);
    const c = current.current;

    const lerpObj = (key, props) => {
      props.forEach((p) => {
        c[key][p] += (t[key][p] - c[key][p]) * damp;
      });
    };

    lerpObj('outerShell', ['z', 'scale', 'opacity', 'radial']);
    lerpObj('ring01', ['z', 'rotation']);
    lerpObj('ring02', ['z', 'rotation']);
    lerpObj('ring03', ['z', 'rotation']);
    lerpObj('coolingSystem', ['z', 'radial']);
    lerpObj('magneticContainment', ['z', 'opacity']);
    lerpObj('energyConduits', ['intensity', 'sequential']);
    lerpObj('coreHousing', ['z']);
    lerpObj('core', ['rotationSpeed', 'emissive']);
    lerpObj('emitter', ['pulse', 'intensity']);

    if (outerShell.current) {
      outerShell.current.position.z = c.outerShell.z;
      outerShell.current.scale.setScalar(c.outerShell.scale);
      outerShell.current.children.forEach((child, i) => {
        if (child.userData.segment) {
          const a = segments[i]?.angle ?? 0;
          const r = 1.35 + c.outerShell.radial;
          child.position.x = Math.cos(a) * r;
          child.position.y = Math.sin(a) * r;
        }
      });
    }

    if (ring01.current) {
      ring01.current.position.z = c.ring01.z;
      ring01.current.rotation.z += delta * (0.08 + c.ring01.rotation);
    }
    if (ring02.current) {
      ring02.current.position.z = c.ring02.z;
      ring02.current.rotation.z -= delta * (0.06 + Math.abs(c.ring02.rotation));
    }
    if (ring03.current) {
      ring03.current.position.z = c.ring03.z;
      ring03.current.rotation.z += delta * (0.1 + c.ring03.rotation);
    }

    if (cooling.current) {
      cooling.current.position.z = c.coolingSystem.z;
      cooling.current.scale.setScalar(1 + c.coolingSystem.radial * 0.35);
    }

    if (magnetic.current) {
      magnetic.current.position.z = c.magneticContainment.z;
    }

    if (coreHousing.current) {
      coreHousing.current.position.z = c.coreHousing.z;
    }

    if (core.current) {
      core.current.rotation.z += delta * c.core.rotationSpeed;
      mats.core.emissiveIntensity = c.core.emissive;
    }

    const breath = reducedMotion
      ? 0
      : Math.sin(state.clock.elapsedTime * 0.7) * 0.08 * c.emitter.pulse;

    if (emitter.current) {
      mats.blue.emissiveIntensity = c.emitter.intensity + breath;
      mats.cyan.emissiveIntensity = 0.5 + c.energyConduits.intensity * 0.5 + breath * 0.5;
    }

    if (coreLight.current) {
      coreLight.current.intensity = 1.2 + c.emitter.intensity + breath;
    }

    if (conduits.current) {
      conduits.current.children.forEach((child, i) => {
        const gate = c.energyConduits.sequential;
        const on = i / Math.max(1, conduits.current.children.length - 1) <= gate;
        child.material.emissiveIntensity = on
          ? c.energyConduits.intensity
          : 0.15;
      });
    }
  });

  return (
    <group ref={group} rotation={[0.35, -0.35, 0]}>
      {/* Outer shell segments */}
      <group ref={outerShell}>
        {segments.map((seg, i) => (
          <group
            key={i}
            userData={{ segment: true }}
            position={[Math.cos(seg.angle) * 1.35, Math.sin(seg.angle) * 1.35, 0]}
            rotation={[0, 0, seg.angle]}
          >
            {seg.isCoil ? (
              <mesh material={mats.copper} castShadow>
                <torusGeometry args={[0.18, 0.055, 10, 20]} />
              </mesh>
            ) : (
              <mesh material={mats.cyan} castShadow>
                <boxGeometry args={[0.28, 0.16, 0.22]} />
              </mesh>
            )}
            <mesh position={[0, 0, -0.12]} material={mats.titanium}>
              <boxGeometry args={[0.32, 0.2, 0.08]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Rings */}
      <mesh ref={ring01} material={mats.graphite}>
        <torusGeometry args={[1.05, 0.035, 12, 64]} />
      </mesh>
      <mesh ref={ring02} material={mats.silver} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.88, 0.025, 10, 64]} />
      </mesh>
      <mesh ref={ring03} material={mats.titanium}>
        <torusGeometry args={[0.72, 0.04, 12, 48]} />
      </mesh>

      {/* Cooling fins */}
      <group ref={cooling}>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0.05]}
              rotation={[0, 0, a]}
              material={mats.graphite}
            >
              <boxGeometry args={[0.08, 0.22, 0.02]} />
            </mesh>
          );
        })}
      </group>

      {/* Magnetic containment */}
      <mesh ref={magnetic} material={mats.blue}>
        <torusGeometry args={[0.55, 0.02, 8, 48]} />
      </mesh>

      {/* Energy conduits */}
      <group ref={conduits}>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0]}
              rotation={[0, 0, a]}
              material={emissiveMaterial('#19b6a5', 0.3)}
            >
              <boxGeometry args={[0.04, 0.28, 0.03]} />
            </mesh>
          );
        })}
      </group>

      {/* Core housing */}
      <mesh ref={coreHousing} material={mats.titanium}>
        <cylinderGeometry args={[0.38, 0.42, 0.18, 32]} />
      </mesh>

      {/* Core */}
      <group ref={core}>
        <mesh material={mats.core}>
          <sphereGeometry args={[0.22, 32, 32]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={mats.silver}>
          <torusGeometry args={[0.28, 0.015, 8, 32]} />
        </mesh>
      </group>

      {/* Emitter ring */}
      <mesh ref={emitter} material={mats.blue} position={[0, 0, 0.12]}>
        <torusGeometry args={[0.32, 0.03, 10, 48]} />
      </mesh>

      {/* Tiny amber accents */}
      {[0, 2, 4, 6].map((i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={`amber-${i}`}
            position={[Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0.08]}
            material={metalMaterial('#f28c5b', 0.6, 0.35)}
          >
            <sphereGeometry args={[0.025, 8, 8]} />
          </mesh>
        );
      })}

      <pointLight
        ref={coreLight}
        color="#63c7d9"
        intensity={1.4}
        distance={6}
        decay={2}
      />
    </group>
  );
}

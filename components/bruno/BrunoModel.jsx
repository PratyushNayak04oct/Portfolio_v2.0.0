'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BRUNO_STATES } from '@/data/brunoStates';

function makeMat(color, metalness = 0.72, roughness = 0.38) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
  });
}

/**
 * Slimmer mechanical Doberman — leaner proportions, happier wag.
 */
export default function BrunoModel({ state = BRUNO_STATES.Wag }) {
  const root = useRef(null);
  const head = useRef(null);
  const neck = useRef(null);
  const torso = useRef(null);
  const tail = useRef(null);
  const jaw = useRef(null);
  const legFL = useRef(null);
  const legFR = useRef(null);
  const legBL = useRef(null);
  const legBR = useRef(null);
  const phase = useRef(0);

  const mats = useMemo(
    () => ({
      body: makeMat('#3a4550', 0.58, 0.45),
      shell: makeMat('#2f3944', 0.65, 0.4),
      metal: makeMat('#d0d8e0', 0.95, 0.16),
      dark: makeMat('#1c242c', 0.72, 0.38),
      paw: makeMat('#5a6570', 0.35, 0.62),
      led: new THREE.MeshStandardMaterial({
        color: '#3a0808',
        emissive: '#ff3b3b',
        emissiveIntensity: 2.8,
        metalness: 0.2,
        roughness: 0.25,
      }),
      ledSoft: new THREE.MeshStandardMaterial({
        color: '#2a0a0a',
        emissive: '#ff5555',
        emissiveIntensity: 2.1,
        metalness: 0.15,
        roughness: 0.3,
      }),
      teal: new THREE.MeshStandardMaterial({
        color: '#0c2a28',
        emissive: '#2fd4c0',
        emissiveIntensity: 1.2,
      }),
    }),
    [],
  );

  useFrame((_, delta) => {
    if (!root.current) return;
    const d = Math.min(delta, 1 / 30);
    phase.current += d;

    const setLeg = (ref, x) => {
      if (ref.current) ref.current.rotation.x = x;
    };

    if (jaw.current) jaw.current.rotation.x = 0;

    // Always a happy base wag
    const wag = Math.sin(phase.current * 8.5) * 0.55;
    if (tail.current) {
      tail.current.rotation.z = wag;
      tail.current.rotation.y = Math.sin(phase.current * 6) * 0.15;
    }

    const idle = Math.sin(phase.current * 1.4) * 0.012;
    if (torso.current) {
      torso.current.position.y = idle;
      torso.current.rotation.x = 0;
      torso.current.rotation.z = 0;
    }

    if (state === BRUNO_STATES.Walk || state === BRUNO_STATES.Run) {
      const speed = state === BRUNO_STATES.Run ? 8 : 4.5;
      const amp = state === BRUNO_STATES.Run ? 0.45 : 0.28;
      const t = phase.current * speed;
      setLeg(legFL, Math.sin(t) * amp);
      setLeg(legFR, Math.sin(t + Math.PI) * amp);
      setLeg(legBL, Math.sin(t + Math.PI) * amp * 0.85);
      setLeg(legBR, Math.sin(t) * amp * 0.85);
      root.current.position.y = Math.abs(Math.sin(t * 2)) * 0.03;
    } else if (state === BRUNO_STATES.Sit) {
      setLeg(legBL, 0.95);
      setLeg(legBR, 0.95);
      setLeg(legFL, -0.1);
      setLeg(legFR, -0.1);
      if (torso.current) {
        torso.current.rotation.x = -0.22;
        torso.current.position.y = -0.06;
      }
    } else if (state === BRUNO_STATES.Look || state === BRUNO_STATES.Curious) {
      if (head.current) {
        head.current.rotation.y = Math.sin(phase.current * 1.2) * 0.6;
        head.current.rotation.z = Math.sin(phase.current * 0.6) * 0.1;
      }
      setLeg(legFL, 0.02);
      setLeg(legFR, -0.02);
    } else if (state === BRUNO_STATES.Bark) {
      if (jaw.current) {
        jaw.current.rotation.x =
          0.12 + Math.abs(Math.sin(phase.current * 16)) * 0.32;
      }
      if (head.current) {
        head.current.rotation.x = -0.12 + Math.sin(phase.current * 12) * 0.05;
      }
      if (tail.current) tail.current.rotation.z = Math.sin(phase.current * 14) * 0.7;
    } else if (state === BRUNO_STATES.Excited || state === BRUNO_STATES.Wag) {
      root.current.position.y =
        Math.abs(Math.sin(phase.current * (state === BRUNO_STATES.Excited ? 6 : 2.2))) *
        (state === BRUNO_STATES.Excited ? 0.08 : 0.02);
      if (head.current) {
        head.current.rotation.y = Math.sin(phase.current * 1.1) * 0.22;
        head.current.rotation.x = -0.05;
      }
      if (tail.current) {
        tail.current.rotation.z = Math.sin(phase.current * 12) * 0.75;
      }
      setLeg(legFL, Math.sin(phase.current * 3) * 0.06);
      setLeg(legFR, Math.sin(phase.current * 3 + 1) * 0.06);
      setLeg(legBL, 0);
      setLeg(legBR, 0);
    } else if (state === BRUNO_STATES.Jump) {
      root.current.position.y = Math.abs(Math.sin(phase.current * 4)) * 0.35;
      setLeg(legFL, -0.45);
      setLeg(legFR, -0.45);
      setLeg(legBL, 0.35);
      setLeg(legBR, 0.35);
    } else if (state === BRUNO_STATES.Spin) {
      root.current.rotation.y += d * 6;
      if (tail.current) tail.current.rotation.z = Math.sin(phase.current * 16) * 0.8;
    } else {
      if (head.current) {
        head.current.rotation.y = Math.sin(phase.current * 0.5) * 0.2;
        head.current.rotation.x *= 0.9;
        head.current.rotation.z *= 0.9;
      }
      setLeg(legFL, Math.sin(phase.current * 0.9) * 0.03);
      setLeg(legFR, Math.sin(phase.current * 0.9 + 1) * 0.03);
      setLeg(legBL, 0);
      setLeg(legBR, 0);
      root.current.rotation.y *= 0.92;
      root.current.position.y *= 0.9;
    }

    if (state !== BRUNO_STATES.Spin) {
      root.current.rotation.y *= 0.9;
    }

    mats.led.emissiveIntensity = 2.4 + Math.sin(phase.current * 2.2) * 0.3;
  });

  const JointRing = ({ position }) => (
    <mesh position={position} rotation={[0, Math.PI / 2, 0]} material={mats.led}>
      <torusGeometry args={[0.048, 0.01, 8, 20]} />
    </mesh>
  );

  const Leg = ({ legRef, position, rear = false }) => (
    <group ref={legRef} position={position}>
      <JointRing position={[0, 0, 0]} />
      <mesh position={[0, -0.14, rear ? -0.015 : 0.015]} material={mats.shell}>
        <capsuleGeometry args={[0.038, 0.16, 4, 10]} />
      </mesh>
      <mesh position={[0, -0.3, rear ? 0.015 : -0.015]} material={mats.metal}>
        <capsuleGeometry args={[0.03, 0.14, 4, 10]} />
      </mesh>
      <mesh position={[0, -0.42, 0.02]} material={mats.paw}>
        <boxGeometry args={[0.08, 0.035, 0.11]} />
      </mesh>
    </group>
  );

  return (
    <group ref={root} position={[0, 0.42, 0]} scale={1.05} rotation={[0, 0.35, 0]}>
      <group ref={torso}>
        {/* Leaner torso */}
        <mesh material={mats.body} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.135, 0.38, 8, 16]} />
        </mesh>
        <mesh position={[0, -0.015, 0.09]} material={mats.shell}>
          <boxGeometry args={[0.2, 0.15, 0.14]} />
        </mesh>
        <mesh position={[0, 0.1, 0]} material={mats.ledSoft}>
          <boxGeometry args={[0.022, 0.014, 0.34]} />
        </mesh>
        <mesh position={[0.1, 0.03, 0]} material={mats.teal}>
          <boxGeometry args={[0.014, 0.04, 0.14]} />
        </mesh>
      </group>

      <group ref={neck} position={[0, 0.08, 0.24]}>
        <mesh material={mats.dark}>
          <cylinderGeometry args={[0.05, 0.06, 0.14, 10]} />
        </mesh>
      </group>

      <group ref={head} position={[0, 0.12, 0.38]}>
        <mesh material={mats.body}>
          <boxGeometry args={[0.15, 0.12, 0.24]} />
        </mesh>
        <mesh position={[0, -0.015, 0.14]} material={mats.shell}>
          <boxGeometry args={[0.09, 0.075, 0.11]} />
        </mesh>
        <mesh ref={jaw} position={[0, -0.05, 0.12]} material={mats.dark}>
          <boxGeometry args={[0.075, 0.03, 0.09]} />
        </mesh>
        <mesh
          position={[-0.055, 0.11, -0.03]}
          rotation={[0.2, 0, -0.12]}
          material={mats.dark}
        >
          <coneGeometry args={[0.025, 0.11, 4]} />
        </mesh>
        <mesh
          position={[0.055, 0.11, -0.03]}
          rotation={[0.2, 0, 0.12]}
          material={mats.dark}
        >
          <coneGeometry args={[0.025, 0.11, 4]} />
        </mesh>
        <mesh
          position={[0.08, 0.015, 0.03]}
          rotation={[0, Math.PI / 2, 0]}
          material={mats.led}
        >
          <circleGeometry args={[0.028, 18]} />
        </mesh>
        <mesh position={[0, 0.015, 0.17]} material={mats.metal}>
          <cylinderGeometry args={[0.025, 0.025, 0.03, 14]} />
        </mesh>
      </group>

      {/* Longer expressive tail */}
      <group ref={tail} position={[0, 0.08, -0.28]}>
        <mesh rotation={[0.9, 0, 0]} material={mats.body}>
          <capsuleGeometry args={[0.022, 0.22, 4, 8]} />
        </mesh>
        <mesh position={[0, 0.08, -0.12]} rotation={[1.1, 0, 0]} material={mats.metal}>
          <capsuleGeometry args={[0.014, 0.1, 4, 8]} />
        </mesh>
      </group>

      <Leg legRef={legFL} position={[0.1, -0.02, 0.14]} />
      <Leg legRef={legFR} position={[-0.1, -0.02, 0.14]} />
      <Leg legRef={legBL} position={[0.1, -0.02, -0.16]} rear />
      <Leg legRef={legBR} position={[-0.1, -0.02, -0.16]} rear />

      <pointLight
        color="#ff5555"
        intensity={0.7}
        distance={2}
        position={[0.15, 0.15, 0.3]}
      />
    </group>
  );
}

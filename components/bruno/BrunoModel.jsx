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
    envMapIntensity: 1.1,
  });
}

/**
 * Mechanical quadruped — Doberman silhouette, graphite body,
 * silver limbs, bright red joint rings (reference-informed, original).
 */
export default function BrunoModel({ state = BRUNO_STATES.Idle }) {
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
  const flip = useRef(0);

  const mats = useMemo(
    () => ({
      body: makeMat('#3a4550', 0.55, 0.48),
      shell: makeMat('#2f3944', 0.62, 0.42),
      metal: makeMat('#d0d8e0', 0.95, 0.18),
      dark: makeMat('#1c242c', 0.7, 0.4),
      paw: makeMat('#5a6570', 0.35, 0.65),
      led: new THREE.MeshStandardMaterial({
        color: '#3a0808',
        emissive: '#ff3b3b',
        emissiveIntensity: 3.2,
        metalness: 0.2,
        roughness: 0.25,
      }),
      ledSoft: new THREE.MeshStandardMaterial({
        color: '#2a0a0a',
        emissive: '#ff5555',
        emissiveIntensity: 2.4,
        metalness: 0.15,
        roughness: 0.3,
      }),
      accent: makeMat('#f28c5b', 0.7, 0.32),
      teal: new THREE.MeshStandardMaterial({
        color: '#0c2a28',
        emissive: '#2fd4c0',
        emissiveIntensity: 1.4,
      }),
    }),
    [],
  );

  useFrame((_, delta) => {
    if (!root.current) return;
    phase.current += delta;

    const idle = Math.sin(phase.current * 1.1) * 0.015;
    if (torso.current && state !== BRUNO_STATES.Sit) {
      torso.current.position.y = idle;
      torso.current.rotation.x = 0;
    }

    const setLeg = (ref, x) => {
      if (ref.current) ref.current.rotation.x = x;
    };

    // Defaults
    if (jaw.current) jaw.current.rotation.x = 0;
    if (state !== BRUNO_STATES.FrontFlip) {
      flip.current = Math.max(0, flip.current - delta * 1.2);
    }

    if (state === BRUNO_STATES.Walk || state === BRUNO_STATES.Run) {
      const speed = state === BRUNO_STATES.Run ? 7.5 : 4.2;
      const amp = state === BRUNO_STATES.Run ? 0.5 : 0.32;
      const t = phase.current * speed;
      setLeg(legFL, Math.sin(t) * amp);
      setLeg(legFR, Math.sin(t + Math.PI) * amp);
      setLeg(legBL, Math.sin(t + Math.PI) * amp * 0.85);
      setLeg(legBR, Math.sin(t) * amp * 0.85);
      root.current.position.x = Math.sin(phase.current * 0.35) * 0.12;
      root.current.position.y *= 0.85;
      root.current.rotation.x *= 0.85;
    } else if (state === BRUNO_STATES.Sit) {
      setLeg(legBL, 1.05);
      setLeg(legBR, 1.05);
      setLeg(legFL, -0.12);
      setLeg(legFR, -0.12);
      if (torso.current) {
        torso.current.rotation.x = -0.28;
        torso.current.position.y = -0.08;
      }
      if (head.current) head.current.rotation.x = 0.15;
    } else if (state === BRUNO_STATES.Look || state === BRUNO_STATES.Curious) {
      if (head.current) {
        head.current.rotation.y = Math.sin(phase.current * 0.9) * 0.55;
        head.current.rotation.z = Math.sin(phase.current * 0.45) * 0.12;
      }
      if (tail.current) {
        tail.current.rotation.z = Math.sin(phase.current * 3) * 0.25;
      }
    } else if (state === BRUNO_STATES.Inspect) {
      if (head.current) {
        head.current.rotation.x = -0.4 + Math.sin(phase.current) * 0.06;
      }
      if (neck.current) neck.current.rotation.x = 0.25;
    } else if (state === BRUNO_STATES.Bark) {
      if (jaw.current) {
        jaw.current.rotation.x = 0.15 + Math.abs(Math.sin(phase.current * 14)) * 0.35;
      }
      if (head.current) {
        head.current.rotation.x = -0.15 + Math.sin(phase.current * 10) * 0.05;
      }
    } else if (state === BRUNO_STATES.Excited) {
      root.current.position.y = Math.abs(Math.sin(phase.current * 5.5)) * 0.1;
      if (tail.current) {
        tail.current.rotation.z = Math.sin(phase.current * 12) * 0.5;
      }
    } else if (state === BRUNO_STATES.FrontFlip) {
      flip.current = Math.min(1, flip.current + delta * 0.9);
      root.current.rotation.x = -flip.current * Math.PI * 2;
      root.current.position.y = Math.sin(flip.current * Math.PI) * 0.55;
    } else if (state === BRUNO_STATES.Jump) {
      root.current.position.y = Math.abs(Math.sin(phase.current * 3.2)) * 0.4;
      setLeg(legFL, -0.5);
      setLeg(legFR, -0.5);
      setLeg(legBL, 0.4);
      setLeg(legBR, 0.4);
    } else if (state === BRUNO_STATES.Sleep) {
      if (torso.current) torso.current.rotation.z = 0.45;
      if (head.current) head.current.rotation.x = 0.35;
    } else {
      // Idle
      if (head.current) {
        head.current.rotation.y = Math.sin(phase.current * 0.4) * 0.18;
        head.current.rotation.x *= 0.9;
        head.current.rotation.z *= 0.9;
      }
      if (tail.current) {
        tail.current.rotation.z = Math.sin(phase.current * 1.6) * 0.14;
      }
      if (neck.current) neck.current.rotation.x *= 0.9;
      setLeg(legFL, Math.sin(phase.current * 0.8) * 0.04);
      setLeg(legFR, Math.sin(phase.current * 0.8 + 1) * 0.04);
      setLeg(legBL, 0);
      setLeg(legBR, 0);
      root.current.rotation.x *= 0.9;
      root.current.position.y *= 0.9;
      root.current.position.x *= 0.9;
    }

    mats.led.emissiveIntensity = 2.8 + Math.sin(phase.current * 2) * 0.35;
  });

  const JointRing = ({ position }) => (
    <mesh position={position} rotation={[0, Math.PI / 2, 0]} material={mats.led}>
      <torusGeometry args={[0.07, 0.014, 8, 24]} />
    </mesh>
  );

  const Leg = ({ legRef, position, rear = false }) => (
    <group ref={legRef} position={position}>
      <JointRing position={[0, 0, 0]} />
      <mesh position={[0, -0.16, rear ? -0.02 : 0.02]} material={mats.shell}>
        <capsuleGeometry args={[0.055, 0.2, 4, 10]} />
      </mesh>
      <mesh position={[0, -0.36, rear ? 0.02 : -0.02]} material={mats.metal}>
        <capsuleGeometry args={[0.042, 0.18, 4, 10]} />
      </mesh>
      <mesh position={[0, -0.5, 0.03]} material={mats.paw}>
        <boxGeometry args={[0.11, 0.05, 0.15]} />
      </mesh>
    </group>
  );

  return (
    <group ref={root} position={[0, 0.52, 0]} scale={1.25}>
      {/* Torso */}
      <group ref={torso}>
        <mesh material={mats.body} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.2, 0.42, 8, 16]} />
        </mesh>
        {/* Chest plate */}
        <mesh position={[0, -0.02, 0.12]} material={mats.shell}>
          <boxGeometry args={[0.28, 0.22, 0.18]} />
        </mesh>
        {/* Spine LED */}
        <mesh position={[0, 0.12, 0]} material={mats.ledSoft}>
          <boxGeometry args={[0.03, 0.02, 0.42]} />
        </mesh>
        {/* Side teal accent */}
        <mesh position={[0.14, 0.04, 0]} material={mats.teal}>
          <boxGeometry args={[0.02, 0.06, 0.2]} />
        </mesh>
        <mesh position={[-0.14, 0.06, -0.05]} material={mats.accent}>
          <sphereGeometry args={[0.02, 8, 8]} />
        </mesh>
      </group>

      {/* Neck */}
      <group ref={neck} position={[0, 0.1, 0.3]}>
        <mesh material={mats.dark}>
          <cylinderGeometry args={[0.07, 0.085, 0.18, 10]} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[0, 0.02 * i - 0.04, 0]}
            material={mats.metal}
          >
            <torusGeometry args={[0.075, 0.01, 6, 16]} />
          </mesh>
        ))}
      </group>

      {/* Head */}
      <group ref={head} position={[0, 0.16, 0.46]}>
        <mesh material={mats.body}>
          <boxGeometry args={[0.2, 0.15, 0.32]} />
        </mesh>
        {/* Snout */}
        <mesh position={[0, -0.02, 0.18]} material={mats.shell}>
          <boxGeometry args={[0.12, 0.1, 0.14]} />
        </mesh>
        {/* Jaw */}
        <mesh ref={jaw} position={[0, -0.06, 0.16]} material={mats.dark}>
          <boxGeometry args={[0.1, 0.04, 0.12]} />
        </mesh>
        {/* Ears */}
        <mesh position={[-0.07, 0.14, -0.04]} rotation={[0.15, 0, -0.15]} material={mats.dark}>
          <coneGeometry args={[0.035, 0.14, 4]} />
        </mesh>
        <mesh position={[0.07, 0.14, -0.04]} rotation={[0.15, 0, 0.15]} material={mats.dark}>
          <coneGeometry args={[0.035, 0.14, 4]} />
        </mesh>
        {/* Side sensor eye — bright red */}
        <mesh
          position={[0.105, 0.02, 0.04]}
          rotation={[0, Math.PI / 2, 0]}
          material={mats.led}
        >
          <circleGeometry args={[0.04, 20]} />
        </mesh>
        {/* Front camera */}
        <mesh position={[0, 0.02, 0.22]} material={mats.metal}>
          <cylinderGeometry args={[0.035, 0.035, 0.04, 16]} />
        </mesh>
        <mesh position={[0, 0.02, 0.24]} material={mats.ledSoft}>
          <circleGeometry args={[0.02, 16]} />
        </mesh>
      </group>

      {/* Tail */}
      <group ref={tail} position={[0, 0.1, -0.34]}>
        <mesh rotation={[0.75, 0, 0]} material={mats.body}>
          <capsuleGeometry args={[0.035, 0.2, 4, 8]} />
        </mesh>
      </group>

      <Leg legRef={legFL} position={[0.14, -0.02, 0.18]} />
      <Leg legRef={legFR} position={[-0.14, -0.02, 0.18]} />
      <Leg legRef={legBL} position={[0.14, -0.02, -0.2]} rear />
      <Leg legRef={legBR} position={[-0.14, -0.02, -0.2]} rear />

      <pointLight color="#ff4444" intensity={1.1} distance={2.5} position={[0.2, 0.2, 0.4]} />
      <pointLight color="#63c7d9" intensity={0.45} distance={2} position={[-0.3, 0.3, 0]} />
    </group>
  );
}

'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BRUNO_STATES } from '@/data/brunoStates';

function mat(color, metalness = 0.75, roughness = 0.4) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}

/**
 * Original articulated mechanical quadruped — reference-informed silhouette.
 */
export default function BrunoModel({ state = BRUNO_STATES.Idle, onReady }) {
  const root = useRef(null);
  const head = useRef(null);
  const neck = useRef(null);
  const torso = useRef(null);
  const tail = useRef(null);
  const legFL = useRef(null);
  const legFR = useRef(null);
  const legBL = useRef(null);
  const legBR = useRef(null);
  const phase = useRef(0);
  const flip = useRef(0);

  const mats = useMemo(
    () => ({
      body: mat('#12181e', 0.8, 0.45),
      metal: mat('#9aa7b2', 0.95, 0.25),
      dark: mat('#0a0f14', 0.7, 0.5),
      led: new THREE.MeshStandardMaterial({
        color: '#190808',
        emissive: '#e04545',
        emissiveIntensity: 0.9,
      }),
      accent: mat('#f28c5b', 0.6, 0.4),
      teal: new THREE.MeshStandardMaterial({
        color: '#081418',
        emissive: '#19b6a5',
        emissiveIntensity: 0.55,
      }),
    }),
    [],
  );

  useFrame((_, delta) => {
    if (!root.current) return;
    phase.current += delta;

    const idle = Math.sin(phase.current * 1.2) * 0.02;
    if (torso.current) torso.current.position.y = idle;

    // Reset-ish baselines
    const setLeg = (ref, x) => {
      if (ref.current) ref.current.rotation.x = x;
    };

    if (state === BRUNO_STATES.Walk || state === BRUNO_STATES.Run) {
      const speed = state === BRUNO_STATES.Run ? 8 : 4.5;
      const amp = state === BRUNO_STATES.Run ? 0.55 : 0.35;
      const t = phase.current * speed;
      setLeg(legFL, Math.sin(t) * amp);
      setLeg(legFR, Math.sin(t + Math.PI) * amp);
      setLeg(legBL, Math.sin(t + Math.PI) * amp * 0.9);
      setLeg(legBR, Math.sin(t) * amp * 0.9);
      root.current.position.x = Math.sin(phase.current * 0.4) * 0.15;
    } else if (state === BRUNO_STATES.Sit) {
      setLeg(legBL, 0.9);
      setLeg(legBR, 0.9);
      setLeg(legFL, -0.15);
      setLeg(legFR, -0.15);
      if (torso.current) torso.current.rotation.x = -0.25;
    } else if (state === BRUNO_STATES.Look || state === BRUNO_STATES.Curious) {
      if (head.current) {
        head.current.rotation.y = Math.sin(phase.current * 0.8) * 0.45;
        head.current.rotation.z = Math.sin(phase.current * 0.5) * 0.1;
      }
    } else if (state === BRUNO_STATES.Inspect) {
      if (head.current) head.current.rotation.x = -0.35 + Math.sin(phase.current) * 0.05;
      if (neck.current) neck.current.rotation.x = 0.2;
    } else if (state === BRUNO_STATES.Bark) {
      if (head.current) head.current.rotation.x = -0.2 + Math.sin(phase.current * 12) * 0.08;
    } else if (state === BRUNO_STATES.Excited) {
      root.current.position.y = Math.abs(Math.sin(phase.current * 6)) * 0.08;
      if (tail.current) tail.current.rotation.z = Math.sin(phase.current * 10) * 0.4;
    } else if (state === BRUNO_STATES.FrontFlip) {
      flip.current = Math.min(1, flip.current + delta * 0.85);
      root.current.rotation.x = -flip.current * Math.PI * 2;
      root.current.position.y = Math.sin(flip.current * Math.PI) * 0.6;
    } else if (state === BRUNO_STATES.Jump) {
      root.current.position.y = Math.abs(Math.sin(phase.current * 3)) * 0.35;
    } else if (state === BRUNO_STATES.Sleep) {
      if (torso.current) torso.current.rotation.z = 0.4;
      if (head.current) head.current.rotation.x = 0.3;
    } else {
      // Idle
      if (head.current) {
        head.current.rotation.y = Math.sin(phase.current * 0.35) * 0.15;
      }
      if (tail.current) {
        tail.current.rotation.z = Math.sin(phase.current * 1.5) * 0.12;
      }
      setLeg(legFL, 0);
      setLeg(legFR, 0);
      setLeg(legBL, 0);
      setLeg(legBR, 0);
      if (state !== BRUNO_STATES.FrontFlip) {
        flip.current = 0;
        root.current.rotation.x *= 0.9;
        root.current.position.y *= 0.9;
      }
    }

    if (onReady) onReady();
  });

  const Leg = ({ legRef, position }) => (
    <group ref={legRef} position={position}>
      <mesh position={[0, -0.18, 0]} material={mats.body}>
        <capsuleGeometry args={[0.05, 0.22, 4, 8]} />
      </mesh>
      <mesh position={[0, -0.38, 0]} material={mats.metal}>
        <capsuleGeometry args={[0.04, 0.18, 4, 8]} />
      </mesh>
      <mesh position={[0, -0.52, 0.02]} material={mats.dark}>
        <boxGeometry args={[0.1, 0.05, 0.14]} />
      </mesh>
      <mesh position={[0, -0.05, 0]} material={mats.led}>
        <torusGeometry args={[0.06, 0.01, 6, 16]} />
      </mesh>
    </group>
  );

  return (
    <group ref={root} position={[0, 0.55, 0]} scale={1.15}>
      <group ref={torso}>
        <mesh material={mats.body}>
          <capsuleGeometry args={[0.18, 0.45, 6, 12]} />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.teal}>
          <boxGeometry args={[0.02, 0.35, 0.08]} />
        </mesh>
        <mesh position={[0.12, 0.08, 0]} material={mats.accent}>
          <sphereGeometry args={[0.02, 8, 8]} />
        </mesh>
      </group>

      <group ref={neck} position={[0, 0.12, 0.28]}>
        <mesh material={mats.dark}>
          <cylinderGeometry args={[0.06, 0.07, 0.16, 8]} />
        </mesh>
      </group>

      <group ref={head} position={[0, 0.18, 0.42]}>
        <mesh material={mats.body}>
          <boxGeometry args={[0.18, 0.14, 0.28]} />
        </mesh>
        {/* Ears */}
        <mesh position={[-0.07, 0.12, -0.02]} material={mats.dark}>
          <coneGeometry args={[0.03, 0.12, 4]} />
        </mesh>
        <mesh position={[0.07, 0.12, -0.02]} material={mats.dark}>
          <coneGeometry args={[0.03, 0.12, 4]} />
        </mesh>
        {/* Sensor eye */}
        <mesh position={[0.1, 0.02, 0.05]} rotation={[0, Math.PI / 2, 0]} material={mats.led}>
          <circleGeometry args={[0.035, 16]} />
        </mesh>
        <mesh position={[0, 0.01, 0.15]} material={mats.metal}>
          <cylinderGeometry args={[0.03, 0.03, 0.04, 12]} />
        </mesh>
      </group>

      <group ref={tail} position={[0, 0.08, -0.32]}>
        <mesh rotation={[0.6, 0, 0]} material={mats.body}>
          <capsuleGeometry args={[0.03, 0.18, 4, 8]} />
        </mesh>
      </group>

      <Leg legRef={legFL} position={[0.12, -0.05, 0.18]} />
      <Leg legRef={legFR} position={[-0.12, -0.05, 0.18]} />
      <Leg legRef={legBL} position={[0.12, -0.05, -0.2]} />
      <Leg legRef={legBR} position={[-0.12, -0.05, -0.2]} />
    </group>
  );
}

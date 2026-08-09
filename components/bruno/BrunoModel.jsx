'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BRUNO_STATES } from '@/data/brunoStates';

function makeMat(color, metalness = 0.35, roughness = 0.55) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
  });
}

/** Visible servo cuff — small, reads as joint without cluttering the dog form */
function Joint({ mats, position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh material={mats.joint} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.024, 0.024, 0.028, 12]} />
      </mesh>
      <mesh material={mats.accent} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.028, 0.004, 6, 14]} />
      </mesh>
    </group>
  );
}

function Leg({
  mats,
  hipRef,
  kneeRef,
  ankleRef,
  position,
  rear = false,
}) {
  return (
    <group ref={hipRef} position={position}>
      <Joint mats={mats} position={[0, 0, 0]} />
      {/* Upper thigh */}
      <mesh position={[0, -0.1, rear ? -0.01 : 0.01]} material={mats.coat}>
        <capsuleGeometry args={[0.03, 0.14, 4, 10]} />
      </mesh>
      <group ref={kneeRef} position={[0, -0.2, rear ? -0.008 : 0.008]}>
        <Joint mats={mats} position={[0, 0, 0]} scale={0.85} />
        {/* Shin */}
        <mesh position={[0, -0.1, rear ? 0.01 : -0.01]} material={mats.coatDark}>
          <capsuleGeometry args={[0.024, 0.14, 4, 10]} />
        </mesh>
        <group ref={ankleRef} position={[0, -0.2, rear ? 0.008 : -0.008]}>
          <Joint mats={mats} position={[0, 0, 0]} scale={0.7} />
          {/* Paw */}
          <mesh position={[0, -0.035, 0.02]} material={mats.tan}>
            <boxGeometry args={[0.055, 0.028, 0.09]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/**
 * B.R.U.N.O. — Doberman-inspired companion.
 * Warm tan + deep charcoal contrast the cool cyan lab UI.
 */
export default function BrunoModel({ state = BRUNO_STATES.Wag }) {
  const root = useRef(null);
  const head = useRef(null);
  const neck = useRef(null);
  const torso = useRef(null);
  const tail = useRef(null);
  const jaw = useRef(null);
  const hipFL = useRef(null);
  const kneeFL = useRef(null);
  const ankleFL = useRef(null);
  const hipFR = useRef(null);
  const kneeFR = useRef(null);
  const ankleFR = useRef(null);
  const hipBL = useRef(null);
  const kneeBL = useRef(null);
  const ankleBL = useRef(null);
  const hipBR = useRef(null);
  const kneeBR = useRef(null);
  const ankleBR = useRef(null);
  const phase = useRef(0);

  const mats = useMemo(
    () => ({
      // Deep charcoal coat (reads against cyan UI)
      coat: makeMat('#1a222c', 0.22, 0.62),
      coatDark: makeMat('#10161c', 0.28, 0.55),
      // Warm Doberman rust / tan contrast
      tan: makeMat('#c9894a', 0.18, 0.58),
      tanSoft: makeMat('#e0b078', 0.12, 0.65),
      // Small metal accents only
      joint: makeMat('#d8c4a8', 0.9, 0.2),
      accent: new THREE.MeshStandardMaterial({
        color: '#0a2a28',
        emissive: '#2fd4c0',
        emissiveIntensity: 1.4,
        metalness: 0.3,
        roughness: 0.35,
      }),
      eye: new THREE.MeshStandardMaterial({
        color: '#081818',
        emissive: '#63c7d9',
        emissiveIntensity: 2.6,
        metalness: 0.15,
        roughness: 0.25,
      }),
      nose: makeMat('#0c1014', 0.4, 0.45),
    }),
    [],
  );

  const setLimb = (hip, knee, ankle, hx, kx, ax) => {
    if (hip.current) hip.current.rotation.x = hx;
    if (knee.current) knee.current.rotation.x = kx;
    if (ankle.current) ankle.current.rotation.x = ax;
  };

  /* eslint-disable react-hooks/immutability */
  useFrame((_, delta) => {
    if (!root.current) return;
    const d = Math.min(delta, 1 / 30);
    phase.current += d;

    if (jaw.current) jaw.current.rotation.x = 0;

    if (tail.current) {
      tail.current.rotation.z = Math.sin(phase.current * 9) * 0.55;
      tail.current.rotation.y = Math.sin(phase.current * 6) * 0.12;
    }

    if (torso.current) {
      torso.current.position.y = Math.sin(phase.current * 1.4) * 0.008;
      torso.current.rotation.x = 0;
      torso.current.rotation.z = 0;
    }

    if (state === BRUNO_STATES.Walk || state === BRUNO_STATES.Run) {
      const speed = state === BRUNO_STATES.Run ? 9 : 5;
      const amp = state === BRUNO_STATES.Run ? 0.5 : 0.34;
      const t = phase.current * speed;
      const gait = (offset) => {
        const s = Math.sin(t + offset);
        return {
          hip: s * amp,
          knee: Math.max(0, -s) * amp * 1.1 + 0.1,
          ankle: -s * amp * 0.3,
        };
      };
      const a = gait(0);
      const b = gait(Math.PI);
      setLimb(hipFL, kneeFL, ankleFL, a.hip, a.knee, a.ankle);
      setLimb(hipFR, kneeFR, ankleFR, b.hip, b.knee, b.ankle);
      setLimb(hipBL, kneeBL, ankleBL, b.hip * 0.9, b.knee * 0.95, b.ankle);
      setLimb(hipBR, kneeBR, ankleBR, a.hip * 0.9, a.knee * 0.95, a.ankle);
      root.current.position.y = Math.abs(Math.sin(t * 2)) * 0.03;
    } else if (state === BRUNO_STATES.Sit) {
      setLimb(hipBL, kneeBL, ankleBL, 0.8, 1.05, -0.3);
      setLimb(hipBR, kneeBR, ankleBR, 0.8, 1.05, -0.3);
      setLimb(hipFL, kneeFL, ankleFL, -0.1, 0.18, 0.04);
      setLimb(hipFR, kneeFR, ankleFR, -0.1, 0.18, 0.04);
      if (torso.current) {
        torso.current.rotation.x = -0.25;
        torso.current.position.y = -0.07;
      }
    } else if (state === BRUNO_STATES.Look || state === BRUNO_STATES.Curious) {
      if (head.current) {
        head.current.rotation.y = Math.sin(phase.current * 1.15) * 0.5;
        head.current.rotation.z = Math.sin(phase.current * 0.55) * 0.08;
      }
      if (neck.current) {
        neck.current.rotation.y = (head.current?.rotation.y || 0) * 0.4;
      }
      setLimb(hipFL, kneeFL, ankleFL, 0.03, 0.12, 0);
      setLimb(hipFR, kneeFR, ankleFR, -0.03, 0.12, 0);
      setLimb(hipBL, kneeBL, ankleBL, 0.02, 0.15, 0);
      setLimb(hipBR, kneeBR, ankleBR, -0.02, 0.15, 0);
    } else if (state === BRUNO_STATES.Bark) {
      if (jaw.current) {
        jaw.current.rotation.x =
          0.15 + Math.abs(Math.sin(phase.current * 16)) * 0.32;
      }
      if (head.current) {
        head.current.rotation.x = -0.1 + Math.sin(phase.current * 12) * 0.04;
      }
      if (tail.current) tail.current.rotation.z = Math.sin(phase.current * 14) * 0.7;
      setLimb(hipFL, kneeFL, ankleFL, 0.04, 0.16, 0);
      setLimb(hipFR, kneeFR, ankleFR, 0.04, 0.16, 0);
      setLimb(hipBL, kneeBL, ankleBL, 0.06, 0.18, 0);
      setLimb(hipBR, kneeBR, ankleBR, 0.06, 0.18, 0);
    } else if (state === BRUNO_STATES.Excited || state === BRUNO_STATES.Wag) {
      root.current.position.y =
        Math.abs(Math.sin(phase.current * (state === BRUNO_STATES.Excited ? 6.2 : 2.3))) *
        (state === BRUNO_STATES.Excited ? 0.08 : 0.018);
      if (head.current) {
        head.current.rotation.y = Math.sin(phase.current * 1.1) * 0.2;
        head.current.rotation.x = -0.05;
      }
      if (tail.current) {
        tail.current.rotation.z = Math.sin(phase.current * 12) * 0.75;
      }
      const tip = Math.sin(phase.current * 3) * 0.07;
      setLimb(hipFL, kneeFL, ankleFL, tip, 0.14 + Math.abs(tip) * 0.35, -tip * 0.25);
      setLimb(hipFR, kneeFR, ankleFR, -tip, 0.14 + Math.abs(tip) * 0.35, tip * 0.25);
      setLimb(hipBL, kneeBL, ankleBL, tip * 0.35, 0.16, 0);
      setLimb(hipBR, kneeBR, ankleBR, -tip * 0.35, 0.16, 0);
    } else if (state === BRUNO_STATES.Jump) {
      root.current.position.y = Math.abs(Math.sin(phase.current * 4)) * 0.36;
      setLimb(hipFL, kneeFL, ankleFL, -0.5, 0.8, 0.18);
      setLimb(hipFR, kneeFR, ankleFR, -0.5, 0.8, 0.18);
      setLimb(hipBL, kneeBL, ankleBL, 0.42, 0.85, -0.12);
      setLimb(hipBR, kneeBR, ankleBR, 0.42, 0.85, -0.12);
    } else if (state === BRUNO_STATES.Spin) {
      root.current.rotation.y += d * 6.2;
      if (tail.current) tail.current.rotation.z = Math.sin(phase.current * 15) * 0.8;
      setLimb(hipFL, kneeFL, ankleFL, -0.18, 0.4, 0.08);
      setLimb(hipFR, kneeFR, ankleFR, -0.18, 0.4, 0.08);
      setLimb(hipBL, kneeBL, ankleBL, 0.12, 0.35, 0);
      setLimb(hipBR, kneeBR, ankleBR, 0.12, 0.35, 0);
    } else {
      if (head.current) {
        head.current.rotation.y = Math.sin(phase.current * 0.45) * 0.16;
        head.current.rotation.x *= 0.9;
        head.current.rotation.z *= 0.9;
      }
      const sway = Math.sin(phase.current * 0.85) * 0.03;
      setLimb(hipFL, kneeFL, ankleFL, sway, 0.14, 0);
      setLimb(hipFR, kneeFR, ankleFR, -sway, 0.14, 0);
      setLimb(hipBL, kneeBL, ankleBL, 0.015, 0.15, 0);
      setLimb(hipBR, kneeBR, ankleBR, -0.015, 0.15, 0);
      root.current.rotation.y *= 0.92;
      root.current.position.y *= 0.9;
    }

    if (state !== BRUNO_STATES.Spin) {
      root.current.rotation.y *= 0.9;
    }

    mats.eye.emissiveIntensity = 2.4 + Math.sin(phase.current * 2) * 0.3;
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <group ref={root} position={[0, 0.48, 0]} scale={1.42} rotation={[0, 0.42, 0]}>
      {/* —— Body: lean Doberman chassis —— */}
      <group ref={torso}>
        <mesh material={mats.coat} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.1, 0.46, 8, 16]} />
        </mesh>
        {/* Warm chest blaze */}
        <mesh position={[0, -0.02, 0.12]} material={mats.tan}>
          <boxGeometry args={[0.09, 0.1, 0.18]} />
        </mesh>
        {/* Soft belly tan */}
        <mesh position={[0, -0.08, 0]} material={mats.tanSoft}>
          <boxGeometry args={[0.08, 0.04, 0.28]} />
        </mesh>
        {/* Subtle spine ridge */}
        <mesh position={[0, 0.09, -0.02]} material={mats.coatDark}>
          <boxGeometry args={[0.03, 0.02, 0.36]} />
        </mesh>
      </group>

      {/* —— Neck —— */}
      <group ref={neck} position={[0, 0.05, 0.28]}>
        <mesh material={mats.coat}>
          <cylinderGeometry args={[0.045, 0.055, 0.12, 12]} />
        </mesh>
        <mesh position={[0, -0.01, 0.02]} material={mats.tan}>
          <boxGeometry args={[0.05, 0.04, 0.08]} />
        </mesh>
      </group>

      {/* —— Head: long muzzle, upright ears —— */}
      <group ref={head} position={[0, 0.1, 0.42]}>
        <mesh material={mats.coat}>
          <boxGeometry args={[0.13, 0.11, 0.16]} />
        </mesh>
        {/* Long snout */}
        <mesh position={[0, -0.01, 0.14]} material={mats.tan}>
          <boxGeometry args={[0.085, 0.07, 0.14]} />
        </mesh>
        {/* Brow tan marks */}
        <mesh position={[-0.045, 0.04, 0.04]} material={mats.tanSoft}>
          <boxGeometry args={[0.035, 0.02, 0.04]} />
        </mesh>
        <mesh position={[0.045, 0.04, 0.04]} material={mats.tanSoft}>
          <boxGeometry args={[0.035, 0.02, 0.04]} />
        </mesh>
        {/* Jaw */}
        <mesh ref={jaw} position={[0, -0.05, 0.12]} material={mats.coatDark}>
          <boxGeometry args={[0.07, 0.03, 0.1]} />
        </mesh>
        {/* Pointed ears */}
        <mesh
          position={[-0.055, 0.1, -0.02]}
          rotation={[0.15, 0, -0.2]}
          material={mats.coat}
        >
          <coneGeometry args={[0.028, 0.12, 4]} />
        </mesh>
        <mesh
          position={[0.055, 0.1, -0.02]}
          rotation={[0.15, 0, 0.2]}
          material={mats.coat}
        >
          <coneGeometry args={[0.028, 0.12, 4]} />
        </mesh>
        <mesh
          position={[-0.055, 0.085, -0.015]}
          rotation={[0.15, 0, -0.2]}
          material={mats.tan}
        >
          <coneGeometry args={[0.014, 0.07, 4]} />
        </mesh>
        <mesh
          position={[0.055, 0.085, -0.015]}
          rotation={[0.15, 0, 0.2]}
          material={mats.tan}
        >
          <coneGeometry args={[0.014, 0.07, 4]} />
        </mesh>
        {/* Cyan optic eyes — site accent */}
        <mesh position={[-0.04, 0.025, 0.07]} material={mats.eye}>
          <sphereGeometry args={[0.018, 12, 12]} />
        </mesh>
        <mesh position={[0.04, 0.025, 0.07]} material={mats.eye}>
          <sphereGeometry args={[0.018, 12, 12]} />
        </mesh>
        {/* Nose */}
        <mesh position={[0, 0.005, 0.22]} material={mats.nose}>
          <sphereGeometry args={[0.022, 12, 12]} />
        </mesh>
      </group>

      {/* —— Tail —— */}
      <group ref={tail} position={[0, 0.06, -0.3]}>
        <mesh rotation={[0.85, 0, 0]} material={mats.coat}>
          <capsuleGeometry args={[0.02, 0.22, 4, 8]} />
        </mesh>
        <mesh position={[0, 0.06, -0.1]} rotation={[1.05, 0, 0]} material={mats.tan}>
          <capsuleGeometry args={[0.012, 0.08, 4, 8]} />
        </mesh>
      </group>

      <Leg
        mats={mats}
        hipRef={hipFL}
        kneeRef={kneeFL}
        ankleRef={ankleFL}
        position={[0.085, -0.05, 0.15]}
      />
      <Leg
        mats={mats}
        hipRef={hipFR}
        kneeRef={kneeFR}
        ankleRef={ankleFR}
        position={[-0.085, -0.05, 0.15]}
      />
      <Leg
        mats={mats}
        hipRef={hipBL}
        kneeRef={kneeBL}
        ankleRef={ankleBL}
        position={[0.085, -0.05, -0.17]}
        rear
      />
      <Leg
        mats={mats}
        hipRef={hipBR}
        kneeRef={kneeBR}
        ankleRef={ankleBR}
        position={[-0.085, -0.05, -0.17]}
        rear
      />

      <pointLight
        color="#63c7d9"
        intensity={0.45}
        distance={1.8}
        position={[0, 0.15, 0.45]}
      />
      <pointLight
        color="#e0b078"
        intensity={0.35}
        distance={2}
        position={[0.2, 0.1, 0.1]}
      />
    </group>
  );
}

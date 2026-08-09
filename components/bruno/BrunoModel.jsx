'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BRUNO_STATES } from '@/data/brunoStates';

function makeMat(color, metalness = 0.78, roughness = 0.32) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
  });
}

function Servo({ mats, position, radius = 0.028 }) {
  return (
    <group position={position}>
      <mesh material={mats.joint} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius, radius, 0.034, 12]} />
      </mesh>
      <mesh material={mats.led} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[radius * 1.15, 0.006, 6, 16]} />
      </mesh>
    </group>
  );
}

function Leg({ mats, hipRef, kneeRef, ankleRef, position, rear = false }) {
  return (
    <group ref={hipRef} position={position}>
      <Servo mats={mats} position={[0, 0, 0]} radius={0.032} />
      <mesh position={[0, -0.11, rear ? -0.012 : 0.012]} material={mats.shell}>
        <capsuleGeometry args={[0.026, 0.16, 4, 10]} />
      </mesh>
      <group ref={kneeRef} position={[0, -0.22, rear ? -0.01 : 0.01]}>
        <Servo mats={mats} position={[0, 0, 0]} radius={0.026} />
        <mesh position={[0, -0.11, rear ? 0.012 : -0.012]} material={mats.metal}>
          <capsuleGeometry args={[0.02, 0.15, 4, 10]} />
        </mesh>
        <group ref={ankleRef} position={[0, -0.22, rear ? 0.01 : -0.01]}>
          <Servo mats={mats} position={[0, 0, 0]} radius={0.02} />
          <mesh position={[0, -0.045, 0.018]} material={mats.paw}>
            <boxGeometry args={[0.065, 0.028, 0.1]} />
          </mesh>
          <mesh position={[0.018, -0.052, 0.04]} material={mats.dark}>
            <boxGeometry args={[0.018, 0.016, 0.03]} />
          </mesh>
          <mesh position={[-0.018, -0.052, 0.04]} material={mats.dark}>
            <boxGeometry args={[0.018, 0.016, 0.03]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/**
 * Mechanical Doberman — lean chassis, hip/knee/ankle servos, bigger presence.
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
      body: makeMat('#3a4550', 0.62, 0.4),
      shell: makeMat('#2a333c', 0.72, 0.34),
      metal: makeMat('#d4dce4', 0.96, 0.14),
      dark: makeMat('#161c22', 0.78, 0.32),
      joint: makeMat('#9aa8b4', 0.92, 0.18),
      paw: makeMat('#4a545e', 0.4, 0.55),
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
        emissiveIntensity: 1.25,
      }),
    }),
    [],
  );

  const setLimb = (hip, knee, ankle, hx, kx, ax) => {
    if (hip.current) hip.current.rotation.x = hx;
    if (knee.current) knee.current.rotation.x = kx;
    if (ankle.current) ankle.current.rotation.x = ax;
  };

  /* Three.js scene graph + materials are mutated each frame by design */
  /* eslint-disable react-hooks/immutability */
  useFrame((_, delta) => {
    if (!root.current) return;
    const d = Math.min(delta, 1 / 30);
    phase.current += d;

    if (jaw.current) jaw.current.rotation.x = 0;

    const wag = Math.sin(phase.current * 9) * 0.6;
    if (tail.current) {
      tail.current.rotation.z = wag;
      tail.current.rotation.y = Math.sin(phase.current * 6.5) * 0.18;
    }

    const idle = Math.sin(phase.current * 1.5) * 0.01;
    if (torso.current) {
      torso.current.position.y = idle;
      torso.current.rotation.x = 0;
      torso.current.rotation.z = 0;
    }

    if (state === BRUNO_STATES.Walk || state === BRUNO_STATES.Run) {
      const speed = state === BRUNO_STATES.Run ? 9 : 5;
      const amp = state === BRUNO_STATES.Run ? 0.55 : 0.38;
      const t = phase.current * speed;
      const gait = (offset) => {
        const s = Math.sin(t + offset);
        return {
          hip: s * amp,
          knee: Math.max(0, -s) * amp * 1.15 + 0.12,
          ankle: -s * amp * 0.35,
        };
      };
      const a = gait(0);
      const b = gait(Math.PI);
      setLimb(hipFL, kneeFL, ankleFL, a.hip, a.knee, a.ankle);
      setLimb(hipFR, kneeFR, ankleFR, b.hip, b.knee, b.ankle);
      setLimb(hipBL, kneeBL, ankleBL, b.hip * 0.9, b.knee * 0.95, b.ankle);
      setLimb(hipBR, kneeBR, ankleBR, a.hip * 0.9, a.knee * 0.95, a.ankle);
      root.current.position.y = Math.abs(Math.sin(t * 2)) * 0.035;
    } else if (state === BRUNO_STATES.Sit) {
      setLimb(hipBL, kneeBL, ankleBL, 0.85, 1.1, -0.35);
      setLimb(hipBR, kneeBR, ankleBR, 0.85, 1.1, -0.35);
      setLimb(hipFL, kneeFL, ankleFL, -0.12, 0.2, 0.05);
      setLimb(hipFR, kneeFR, ankleFR, -0.12, 0.2, 0.05);
      if (torso.current) {
        torso.current.rotation.x = -0.28;
        torso.current.position.y = -0.08;
      }
    } else if (state === BRUNO_STATES.Look || state === BRUNO_STATES.Curious) {
      if (head.current) {
        head.current.rotation.y = Math.sin(phase.current * 1.2) * 0.55;
        head.current.rotation.z = Math.sin(phase.current * 0.6) * 0.1;
      }
      if (neck.current) {
        neck.current.rotation.y = (head.current?.rotation.y || 0) * 0.35;
      }
      setLimb(hipFL, kneeFL, ankleFL, 0.04, 0.15, 0);
      setLimb(hipFR, kneeFR, ankleFR, -0.04, 0.15, 0);
      setLimb(hipBL, kneeBL, ankleBL, 0.02, 0.18, 0);
      setLimb(hipBR, kneeBR, ankleBR, -0.02, 0.18, 0);
    } else if (state === BRUNO_STATES.Bark) {
      if (jaw.current) {
        jaw.current.rotation.x =
          0.14 + Math.abs(Math.sin(phase.current * 16)) * 0.34;
      }
      if (head.current) {
        head.current.rotation.x = -0.12 + Math.sin(phase.current * 12) * 0.05;
      }
      if (tail.current) tail.current.rotation.z = Math.sin(phase.current * 14) * 0.75;
      setLimb(hipFL, kneeFL, ankleFL, 0.05, 0.2, 0);
      setLimb(hipFR, kneeFR, ankleFR, 0.05, 0.2, 0);
      setLimb(hipBL, kneeBL, ankleBL, 0.08, 0.22, 0);
      setLimb(hipBR, kneeBR, ankleBR, 0.08, 0.22, 0);
    } else if (state === BRUNO_STATES.Excited || state === BRUNO_STATES.Wag) {
      const bounce =
        Math.abs(Math.sin(phase.current * (state === BRUNO_STATES.Excited ? 6.5 : 2.4))) *
        (state === BRUNO_STATES.Excited ? 0.09 : 0.022);
      root.current.position.y = bounce;
      if (head.current) {
        head.current.rotation.y = Math.sin(phase.current * 1.15) * 0.24;
        head.current.rotation.x = -0.06;
      }
      if (tail.current) {
        tail.current.rotation.z = Math.sin(phase.current * 13) * 0.8;
      }
      const tip = Math.sin(phase.current * 3.2) * 0.08;
      setLimb(hipFL, kneeFL, ankleFL, tip, 0.18 + Math.abs(tip) * 0.4, -tip * 0.3);
      setLimb(hipFR, kneeFR, ankleFR, -tip, 0.18 + Math.abs(tip) * 0.4, tip * 0.3);
      setLimb(hipBL, kneeBL, ankleBL, tip * 0.4, 0.2, 0);
      setLimb(hipBR, kneeBR, ankleBR, -tip * 0.4, 0.2, 0);
    } else if (state === BRUNO_STATES.Jump) {
      root.current.position.y = Math.abs(Math.sin(phase.current * 4)) * 0.38;
      setLimb(hipFL, kneeFL, ankleFL, -0.55, 0.85, 0.2);
      setLimb(hipFR, kneeFR, ankleFR, -0.55, 0.85, 0.2);
      setLimb(hipBL, kneeBL, ankleBL, 0.45, 0.9, -0.15);
      setLimb(hipBR, kneeBR, ankleBR, 0.45, 0.9, -0.15);
    } else if (state === BRUNO_STATES.Spin) {
      root.current.rotation.y += d * 6.5;
      if (tail.current) tail.current.rotation.z = Math.sin(phase.current * 16) * 0.85;
      setLimb(hipFL, kneeFL, ankleFL, -0.2, 0.45, 0.1);
      setLimb(hipFR, kneeFR, ankleFR, -0.2, 0.45, 0.1);
      setLimb(hipBL, kneeBL, ankleBL, 0.15, 0.4, 0);
      setLimb(hipBR, kneeBR, ankleBR, 0.15, 0.4, 0);
    } else {
      if (head.current) {
        head.current.rotation.y = Math.sin(phase.current * 0.5) * 0.18;
        head.current.rotation.x *= 0.9;
        head.current.rotation.z *= 0.9;
      }
      const sway = Math.sin(phase.current * 0.9) * 0.04;
      setLimb(hipFL, kneeFL, ankleFL, sway, 0.16, 0);
      setLimb(hipFR, kneeFR, ankleFR, -sway, 0.16, 0);
      setLimb(hipBL, kneeBL, ankleBL, 0.02, 0.18, 0);
      setLimb(hipBR, kneeBR, ankleBR, -0.02, 0.18, 0);
      root.current.rotation.y *= 0.92;
      root.current.position.y *= 0.9;
    }

    if (state !== BRUNO_STATES.Spin) {
      root.current.rotation.y *= 0.9;
    }

    mats.led.emissiveIntensity = 2.4 + Math.sin(phase.current * 2.2) * 0.35;
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <group ref={root} position={[0, 0.52, 0]} scale={1.35} rotation={[0, 0.4, 0]}>
      <group ref={torso}>
        <mesh material={mats.body} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.095, 0.48, 8, 16]} />
        </mesh>
        <mesh position={[0, -0.01, 0.1]} material={mats.shell}>
          <boxGeometry args={[0.13, 0.11, 0.16]} />
        </mesh>
        <mesh position={[0, 0.078, 0]} material={mats.ledSoft}>
          <boxGeometry args={[0.018, 0.012, 0.4]} />
        </mesh>
        <mesh position={[0.078, 0.02, 0.02]} material={mats.teal}>
          <boxGeometry args={[0.012, 0.032, 0.16]} />
        </mesh>
        {[-0.08, 0, 0.08].map((z) => (
          <mesh key={z} position={[0.09, -0.02, z]} material={mats.dark}>
            <boxGeometry args={[0.01, 0.05, 0.04]} />
          </mesh>
        ))}
      </group>

      <group ref={neck} position={[0, 0.06, 0.28]}>
        <Servo mats={mats} position={[0, 0, 0]} radius={0.03} />
        <mesh position={[0, 0.02, 0.04]} material={mats.dark}>
          <cylinderGeometry args={[0.038, 0.048, 0.12, 10]} />
        </mesh>
      </group>

      <group ref={head} position={[0, 0.12, 0.44]}>
        <mesh material={mats.body}>
          <boxGeometry args={[0.12, 0.1, 0.22]} />
        </mesh>
        <mesh position={[0, -0.01, 0.13]} material={mats.shell}>
          <boxGeometry args={[0.08, 0.065, 0.1]} />
        </mesh>
        <mesh ref={jaw} position={[0, -0.048, 0.11]} material={mats.dark}>
          <boxGeometry args={[0.068, 0.028, 0.085]} />
        </mesh>
        <mesh
          position={[-0.045, 0.095, -0.04]}
          rotation={[0.25, 0, -0.14]}
          material={mats.dark}
        >
          <coneGeometry args={[0.02, 0.1, 4]} />
        </mesh>
        <mesh
          position={[0.045, 0.095, -0.04]}
          rotation={[0.25, 0, 0.14]}
          material={mats.dark}
        >
          <coneGeometry args={[0.02, 0.1, 4]} />
        </mesh>
        <mesh
          position={[0.055, 0.02, 0.04]}
          rotation={[0, Math.PI / 2, 0]}
          material={mats.led}
        >
          <circleGeometry args={[0.022, 16]} />
        </mesh>
        <mesh
          position={[-0.02, 0.02, 0.085]}
          rotation={[0, Math.PI / 2, 0]}
          material={mats.ledSoft}
        >
          <circleGeometry args={[0.014, 14]} />
        </mesh>
        <mesh position={[0, 0.01, 0.16]} material={mats.metal}>
          <cylinderGeometry args={[0.02, 0.022, 0.028, 12]} />
        </mesh>
      </group>

      <group ref={tail} position={[0, 0.06, -0.32]}>
        <Servo mats={mats} position={[0, 0, 0]} radius={0.022} />
        <mesh rotation={[0.95, 0, 0]} material={mats.body}>
          <capsuleGeometry args={[0.018, 0.2, 4, 8]} />
        </mesh>
        <mesh position={[0, 0.07, -0.11]} rotation={[1.15, 0, 0]} material={mats.metal}>
          <capsuleGeometry args={[0.012, 0.1, 4, 8]} />
        </mesh>
      </group>

      <Leg
        mats={mats}
        hipRef={hipFL}
        kneeRef={kneeFL}
        ankleRef={ankleFL}
        position={[0.09, -0.04, 0.16]}
      />
      <Leg
        mats={mats}
        hipRef={hipFR}
        kneeRef={kneeFR}
        ankleRef={ankleFR}
        position={[-0.09, -0.04, 0.16]}
      />
      <Leg
        mats={mats}
        hipRef={hipBL}
        kneeRef={kneeBL}
        ankleRef={ankleBL}
        position={[0.09, -0.04, -0.18]}
        rear
      />
      <Leg
        mats={mats}
        hipRef={hipBR}
        kneeRef={kneeBR}
        ankleRef={ankleBR}
        position={[-0.09, -0.04, -0.18]}
        rear
      />

      <pointLight
        color="#ff5555"
        intensity={0.75}
        distance={2.2}
        position={[0.18, 0.18, 0.35]}
      />
    </group>
  );
}

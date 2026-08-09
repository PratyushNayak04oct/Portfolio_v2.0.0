'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BRUNO_STATES } from '@/data/brunoStates';

function mat(color, metalness, roughness, extras = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
    ...extras,
  });
}

/** Large circular servo hub with red glow ring — signature of the reference */
function ServoHub({ mats, position, scale = 1, side = 1 }) {
  return (
    <group position={position} scale={scale} rotation={[0, 0, side > 0 ? 0 : Math.PI]}>
      {/* Outer silver rim */}
      <mesh material={mats.silver} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.032, 24]} />
      </mesh>
      {/* Inner matte recess */}
      <mesh material={mats.black} rotation={[0, Math.PI / 2, 0]} position={[side * 0.002, 0, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.028, 20]} />
      </mesh>
      {/* Red emissive ring */}
      <mesh material={mats.redRing} rotation={[0, Math.PI / 2, 0]} position={[side * 0.014, 0, 0]}>
        <torusGeometry args={[0.028, 0.005, 8, 28]} />
      </mesh>
      {/* Center red core */}
      <mesh material={mats.redCore} position={[side * 0.018, 0, 0]}>
        <sphereGeometry args={[0.012, 12, 12]} />
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
  side = 1,
  rear = false,
}) {
  return (
    <group ref={hipRef} position={position}>
      <ServoHub mats={mats} position={[side * 0.02, 0, 0]} scale={rear ? 0.95 : 1.05} side={side} />
      {/* Upper armor (matte black) */}
      <mesh
        position={[0, -0.09, rear ? -0.012 : 0.01]}
        material={mats.black}
        rotation={[rear ? 0.08 : -0.05, 0, 0]}
      >
        <capsuleGeometry args={[0.042, 0.13, 4, 10]} />
      </mesh>
      {/* Knee hinge */}
      <group ref={kneeRef} position={[0, -0.18, rear ? -0.02 : 0.015]}>
        <mesh material={mats.silver} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.028, 14]} />
        </mesh>
        <mesh material={mats.redRing} rotation={[0, Math.PI / 2, 0]} position={[side * 0.012, 0, 0]}>
          <torusGeometry args={[0.016, 0.003, 6, 16]} />
        </mesh>
        {/* Thin silver lower strut */}
        <mesh
          position={[0, -0.11, rear ? 0.015 : -0.01]}
          material={mats.silver}
          rotation={[rear ? -0.1 : 0.08, 0, 0]}
        >
          <capsuleGeometry args={[0.014, 0.16, 4, 10]} />
        </mesh>
        {/* Ankle + ball foot */}
        <group ref={ankleRef} position={[0, -0.22, rear ? 0.02 : -0.015]}>
          <mesh material={mats.silver} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.022, 12]} />
          </mesh>
          <mesh position={[0, -0.04, 0.01]} material={mats.pad}>
            <sphereGeometry args={[0.028, 14, 14]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/**
 * B.R.U.N.O. — mechanical Doberman matching the provided reference:
 * lean chassis, matte black plates, silver lower legs, red servo hubs.
 */
export default function BrunoModel({ state = BRUNO_STATES.Wag, facing = 1 }) {
  const root = useRef(null);
  const baseYaw = 0.45;
  const head = useRef(null);
  const neck = useRef(null);
  const torso = useRef(null);
  const tail = useRef(null);
  const tailTip = useRef(null);
  const jaw = useRef(null);
  const earL = useRef(null);
  const earR = useRef(null);
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
      black: mat('#14181c', 0.35, 0.55),
      blackSoft: mat('#1c2228', 0.28, 0.62),
      silver: mat('#c8d0d8', 0.95, 0.18),
      pad: mat('#2a3036', 0.2, 0.75),
      lens: mat('#05080c', 0.9, 0.12),
      redRing: new THREE.MeshStandardMaterial({
        color: '#3a0606',
        emissive: '#ff2a2a',
        emissiveIntensity: 2.8,
        metalness: 0.2,
        roughness: 0.3,
      }),
      redCore: new THREE.MeshStandardMaterial({
        color: '#2a0404',
        emissive: '#ff4444',
        emissiveIntensity: 3.2,
        metalness: 0.15,
        roughness: 0.25,
      }),
      spine: new THREE.MeshStandardMaterial({
        color: '#2a0606',
        emissive: '#ff3030',
        emissiveIntensity: 2.2,
        metalness: 0.2,
        roughness: 0.35,
      }),
      cable: mat('#0e1216', 0.4, 0.5),
      tongue: mat('#8a2a3a', 0.15, 0.55),
      gum: mat('#4a1a22', 0.2, 0.5),
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
    const t = phase.current;

    // Happy baseline — lively wag (quiet when sleeping)
    const sleeping = state === BRUNO_STATES.Sleep;
    const happy = state === BRUNO_STATES.Excited || state === BRUNO_STATES.Wag;
    const wagSpeed = sleeping ? 1.2 : happy ? 14 : state === BRUNO_STATES.Bark ? 16 : 10;
    const wagAmp = sleeping ? 0.06 : happy ? 0.85 : state === BRUNO_STATES.Bark ? 0.7 : 0.55;

    if (tail.current) {
      tail.current.rotation.z = Math.sin(t * wagSpeed) * wagAmp;
      tail.current.rotation.y = Math.sin(t * (wagSpeed * 0.65)) * wagAmp * 0.35;
      tail.current.rotation.x = 0.35 + Math.sin(t * 6) * (sleeping ? 0.02 : 0.12);
    }
    if (tailTip.current) {
      tailTip.current.rotation.z = Math.sin(t * wagSpeed + 0.8) * wagAmp * 0.7;
      tailTip.current.rotation.x = 0.25 + Math.sin(t * 7) * (sleeping ? 0.02 : 0.1);
    }

    // Canine mouth — mostly closed, opens for bark / happy pant
    let jawOpen = 0.06 + Math.sin(t * 2.4) * 0.025;
    if (state === BRUNO_STATES.Bark) {
      jawOpen = 0.48 + Math.abs(Math.sin(t * 15)) * 0.4;
    } else if (state === BRUNO_STATES.Excited || state === BRUNO_STATES.Wag) {
      jawOpen = 0.12 + Math.sin(t * 4) * 0.04;
    } else if (state === BRUNO_STATES.Sleep) {
      jawOpen = 0.02;
    } else if (state === BRUNO_STATES.Curious || state === BRUNO_STATES.Look) {
      jawOpen = 0.08 + Math.sin(t * 2) * 0.02;
    }
    if (jaw.current) jaw.current.rotation.x = jawOpen;

    // Perky ear wiggle
    if (earL.current) {
      earL.current.rotation.z = -0.22 + Math.sin(t * 4.5) * 0.06;
      earL.current.rotation.x = 0.18 + Math.sin(t * 3.2) * 0.04;
    }
    if (earR.current) {
      earR.current.rotation.z = 0.22 + Math.sin(t * 4.5 + 0.4) * 0.06;
      earR.current.rotation.x = 0.18 + Math.sin(t * 3.2 + 0.3) * 0.04;
    }

    if (torso.current) {
      torso.current.position.y = Math.sin(t * 1.8) * 0.01;
      torso.current.rotation.x = 0;
      torso.current.rotation.z = Math.sin(t * wagSpeed * 0.35) * 0.03;
    }

    // Happy default head tilt
    if (head.current && state !== BRUNO_STATES.Bark && state !== BRUNO_STATES.Look) {
      head.current.rotation.z = 0.08 + Math.sin(t * 1.2) * 0.05;
    }

    if (state === BRUNO_STATES.Walk || state === BRUNO_STATES.Run) {
      const speed = state === BRUNO_STATES.Run ? 9 : 5.2;
      const amp = state === BRUNO_STATES.Run ? 0.52 : 0.36;
      const gt = t * speed;
      const gait = (offset) => {
        const s = Math.sin(gt + offset);
        return {
          hip: s * amp,
          knee: Math.max(0, -s) * amp * 1.2 + 0.15,
          ankle: -s * amp * 0.28,
        };
      };
      const a = gait(0);
      const b = gait(Math.PI);
      setLimb(hipFL, kneeFL, ankleFL, a.hip, a.knee, a.ankle);
      setLimb(hipFR, kneeFR, ankleFR, b.hip, b.knee, b.ankle);
      setLimb(hipBL, kneeBL, ankleBL, b.hip * 0.92, b.knee, b.ankle);
      setLimb(hipBR, kneeBR, ankleBR, a.hip * 0.92, a.knee, a.ankle);
      root.current.position.y = Math.abs(Math.sin(gt * 2)) * 0.028;
      if (head.current) {
        head.current.rotation.y = Math.sin(gt * 0.5) * 0.1;
        head.current.rotation.x = -0.06;
      }
    } else if (state === BRUNO_STATES.Sit) {
      setLimb(hipBL, kneeBL, ankleBL, 0.95, 1.25, -0.4);
      setLimb(hipBR, kneeBR, ankleBR, 0.95, 1.25, -0.4);
      setLimb(hipFL, kneeFL, ankleFL, -0.08, 0.2, 0.05);
      setLimb(hipFR, kneeFR, ankleFR, -0.08, 0.2, 0.05);
      if (torso.current) {
        torso.current.rotation.x = -0.32;
        torso.current.position.y = -0.05;
      }
      if (head.current) {
        head.current.rotation.x = 0.12;
        head.current.rotation.y = Math.sin(t * 1.4) * 0.2;
      }
    } else if (state === BRUNO_STATES.Sleep) {
      setLimb(hipBL, kneeBL, ankleBL, 1.15, 1.35, -0.5);
      setLimb(hipBR, kneeBR, ankleBR, 1.15, 1.35, -0.5);
      setLimb(hipFL, kneeFL, ankleFL, 0.55, 0.85, -0.15);
      setLimb(hipFR, kneeFR, ankleFR, 0.55, 0.85, -0.15);
      if (torso.current) {
        torso.current.rotation.x = -0.55;
        torso.current.rotation.z = 0.35;
        torso.current.position.y = -0.12;
      }
      if (head.current) {
        head.current.rotation.x = 0.35;
        head.current.rotation.y = 0.15;
        head.current.rotation.z = 0.2;
      }
      if (neck.current) neck.current.rotation.x = 0.25;
      root.current.position.y = -0.08;
    } else if (state === BRUNO_STATES.Look || state === BRUNO_STATES.Curious) {
      if (head.current) {
        head.current.rotation.y = Math.sin(t * 1.1) * 0.55;
        head.current.rotation.z = 0.12 + Math.sin(t * 0.5) * 0.1;
        head.current.rotation.x = -0.05;
      }
      if (neck.current) neck.current.rotation.y = (head.current?.rotation.y || 0) * 0.45;
      setLimb(hipFL, kneeFL, ankleFL, 0.04, 0.18, 0);
      setLimb(hipFR, kneeFR, ankleFR, -0.04, 0.18, 0);
      setLimb(hipBL, kneeBL, ankleBL, 0.02, 0.2, 0);
      setLimb(hipBR, kneeBR, ankleBR, -0.02, 0.2, 0);
    } else if (state === BRUNO_STATES.Bark) {
      if (head.current) {
        head.current.rotation.x = -0.28 + Math.sin(t * 12) * 0.05;
        head.current.rotation.z = 0;
      }
      if (neck.current) neck.current.rotation.x = -0.15;
      setLimb(hipFL, kneeFL, ankleFL, 0.05, 0.2, 0);
      setLimb(hipFR, kneeFR, ankleFR, 0.05, 0.2, 0);
      setLimb(hipBL, kneeBL, ankleBL, 0.08, 0.22, 0);
      setLimb(hipBR, kneeBR, ankleBR, 0.08, 0.22, 0);
    } else if (state === BRUNO_STATES.Excited || state === BRUNO_STATES.Wag) {
      root.current.position.y =
        Math.abs(Math.sin(t * (state === BRUNO_STATES.Excited ? 6.5 : 2.6))) *
        (state === BRUNO_STATES.Excited ? 0.08 : 0.022);
      if (head.current) {
        head.current.rotation.y = Math.sin(t * 1.4) * 0.22;
        head.current.rotation.x = -0.08;
      }
      if (state === BRUNO_STATES.Excited) {
        setLimb(hipFL, kneeFL, ankleFL, -0.85, 0.55, 0.2);
        setLimb(hipFR, kneeFR, ankleFR, 0.05, 0.2, 0);
      } else {
        const tip = Math.sin(t * 3.2) * 0.07;
        setLimb(hipFL, kneeFL, ankleFL, tip, 0.18 + Math.abs(tip) * 0.3, -tip * 0.2);
        setLimb(hipFR, kneeFR, ankleFR, -tip, 0.18 + Math.abs(tip) * 0.3, tip * 0.2);
      }
      setLimb(hipBL, kneeBL, ankleBL, 0.04, 0.2, 0);
      setLimb(hipBR, kneeBR, ankleBR, -0.04, 0.2, 0);
    } else if (state === BRUNO_STATES.Jump) {
      root.current.position.y = Math.abs(Math.sin(t * 4)) * 0.4;
      setLimb(hipFL, kneeFL, ankleFL, -0.55, 0.9, 0.2);
      setLimb(hipFR, kneeFR, ankleFR, -0.55, 0.9, 0.2);
      setLimb(hipBL, kneeBL, ankleBL, 0.5, 1.0, -0.2);
      setLimb(hipBR, kneeBR, ankleBR, 0.5, 1.0, -0.2);
      if (torso.current) torso.current.rotation.x = -0.15;
      if (jaw.current) jaw.current.rotation.x = 0.28;
    } else if (state === BRUNO_STATES.Spin || state === BRUNO_STATES.Flip) {
      // Flip = aerial spin
      root.current.rotation.y += d * 7.5;
      if (state === BRUNO_STATES.Flip) {
        root.current.rotation.x += d * 8.5;
        root.current.position.y = 0.12 + Math.abs(Math.sin(t * 5)) * 0.28;
      }
      setLimb(hipFL, kneeFL, ankleFL, -0.35, 0.7, 0.15);
      setLimb(hipFR, kneeFR, ankleFR, -0.35, 0.7, 0.15);
      setLimb(hipBL, kneeBL, ankleBL, 0.35, 0.65, -0.1);
      setLimb(hipBR, kneeBR, ankleBR, 0.35, 0.65, -0.1);
    } else {
      // Happy idle
      if (head.current) {
        head.current.rotation.y = Math.sin(t * 0.7) * 0.18;
        head.current.rotation.x = -0.06;
      }
      if (neck.current) {
        neck.current.rotation.x *= 0.9;
        neck.current.rotation.y = (head.current?.rotation.y || 0) * 0.3;
      }
      const sway = Math.sin(t * 1.1) * 0.04;
      setLimb(hipFL, kneeFL, ankleFL, sway, 0.16, 0);
      setLimb(hipFR, kneeFR, ankleFR, -sway, 0.16, 0);
      setLimb(hipBL, kneeBL, ankleBL, 0.02, 0.18, 0);
      setLimb(hipBR, kneeBR, ankleBR, -0.02, 0.18, 0);
      root.current.position.y = Math.abs(Math.sin(t * 2.2)) * 0.012;
      root.current.rotation.x *= 0.85;
    }

    // Face left/right during page run; damp spin when not flipping
    const targetYaw = facing < 0 ? Math.PI - baseYaw : baseYaw;
    if (state === BRUNO_STATES.Run) {
      root.current.rotation.y += (targetYaw - root.current.rotation.y) * 0.18;
      root.current.rotation.x *= 0.85;
    } else if (state !== BRUNO_STATES.Spin && state !== BRUNO_STATES.Flip) {
      root.current.rotation.y += (baseYaw - root.current.rotation.y) * 0.12;
      root.current.rotation.x *= 0.85;
    }

    const pulse = 2.5 + Math.sin(t * 2.4) * 0.4;
    mats.redRing.emissiveIntensity = pulse;
    mats.redCore.emissiveIntensity = pulse + 0.4;
    mats.spine.emissiveIntensity = 2.0 + Math.sin(t * 1.8) * 0.35;
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <group ref={root} position={[0, 0.5, 0]} scale={1.48} rotation={[0, baseYaw, 0]}>
      {/* —— Muscular chest → tucked waist —— */}
      <group ref={torso}>
        {/* Broad chest / shoulders */}
        <mesh position={[0, 0.02, 0.12]} material={mats.black} rotation={[0.05, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.125, 0.2, 8, 16]} />
        </mesh>
        {/* Shoulder plates */}
        <mesh position={[0.09, 0.04, 0.12]} material={mats.blackSoft}>
          <boxGeometry args={[0.06, 0.08, 0.1]} />
        </mesh>
        <mesh position={[-0.09, 0.04, 0.12]} material={mats.blackSoft}>
          <boxGeometry args={[0.06, 0.08, 0.1]} />
        </mesh>
        {/* Mid body taper */}
        <mesh position={[0, 0.01, -0.06]} material={mats.blackSoft} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.08, 0.2, 8, 14]} />
        </mesh>
        {/* Muscular haunches */}
        <mesh position={[0, 0.02, -0.22]} material={mats.black} rotation={[-0.05, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.11, 0.12, 8, 14]} />
        </mesh>
        {/* Armor plate top */}
        <mesh position={[0, 0.09, 0.02]} material={mats.black}>
          <boxGeometry args={[0.14, 0.04, 0.38]} />
        </mesh>
        {/* Red spine LED strip */}
        <mesh position={[0, 0.1, 0.0]} material={mats.spine}>
          <boxGeometry args={[0.012, 0.008, 0.42]} />
        </mesh>
        {/* Belly mechanical ribs (silver) */}
        {[-0.06, 0.02, 0.1].map((z) => (
          <mesh key={z} position={[0, -0.07, z]} material={mats.silver}>
            <boxGeometry args={[0.07, 0.012, 0.035]} />
          </mesh>
        ))}
      </group>

      {/* —— Segmented neck + ribbon cables —— */}
      <group ref={neck} position={[0, 0.06, 0.26]}>
        {[0, 0.04, 0.08].map((y, i) => (
          <mesh
            key={y}
            position={[0, y * 0.4, 0.03 + i * 0.025]}
            material={i % 2 ? mats.silver : mats.black}
          >
            <cylinderGeometry args={[0.04 - i * 0.004, 0.045 - i * 0.004, 0.035, 12]} />
          </mesh>
        ))}
        {/* Neck cables */}
        {[-0.025, 0, 0.025].map((x) => (
          <mesh
            key={x}
            position={[x, 0.02, -0.01]}
            rotation={[0.6, 0, x * 2]}
            material={mats.cable}
          >
            <capsuleGeometry args={[0.006, 0.1, 3, 6]} />
          </mesh>
        ))}
      </group>

      {/* —— Wedge head + real canine hinged jaw —— */}
      <group ref={head} position={[0, 0.12, 0.44]}>
        {/* Skull shell */}
        <mesh material={mats.black}>
          <boxGeometry args={[0.125, 0.105, 0.14]} />
        </mesh>
        {/* Upper snout — tapered wedge like a dog muzzle */}
        <mesh position={[0, 0.008, 0.12]} material={mats.blackSoft}>
          <boxGeometry args={[0.095, 0.05, 0.1]} />
        </mesh>
        <mesh position={[0, 0.002, 0.185]} material={mats.black}>
          <boxGeometry args={[0.072, 0.042, 0.07]} />
        </mesh>
        {/* Black nose */}
        <mesh position={[0, 0.0, 0.225]} material={mats.lens}>
          <sphereGeometry args={[0.022, 12, 12]} />
        </mesh>
        {/* Sensor visor strip */}
        <mesh position={[0, 0.02, 0.09]} material={mats.lens}>
          <boxGeometry args={[0.08, 0.028, 0.018]} />
        </mesh>
        <mesh position={[0, 0.02, 0.1]} material={mats.redCore}>
          <circleGeometry args={[0.01, 12]} />
        </mesh>
        {/* Side eye LEDs */}
        <mesh position={[-0.04, 0.025, 0.07]} material={mats.redRing}>
          <sphereGeometry args={[0.01, 10, 10]} />
        </mesh>
        <mesh position={[0.04, 0.025, 0.07]} material={mats.redRing}>
          <sphereGeometry args={[0.01, 10, 10]} />
        </mesh>

        {/* Lower jaw — matches snout taper, hinges from the throat */}
        <group ref={jaw} position={[0, -0.012, 0.06]}>
          <mesh position={[0, -0.03, 0.08]} material={mats.black}>
            <boxGeometry args={[0.088, 0.028, 0.13]} />
          </mesh>
          <mesh position={[0, -0.034, 0.15]} material={mats.blackSoft}>
            <boxGeometry args={[0.062, 0.02, 0.055]} />
          </mesh>
          {/* Lip line */}
          <mesh position={[0, -0.014, 0.1]} material={mats.gum}>
            <boxGeometry args={[0.078, 0.006, 0.1]} />
          </mesh>
          {/* Teeth row */}
          <mesh position={[-0.02, -0.018, 0.155]} material={mats.silver}>
            <boxGeometry args={[0.012, 0.01, 0.01]} />
          </mesh>
          <mesh position={[0.02, -0.018, 0.155]} material={mats.silver}>
            <boxGeometry args={[0.012, 0.01, 0.01]} />
          </mesh>
          {/* Tongue — only peeks when jaw opens */}
          <mesh position={[0, -0.022, 0.12]} rotation={[0.2, 0, 0]} material={mats.tongue}>
            <capsuleGeometry args={[0.012, 0.04, 4, 8]} />
          </mesh>
        </group>

        {/* Perky pointed ears */}
        <group ref={earL} position={[-0.052, 0.08, -0.02]}>
          <mesh rotation={[0.2, 0, -0.22]} material={mats.black}>
            <coneGeometry args={[0.028, 0.12, 4]} />
          </mesh>
        </group>
        <group ref={earR} position={[0.052, 0.08, -0.02]}>
          <mesh rotation={[0.2, 0, 0.22]} material={mats.black}>
            <coneGeometry args={[0.028, 0.12, 4]} />
          </mesh>
        </group>

        <mesh position={[0.062, 0.0, 0.02]} material={mats.redRing} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.018, 0.003, 6, 16]} />
        </mesh>
      </group>

      {/* —— Multi-joint happy wagging tail —— */}
      <group ref={tail} position={[0, 0.08, -0.3]}>
        <mesh rotation={[0.55, 0, 0]} material={mats.black}>
          <capsuleGeometry args={[0.018, 0.12, 4, 8]} />
        </mesh>
        <group ref={tailTip} position={[0, 0.06, -0.08]}>
          <mesh rotation={[0.85, 0, 0]} material={mats.blackSoft}>
            <capsuleGeometry args={[0.014, 0.1, 4, 8]} />
          </mesh>
          <mesh position={[0, 0.05, -0.06]} rotation={[1.1, 0, 0]} material={mats.silver}>
            <capsuleGeometry args={[0.009, 0.05, 4, 8]} />
          </mesh>
        </group>
      </group>

      <Leg
        mats={mats}
        hipRef={hipFL}
        kneeRef={kneeFL}
        ankleRef={ankleFL}
        position={[0.115, -0.02, 0.14]}
        side={1}
      />
      <Leg
        mats={mats}
        hipRef={hipFR}
        kneeRef={kneeFR}
        ankleRef={ankleFR}
        position={[-0.115, -0.02, 0.14]}
        side={-1}
      />
      <Leg
        mats={mats}
        hipRef={hipBL}
        kneeRef={kneeBL}
        ankleRef={ankleBL}
        position={[0.11, -0.02, -0.2]}
        side={1}
        rear
      />
      <Leg
        mats={mats}
        hipRef={hipBR}
        kneeRef={kneeBR}
        ankleRef={ankleBR}
        position={[-0.11, -0.02, -0.2]}
        side={-1}
        rear
      />

      <pointLight color="#ff4444" intensity={0.55} distance={1.8} position={[0.15, 0.1, 0.2]} />
      <pointLight color="#c8d0d8" intensity={0.35} distance={2} position={[-0.3, 0.4, 0.3]} />
    </group>
  );
}

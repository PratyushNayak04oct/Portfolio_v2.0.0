'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BRUNO_STATES } from '@/data/brunoStates';

const RED = '#ff3131';
const LERP = 10;

function mat(color, metalness, roughness, extras = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
    ...extras,
  });
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

/** Large circular silver servo hub with glowing red ring (#ff3131) */
function ServoHub({ mats, position, scale = 1, side = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh material={mats.silver} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.058, 0.058, 0.034, 28]} />
      </mesh>
      <mesh material={mats.silverRim} rotation={[0, Math.PI / 2, 0]} position={[side * 0.012, 0, 0]}>
        <torusGeometry args={[0.052, 0.005, 8, 28]} />
      </mesh>
      <mesh material={mats.black} rotation={[0, Math.PI / 2, 0]} position={[side * 0.004, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.03, 22]} />
      </mesh>
      <mesh material={mats.redRing} rotation={[0, Math.PI / 2, 0]} position={[side * 0.016, 0, 0]}>
        <torusGeometry args={[0.03, 0.006, 8, 32]} />
      </mesh>
      <mesh material={mats.redCore} position={[side * 0.02, 0, 0]}>
        <sphereGeometry args={[0.013, 12, 12]} />
      </mesh>
    </group>
  );
}

/** Clawed pad foot with mechanical wrist */
function Foot({ mats, ankleRef, side = 1, rear = false }) {
  return (
    <group ref={ankleRef} position={[0, -0.22, rear ? 0.02 : -0.012]}>
      {/* Wrist / ankle servo */}
      <mesh material={mats.silver} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.024, 12]} />
      </mesh>
      <mesh material={mats.redRing} rotation={[0, Math.PI / 2, 0]} position={[side * 0.01, 0, 0]}>
        <torusGeometry args={[0.012, 0.0025, 6, 14]} />
      </mesh>
      {/* Pad */}
      <mesh position={[0, -0.038, 0.012]} material={mats.pad} scale={[1.15, 0.55, 1.35]}>
        <sphereGeometry args={[0.026, 12, 12]} />
      </mesh>
      {/* Claws */}
      {[-0.014, 0, 0.014].map((x) => (
        <mesh
          key={x}
          position={[x, -0.042, 0.038]}
          rotation={[0.55, 0, 0]}
          material={mats.silver}
        >
          <coneGeometry args={[0.005, 0.018, 4]} />
        </mesh>
      ))}
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
      <ServoHub mats={mats} position={[side * 0.022, 0, 0]} scale={rear ? 0.92 : 1.08} side={side} />
      {/* Upper armor — matte black */}
      <mesh
        position={[0, -0.09, rear ? -0.01 : 0.012]}
        material={mats.black}
        rotation={[rear ? 0.1 : -0.06, 0, 0]}
      >
        <capsuleGeometry args={[0.044, 0.12, 4, 10]} />
      </mesh>
      {/* Knee hinge */}
      <group ref={kneeRef} position={[0, -0.175, rear ? -0.018 : 0.014]}>
        <mesh material={mats.silver} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.026, 14]} />
        </mesh>
        <mesh material={mats.redRing} rotation={[0, Math.PI / 2, 0]} position={[side * 0.012, 0, 0]}>
          <torusGeometry args={[0.015, 0.003, 6, 16]} />
        </mesh>
        {/* Silver lower strut */}
        <mesh
          position={[0, -0.105, rear ? 0.012 : -0.008]}
          material={mats.silver}
          rotation={[rear ? -0.08 : 0.06, 0, 0]}
        >
          <capsuleGeometry args={[0.013, 0.15, 4, 10]} />
        </mesh>
        <Foot mats={mats} ankleRef={ankleRef} side={side} rear={rear} />
      </group>
    </group>
  );
}

/**
 * Default standing pose targets (radians / units).
 * Blended each frame toward the active state.
 */
function poseFor(state, t) {
  const tip = Math.sin(t * 3.2) * 0.07;
  const base = {
    rootY: 0,
    rootRx: 0,
    torsoY: Math.sin(t * 1.8) * 0.01,
    torsoRx: 0,
    torsoRz: Math.sin(t * 4) * 0.025,
    neckRx: 0,
    neckRy: 0,
    headRx: -0.06,
    headRy: Math.sin(t * 0.7) * 0.18,
    headRz: 0.06 + Math.sin(t * 1.2) * 0.04,
    jaw: 0.08 + Math.sin(t * 2.4) * 0.02,
    fl: [tip, 0.18, -tip * 0.2],
    fr: [-tip, 0.18, tip * 0.2],
    bl: [0.02, 0.18, 0],
    br: [-0.02, 0.18, 0],
    wagSpeed: 11,
    wagAmp: 0.55,
  };

  switch (state) {
    case BRUNO_STATES.Bark: {
      // Planted crouch — drop body with leg fold so paws stay on the ground
      return {
        ...base,
        rootY: -0.155,
        torsoY: -0.02,
        torsoRx: 0.32,
        neckRx: -0.42,
        headRx: -0.28 + Math.sin(t * 12) * 0.06,
        headRy: Math.sin(t * 2) * 0.08,
        headRz: Math.sin(t * 3) * 0.1,
        jaw: 0.55 + Math.abs(Math.sin(t * 14)) * 0.35,
        fl: [0.42, 0.72, -0.12],
        fr: [0.42, 0.72, -0.12],
        bl: [0.28, 0.48, 0.04],
        br: [0.28, 0.48, 0.04],
        wagSpeed: 16,
        wagAmp: 0.95,
      };
    }
    case BRUNO_STATES.Sit: {
      // Hind folded, front straight vertical — grounded
      return {
        ...base,
        rootY: -0.12,
        torsoY: -0.03,
        torsoRx: -0.38,
        neckRx: -0.08,
        headRx: 0.1,
        headRy: Math.sin(t * 1.4) * 0.2,
        headRz: 0.05,
        jaw: 0.1 + Math.sin(t * 3) * 0.03,
        fl: [-0.05, 0.08, 0.02],
        fr: [-0.05, 0.08, 0.02],
        bl: [1.05, 1.35, -0.45],
        br: [1.05, 1.35, -0.45],
        wagSpeed: 10,
        wagAmp: 0.7,
      };
    }
    case BRUNO_STATES.Shake: {
      // Handshake — raise one front paw; keep other three planted
      return {
        ...base,
        rootY: -0.02,
        torsoRz: -0.06,
        neckRx: -0.08,
        headRx: -0.05,
        headRy: 0.15,
        headRz: -0.12,
        jaw: 0.14 + Math.sin(t * 4) * 0.04,
        fl: [-1.15, 0.95, 0.55],
        fr: [0.08, 0.22, 0],
        bl: [0.05, 0.22, 0],
        br: [-0.02, 0.2, 0],
        wagSpeed: 12,
        wagAmp: 0.65,
      };
    }
    case BRUNO_STATES.Excited: {
      return {
        ...base,
        rootY: 0,
        headRx: -0.1,
        headRy: Math.sin(t * 1.8) * 0.28,
        headRz: 0.1 + Math.sin(t * 2) * 0.08,
        jaw: 0.18 + Math.sin(t * 5) * 0.05,
        fl: [0.05, 0.2, 0],
        fr: [0.05, 0.2, 0],
        bl: [0.04, 0.2, 0],
        br: [-0.04, 0.2, 0],
        wagSpeed: 15,
        wagAmp: 0.9,
      };
    }
    case BRUNO_STATES.Wag: {
      return {
        ...base,
        rootY: 0,
        headRx: -0.08,
        headRy: Math.sin(t * 1.4) * 0.22,
        jaw: 0.12 + Math.sin(t * 4) * 0.04,
        wagSpeed: 12,
        wagAmp: 0.75,
      };
    }
    case BRUNO_STATES.Idle:
    default:
      return {
        ...base,
        wagSpeed: 8,
        wagAmp: 0.4,
      };
  }
}

/**
 * B.R.U.N.O. — mechanical Doberman:
 * matte black armor, silver lower legs, red (#ff3131) servo hubs,
 * short docked upward tail, articulated jaw, pointed ears, clawed pads.
 */
export default function BrunoModel({ state = BRUNO_STATES.Wag }) {
  const root = useRef(null);
  const baseYaw = 0.45;
  const head = useRef(null);
  const neck = useRef(null);
  const torso = useRef(null);
  const tail = useRef(null);
  const midTail = useRef(null);
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
  const blended = useRef(poseFor(BRUNO_STATES.Wag, 0));

  const mats = useMemo(
    () => ({
      black: mat('#14181e', 0.35, 0.72),
      blackSoft: mat('#1c222a', 0.3, 0.78),
      silver: mat('#d4dce4', 0.95, 0.16),
      silverRim: mat('#e8eef4', 0.98, 0.12),
      pad: mat('#1a1e24', 0.25, 0.7),
      lens: mat('#05080c', 0.85, 0.15),
      redRing: new THREE.MeshStandardMaterial({
        color: '#3a0808',
        emissive: RED,
        emissiveIntensity: 2.6,
        metalness: 0.3,
        roughness: 0.3,
      }),
      redCore: new THREE.MeshStandardMaterial({
        color: '#2a0404',
        emissive: RED,
        emissiveIntensity: 3.0,
        metalness: 0.2,
        roughness: 0.25,
      }),
      spine: new THREE.MeshStandardMaterial({
        color: '#2a0606',
        emissive: RED,
        emissiveIntensity: 2.0,
        metalness: 0.25,
        roughness: 0.35,
      }),
      cable: mat('#2e343c', 0.55, 0.45),
      tongue: mat('#8a2a3a', 0.12, 0.55),
      gum: mat('#4a1a22', 0.18, 0.52),
    }),
    [],
  );

  const applyLimb = (hip, knee, ankle, vals) => {
    if (hip.current) hip.current.rotation.x = vals[0];
    if (knee.current) knee.current.rotation.x = vals[1];
    if (ankle.current) ankle.current.rotation.x = vals[2];
  };

  const blendPose = (cur, tgt, k) => {
    cur.rootY = lerp(cur.rootY, tgt.rootY, k);
    cur.rootRx = lerp(cur.rootRx, tgt.rootRx, k);
    cur.torsoY = lerp(cur.torsoY, tgt.torsoY, k);
    cur.torsoRx = lerp(cur.torsoRx, tgt.torsoRx, k);
    cur.torsoRz = lerp(cur.torsoRz, tgt.torsoRz, k);
    cur.neckRx = lerp(cur.neckRx, tgt.neckRx, k);
    cur.neckRy = lerp(cur.neckRy, tgt.neckRy, k);
    cur.headRx = lerp(cur.headRx, tgt.headRx, k);
    cur.headRy = lerp(cur.headRy, tgt.headRy, k);
    cur.headRz = lerp(cur.headRz, tgt.headRz, k);
    cur.jaw = lerp(cur.jaw, tgt.jaw, k);
    cur.wagSpeed = lerp(cur.wagSpeed, tgt.wagSpeed, k);
    cur.wagAmp = lerp(cur.wagAmp, tgt.wagAmp, k);
    for (const key of ['fl', 'fr', 'bl', 'br']) {
      cur[key][0] = lerp(cur[key][0], tgt[key][0], k);
      cur[key][1] = lerp(cur[key][1], tgt[key][1], k);
      cur[key][2] = lerp(cur[key][2], tgt[key][2], k);
    }
  };

  /* eslint-disable react-hooks/immutability */
  useFrame((_, delta) => {
    if (!root.current) return;
    const d = Math.min(delta, 1 / 30);
    phase.current += d;
    const t = phase.current;
    const k = 1 - Math.exp(-LERP * d);

    const target = poseFor(state, t);
    blendPose(blended.current, target, k);
    const p = blended.current;

    // Short docked tail — wag base + tip lag
    if (tail.current) {
      tail.current.rotation.z = Math.sin(t * p.wagSpeed) * p.wagAmp * 0.5;
      tail.current.rotation.y = Math.sin(t * p.wagSpeed * 0.45) * p.wagAmp * 0.1;
      tail.current.rotation.x = 0.85 + Math.sin(t * 3) * 0.05;
    }
    if (midTail.current) {
      midTail.current.rotation.z = Math.sin(t * p.wagSpeed - 0.5) * p.wagAmp * 0.65;
      midTail.current.rotation.x = 0.35 + Math.sin(t * 3.5) * 0.04;
    }

    if (jaw.current) jaw.current.rotation.x = p.jaw;

    if (earL.current) {
      earL.current.rotation.z = -0.28 + Math.sin(t * 4.5) * 0.05;
      earL.current.rotation.x = 0.15 + Math.sin(t * 3.2) * 0.03;
    }
    if (earR.current) {
      earR.current.rotation.z = 0.28 + Math.sin(t * 4.5 + 0.4) * 0.05;
      earR.current.rotation.x = 0.15 + Math.sin(t * 3.2 + 0.3) * 0.03;
    }

    if (torso.current) {
      torso.current.position.y = p.torsoY;
      torso.current.rotation.x = p.torsoRx;
      torso.current.rotation.z = p.torsoRz;
    }

    if (neck.current) {
      neck.current.rotation.x = p.neckRx;
      neck.current.rotation.y = p.neckRy;
    }

    if (head.current) {
      head.current.rotation.x = p.headRx;
      head.current.rotation.y = p.headRy;
      head.current.rotation.z = p.headRz;
    }

    applyLimb(hipFL, kneeFL, ankleFL, p.fl);
    applyLimb(hipFR, kneeFR, ankleFR, p.fr);
    applyLimb(hipBL, kneeBL, ankleBL, p.bl);
    applyLimb(hipBR, kneeBR, ankleBR, p.br);

    root.current.position.y = p.rootY;
    root.current.rotation.x = lerp(root.current.rotation.x, p.rootRx, k);
    root.current.rotation.y = lerp(root.current.rotation.y, baseYaw, clamp01(k * 1.4));

    const pulse = 2.4 + Math.sin(t * 2.4) * 0.45;
    mats.redRing.emissiveIntensity = pulse;
    mats.redCore.emissiveIntensity = pulse + 0.35;
    mats.spine.emissiveIntensity = 1.9 + Math.sin(t * 1.8) * 0.3;
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <group ref={root} position={[0, 0.48, 0]} scale={1.52} rotation={[0, baseYaw, 0]}>
      {/* —— Matte black chassis —— */}
      <group ref={torso}>
        <mesh position={[0, 0.02, 0.12]} material={mats.black} rotation={[0.05, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.12, 0.18, 8, 16]} />
        </mesh>
        <mesh position={[0.088, 0.045, 0.12]} material={mats.blackSoft}>
          <boxGeometry args={[0.055, 0.075, 0.095]} />
        </mesh>
        <mesh position={[-0.088, 0.045, 0.12]} material={mats.blackSoft}>
          <boxGeometry args={[0.055, 0.075, 0.095]} />
        </mesh>
        <mesh position={[0, 0.01, -0.05]} material={mats.blackSoft} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.075, 0.18, 8, 14]} />
        </mesh>
        <mesh position={[0, 0.02, -0.22]} material={mats.black} rotation={[-0.06, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.105, 0.1, 8, 14]} />
        </mesh>
        <mesh position={[0, 0.09, 0.02]} material={mats.black}>
          <boxGeometry args={[0.13, 0.035, 0.36]} />
        </mesh>
        {/* Red spine LED rail */}
        <mesh position={[0, 0.108, 0]} material={mats.spine}>
          <boxGeometry args={[0.01, 0.007, 0.4]} />
        </mesh>
        <mesh position={[0, 0.1, 0]} material={mats.silver}>
          <boxGeometry args={[0.024, 0.003, 0.38]} />
        </mesh>
        {/* Belly ribs */}
        {[-0.05, 0.03, 0.11].map((z) => (
          <mesh key={z} position={[0, -0.065, z]} material={mats.silver}>
            <boxGeometry args={[0.06, 0.01, 0.03]} />
          </mesh>
        ))}
      </group>

      {/* —— Segmented neck —— */}
      <group ref={neck} position={[0, 0.06, 0.26]}>
        {[0, 0.04, 0.08].map((y, i) => (
          <mesh
            key={y}
            position={[0, y * 0.35, 0.03 + i * 0.028]}
            material={i % 2 ? mats.silver : mats.black}
          >
            <cylinderGeometry args={[0.038 - i * 0.004, 0.042 - i * 0.004, 0.032, 12]} />
          </mesh>
        ))}
        {[-0.022, 0, 0.022].map((x) => (
          <mesh
            key={x}
            position={[x, 0.015, -0.01]}
            rotation={[0.55, 0, x * 2]}
            material={mats.cable}
          >
            <capsuleGeometry args={[0.005, 0.09, 3, 6]} />
          </mesh>
        ))}
      </group>

      {/* —— Wedge head + articulated jaw —— */}
      <group ref={head} position={[0, 0.12, 0.44]}>
        <mesh material={mats.black}>
          <boxGeometry args={[0.12, 0.1, 0.135]} />
        </mesh>
        <mesh position={[0, 0.006, 0.115]} material={mats.blackSoft}>
          <boxGeometry args={[0.09, 0.048, 0.095]} />
        </mesh>
        <mesh position={[0, 0.0, 0.18]} material={mats.black}>
          <boxGeometry args={[0.068, 0.04, 0.065]} />
        </mesh>
        <mesh position={[0, -0.002, 0.22]} material={mats.lens}>
          <sphereGeometry args={[0.02, 12, 12]} />
        </mesh>
        <mesh position={[0, 0.018, 0.085]} material={mats.lens}>
          <boxGeometry args={[0.075, 0.026, 0.016]} />
        </mesh>
        <mesh position={[0, 0.018, 0.095]} material={mats.redCore}>
          <circleGeometry args={[0.009, 12]} />
        </mesh>
        <mesh position={[-0.038, 0.022, 0.065]} material={mats.redRing}>
          <sphereGeometry args={[0.009, 10, 10]} />
        </mesh>
        <mesh position={[0.038, 0.022, 0.065]} material={mats.redRing}>
          <sphereGeometry args={[0.009, 10, 10]} />
        </mesh>

        {/* Articulated lower jaw */}
        <group ref={jaw} position={[0, -0.01, 0.055]}>
          <mesh position={[0, -0.028, 0.075]} material={mats.black}>
            <boxGeometry args={[0.084, 0.026, 0.125]} />
          </mesh>
          <mesh position={[0, -0.032, 0.145]} material={mats.blackSoft}>
            <boxGeometry args={[0.058, 0.018, 0.05]} />
          </mesh>
          <mesh position={[0, -0.012, 0.095]} material={mats.gum}>
            <boxGeometry args={[0.074, 0.005, 0.095]} />
          </mesh>
          <mesh position={[-0.018, -0.016, 0.15]} material={mats.silver}>
            <boxGeometry args={[0.011, 0.009, 0.009]} />
          </mesh>
          <mesh position={[0.018, -0.016, 0.15]} material={mats.silver}>
            <boxGeometry args={[0.011, 0.009, 0.009]} />
          </mesh>
          <mesh position={[0, -0.02, 0.11]} rotation={[0.2, 0, 0]} material={mats.tongue}>
            <capsuleGeometry args={[0.011, 0.035, 4, 8]} />
          </mesh>
        </group>

        {/* Pointed ears */}
        <group ref={earL} position={[-0.05, 0.078, -0.018]}>
          <mesh rotation={[0.18, 0.05, -0.28]} material={mats.black}>
            <coneGeometry args={[0.026, 0.115, 4]} />
          </mesh>
        </group>
        <group ref={earR} position={[0.05, 0.078, -0.018]}>
          <mesh rotation={[0.18, -0.05, 0.28]} material={mats.black}>
            <coneGeometry args={[0.026, 0.115, 4]} />
          </mesh>
        </group>

        <mesh position={[0.06, 0, 0.015]} material={mats.redRing} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.016, 0.003, 6, 16]} />
        </mesh>
      </group>

      {/* —— Short docked upward tail —— */}
      <group ref={tail} position={[0, 0.1, -0.28]} rotation={[0.9, 0, 0]}>
        <mesh position={[0, 0.02, -0.01]} rotation={[0.4, 0, 0]} material={mats.black}>
          <capsuleGeometry args={[0.028, 0.04, 4, 10]} />
        </mesh>
        <group ref={midTail} position={[0, 0.055, -0.04]}>
          <mesh rotation={[0.55, 0, 0]} material={mats.blackSoft}>
            <capsuleGeometry args={[0.018, 0.045, 4, 8]} />
          </mesh>
          <mesh position={[0, 0.04, -0.03]} rotation={[0.7, 0, 0]} material={mats.blackSoft}>
            <sphereGeometry args={[0.012, 8, 8]} />
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

      <pointLight color={RED} intensity={0.5} distance={1.6} position={[0.15, 0.1, 0.2]} />
      <pointLight color="#c8d0d8" intensity={0.32} distance={2} position={[-0.3, 0.4, 0.3]} />
    </group>
  );
}

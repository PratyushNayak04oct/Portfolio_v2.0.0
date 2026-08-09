'use client';

import { useId } from 'react';

/**
 * New Element core emblem.
 * `triangleOnly` — loading-screen variant without the steel plate shell.
 */
export default function CoreEmblem({
  className = '',
  glow = 0.85,
  size = 40,
  spinning = false,
  triangleOnly = false,
}) {
  const g = Math.min(1, Math.max(0, glow));
  const uid = useId().replace(/:/g, '');

  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        filter: `drop-shadow(0 0 ${12 + g * 28}px rgba(100,210,255,${0.5 + g * 0.45})) drop-shadow(0 0 ${32 + g * 60}px rgba(40,160,230,${0.3 + g * 0.4}))`,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        className={`h-full w-full ${spinning ? 'animate-[spin_14s_linear_infinite]' : ''}`}
      >
        <defs>
          <radialGradient id={`${uid}-plate`} cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#c8d2dc" />
            <stop offset="55%" stopColor="#8a96a2" />
            <stop offset="100%" stopColor="#4a5560" />
          </radialGradient>
          <radialGradient id={`${uid}-tri`} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#d8f6ff" />
            <stop offset="70%" stopColor="#5ed4ff" />
            <stop offset="100%" stopColor="#1a8fd0" />
          </radialGradient>
          <radialGradient id={`${uid}-aura`} cx="50%" cy="48%" r="50%">
            <stop offset="0%" stopColor={`rgba(180,240,255,${0.55 + g * 0.4})`} />
            <stop offset="55%" stopColor={`rgba(60,180,240,${0.25 + g * 0.25})`} />
            <stop offset="100%" stopColor="rgba(20,80,140,0)" />
          </radialGradient>
        </defs>

        {!triangleOnly ? (
          <>
            <circle cx="50" cy="50" r="46" fill={`url(#${uid}-plate)`} />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(220,230,240,0.35)"
              strokeWidth="1.2"
            />
            <circle cx="50" cy="50" r="28" fill={`rgba(8,24,40,${0.75})`} />
            <circle
              cx="50"
              cy="50"
              r="28"
              fill="none"
              stroke={`rgba(120,210,255,${0.35 + g * 0.4})`}
              strokeWidth="1.4"
            />
            <g
              stroke={`rgba(160,230,255,${0.45 + g * 0.4})`}
              strokeWidth="1.1"
              strokeLinecap="round"
            >
              <line x1="50" y1="50" x2="50" y2="76" />
              <line x1="50" y1="50" x2="28" y2="36" />
              <line x1="50" y1="50" x2="72" y2="36" />
            </g>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
              const x = 50 + Math.cos(a) * 37;
              const y = 50 + Math.sin(a) * 37;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3.2"
                  fill="#2a3036"
                  stroke="#5a646e"
                  strokeWidth="0.6"
                />
              );
            })}
          </>
        ) : (
          <circle cx="50" cy="50" r="42" fill={`url(#${uid}-aura)`} />
        )}

        {/* Filled inverted triangle — the core */}
        <polygon
          points={triangleOnly ? '50,82 16,26 84,26' : '50,74 28,36 72,36'}
          fill={`url(#${uid}-tri)`}
          opacity={0.9 + g * 0.1}
        />
        <polygon
          points={triangleOnly ? '50,72 28,34 72,34' : '50,68 34,40 66,40'}
          fill={`rgba(255,255,255,${0.4 + g * 0.45})`}
        />
      </svg>
    </span>
  );
}

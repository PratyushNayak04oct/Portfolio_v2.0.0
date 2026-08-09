'use client';

/**
 * Inverted double-triangle core (point down) with radiating spokes —
 * matches the Arc Reactor Triangle reference.
 */
export default function CoreEmblem({
  className = '',
  glow = 0.85,
  size = 40,
  spinning = false,
}) {
  const g = Math.min(1, Math.max(0, glow));

  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        filter: `drop-shadow(0 0 ${6 + g * 14}px rgba(80,200,255,${0.35 + g * 0.45})) drop-shadow(0 0 ${16 + g * 28}px rgba(40,160,230,${0.2 + g * 0.35}))`,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        className={`h-full w-full ${spinning ? 'animate-[spin_12s_linear_infinite]' : ''}`}
      >
        <defs>
          <radialGradient id="coreBlue" cx="50%" cy="48%" r="52%">
            <stop offset="0%" stopColor={`rgba(220,250,255,${0.95})`} />
            <stop offset="35%" stopColor={`rgba(90,210,255,${0.95})`} />
            <stop offset="70%" stopColor={`rgba(30,140,220,${0.85})`} />
            <stop offset="100%" stopColor={`rgba(10,60,110,${0.2})`} />
          </radialGradient>
          <linearGradient id="coreSteel" x1="20%" y1="10%" x2="80%" y2="90%">
            <stop offset="0%" stopColor="#f2f6fa" />
            <stop offset="45%" stopColor="#c5d0da" />
            <stop offset="100%" stopColor="#7e8c99" />
          </linearGradient>
        </defs>

        {/* Glow disc */}
        <circle cx="50" cy="52" r="40" fill="url(#coreBlue)" opacity={0.55 + g * 0.4} />
        <circle
          cx="50"
          cy="52"
          r="28"
          fill={`rgba(160,230,255,${0.25 + g * 0.45})`}
        />

        {/* Outer steel rim */}
        <circle
          cx="50"
          cy="52"
          r="41"
          fill="none"
          stroke="url(#coreSteel)"
          strokeWidth="3.2"
          opacity="0.95"
        />

        {/* Inverted outer triangle (tip down) */}
        <polygon
          points="50,84 18,28 82,28"
          fill="none"
          stroke="url(#coreSteel)"
          strokeWidth="3.4"
          strokeLinejoin="round"
        />

        {/* Nested inner triangle */}
        <polygon
          points="50,70 30,38 70,38"
          fill="none"
          stroke="url(#coreSteel)"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />

        {/* Radiating spokes from corners to rim */}
        <g stroke="url(#coreSteel)" strokeWidth="2.2" strokeLinecap="round" opacity="0.92">
          <line x1="50" y1="84" x2="50" y2="93" />
          <line x1="18" y1="28" x2="8" y2="18" />
          <line x1="82" y1="28" x2="92" y2="18" />
        </g>

        {/* Hot center */}
        <circle
          cx="50"
          cy="50"
          r={6 + g * 3}
          fill={`rgba(255,255,255,${0.55 + g * 0.4})`}
        />
      </svg>
    </span>
  );
}

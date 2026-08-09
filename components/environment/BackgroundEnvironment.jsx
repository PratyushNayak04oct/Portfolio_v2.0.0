'use client';

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const SHAPES = [
  { t: 'orb', c: 'rgba(120,190,255,0.08)', w: 52, h: 52, x: 68, y: 22, s: 0.04 },
  { t: 'orb', c: 'rgba(80,210,190,0.06)', w: 40, h: 40, x: 12, y: 64, s: -0.03 },
  { t: 'ring', c: 'rgba(180,220,240,0.08)', w: 36, h: 36, x: 76, y: 66, s: 0.024 },
  { t: 'orb', c: 'rgba(200,220,255,0.05)', w: 28, h: 28, x: 30, y: 18, s: -0.036 },
  { t: 'slab', c: 'rgba(140,200,255,0.05)', w: 44, h: 16, x: 50, y: 76, s: 0.018 },
  { t: 'ring', c: 'rgba(160,210,230,0.06)', w: 58, h: 58, x: 4, y: 32, s: 0.016 },
  { t: 'orb', c: 'rgba(99,199,217,0.06)', w: 24, h: 24, x: 86, y: 42, s: -0.032 },
  { t: 'slab', c: 'rgba(100,190,180,0.05)', w: 32, h: 12, x: 36, y: 50, s: 0.026 },
  { t: 'shard', c: 'rgba(220,235,255,0.05)', w: 18, h: 18, x: 58, y: 38, s: 0.02 },
  { t: 'shard', c: 'rgba(160,220,240,0.04)', w: 14, h: 14, x: 22, y: 42, s: -0.022 },
];

export default function BackgroundEnvironment() {
  const layerRef = useRef(null);
  const shapesRef = useRef(null);
  const shimmerRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    let raf = 0;
    let y = 0;
    let target = 0;
    let t0 = performance.now();

    const onScroll = () => {
      target = window.scrollY;
    };

    const tick = (now) => {
      y += (target - y) * 0.14;
      const time = (now - t0) * 0.001;

      if (layerRef.current) {
        layerRef.current.style.transform = `translate3d(0, ${y * 0.04}px, 0)`;
      }
      if (shapesRef.current) {
        shapesRef.current.style.transform = `translate3d(0, ${y * -0.06}px, 0)`;
        [...shapesRef.current.children].forEach((el, i) => {
          const s = SHAPES[i]?.s || 0.02;
          const drift = Math.sin(time * 0.35 + i) * 4;
          el.style.transform = `translate3d(${drift}px, ${y * s}px, 0) rotate(${y * s * 5 + time * 3}deg)`;
        });
      }
      if (shimmerRef.current) {
        shimmerRef.current.style.backgroundPosition = `${y * 0.06}px ${y * 0.08}px, ${-y * 0.04}px ${y * 0.03}px`;
        shimmerRef.current.style.opacity = String(0.035 + Math.sin(time * 0.5) * 0.01);
      }
      raf = requestAnimationFrame(tick);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Solid base — a bit more opaque so patterns stay quiet */}
      <div className="absolute inset-0 bg-deepest" />
      <div className="absolute inset-0 bg-primary/92" />
      <div className="absolute inset-0 bg-deepest/40" />

      {/* Soft atmosphere — muted */}
      <div
        ref={layerRef}
        className="absolute inset-[-16%] will-change-transform opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 75% 60% at 74% 30%, rgba(90,160,255,0.09), transparent 70%), radial-gradient(ellipse 60% 52% at 14% 78%, rgba(60,200,180,0.06), transparent 68%), radial-gradient(ellipse 50% 45% at 50% 50%, rgba(180,210,240,0.03), transparent 75%)',
        }}
      />

      {/* Shiny diagonal highlight patterns — barely visible */}
      <div
        ref={shimmerRef}
        className="absolute inset-0 will-change-transform mix-blend-screen"
        style={{
          opacity: 0.035,
          backgroundImage:
            'repeating-linear-gradient(118deg, transparent 0 28px, rgba(220,240,255,0.08) 28px 30px, transparent 30px 64px), repeating-linear-gradient(-28deg, transparent 0 40px, rgba(140,210,255,0.05) 40px 41px, transparent 41px 90px)',
          backgroundSize: '240px 240px, 320px 320px',
          maskImage:
            'radial-gradient(ellipse 80% 70% at 50% 42%, black, transparent 85%)',
        }}
      />

      {/* Glass orbs / rings / shards — low presence */}
      <div
        ref={shapesRef}
        className="absolute inset-0 will-change-transform opacity-35"
      >
        {SHAPES.map((shape, i) => (
          <span
            key={i}
            className="absolute block will-change-transform"
            style={{
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              width: `${shape.w}vw`,
              height: `${shape.h}vw`,
              maxWidth: shape.t === 'slab' ? 340 : shape.t === 'shard' ? 160 : 480,
              maxHeight: shape.t === 'slab' ? 120 : shape.t === 'shard' ? 160 : 480,
              background:
                shape.t === 'ring'
                  ? 'transparent'
                  : shape.t === 'shard'
                    ? `linear-gradient(135deg, ${shape.c}, transparent 70%)`
                    : `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.08), ${shape.c} 40%, transparent 72%)`,
              border:
                shape.t === 'ring'
                  ? `1px solid ${shape.c}`
                  : shape.t === 'slab' || shape.t === 'shard'
                    ? `1px solid ${shape.c}`
                    : 'none',
              borderRadius:
                shape.t === 'slab' ? 32 : shape.t === 'shard' ? 8 : '50%',
              transform: shape.t === 'shard' ? 'rotate(28deg)' : undefined,
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              filter: 'blur(2px)',
              boxShadow:
                shape.t === 'orb'
                  ? `0 0 60px ${shape.c}`
                  : `0 0 30px ${shape.c}`,
              mixBlendMode: 'screen',
            }}
          />
        ))}
      </div>

      {/* Fine glossy grid — faint */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(200,230,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(200,230,255,0.4) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage:
            'radial-gradient(ellipse 78% 68% at 50% 40%, black, transparent)',
        }}
      />

      {/* Specular speckles — faint */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-screen"
        style={{
          backgroundImage:
            'radial-gradient(1.5px 1.5px at 20% 30%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 70% 55%, rgba(200,230,255,0.4), transparent), radial-gradient(1.2px 1.2px at 45% 75%, rgba(255,255,255,0.35), transparent), radial-gradient(1px 1px at 85% 25%, rgba(180,220,255,0.35), transparent), radial-gradient(1.4px 1.4px at 35% 50%, rgba(255,255,255,0.3), transparent)',
          backgroundSize: '100% 100%',
        }}
      />
    </div>
  );
}

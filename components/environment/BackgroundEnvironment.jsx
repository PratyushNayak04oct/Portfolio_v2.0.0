'use client';

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const SHAPES = [
  { t: 'orb', c: 'rgba(38,120,255,0.18)', w: 48, h: 48, x: 70, y: 26, s: 0.05 },
  { t: 'orb', c: 'rgba(25,182,165,0.14)', w: 38, h: 38, x: 14, y: 66, s: -0.035 },
  { t: 'ring', c: 'rgba(99,199,217,0.22)', w: 32, h: 32, x: 78, y: 68, s: 0.028 },
  { t: 'orb', c: 'rgba(242,140,91,0.1)', w: 26, h: 26, x: 28, y: 20, s: -0.042 },
  { t: 'slab', c: 'rgba(38,120,255,0.08)', w: 42, h: 14, x: 52, y: 78, s: 0.022 },
  { t: 'ring', c: 'rgba(99,199,217,0.16)', w: 54, h: 54, x: 6, y: 34, s: 0.02 },
  { t: 'orb', c: 'rgba(99,199,217,0.12)', w: 22, h: 22, x: 88, y: 40, s: -0.038 },
  { t: 'slab', c: 'rgba(25,182,165,0.09)', w: 30, h: 12, x: 38, y: 48, s: 0.03 },
];

export default function BackgroundEnvironment() {
  const layerRef = useRef(null);
  const shapesRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    let raf = 0;
    let y = 0;
    let target = 0;

    const onScroll = () => {
      target = window.scrollY;
    };

    const tick = () => {
      y += (target - y) * 0.055;
      if (layerRef.current) {
        layerRef.current.style.transform = `translate3d(0, ${y * 0.045}px, 0)`;
      }
      if (shapesRef.current) {
        shapesRef.current.style.transform = `translate3d(0, ${y * -0.07}px, 0)`;
        [...shapesRef.current.children].forEach((el, i) => {
          const s = SHAPES[i]?.s || 0.02;
          el.style.transform = `translate3d(0, ${y * s}px, 0) rotate(${y * s * 6}deg)`;
        });
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
      <div className="absolute inset-0 bg-deepest" />

      <div
        ref={layerRef}
        className="absolute inset-[-14%] will-change-transform opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 72% 34%, rgba(38,120,255,0.22), transparent 68%), radial-gradient(ellipse 55% 48% at 16% 76%, rgba(25,182,165,0.14), transparent 65%), radial-gradient(ellipse 45% 40% at 48% 52%, rgba(99,199,217,0.07), transparent 72%)',
        }}
      />

      {/* Soft translucent shapes — visible through reactor canvas */}
      <div
        ref={shapesRef}
        className="absolute inset-0 will-change-transform opacity-70"
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
              maxWidth: shape.t === 'slab' ? 320 : 460,
              maxHeight: shape.t === 'slab' ? 110 : 460,
              background:
                shape.t === 'ring'
                  ? 'transparent'
                  : `radial-gradient(circle, ${shape.c}, transparent 72%)`,
              border:
                shape.t === 'ring'
                  ? `1.5px solid ${shape.c}`
                  : shape.t === 'slab'
                    ? `1px solid ${shape.c}`
                    : 'none',
              borderRadius: shape.t === 'slab' ? 28 : '50%',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              filter: 'blur(2px)',
              boxShadow:
                shape.t === 'orb'
                  ? `0 0 80px ${shape.c}`
                  : `0 0 40px ${shape.c}`,
              mixBlendMode: 'screen',
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,199,217,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,199,217,0.5) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage:
            'radial-gradient(ellipse 75% 65% at 50% 40%, black, transparent)',
        }}
      />
    </div>
  );
}

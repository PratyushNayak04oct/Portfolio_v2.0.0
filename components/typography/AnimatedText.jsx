'use client';

import { useEffect, useRef } from 'react';
import { getGsap } from '@/lib/gsap';
import { duration, ease } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Smooth masked line reveal / blur-to-focus.
 */
export default function AnimatedText({
  as: Tag = 'p',
  children,
  className = '',
  delay = 0,
  mode = 'reveal',
  once = true,
}) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const { gsap, ScrollTrigger } = getGsap();

    if (reduced) {
      gsap.set(el, { autoAlpha: 1, y: 0, filter: 'none' });
      return undefined;
    }

    const from =
      mode === 'blur'
        ? { autoAlpha: 0, y: 16, filter: 'blur(8px)' }
        : { autoAlpha: 0, y: 28 };

    const to =
      mode === 'blur'
        ? { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: duration.text, ease: ease.soft, delay }
        : { autoAlpha: 1, y: 0, duration: duration.text, ease: ease.soft, delay };

    gsap.set(el, from);
    const tween = gsap.to(el, {
      ...to,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once,
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll()
        .filter((t) => t.trigger === el)
        .forEach((t) => t.kill());
    };
  }, [delay, mode, once, reduced]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

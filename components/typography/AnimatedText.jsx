'use client';

import { useEffect, useMemo, useRef } from 'react';
import { getGsap } from '@/lib/gsap';
import { duration, ease } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Scroll-triggered text motion.
 * modes: reveal | blur | rise | words | lines
 */
export default function AnimatedText({
  as: Tag = 'p',
  children,
  className = '',
  delay = 0,
  mode = 'reveal',
  once = true,
  stagger = 0.045,
}) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();

  const wordParts = useMemo(() => {
    if (mode !== 'words' || typeof children !== 'string') return null;
    return children.split(/(\s+)/);
  }, [children, mode]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const { gsap, ScrollTrigger } = getGsap();

    if (reduced) {
      gsap.set(el, { autoAlpha: 1, y: 0, filter: 'none', rotateX: 0 });
      gsap.set(el.querySelectorAll('[data-word]'), {
        autoAlpha: 1,
        y: 0,
        filter: 'none',
      });
      return undefined;
    }

    const words = el.querySelectorAll('[data-word]');
    if (mode === 'words' && words.length) {
      gsap.set(words, { autoAlpha: 0, y: 22, filter: 'blur(4px)' });
      const tween = gsap.to(words, {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: duration.text,
        ease: ease.soft,
        delay,
        stagger,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once,
        },
      });
      return () => {
        tween.kill();
        ScrollTrigger.getAll()
          .filter((t) => t.trigger === el)
          .forEach((t) => t.kill());
      };
    }

    const from =
      mode === 'blur'
        ? { autoAlpha: 0, y: 18, filter: 'blur(8px)' }
        : mode === 'rise' || mode === 'lines'
          ? { autoAlpha: 0, y: 40, rotateX: 10 }
          : { autoAlpha: 0, y: 28 };

    const to =
      mode === 'blur'
        ? {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: duration.text,
            ease: ease.soft,
            delay,
          }
        : mode === 'rise' || mode === 'lines'
          ? {
              autoAlpha: 1,
              y: 0,
              rotateX: 0,
              duration: duration.text * 1.05,
              ease: ease.soft,
              delay,
            }
          : {
              autoAlpha: 1,
              y: 0,
              duration: duration.text,
              ease: ease.soft,
              delay,
            };

    gsap.set(el, { ...from, transformPerspective: 700 });
    const tween = gsap.to(el, {
      ...to,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once,
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll()
        .filter((t) => t.trigger === el)
        .forEach((t) => t.kill());
    };
  }, [delay, mode, once, reduced, stagger, wordParts]);

  if (mode === 'words' && wordParts) {
    return (
      <Tag ref={ref} className={className}>
        {wordParts.map((part, i) =>
          /^\s+$/.test(part) ? (
            <span key={`s-${i}`}>{part}</span>
          ) : (
            <span
              key={`w-${i}`}
              data-word
              className="inline-block will-change-transform"
            >
              {part}
            </span>
          ),
        )}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

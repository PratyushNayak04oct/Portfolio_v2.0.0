'use client';

import { Children, isValidElement, useRef } from 'react';

/**
 * Magnetic CTA. Primary fills left→right on hover with deep readable text;
 * arrows nudge continuously in their pointing direction.
 */
export default function MagneticButton({
  href,
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate3d(${x * 0.18}px, ${y * 0.18}px, 0) scale(1.025)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'translate3d(0,0,0) scale(1)';
  };

  const Comp = href ? 'a' : 'button';
  const childArr = Children.toArray(children);
  let label = childArr;
  let arrow = null;
  let arrowChar = '→';
  if (childArr.length >= 2) {
    const last = childArr[childArr.length - 1];
    if (isValidElement(last)) {
      arrow = last;
      label = childArr.slice(0, -1);
      const raw = last.props?.children;
      if (typeof raw === 'string') arrowChar = raw.trim();
    }
  }

  const isDiag = arrowChar.includes('↗') || arrowChar.includes('↖') || arrowChar.includes('↘');
  const arrowClass = isDiag ? 'btn-arrow-nudge-diag' : 'btn-arrow-nudge';

  if (variant === 'ghost') {
    return (
      <Comp
        ref={ref}
        href={href}
        data-cursor="interactive"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={`inline-flex items-center gap-2 font-sans text-nav uppercase tracking-[0.14em] text-ink-secondary transition-colors duration-300 hover:text-ink link-underline ${className}`}
        style={{
          transition:
            'transform 0.4s var(--ease-soft), color 0.3s, border-color 0.3s',
        }}
        {...props}
      >
        {label}
        <span className={`${arrowClass} inline-block`} aria-hidden="true">
          {arrowChar || '↗'}
        </span>
      </Comp>
    );
  }

  return (
    <Comp
      ref={ref}
      href={href}
      data-cursor="interactive"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`btn-fill group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-cyan/50 bg-transparent px-7 py-3.5 font-sans text-nav uppercase tracking-[0.14em] text-ink ${className}`}
      style={{ transition: 'transform 0.4s var(--ease-soft)' }}
      {...props}
    >
      <span className="btn-fill__bg" aria-hidden="true" />
      <span className="relative z-[1] inline-flex items-center gap-2 transition-colors duration-300 ease-out group-hover:text-[#030a10]">
        {label}
        <span className={`${arrowClass} inline-block`} aria-hidden="true">
          {arrowChar || '→'}
        </span>
      </span>
    </Comp>
  );
}

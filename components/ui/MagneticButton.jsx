'use client';

import { Children, isValidElement, useRef } from 'react';

/**
 * Magnetic CTA. Primary variant fills left→right on hover;
 * trailing arrow nudges continuously.
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
    el.style.transform = `translate3d(${x * 0.2}px, ${y * 0.2}px, 0) scale(1.03)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'translate3d(0,0,0) scale(1)';
  };

  const Comp = href ? 'a' : 'button';
  const childArr = Children.toArray(children);
  // Split trailing arrow (span with → / ↗) from label text
  let label = childArr;
  let arrow = null;
  if (childArr.length >= 2) {
    const last = childArr[childArr.length - 1];
    if (isValidElement(last)) {
      arrow = last;
      label = childArr.slice(0, -1);
    }
  }

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
        {arrow ? (
          <span className="btn-arrow-nudge inline-block" aria-hidden="true">
            {arrow.props?.children ?? '↗'}
          </span>
        ) : null}
      </Comp>
    );
  }

  // Primary — fill from left with text color; text becomes border color
  return (
    <Comp
      ref={ref}
      href={href}
      data-cursor="interactive"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`btn-fill group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-cyan/50 bg-transparent px-7 py-3.5 font-sans text-nav uppercase tracking-[0.14em] text-ink ${className}`}
      style={{
        transition: 'transform 0.4s var(--ease-soft)',
      }}
      {...props}
    >
      <span className="btn-fill__bg" aria-hidden="true" />
      <span className="relative z-[1] inline-flex items-center gap-2 transition-colors duration-300 ease-out group-hover:text-cyan">
        {label}
        {arrow ? (
          <span className="btn-arrow-nudge inline-block" aria-hidden="true">
            {arrow.props?.children ?? '→'}
          </span>
        ) : (
          <span className="btn-arrow-nudge inline-block" aria-hidden="true">
            →
          </span>
        )}
      </span>
    </Comp>
  );
}

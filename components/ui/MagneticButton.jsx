'use client';

import { useRef } from 'react';

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
    el.style.transform = `translate3d(${x * 0.12}px, ${y * 0.12}px, 0)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'translate3d(0,0,0)';
  };

  const base =
    'inline-flex items-center gap-2 font-sans text-nav uppercase tracking-[0.14em] transition-colors duration-300';
  const styles =
    variant === 'primary'
      ? 'border border-cyan/40 bg-surface/60 px-6 py-3 text-ink hover:border-cyan/70 hover:bg-surface'
      : 'text-ink-secondary hover:text-ink';

  const Comp = href ? 'a' : 'button';

  return (
    <Comp
      ref={ref}
      href={href}
      data-cursor="interactive"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`${base} ${styles} ${className}`}
      style={{ transition: 'transform 0.35s var(--ease-soft), color 0.3s, border-color 0.3s, background 0.3s' }}
      {...props}
    >
      {children}
    </Comp>
  );
}

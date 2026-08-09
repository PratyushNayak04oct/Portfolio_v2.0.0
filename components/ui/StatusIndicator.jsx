'use client';

export default function StatusIndicator({
  label,
  value,
  className = '',
}) {
  return (
    <div
      className={`font-mono text-tech uppercase tracking-[0.16em] text-ink-secondary ${className}`}
    >
      <span className="text-ink-secondary">{label}</span>
      <span className="mx-2 text-line">/</span>
      <span className="text-cyan transition-opacity duration-500">{value}</span>
    </div>
  );
}

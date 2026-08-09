'use client';

import AnimatedText from './AnimatedText';

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className = '',
}) {
  const alignClass =
    align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div
      className={`copy-above-reactor flex flex-col gap-4 ${alignClass} ${className}`}
    >
      {eyebrow ? (
        <AnimatedText
          as="p"
          mode="blur"
          className="text-depth-soft font-mono text-tech uppercase text-cyan"
        >
          {eyebrow}
        </AnimatedText>
      ) : null}
      <AnimatedText
        as="h2"
        className="text-depth font-display text-section font-medium text-ink"
      >
        {title}
      </AnimatedText>
      {subtitle ? (
        <AnimatedText
          as="p"
          delay={0.1}
          className="text-depth-soft max-w-xl text-ink-secondary"
        >
          {subtitle}
        </AnimatedText>
      ) : null}
    </div>
  );
}

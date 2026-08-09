'use client';

import Image from 'next/image';

export default function ReactorFallback() {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      role="img"
      aria-label="Static energy reactor visualization"
    >
      <div className="relative h-64 w-64 overflow-hidden rounded-full md:h-80 md:w-80">
        <Image
          src="/images/fallbacks/reactor.jpg"
          alt=""
          fill
          className="object-cover opacity-80"
          sizes="320px"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle, transparent 30%, #05080b 75%), radial-gradient(circle, color-mix(in srgb, var(--cyan) 25%, transparent), transparent 60%)',
          }}
        />
      </div>
    </div>
  );
}

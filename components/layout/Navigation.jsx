'use client';

import { useEffect, useState } from 'react';
import { site } from '@/data/site';
import { useLabStore } from '@/lib/labStore';

export default function Navigation() {
  const { activeSection, power, reactorStatus } = useLabStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`mx-auto flex max-w-[1320px] items-center justify-between px-[clamp(1.25rem,4vw,3rem)] py-4 transition-all duration-500 ${
          scrolled
            ? 'glass-panel mt-3 rounded-2xl px-5 shadow-[0_12px_40px_rgba(0,0,0,0.25)] md:mx-6'
            : ''
        }`}
      >
        <a
          href="#hero"
          data-cursor="interactive"
          className="font-display text-nav font-medium tracking-[0.14em] text-ink"
          onClick={() => setOpen(false)}
        >
          {site.brand}
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {site.nav.map((item) => {
            const id = item.href.replace('#', '');
            const active = activeSection === id;
            return (
              <a
                key={item.label}
                href={item.href}
                data-cursor="interactive"
                className={`group relative font-sans text-nav uppercase tracking-[0.14em] transition-colors duration-300 ${
                  active ? 'text-ink' : 'text-ink-secondary hover:text-ink'
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-cyan transition-all duration-300 ease-out ${
                    active ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 font-mono text-tech uppercase text-ink-muted sm:flex">
            <span>PWR {Math.round(power)}%</span>
            <span className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  power >= 100 ? 'bg-teal' : 'bg-cyan'
                }`}
              />
              <span className="max-w-[12ch] truncate lg:max-w-none">
                {reactorStatus}
              </span>
            </span>
          </div>

          <button
            type="button"
            className="font-mono text-tech uppercase text-ink md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="glass-panel mx-4 mt-2 rounded-xl p-6 md:hidden"
        >
          <ul className="space-y-4">
            {site.nav.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="font-display text-sub text-ink"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

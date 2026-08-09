'use client';

import { useEffect, useState } from 'react';
import { site } from '@/data/site';
import { useLabStore } from '@/lib/labStore';
import { getLenis } from '@/hooks/useLenis';
import CoreEmblem from '@/components/ui/CoreEmblem';

function scrollToHash(href) {
  const id = href.replace('#', '');
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el, { offset: -24, duration: 1.2 });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export default function Navigation() {
  const { activeSection, power, reactorStatus, coreDocked } = useLabStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      document.body.style.overflow = 'hidden';
      lenis?.stop();
    } else {
      document.body.style.overflow = '';
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = '';
      getLenis()?.start();
    };
  }, [open]);

  const onNavClick = (e, href) => {
    if (!href.startsWith('#')) return;
    e.preventDefault();
    setOpen(false);
    scrollToHash(href);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`safe-pad-x mx-auto flex max-w-[1320px] items-center justify-between px-[clamp(1rem,4vw,3rem)] py-3 transition-all duration-500 sm:py-4 ${
          scrolled
            ? 'glass-panel mt-2 rounded-xl px-3 shadow-[0_12px_40px_rgba(0,0,0,0.25)] sm:mt-3 sm:rounded-2xl sm:px-5 md:mx-6'
            : ''
        }`}
      >
        <a
          href="#hero"
          data-cursor="interactive"
          className="flex min-w-0 items-center gap-2 font-display text-[0.7rem] font-medium tracking-[0.12em] text-ink sm:gap-2.5 sm:text-nav sm:tracking-[0.14em]"
          onClick={(e) => onNavClick(e, '#hero')}
        >
          <span
            data-nav-core
            className={`inline-flex items-center justify-center transition-opacity duration-500 ${
              coreDocked ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ width: 28, height: 28 }}
          >
            {coreDocked ? <CoreEmblem size={28} glow={0.78} /> : null}
          </span>
          <span>{site.brand}</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-5 lg:gap-8 md:flex">
          {site.nav.map((item) => {
            const id = item.href.replace('#', '');
            const active = activeSection === id;
            return (
              <a
                key={item.label}
                href={item.href}
                data-cursor="interactive"
                onClick={(e) => onNavClick(e, item.href)}
                className={`group relative font-sans text-nav uppercase tracking-[0.14em] transition-all duration-300 micro-lift ${
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
          <div className="hidden items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-muted sm:flex sm:gap-4 sm:text-tech">
            <span>PWR {Math.round(power)}%</span>
            <span className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  power >= 100 ? 'bg-teal' : 'bg-cyan'
                }`}
              />
              <span className="max-w-[10ch] truncate md:max-w-[14ch] lg:max-w-none">
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
                  onClick={(e) => onNavClick(e, item.href)}
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

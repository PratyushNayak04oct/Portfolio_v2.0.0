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

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const onNavClick = (e, href) => {
    if (!href.startsWith('#')) return;
    e.preventDefault();
    setOpen(false);
    scrollToHash(href);
  };

  const toggleOpen = () => setOpen((v) => !v);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[80]">
        <div
          className={`pointer-events-auto mx-auto mt-3 flex w-fit max-w-[min(92vw,520px)] items-center gap-3 rounded-full px-3.5 py-2 transition-[background,box-shadow,border-color,backdrop-filter] duration-500 sm:gap-4 sm:px-4 ${
            scrolled
              ? 'glass-panel shadow-[0_12px_40px_rgba(0,0,0,0.28)]'
              : 'border border-transparent bg-transparent'
          }`}
        >
          <a
            href="#hero"
            data-cursor="interactive"
            className="flex min-w-0 items-center gap-2 font-display text-[0.68rem] font-medium tracking-[0.12em] text-ink sm:text-[0.72rem] sm:tracking-[0.14em]"
            onClick={(e) => onNavClick(e, '#hero')}
          >
            <span
              data-nav-core
              className={`inline-flex items-center justify-center transition-opacity duration-500 ${
                coreDocked ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ width: 24, height: 24 }}
            >
              {coreDocked ? <CoreEmblem size={24} glow={0.78} /> : null}
            </span>
            <span className="truncate">{site.brand}</span>
          </a>

          <button
            type="button"
            className={`menu-morph ${open ? 'is-open' : ''}`}
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            data-cursor="interactive"
            onClick={toggleOpen}
          >
            <span className="menu-morph__letter menu-morph__m" aria-hidden="true">
              <span className="menu-morph__glyph">M</span>
            </span>
            <span className="menu-morph__letter menu-morph__e" aria-hidden="true">
              <span className="menu-morph__glyph">E</span>
            </span>
            <span className="menu-morph__letter menu-morph__n" aria-hidden="true">
              <span className="menu-morph__glyph">N</span>
              <span className="menu-morph__bar" />
            </span>
            <span className="menu-morph__letter menu-morph__u" aria-hidden="true">
              <span className="menu-morph__glyph">U</span>
              <span className="menu-morph__bar" />
            </span>
          </button>

          <div
            className="hidden items-center gap-1.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-ink-muted sm:flex"
            aria-hidden="true"
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                power >= 100 ? 'bg-teal' : 'bg-cyan'
              }`}
            />
            <span>{Math.round(power)}%</span>
          </div>
        </div>
      </header>

      <div
        className={`nav-backdrop ${open ? 'is-open' : ''}`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      <aside
        id="site-nav"
        className={`nav-sidebar ${open ? 'is-open' : ''}`}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="nav-sidebar__inner safe-pad-b">
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-line/50 pb-5">
            <p className="font-mono text-tech uppercase tracking-[0.14em] text-ink-muted">
              Navigate
            </p>
            <div className="flex items-center gap-2.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-muted">
              <span>PWR {Math.round(power)}%</span>
              <span className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    power >= 100 ? 'bg-teal' : 'bg-cyan'
                  }`}
                />
                <span className="max-w-[14ch] truncate">{reactorStatus}</span>
              </span>
            </div>
          </div>

          <nav aria-label="Primary">
            <ul className="flex flex-col gap-1">
              {site.nav.map((item, i) => {
                const id = item.href.replace('#', '');
                const active = activeSection === id;
                return (
                  <li
                    key={item.label}
                    className="nav-sidebar__item group"
                    style={{ '--i': i }}
                  >
                    <a
                      href={item.href}
                      data-cursor="interactive"
                      onClick={(e) => onNavClick(e, item.href)}
                      className={`flex items-baseline justify-between gap-4 py-3 font-display text-sub tracking-[-0.02em] transition-colors duration-300 ${
                        active ? 'text-ink' : 'text-ink-secondary group-hover:text-ink'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span
                        className={`font-mono text-tech uppercase tracking-[0.14em] transition-opacity duration-300 ${
                          active ? 'text-cyan opacity-100' : 'opacity-0 group-hover:opacity-60'
                        }`}
                      >
                        0{i + 1}
                      </span>
                    </a>
                    <span
                      className={`block h-px bg-cyan transition-all duration-300 ease-out ${
                        active
                          ? 'w-full opacity-70'
                          : 'w-0 opacity-0 group-hover:w-1/3 group-hover:opacity-40'
                      }`}
                    />
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}

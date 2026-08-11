'use client';

import dynamic from 'next/dynamic';
import { site } from '@/data/site';
import SceneErrorBoundary from '@/components/layout/SceneErrorBoundary';
import { useLabStore } from '@/lib/labStore';

const BrunoScene = dynamic(() => import('@/components/bruno/BrunoScene'), {
  ssr: false,
});

export default function Footer() {
  const { warmBoot, loaded } = useLabStore();
  const showBruno = warmBoot || loaded;

  return (
    <footer className="relative z-20 border-t border-line/60 bg-deepest/80">
      <div className="content-grid grid gap-8 py-12 sm:gap-10 sm:py-16 md:grid-cols-12 md:items-end">
        <div className="md:col-span-4">
          <p className="font-display text-sub text-ink">{site.brand}</p>
          <p className="mt-3 font-mono text-tech uppercase text-ink-muted">
            {site.roles.join(' · ')}
          </p>
          <p className="mt-8 font-mono text-tech text-teal">● SYSTEM ONLINE</p>
        </div>

        <div className="md:col-span-3">
          <ul className="grid grid-cols-2 gap-3">
            {site.footerLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  data-cursor="interactive"
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="micro-lift link-underline font-sans text-nav uppercase text-ink-secondary hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center justify-end gap-3 md:col-span-3 md:items-center">
          {showBruno ? (
            <SceneErrorBoundary>
              <BrunoScene />
            </SceneErrorBoundary>
          ) : null}
        </div>

        <div className="flex flex-col justify-between md:col-span-2 md:items-end">
          <p className="font-mono text-tech uppercase text-ink-muted">
            Built with code + curiosity
          </p>
          <p className="mt-6 font-mono text-tech text-ink-muted">© 2026</p>
        </div>
      </div>
    </footer>
  );
}

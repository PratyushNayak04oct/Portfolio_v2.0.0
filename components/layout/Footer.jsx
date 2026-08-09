import { site } from '@/data/site';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-line/60 bg-deepest/80">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-16 md:grid-cols-12 md:px-8">
        <div className="md:col-span-5">
          <p className="font-display text-sub text-ink">{site.brand}</p>
          <p className="mt-3 font-mono text-tech uppercase text-ink-muted">
            {site.roles.join(' · ')}
          </p>
          <p className="mt-8 font-mono text-tech text-teal">● SYSTEM ONLINE</p>
        </div>

        <div className="md:col-span-4">
          <ul className="grid grid-cols-2 gap-3">
            {site.footerLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  data-cursor="interactive"
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="font-sans text-nav uppercase text-ink-secondary transition-colors duration-300 hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-between md:col-span-3 md:items-end">
          <p className="font-mono text-tech uppercase text-ink-muted">
            Built with code + curiosity
          </p>
          <p className="mt-6 font-mono text-tech text-ink-muted">© 2026</p>
        </div>
      </div>
    </footer>
  );
}

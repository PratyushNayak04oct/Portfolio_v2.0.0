import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-primary px-6 text-center">
      <p className="font-mono text-tech uppercase text-cyan">404 // Signal lost</p>
      <h1 className="mt-4 font-display text-section text-ink">Page not found</h1>
      <Link
        href="/"
        className="mt-8 font-sans text-nav uppercase tracking-[0.14em] text-ink-secondary transition-colors hover:text-ink"
      >
        Return to lab →
      </Link>
    </main>
  );
}

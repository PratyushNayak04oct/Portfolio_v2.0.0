# Midnight Lab — Pratyush Portfolio

Interactive digital portfolio built as a cinematic midnight engineering laboratory.

## Stack

- Next.js (App Router) · React · JavaScript only
- Tailwind CSS
- GSAP + ScrollTrigger
- Three.js · React Three Fiber · Drei

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Structure

- `app/` — routes, layout, SEO
- `components/` — UI, sections, reactor, B.R.U.N.O.
- `data/` — projects, experience, skills, reactor story
- `hooks/` · `lib/` — shared utilities

## Content

Edit placeholder data in `data/*.js`. Swap social URLs in `data/site.js`.

## Notes

- No TypeScript by design
- WebGL falls back to static reactor imagery
- `prefers-reduced-motion` disables heavy motion

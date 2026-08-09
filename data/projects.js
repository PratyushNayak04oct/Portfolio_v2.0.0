export const projects = [
  {
    title: 'Midnight Systems Console',
    slug: 'midnight-systems-console',
    description:
      'An enterprise operations console that turns dense system data into a calm, readable control surface.',
    year: '2026',
    category: 'Systems',
    technologies: ['Java', 'Spring', 'Oracle', 'SQL', 'React'],
    image: '/images/projects/console.jpg',
    heroMedia: '/images/projects/console-hero.jpg',
    problem:
      'Operators were navigating fragmented tools and inconsistent workflows across critical enterprise systems.',
    solution:
      'A unified console with clear hierarchy, real-time status, and workflows designed around operator intent.',
    architecture:
      'Client → Next.js dashboard → API layer → Spring services → Oracle database, with modular domain boundaries.',
    interaction:
      'Keyboard-first navigation, progressive disclosure of detail, and restrained motion for status changes.',
    results: [
      'Reduced context switching across tools',
      'Faster triage of system incidents',
      'Clearer audit trail for operators',
    ],
    liveUrl: '#',
    sourceUrl: '#',
  },
  {
    title: 'Pulse Archive',
    slug: 'pulse-archive',
    description:
      'A cinematic archive experience for exploring technical case studies with scroll-driven storytelling.',
    year: '2025',
    category: 'Creative',
    technologies: ['Next.js', 'GSAP', 'Three.js', 'Tailwind'],
    image: '/images/projects/pulse.jpg',
    heroMedia: '/images/projects/pulse-hero.jpg',
    problem:
      'Project work was buried in static galleries that failed to communicate process or craft.',
    solution:
      'An immersive archive where each study expands from thumbnail into a guided narrative.',
    architecture:
      'App Router pages, structured project data modules, GSAP ScrollTrigger scenes, optional WebGL accents.',
    interaction:
      'Horizontal project scrub on desktop, vertical flow on mobile, image-to-case-study continuity.',
    results: [
      'Stronger narrative for each project',
      'Higher engagement on case studies',
      'Reusable data-driven content model',
    ],
    liveUrl: '#',
    sourceUrl: '#',
  },
  {
    title: 'Lattice Query Lab',
    slug: 'lattice-query-lab',
    description:
      'An experimental interface for visualizing SQL relationships and query intent as a living node graph.',
    year: '2025',
    category: 'Lab',
    technologies: ['JavaScript', 'WebGL', 'SQL', 'React'],
    image: '/images/projects/lattice.jpg',
    heroMedia: '/images/projects/lattice-hero.jpg',
    problem:
      'Complex relational queries are hard to explain without drowning people in raw syntax.',
    solution:
      'A visual lab that maps entities, joins, and flow with gentle interactive highlighting.',
    architecture:
      'React UI + canvas/WebGL renderer, query metadata model, progressive enhancement for low-power devices.',
    interaction:
      'Hover/tap to isolate nodes, soft line emphasis, no rapid particle noise.',
    results: [
      'Clearer explanation of data relationships',
      'Useful teaching and demo tool',
      'Foundation for future AI-assisted query help',
    ],
    liveUrl: '#',
    sourceUrl: '#',
  },
];

export function getProjectBySlug(slug) {
  return projects.find((p) => p.slug === slug) || null;
}

export function getAllProjectSlugs() {
  return projects.map((p) => p.slug);
}

export const skillGroups = [
  {
    id: 'systems',
    title: 'SYSTEMS',
    items: ['Java', 'Spring', 'Oracle', 'SQL'],
  },
  {
    id: 'frontend',
    title: 'FRONTEND',
    items: ['JavaScript', 'React', 'Next.js', 'GSAP'],
  },
  {
    id: 'creative',
    title: 'CREATIVE TECHNOLOGY',
    items: ['Three.js', 'WebGL', 'Blender', 'Motion'],
  },
  {
    id: 'tools',
    title: 'TOOLS',
    items: ['Git', 'Docker', 'Postman', 'Linux'],
  },
];

export const skillNodes = [
  { id: 'java', label: 'JAVA', x: 0.2, y: 0.35 },
  { id: 'sql', label: 'SQL', x: 0.4, y: 0.2 },
  { id: 'web', label: 'WEB', x: 0.55, y: 0.45 },
  { id: 'ai', label: 'AI', x: 0.75, y: 0.3 },
  { id: '3d', label: '3D', x: 0.65, y: 0.7 },
];

export const skillLinks = [
  ['java', 'sql'],
  ['java', 'web'],
  ['sql', 'web'],
  ['web', 'ai'],
  ['web', '3d'],
  ['ai', '3d'],
];

export const philosophy = [
  {
    title: 'PERFORMANCE',
    copy: 'Experiences should feel immediate. Optimize what the visitor actually feels.',
  },
  {
    title: 'SIMPLICITY',
    copy: 'Complexity belongs in the system — not in the interface.',
  },
  {
    title: 'SCALABILITY',
    copy: 'Build structures that grow without collapsing under their own weight.',
  },
  {
    title: 'MAINTAINABILITY',
    copy: 'Clear architecture outlives clever shortcuts.',
  },
  {
    title: 'EXPERIENCE',
    copy: 'Technology earns trust when it feels calm, precise, and human.',
  },
];

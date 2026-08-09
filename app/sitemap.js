import { site } from '@/data/site';
import { projects } from '@/data/projects';

export default function sitemap() {
  const base = site.url;

  return [
    {
      url: base,
      lastModified: new Date(),
    },
    ...projects.map((p) => ({
      url: `${base}/work/${p.slug}`,
      lastModified: new Date(),
    })),
  ];
}

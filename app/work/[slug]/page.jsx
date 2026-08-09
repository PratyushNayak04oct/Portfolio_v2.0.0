import { notFound } from 'next/navigation';
import { getAllProjectSlugs, getProjectBySlug } from '@/data/projects';
import ProjectCaseStudy from '@/components/projects/ProjectCaseStudy';
import ClientShell from '@/components/layout/ClientShell';
import PageTransition from '@/components/ui/PageTransition';
import { site } from '@/data/site';

export function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    return { title: 'Project not found' };
  }
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: `${project.title} — ${site.name}`,
      description: project.description,
    },
  };
}

export default async function WorkPage({ params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <ClientShell>
      <PageTransition>
        <ProjectCaseStudy project={project} />
      </PageTransition>
    </ClientShell>
  );
}

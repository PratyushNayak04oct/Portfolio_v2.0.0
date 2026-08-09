'use client';

import { useEffect, useRef } from 'react';
import { projects } from '@/data/projects';
import ProjectCard from '@/components/projects/ProjectCard';
import SectionHeading from '@/components/typography/SectionHeading';
import { getGsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useIsDesktop } from '@/hooks/useMediaQuery';

export default function Projects() {
  const trackRef = useRef(null);
  const sectionRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (reduced || !isDesktop || !trackRef.current || !sectionRef.current) {
      return undefined;
    }

    const { gsap } = getGsap();
    const track = trackRef.current;
    const totalScroll = track.scrollWidth - window.innerWidth;

    const tween = gsap.to(track, {
      x: () => -Math.max(0, totalScroll),
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${Math.max(totalScroll * 0.85, window.innerHeight * 0.7)}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced, isDesktop]);

  return (
    <section id="projects" ref={sectionRef} className="relative z-20">
      <div className="content-grid section-space pb-8 md:pb-10">
        <SectionHeading
          eyebrow="04 — Work"
          title="Selected systems & experiences."
          subtitle="Credibility through craft — problem, architecture, and result."
        />
      </div>

      <div
        ref={trackRef}
        className="flex gap-6 px-[clamp(1.25rem,4vw,3rem)] pb-24 will-change-transform md:gap-8 md:pb-32"
      >
        {projects.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}

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
        end: () => `+=${Math.max(totalScroll, window.innerHeight * 0.8)}`,
        scrub: 0.8,
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
    <section id="projects" ref={sectionRef} className="relative z-10 py-28 md:py-0">
      <div className="mx-auto max-w-[1400px] px-5 pt-28 md:px-8 md:pt-32">
        <SectionHeading
          eyebrow="04 — Work"
          title="Selected systems & experiences."
          subtitle="Credibility through craft — problem, architecture, and result."
        />
      </div>

      <div
        ref={trackRef}
        className="mt-12 flex gap-5 px-5 pb-28 md:mt-16 md:gap-6 md:px-8 md:pb-32 will-change-transform"
      >
        {projects.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}

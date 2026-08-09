'use client';

import { useEffect } from 'react';
import { getGsap } from '@/lib/gsap';
import { sections } from '@/data/site';
import { labActions } from '@/lib/labStore';

/**
 * Tracks which section is in view and global scroll progress.
 */
export function useSectionProgress() {
  useEffect(() => {
    const { ScrollTrigger } = getGsap();
    const triggers = [];

    const docTrigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => labActions.setScrollProgress(self.progress),
    });
    triggers.push(docTrigger);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const t = ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 45%',
        onEnter: () => labActions.setActiveSection(id),
        onEnterBack: () => labActions.setActiveSection(id),
        onUpdate: (self) => labActions.setSectionProgress(id, self.progress),
      });
      triggers.push(t);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);
}

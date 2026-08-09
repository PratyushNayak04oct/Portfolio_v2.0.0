'use client';

import { useEffect } from 'react';
import { getGsap } from '@/lib/gsap';
import { sections } from '@/data/site';
import { labActions } from '@/lib/labStore';
import { updateReactorScroll } from '@/lib/reactorScroll';

/**
 * Tracks section visibility + drives reactor target from continuous scroll.
 */
export function useSectionProgress() {
  useEffect(() => {
    const { ScrollTrigger } = getGsap();
    const triggers = [];

    const docTrigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        labActions.setScrollProgress(self.progress);
        // Section-weighted + EMA-smoothed blend for butterier reactor motion
        const blended = updateReactorScroll(self.progress);
        labActions.setPowerFromBlend(blended);
      },
    });
    triggers.push(docTrigger);

    // Refresh after layout settles so weighted tops are accurate
    requestAnimationFrame(() => ScrollTrigger.refresh());

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

    // Seed initial blend
    updateReactorScroll(0);

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);
}

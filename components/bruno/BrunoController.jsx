'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BRUNO_STATES,
  brunoInteractionCycle,
  brunoSectionStates,
} from '@/data/brunoStates';
import { useLabStore, labActions } from '@/lib/labStore';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * State machine for B.R.U.N.O. — scroll ambient + interaction cycle.
 */
export function useBrunoController() {
  const { activeSection } = useLabStore();
  const reduced = usePrefersReducedMotion();
  const [state, setState] = useState(BRUNO_STATES.Idle);
  const interactionIndex = useRef(0);
  const busy = useRef(false);
  const reactorBeatDone = useRef(false);

  useEffect(() => {
    if (reduced) {
      setState(BRUNO_STATES.Idle);
      labActions.setBrunoState(BRUNO_STATES.Idle);
      labActions.setBrunoStatus('STANDBY');
      return;
    }
    if (busy.current) return;

    const next = brunoSectionStates[activeSection] || BRUNO_STATES.Idle;
    setState(next);
    labActions.setBrunoState(next);
    labActions.setBrunoStatus(String(next).toUpperCase());

    // One-time reactor encounter near lab/contact
    if (
      (activeSection === 'lab' || activeSection === 'contact') &&
      !reactorBeatDone.current
    ) {
      reactorBeatDone.current = true;
      busy.current = true;
      setState(BRUNO_STATES.Curious);
      labActions.setBrunoStatus('APPROACHING CORE');
      const t1 = setTimeout(() => {
        setState(BRUNO_STATES.Look);
        labActions.setBrunoStatus('REACTING');
      }, 1600);
      const t2 = setTimeout(() => {
        setState(brunoSectionStates[activeSection] || BRUNO_STATES.Sit);
        labActions.setBrunoStatus(
          String(brunoSectionStates[activeSection] || 'SIT').toUpperCase(),
        );
        busy.current = false;
      }, 3200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    return undefined;
  }, [activeSection, reduced]);

  const triggerInteraction = useCallback(() => {
    if (reduced || busy.current) return;
    busy.current = true;
    const next =
      brunoInteractionCycle[
        interactionIndex.current % brunoInteractionCycle.length
      ];
    interactionIndex.current += 1;
    setState(next);
    labActions.setBrunoState(next);
    labActions.setBrunoStatus(String(next).toUpperCase());

    const duration = next === BRUNO_STATES.FrontFlip ? 1400 : 900;
    window.setTimeout(() => {
      const ambient = brunoSectionStates[activeSection] || BRUNO_STATES.Idle;
      setState(ambient);
      labActions.setBrunoState(ambient);
      labActions.setBrunoStatus(String(ambient).toUpperCase());
      busy.current = false;
    }, duration);
  }, [activeSection, reduced]);

  return { state, triggerInteraction };
}

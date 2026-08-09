'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BRUNO_STATES,
  brunoAmbient,
  brunoHoverActions,
} from '@/data/brunoStates';
import { labActions } from '@/lib/labStore';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Corner companion — happy wag by default, random tricks on hover/tap.
 */
export function useBrunoController() {
  const reduced = usePrefersReducedMotion();
  const [state, setState] = useState(brunoAmbient);
  const busy = useRef(false);

  useEffect(() => {
    if (reduced) {
      setState(BRUNO_STATES.Idle);
      labActions.setBrunoState(BRUNO_STATES.Idle);
      labActions.setBrunoStatus('STANDBY');
      return;
    }
    setState(brunoAmbient);
    labActions.setBrunoState(brunoAmbient);
    labActions.setBrunoStatus('HAPPY');
  }, [reduced]);

  const triggerInteraction = useCallback(() => {
    if (reduced || busy.current) return;
    busy.current = true;
    const next =
      brunoHoverActions[Math.floor(Math.random() * brunoHoverActions.length)];
    setState(next);
    labActions.setBrunoState(next);
    labActions.setBrunoStatus(String(next).toUpperCase());

    const duration =
      next === BRUNO_STATES.Jump || next === BRUNO_STATES.Spin ? 1200 : 900;

    window.setTimeout(() => {
      setState(brunoAmbient);
      labActions.setBrunoState(brunoAmbient);
      labActions.setBrunoStatus('HAPPY');
      busy.current = false;
    }, duration);
  }, [reduced]);

  return { state, triggerInteraction };
}

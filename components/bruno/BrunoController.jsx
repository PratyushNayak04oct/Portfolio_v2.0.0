'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BRUNO_STATES, brunoAmbient } from '@/data/brunoStates';
import { labActions } from '@/lib/labStore';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Minimal companion: happy wag, faster wag + bark on hover/tap (no flip).
 */
export function useBrunoController() {
  const reduced = usePrefersReducedMotion();
  const [state, setState] = useState(() =>
    reduced ? BRUNO_STATES.Idle : brunoAmbient,
  );
  const busy = useRef(false);
  const timer = useRef(0);

  useEffect(() => {
    labActions.setBrunoState(reduced ? BRUNO_STATES.Idle : brunoAmbient);
    labActions.setBrunoStatus(reduced ? 'STANDBY' : 'HAPPY');
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [reduced]);

  const returnHappy = useCallback(() => {
    setState(brunoAmbient);
    labActions.setBrunoState(brunoAmbient);
    labActions.setBrunoStatus('HAPPY');
    busy.current = false;
  }, []);

  const onHoverStart = useCallback(() => {
    if (reduced || busy.current) return;
    setState(BRUNO_STATES.Bark);
    labActions.setBrunoState(BRUNO_STATES.Bark);
    labActions.setBrunoStatus('BARK');
  }, [reduced]);

  const onHoverEnd = useCallback(() => {
    if (reduced || busy.current) return;
    returnHappy();
  }, [reduced, returnHappy]);

  const onTap = useCallback(() => {
    if (reduced || busy.current) return;
    busy.current = true;
    if (timer.current) window.clearTimeout(timer.current);
    setState(BRUNO_STATES.Bark);
    labActions.setBrunoState(BRUNO_STATES.Bark);
    labActions.setBrunoStatus('BARK');
    timer.current = window.setTimeout(returnHappy, 900);
  }, [reduced, returnHappy]);

  return { state, onHoverStart, onHoverEnd, onTap };
}

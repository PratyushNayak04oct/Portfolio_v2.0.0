'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BRUNO_ACTIONS,
  BRUNO_STATES,
  brunoAmbient,
} from '@/data/brunoStates';
import { labActions } from '@/lib/labStore';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Hover → Bark (crouch + jaw). Click → vertical action menu.
 * Each trick plays, then returns to Wag.
 */
export function useBrunoController() {
  const reduced = usePrefersReducedMotion();
  const [state, setState] = useState(() =>
    reduced ? BRUNO_STATES.Idle : brunoAmbient,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const busy = useRef(false);
  const timer = useRef(0);
  const menuOpenRef = useRef(false);

  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

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

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const onHoverStart = useCallback(() => {
    if (reduced || busy.current || menuOpenRef.current) return;
    setState(BRUNO_STATES.Bark);
    labActions.setBrunoState(BRUNO_STATES.Bark);
    labActions.setBrunoStatus('BARK');
  }, [reduced]);

  const onHoverEnd = useCallback(() => {
    if (reduced || busy.current) return;
    returnHappy();
  }, [reduced, returnHappy]);

  /** Click toggles the small action menu near the dog */
  const onTap = useCallback(() => {
    if (reduced || busy.current) return;
    const opening = !menuOpenRef.current;
    if (opening) {
      // Never update the shared store inside a setState updater
      setState(brunoAmbient);
      queueMicrotask(() => {
        labActions.setBrunoState(brunoAmbient);
        labActions.setBrunoStatus('READY');
      });
    }
    setMenuOpen(opening);
  }, [reduced]);

  const playAction = useCallback(
    (actionId) => {
      if (reduced || busy.current) return;
      const action = BRUNO_ACTIONS.find((a) => a.id === actionId);
      if (!action) return;

      if (timer.current) window.clearTimeout(timer.current);
      busy.current = true;
      setMenuOpen(false);
      setState(action.id);
      queueMicrotask(() => {
        labActions.setBrunoState(action.id);
        labActions.setBrunoStatus(action.status);
      });
      timer.current = window.setTimeout(returnHappy, action.duration);
    },
    [reduced, returnHappy],
  );

  return {
    state,
    menuOpen,
    actions: BRUNO_ACTIONS,
    onHoverStart,
    onHoverEnd,
    onTap,
    closeMenu,
    playAction,
  };
}

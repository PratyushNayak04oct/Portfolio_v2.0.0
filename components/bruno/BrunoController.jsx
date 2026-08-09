'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BRUNO_STATES,
  brunoAmbient,
  brunoActionDuration,
} from '@/data/brunoStates';
import { labActions } from '@/lib/labStore';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Corner companion — happy wag by default; menu-driven tricks on demand.
 */
export function useBrunoController() {
  const reduced = usePrefersReducedMotion();
  const [state, setState] = useState(() =>
    reduced ? BRUNO_STATES.Idle : brunoAmbient,
  );
  const [runOffset, setRunOffset] = useState(0);
  const busy = useRef(false);
  const timers = useRef([]);
  const raf = useRef(0);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    if (raf.current) {
      window.cancelAnimationFrame(raf.current);
      raf.current = 0;
    }
  }, []);

  useEffect(() => {
    labActions.setBrunoState(reduced ? BRUNO_STATES.Idle : brunoAmbient);
    labActions.setBrunoStatus(reduced ? 'STANDBY' : 'HAPPY');
    return () => clearTimers();
  }, [reduced, clearTimers]);

  const finish = useCallback(() => {
    setState(brunoAmbient);
    labActions.setBrunoState(brunoAmbient);
    labActions.setBrunoStatus('HAPPY');
    setRunOffset(0);
    busy.current = false;
  }, []);

  const playRun = useCallback(() => {
    const dock = 280;
    const travel = Math.max(220, window.innerWidth - dock - 48);
    const duration = brunoActionDuration[BRUNO_STATES.Run];
    const start = performance.now();

    const tick = (now) => {
      const u = Math.min(1, (now - start) / duration);
      const ping = u < 0.5 ? u * 2 : (1 - u) * 2;
      const eased = ping * ping * (3 - 2 * ping);
      setRunOffset(-travel * eased);
      if (u < 1) {
        raf.current = window.requestAnimationFrame(tick);
      } else {
        finish();
      }
    };
    raf.current = window.requestAnimationFrame(tick);
  }, [finish]);

  const playAction = useCallback(
    (actionId) => {
      if (reduced || busy.current) return;
      busy.current = true;
      clearTimers();

      setState(actionId);
      labActions.setBrunoState(actionId);
      labActions.setBrunoStatus(String(actionId).toUpperCase());

      if (actionId === BRUNO_STATES.Run) {
        playRun();
        return;
      }

      const ms = brunoActionDuration[actionId] || 1200;
      const id = window.setTimeout(finish, ms);
      timers.current.push(id);
    },
    [reduced, clearTimers, playRun, finish],
  );

  return { state, runOffset, playAction };
}

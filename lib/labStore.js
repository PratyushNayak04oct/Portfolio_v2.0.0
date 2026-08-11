'use client';

import { useCallback, useRef, useSyncExternalStore } from 'react';
import { getReactorTarget } from '@/data/reactorStory';

/**
 * Minimal external store — no extra state library.
 */

const listeners = new Set();

let state = {
  activeSection: 'hero',
  scrollProgress: 0,
  sectionProgress: {},
  power: 12,
  reactorStatus: 'INITIALIZING',
  brunoStatus: 'STANDBY',
  brunoState: 'Idle',
  systemOnline: false,
  loaded: false,
  /** Triangle core finished loading handoff into the reactor */
  coreDocked: false,
  /** Mount WebGL near end of loader — not during early charge (avoids aura hitch) */
  warmBoot: false,
  webgl: true,
};

function emit() {
  listeners.forEach((l) => l());
}

function set(partial) {
  let changed = false;
  for (const key of Object.keys(partial)) {
    if (state[key] !== partial[key]) {
      changed = true;
      break;
    }
  }
  if (!changed) return;
  state = { ...state, ...partial };
  emit();
}

export const labStore = {
  getState: () => state,
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setActiveSection: (id) => {
    const target = getReactorTarget(id);
    set({
      activeSection: id,
      power: target.power,
      reactorStatus: target.status,
      systemOnline: id === 'contact' && target.power >= 100,
    });
  },
  setScrollProgress: (v) => set({ scrollProgress: v }),
  setSectionProgress: (id, v) =>
    set({ sectionProgress: { ...state.sectionProgress, [id]: v } }),
  /** UI updates from scroll blend — only when rounded power/status change */
  setPowerFromBlend: (blended) => {
    if (!blended) return;
    const power = Math.round(blended.power ?? state.power);
    const reactorStatus = blended.status || state.reactorStatus;
    if (
      power === state.power &&
      reactorStatus === state.reactorStatus &&
      (power >= 100) === state.systemOnline
    ) {
      return;
    }
    set({
      power,
      reactorStatus,
      systemOnline: power >= 100,
    });
  },
  setBrunoStatus: (brunoStatus) => set({ brunoStatus }),
  setBrunoState: (brunoState) => set({ brunoState }),
  setLoaded: (loaded) => set({ loaded }),
  setCoreDocked: (coreDocked) => set({ coreDocked }),
  setWarmBoot: (warmBoot) => set({ warmBoot }),
  setWebgl: (webgl) => set({ webgl }),
};

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return state;
}

/**
 * Subscribe with an optional selector to avoid re-rendering on unrelated store keys.
 * Selector results are cached by identity/Object.is.
 */
export function useLabStore(selector) {
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const cached = useRef({ state, selected: selector ? selector(state) : state });

  const getSelectedSnapshot = useCallback(() => {
    const sel = selectorRef.current;
    const nextState = getSnapshot();
    if (!sel) {
      cached.current = { state: nextState, selected: nextState };
      return nextState;
    }
    if (cached.current.state === nextState) {
      return cached.current.selected;
    }
    const nextSelected = sel(nextState);
    if (Object.is(cached.current.selected, nextSelected)) {
      cached.current = { state: nextState, selected: cached.current.selected };
      return cached.current.selected;
    }
    cached.current = { state: nextState, selected: nextSelected };
    return nextSelected;
  }, []);

  const getSelectedServerSnapshot = useCallback(() => {
    const sel = selectorRef.current;
    const snap = getServerSnapshot();
    return sel ? sel(snap) : snap;
  }, []);

  return useSyncExternalStore(
    labStore.subscribe,
    getSelectedSnapshot,
    getSelectedServerSnapshot,
  );
}

/** Convenience hooks for actions (stable refs) */
export const labActions = {
  setActiveSection: labStore.setActiveSection,
  setScrollProgress: labStore.setScrollProgress,
  setSectionProgress: labStore.setSectionProgress,
  setPowerFromBlend: labStore.setPowerFromBlend,
  setBrunoStatus: labStore.setBrunoStatus,
  setBrunoState: labStore.setBrunoState,
  setLoaded: labStore.setLoaded,
  setCoreDocked: labStore.setCoreDocked,
  setWarmBoot: labStore.setWarmBoot,
  setWebgl: labStore.setWebgl,
};

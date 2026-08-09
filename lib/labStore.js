'use client';

import { useSyncExternalStore } from 'react';
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
  webgl: true,
};

function emit() {
  listeners.forEach((l) => l());
}

function set(partial) {
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
  setBrunoStatus: (brunoStatus) => set({ brunoStatus }),
  setBrunoState: (brunoState) => set({ brunoState }),
  setLoaded: (loaded) => set({ loaded }),
  setWebgl: (webgl) => set({ webgl }),
};

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return state;
}

/** Subscribe to full store state */
export function useLabStore() {
  return useSyncExternalStore(labStore.subscribe, getSnapshot, getServerSnapshot);
}

/** Convenience hooks for actions (stable refs) */
export const labActions = {
  setActiveSection: labStore.setActiveSection,
  setScrollProgress: labStore.setScrollProgress,
  setSectionProgress: labStore.setSectionProgress,
  setBrunoStatus: labStore.setBrunoStatus,
  setBrunoState: labStore.setBrunoState,
  setLoaded: labStore.setLoaded,
  setWebgl: labStore.setWebgl,
};

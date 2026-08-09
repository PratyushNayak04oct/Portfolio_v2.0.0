export const BRUNO_STATES = {
  Idle: 'Idle',
  Wag: 'Wag',
  Walk: 'Walk',
  Run: 'Run',
  Sit: 'Sit',
  Sleep: 'Sleep',
  Look: 'Look',
  Curious: 'Curious',
  Bark: 'Bark',
  Jump: 'Jump',
  Excited: 'Excited',
  Spin: 'Spin',
  Flip: 'Flip',
};

/** Happy ambient — soft wag */
export const brunoAmbient = BRUNO_STATES.Wag;

/** Hover menu actions shown to the user */
export const brunoMenuActions = [
  { id: BRUNO_STATES.Jump, label: 'Jump' },
  { id: BRUNO_STATES.Flip, label: 'Flip' },
  { id: BRUNO_STATES.Bark, label: 'Bark' },
  { id: BRUNO_STATES.Sit, label: 'Sit' },
  { id: BRUNO_STATES.Sleep, label: 'Sleep' },
  { id: BRUNO_STATES.Run, label: 'Run' },
];

/** Durations (ms) before returning to happy wag */
export const brunoActionDuration = {
  [BRUNO_STATES.Jump]: 1400,
  [BRUNO_STATES.Flip]: 1600,
  [BRUNO_STATES.Bark]: 1100,
  [BRUNO_STATES.Sit]: 2200,
  [BRUNO_STATES.Sleep]: 2800,
  [BRUNO_STATES.Run]: 4200,
  [BRUNO_STATES.Spin]: 1600,
  [BRUNO_STATES.Excited]: 1200,
  [BRUNO_STATES.Look]: 1400,
  [BRUNO_STATES.Curious]: 1400,
};

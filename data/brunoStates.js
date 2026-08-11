export const BRUNO_STATES = {
  Idle: 'Idle',
  Wag: 'Wag',
  Bark: 'Bark',
  Sit: 'Sit',
  Shake: 'Shake',
  Excited: 'Excited',
};

/** Clickable companion tricks — play then return to Wag (no flip/jump) */
export const BRUNO_ACTIONS = [
  { id: BRUNO_STATES.Bark, label: 'Bark', duration: 1200, status: 'BARK' },
  { id: BRUNO_STATES.Sit, label: 'Sit', duration: 2400, status: 'SIT' },
  { id: BRUNO_STATES.Shake, label: 'Shake', duration: 2000, status: 'SHAKE' },
];

/** Happy ambient — soft wag */
export const brunoAmbient = BRUNO_STATES.Wag;

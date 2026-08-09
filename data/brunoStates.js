export const BRUNO_STATES = {
  Idle: 'Idle',
  Wag: 'Wag',
  Walk: 'Walk',
  Run: 'Run',
  Sit: 'Sit',
  Look: 'Look',
  Curious: 'Curious',
  Bark: 'Bark',
  Jump: 'Jump',
  Excited: 'Excited',
  Spin: 'Spin',
};

/** Happy ambient — always a soft wag */
export const brunoAmbient = BRUNO_STATES.Wag;

/** Random hover / tap actions */
export const brunoHoverActions = [
  BRUNO_STATES.Bark,
  BRUNO_STATES.Jump,
  BRUNO_STATES.Excited,
  BRUNO_STATES.Look,
  BRUNO_STATES.Spin,
  BRUNO_STATES.Curious,
];

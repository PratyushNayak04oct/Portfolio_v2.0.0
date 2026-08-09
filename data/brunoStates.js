export const BRUNO_STATES = {
  Idle: 'Idle',
  Walk: 'Walk',
  Run: 'Run',
  Sit: 'Sit',
  Look: 'Look',
  Curious: 'Curious',
  Bark: 'Bark',
  Jump: 'Jump',
  FrontFlip: 'FrontFlip',
  Excited: 'Excited',
  Sleep: 'Sleep',
  Inspect: 'Inspect',
};

/** Section → preferred ambient state (not constantly animating) */
export const brunoSectionStates = {
  about: BRUNO_STATES.Walk,
  experience: BRUNO_STATES.Inspect,
  projects: BRUNO_STATES.Curious,
  lab: BRUNO_STATES.Excited,
  contact: BRUNO_STATES.Sit,
};

/** Hover/tap interaction cycle */
export const brunoInteractionCycle = [
  BRUNO_STATES.Look,
  BRUNO_STATES.FrontFlip,
  BRUNO_STATES.Bark,
];

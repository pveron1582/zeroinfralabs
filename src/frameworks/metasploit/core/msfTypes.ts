// ── frameworks/metasploit/core/msfTypes.ts ────────────────────────
// El contrato de tipos (MsfState, MsfSession) vive en src/types/msf.ts
// (única fuente para store, commands, hooks y este framework).
// Aquí solo queda el estado inicial de runtime.

import type { MsfState, MsfSession } from '../../../types/msf';

export type { MsfState, MsfSession };

export const INITIAL_STATE: MsfState = {
  active: true,
  options: {},
  sessionOpen: false,
  shellMode: false,
  auxChecked: false,
  uidChecked: false,
};

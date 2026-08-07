// ── store/slices/identitySlice.ts ──────────────────────────────────
// Stack de identidades (usuario/máquina/cwd) para sesiones de terminal.
// Vive en el store para que el estado sobreviva a remounts de componentes
// y sea compartible si en el futuro hay múltiples terminales.
//
// Cada cambio de contexto (su, sudo su, ssh, reverse shell nc) hace push.
// `exit` hace pop y restaura el usuario/máquina anterior.

import type { StateCreator } from 'zustand';
import type { ScenarioState } from '../types';

export interface IdentityFrame {
  machineId: string;
  suUser?: string;
  cwd: string;
}

export interface IdentitySlice {
  identityStack: IdentityFrame[];

  // Acciones básicas del stack
  pushIdentity: (frame: IdentityFrame) => void;
  /** Hace pop y devuelve el frame anterior, o null si estábamos en el base. */
  popIdentity: () => IdentityFrame | null;
  /** Resetea el stack al frame dado (usado al cambiar de escenario). */
  resetIdentity: (frame: IdentityFrame) => void;

  /**
   * Aplica una identidad: cambia máquina activa, su_user y cwd.
   * Si la identidad no tiene usuario (ej. sesión ssh), limpia privesc
   * para que no quede un "root fantasma".
   */
  applyIdentity: (frame: IdentityFrame) => void;
}

export const createIdentitySlice: StateCreator<ScenarioState, [], [], IdentitySlice> = (set, get) => ({
  identityStack: [],

  pushIdentity: (frame) => set(state => ({
    identityStack: [...state.identityStack, frame],
  })),

  popIdentity: () => {
    const { identityStack } = get();
    if (identityStack.length <= 1) {
      return null;
    }
    const prev = identityStack[identityStack.length - 2];
    set({ identityStack: identityStack.slice(0, -1) });
    return prev;
  },

  resetIdentity: (frame) => set({ identityStack: [frame] }),

  applyIdentity: (frame) => {
    const { changeMachine, setSuUser, resetPrivescCompleted, setCurrentDir } = get();
    changeMachine(frame.machineId);
    setSuUser(frame.machineId, frame.suUser);
    if (frame.suUser === undefined) {
      resetPrivescCompleted(frame.machineId);
    }
    setCurrentDir(frame.cwd);
  },
});

// ── hooks/useIdentityStack.ts ─────────────────────────────────────
// Hook de conveniencia sobre el identitySlice del store.
// Expone API estable para useCommandRunner y sincroniza el stack
// con la máquina inicial cuando cambia de escenario.

import { useEffect } from 'react';
import type { Machine } from '../types';
import { useScenarioStore } from '../store/scenarioStore';

export interface IdentityFrame {
  machineId: string;
  suUser?: string;
  cwd: string;
}

interface UseIdentityStackOptions {
  /** Máquina inicial (atacante) — determina el frame base del stack */
  initialMachine: Machine;
  /** Callback legacy para cambiar máquina (se mantiene por compatibilidad) */
  onChangeMachine: (machineId: string) => void;
}

export function useIdentityStack({ initialMachine, onChangeMachine }: UseIdentityStackOptions) {
  // Acceso defensivo: tests que mockean el store con estado parcial pueden
  // no incluir identityStack → undefined. Lo colapsamos a [] para que el
  // hook siga funcionando y el efecto lo inicialice en el siguiente tick.
  const identityStack = useScenarioStore(state => state.identityStack) ?? [];
  const pushIdentity = useScenarioStore(state => state.pushIdentity);
  const popIdentityStore = useScenarioStore(state => state.popIdentity);
  const resetIdentity = useScenarioStore(state => state.resetIdentity);
  const applyIdentityStore = useScenarioStore(state => state.applyIdentity);

  // Sincronizar cuando cambia la máquina inicial (nuevo escenario)
  useEffect(() => {
    const baseFrame: IdentityFrame = {
      machineId: initialMachine.id,
      suUser: initialMachine.su_user,
      cwd: '/root',
    };
    if (identityStack.length === 0) {
      resetIdentity(baseFrame);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMachine.id]);

  // Wrapper que combina pop + apply + notificación legacy
  const popIdentity = (): boolean => {
    const prev = popIdentityStore();
    if (!prev) return false;
    applyIdentityStore(prev);
    onChangeMachine(prev.machineId);
    return true;
  };

  // Wrapper para push que no hace side-effects extra (el caller los maneja)
  const pushAndNotify = (frame: IdentityFrame) => {
    pushIdentity(frame);
  };

  return {
    identityStack,
    pushIdentity: pushAndNotify,
    popIdentity,
    applyIdentity: applyIdentityStore,
    resetIdentity,
  };
}

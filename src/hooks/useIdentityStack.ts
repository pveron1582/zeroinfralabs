// ── hooks/useIdentityStack.ts ─────────────────────────────────────
// Hook de conveniencia sobre el identitySlice del store.
// Expone API estable para useCommandRunner y sincroniza el stack
// con la máquina inicial cuando cambia de escenario.

import { useEffect, useState } from 'react';
import type { Machine } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import { initialCwd } from '../utils/users';

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
  /** Restaura el cwd local al hacer pop (aislado: no se escribe el store) */
  setCurrentDir?: (dir: string) => void;
  terminalId?: string;
}

export function useIdentityStack({ initialMachine, onChangeMachine, setCurrentDir, terminalId }: UseIdentityStackOptions) {
  // Estado local cuando hay terminalId (aislamiento por ventana de terminal)
  const [localStack, setLocalStack] = useState<IdentityFrame[]>(() => [{
    machineId: initialMachine.id,
    suUser: initialMachine.su_user,
    cwd: initialCwd(initialMachine),
  }]);

  // Acceso al store (fallback / legacy sin terminalId)
  const storeStack = useScenarioStore(state => state.identityStack) ?? [];
  const pushIdentityStore = useScenarioStore(state => state.pushIdentity);
  const popIdentityStore = useScenarioStore(state => state.popIdentity);
  const resetIdentityStore = useScenarioStore(state => state.resetIdentity);
  const applyIdentityStore = useScenarioStore(state => state.applyIdentity);

  // Sincronizar cuando cambia la máquina inicial (nuevo escenario)
  useEffect(() => {
    const baseFrame: IdentityFrame = {
      machineId: initialMachine.id,
      suUser: initialMachine.su_user,
      cwd: initialCwd(initialMachine),
    };
    if (terminalId) {
      // Solo se resetea si la máquina nueva NO es la del frame superior: ese
      // caso viene de un push/pop propio (SSH/pivot o `exit`), que apila el
      // frame remoto y recién después cambia la prop `machine`. Resetear ahí
      // borraba el frame anterior y `exit` no podía volver a la máquina de
      // origen — el stack ES la memoria de a dónde está conectada la terminal.
      setLocalStack(curr => {
        const top = curr[curr.length - 1];
        return top?.machineId === initialMachine.id ? curr : [baseFrame];
      });
    } else if (storeStack.length === 0) {
      resetIdentityStore(baseFrame);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMachine.id]);

  const popIdentity = (): boolean => {
    if (terminalId) {
      if (localStack.length <= 1) return false;
      const prev = localStack[localStack.length - 2];
      setLocalStack(curr => curr.slice(0, -1));
      // Pop LOCAL: nunca applyIdentityStore — escribía suUser/cwd/privesc
      // compartidos y borraba el su de las demás terminales (bug HIGH #2).
      onChangeMachine(prev.machineId);
      setCurrentDir?.(prev.cwd);
      return true;
    }
    const prev = popIdentityStore();
    if (!prev) return false;
    applyIdentityStore(prev);
    onChangeMachine(prev.machineId);
    return true;
  };

  const pushAndNotify = (frame: IdentityFrame) => {
    if (terminalId) {
      setLocalStack(curr => [...curr, frame]);
    } else {
      pushIdentityStore(frame);
    }
  };

  const identityStack = terminalId ? localStack : storeStack;

  // su del frame superior cuando corresponde a la máquina activa: alimenta
  // prompt/env/ejecución de la terminal (aislamiento HIGH #2).
  const topFrame = identityStack[identityStack.length - 1];
  const topSuUser = topFrame?.machineId === initialMachine.id ? topFrame.suUser : undefined;

  return {
    identityStack,
    topSuUser,
    pushIdentity: pushAndNotify,
    popIdentity,
    applyIdentity: applyIdentityStore,
    resetIdentity: resetIdentityStore,
  };
}

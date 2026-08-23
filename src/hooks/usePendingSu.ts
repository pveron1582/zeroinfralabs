// ── hooks/usePendingSu.ts ──────────────────────────────────────────
// Maneja el estado intermedio de `su`/`sudo -i`: el comando ya se ejecutó
// y está esperando el password del usuario destino. Mientras está activo,
// la terminal muestra un prompt "Password:" y oculta el input tipeado.

import { useState } from 'react';
import type { Machine, CommandResponse } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import { validatePassword } from '../utils/credentials';
import type { IdentityFrame } from './useIdentityStack';

export interface PendingSu {
  targetUser: string;
  promptToken: string;
  sudoEscalation?: boolean;
  sudoCwd?: string;
}

interface UsePendingSuOptions {
  machine: Machine;
  currentDir: string;
  setCurrentDir: (dir: string) => void;
  pushIdentity: (frame: IdentityFrame) => void;
}

export function usePendingSu({ machine, currentDir, setCurrentDir, pushIdentity }: UsePendingSuOptions) {
  const [pendingSu, setPendingSu] = useState<PendingSu | null>(null);

  /**
   * Valida el password tipeado. Devuelve un CommandResponse sintético
   * con el mensaje de éxito/fallo, o null si no había su pendiente.
   */
  const handleSuPassword = (password: string): CommandResponse | null => {
    if (!pendingSu) return null;

    const target = pendingSu.targetUser;
    const accepted = validatePassword(machine, target, password);

    if (accepted) {
      if (pendingSu.sudoEscalation) {
        useScenarioStore.getState().setPrivescCompleted(machine.id);
        useScenarioStore.getState().setSuUser(machine.id, 'root');
        const sudoCwd = pendingSu.sudoCwd ?? currentDir;
        setCurrentDir(sudoCwd);
        pushIdentity({ machineId: machine.id, suUser: 'root', cwd: sudoCwd });
        setPendingSu(null);
        // Metadata para que LabValidator detecte la escalada (mismo contrato
        // que `sudo <shell>` en modo NOPASSWD).
        return { type: 'hybrid', output: '', privescCompleted: machine.id };
      }
      useScenarioStore.getState().setSuUser(machine.id, target);
      pushIdentity({ machineId: machine.id, suUser: target, cwd: currentDir });
      setPendingSu(null);
      return { type: 'hybrid', output: '' };
    }

    setPendingSu(null);
    return { type: 'hybrid', output: 'su: Authentication failure', isError: true };
  };

  return { pendingSu, setPendingSu, handleSuPassword };
}

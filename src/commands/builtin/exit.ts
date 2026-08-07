// ── commands/builtin/exit.ts ──────────────────────────────────────
// Cierra la identidad actual (su_user / sesión SSH) y vuelve a la anterior.
// El CommandRunner hace el pop del stack de identidades; aquí solo se
// señala el tipo de salida vía metadata (`identityExit` / `exitTerminal`).

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_exit = {
  name: 'exit',
  execute: (_args: string[], { machine, allMachines }: CommandContext): CommandResponse => {
    // Salir de un cambio de usuario (su): el runner vuelve al usuario previo
    // sin cerrar la terminal (misma máquina, prompt anterior).
    if (machine.su_user) {
      return { output: 'logout\n', isError: false, identityExit: true };
    }

    // Máquina atacante sin identidad: cerrar la terminal.
    if (machine.id === 'attacker-01' || machine.machine_info.type === 'workstation') {
      return { output: "logout\nCerrando terminal...", type: 'exit', exitTerminal: true };
    }

    // Sesión remota (SSH / reverse shell) en máquina objetivo: cerrar la
    // sesión y volver al atacante. El runner hace pop del stack.
    const attackerMachine = allMachines.find(m => m.id === 'attacker-01');
    return {
      output: 'logout\nConnection to target closed.',
      type: 'exit',
      newMachineId: attackerMachine?.id || 'attacker-01',
      sshSessionClosed: true,
    };
  }
};

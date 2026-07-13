// ── commands/builtin/exit.ts ──────────────────────────────────────
// Cierra sesión SSH y vuelve a la máquina atacante

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_exit = {
  name: 'exit',
  execute: (_args: string[], { machine, allMachines }: CommandContext): CommandResponse => {
    // Si estamos en la máquina atacante, cerrar la terminal (exit en bash real cierra la terminal)
    if (machine.id === 'attacker-01' || machine.machine_info.type === 'workstation') {
      return { output: "logout\nCerrando terminal...", exitTerminal: true };
    }
    // Si estamos en una sesión SSH (máquina objetivo), cerrar la sesión y volver al atacante
    const attackerMachine = allMachines.find(m => m.id === 'attacker-01');
    return { 
      output: 'logout\nConnection to target closed.',
      newMachineId: attackerMachine?.id || 'attacker-01',
      sshSessionClosed: true,
    };
  }
};

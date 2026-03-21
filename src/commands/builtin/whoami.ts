// ── commands/builtin/whoami.ts ────────────────────────────────────
// Muestra información del usuario actual

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_whoami = {
  name: 'whoami',
  execute: (_: string[], { machine }: CommandContext): CommandResponse => {
    // Determinar el usuario actual basado en la máquina
    const isAttacker = machine.id.includes('attacker');
    const currentMachine = machine;
    
    // Para máquinas objetivo, intentar obtener el usuario desde las credenciales encontradas
    let currentUser = 'admin'; // Valor por defecto para máquinas objetivo
    
    if (!isAttacker && currentMachine.found_credentials) {
      // Si hay credenciales encontradas, usar el usuario
      currentUser = currentMachine.found_credentials.user;
    } else if (!isAttacker) {
      // Para escenarios específicos, usar el usuario correcto basado en el hostname
      if (currentMachine.machine_info.hostname === 'privesc-lab') {
        currentUser = 'developer';
      }
    }

    return {
      output: isAttacker
        ? `root\nuid=0(root) gid=0(root)\nHostname: ${machine.machine_info.hostname}\nIP: ${machine.machine_info.ip}\nOS: ${machine.machine_info.os}`
        : `${currentUser}\nHostname: ${machine.machine_info.hostname}\nIP: ${machine.machine_info.ip}`
    };
  }
};

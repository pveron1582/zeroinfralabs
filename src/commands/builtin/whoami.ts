// ── commands/builtin/whoami.ts ────────────────────────────────────
// Muestra información del usuario actual

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_whoami = {
  name: 'whoami',
  execute: (_: string[], { machine }: CommandContext): CommandResponse => {
    const isAttacker = machine.id.includes('attacker');
    
    if (machine.privesc_completed) {
      return { output: 'root' };
    }

    // Para máquinas objetivo, buscar credenciales SSH encontradas
    let currentUser = 'user';
    
    if (!isAttacker && machine.found_credentials) {
      // Prioridad: credencial SSH verificada
      const sshCred = machine.found_credentials.find(c => c.service === 'ssh' && c.verified);
      if (sshCred) {
        currentUser = sshCred.user;
      } else {
        // Fallback: cualquier credencial SSH (verificada o no)
        const anySshCred = machine.found_credentials.find(c => c.service === 'ssh');
        if (anySshCred) {
          currentUser = anySshCred.user;
        } else {
          // Fallback: cualquier credencial verificada
          const verifiedCred = machine.found_credentials.find(c => c.verified);
          if (verifiedCred) {
            currentUser = verifiedCred.user;
          }
        }
      }
    } else if (!isAttacker) {
      // Fallback: credenciales del puerto SSH
      const sshPort = machine.scan_results.ports.find(p => p.service === 'ssh');
      if (sshPort?.credentials?.user) {
        currentUser = sshPort.credentials.user;
      }
    }

    return {
      output: isAttacker ? 'root' : currentUser
    };
  }
};

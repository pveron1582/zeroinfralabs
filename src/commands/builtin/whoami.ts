// ── commands/builtin/whoami.ts ────────────────────────────────────
// Muestra información del usuario actual

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_whoami = {
  name: 'whoami',
  execute: (_: string[], { machine }: CommandContext): CommandResponse => {
    // Determinar el usuario actual basado en la máquina
    const isAttacker = machine.id.includes('attacker');
    
    if (machine.privesc_completed) {
      return { output: 'root' };
    }

    // Para máquinas objetivo, usar el usuario de las credenciales SSH encontradas
    // Las credenciales se llenan después de un SSH exitoso via foundCredentials en ssh.ts
    let currentUser = 'user'; // Valor por defecto genérico
    
    if (!isAttacker && machine.found_credentials) {
      // Buscar credencial SSH verificada
      const sshCred = machine.found_credentials.find(c => c.service === 'ssh' && c.verified);
      if (sshCred) {
        currentUser = sshCred.user;
      } else {
        // Fallback: buscar cualquier credencial verificada
        const verifiedCred = machine.found_credentials.find(c => c.verified);
        if (verifiedCred) {
          currentUser = verifiedCred.user;
        }
      }
    } else if (!isAttacker) {
      // Fallback: intentar obtener el usuario de las credenciales SSH del puerto
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

// ── frameworks/shells/ftp/ftpCommand.ts ────────────────────────────
// Simulador de cliente FTP - inicia sesión de shell interactiva
// Este es el comando inicial que arranca FtpSession

import type { CommandContext, CommandResponse } from '../../../types';
import { startShellSession } from '../../../commands';

// Estado global de sesiones FTP (legacy - mantenido para compatibilidad)
const ftpSessions = new Map<string, { connected: boolean; anonymous: boolean; loggedIn: boolean; currentDir: string; targetId?: string }>();

// Resetear sesiones FTP (útil para tests)
export function resetFtpSessions() {
  ftpSessions.clear();
}

export const cmd_ftp = {
  name: 'ftp',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const { allMachines, machine } = ctx;

    // Sin argumentos - mostrar uso
    if (!args[0]) {
      return {
        output: `usage: ftp <hostname-or-ip>
       (inside FTP): get <file>, exit, quit, ls, dir`,
        isError: true
      };
    }

    // Conectar a servidor FTP
    const targetIp = args[0];
    const target = allMachines.find(m => m.machine_info.ip === targetIp);

    if (!target) {
      return { output: `ftp: connect: Connection refused`, isError: true };
    }

    // Verificar si hay puerto FTP abierto
    const ftpPort = target.scan_results.ports.find(p => p.service === 'ftp' && p.state === 'open');
    if (!ftpPort) {
      return { output: `ftp: connect: Connection refused`, isError: true };
    }

    // Iniciar sesión de shell FTP - el ShellManager manejará el flujo interactivo
    return startShellSession('ftp', [targetIp], ctx);
  }
};

// ── commands/tools/ssh.ts ────────────────────────────────────────
// Wrapper para iniciar sesión SSH interactiva via ShellManager

import type { CommandContext, CommandResponse } from '../../types';
import { startShellSession } from '../../commands';
import { useScenarioStore } from '../../store/scenarioStore';

export const cmd_ssh = {
  name: 'ssh',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (!args[0]) return { output: 'usage: ssh user@ip', isError: true };

    const [user, ip] = args[0].split('@');
    if (!user || !ip) return { output: 'usage: ssh user@ip', isError: true };

    const target = ctx.allMachines.find(m => m.machine_info.ip === ip);
    if (!target) return { output: `ssh: connect to host ${ip} port 22: No route to host`, isError: true };

    const sshPort = target.scan_results.ports.find(p => p.service === 'ssh' && p.state === 'open');
    if (!sshPort) return { output: `ssh: connect to host ${ip} port 22: Connection refused`, isError: true };

    // Validar que se haya hecho discovery previo (hydra o equivalente)
    if ((target.discovery_level ?? 0) < 3) {
      return {
        output: `Error: No se puede conectar por SSH a ${ip}.\nPrimero descubre credenciales con: hydra -l ${user} -P /usr/share/wordlists/rockyou.txt ${ip} ssh`,
        isError: true
      };
    }

    // Iniciar sesión SSH interactiva via ShellManager
    return startShellSession('ssh', args, ctx);
  }
};

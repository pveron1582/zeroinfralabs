// ── commands/builtin/journalctl.ts ──────────────────────────────────
// Simulador de journalctl - consulta de logs del sistema (ROADMAP Fase 5.6)
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.

import type { CommandContext, CommandResponse } from '../../types';

const HEADER = '-- Logs begin at Fri 2024-03-19 09:00:00 UTC --';

function unitTokens(service: string): string[] {
  switch (service) {
    case 'ssh': return ['sshd', 'ssh'];
    case 'nginx': return ['nginx'];
    case 'apache2': return ['apache2'];
    case 'mysql': return ['mysqld', 'mysql'];
    case 'cron': return ['CRON', 'cron'];
    case 'vsftpd': return ['vsftpd'];
    case 'rsyslog': return ['rsyslogd', 'rsyslog'];
    case 'systemd': return ['systemd'];
    case 'smb': return ['smbd', 'smb'];
    case 'xrdp': return ['xrdp'];
    default: return [service];
  }
}

function collectMachineLogs(machine: CommandContext['machine']): string[] {
  const lines: string[] = [];
  for (const file of machine.files || []) {
    if (!file.path.startsWith('/var/log/')) continue;
    for (const line of (file.content || '').split('\n')) {
      const trimmed = line.trim();
      if (trimmed) lines.push(trimmed);
    }
  }
  return lines;
}

function generateLogs(service: string, hostname: string, count: number): string[] {
  const tokens = unitTokens(service);
  const daemon = tokens[0];
  const templates = [
    `Mar 19 10:00:01 ${hostname} systemd[1]: Starting ${service}...`,
    `Mar 19 10:00:01 ${hostname} systemd[1]: Started ${service}.`,
    `Mar 19 10:05:23 ${hostname} ${daemon}[1234]: Server listening on 0.0.0.0`,
    `Mar 19 10:12:47 ${hostname} ${daemon}[1234]: Connection from 192.168.1.100`,
    `Mar 19 10:15:00 ${hostname} ${daemon}[1234]: Accepted connection, session established`,
    `Mar 19 10:17:33 ${hostname} ${daemon}[1234]: Child process started with pid 5678`,
    `Mar 19 10:20:11 ${hostname} ${daemon}[1234]: Closing idle connection from 192.168.1.100`,
    `Mar 19 10:23:45 ${hostname} systemd[1]: ${service} reloaded successfully`,
  ];
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(templates[i % templates.length]);
  }
  return result;
}

export const cmd_journalctl = {
  name: 'journalctl',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const machine = ctx.machine;
    const hostname = machine.machine_info?.hostname || 'target-server';

    let follow = false;
    let lines = 20;
    let unit: string | null = null;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '-f' || arg === '--follow') follow = true;
      else if (arg === '-n') {
        const v = Number(args[i + 1]);
        if (!isNaN(v)) lines = Math.max(1, v);
        i++;
      } else if (arg.startsWith('-n') && arg.length > 2) {
        const v = Number(arg.slice(2));
        if (!isNaN(v)) lines = Math.max(1, v);
      } else if (arg === '-u') {
        unit = args[i + 1];
        i++;
      } else if (arg.startsWith('-u') && arg.length > 2) {
        unit = arg.slice(2);
      } else if (arg === '--no-pager' || arg === '-o' || arg === '--output') {
        if (arg === '-o' || arg === '--output') i++;
      }
    }

    // Recolectar logs reales de la máquina y filtrar por unidad
    let logLines = collectMachineLogs(machine);
    if (unit) {
      const tokens = unitTokens(unit);
      const filtered = logLines.filter(l => tokens.some(t => l.includes(t)));
      if (filtered.length > 0) {
        logLines = filtered;
      } else {
        logLines = generateLogs(unit, hostname, 8);
      }
    }

    logLines = logLines.slice(-lines);

    const output = `${HEADER}\n${logLines.join('\n')}`;

    if (follow) {
      return {
        output,
        type: 'blocking',
        blockingCommand: {
          message: 'journalctl -f running... (presiona q para salir)',
          cancelKey: 'q',
          clearScreen: false,
        },
      };
    }

    return { output, isError: false };
  }
};

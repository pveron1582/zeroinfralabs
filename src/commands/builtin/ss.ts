// ── commands/builtin/ss.ts ──────────────────────────────────────────
// Simuladores de 'ss' y 'netstat' (ROADMAP Fase 6.4). Reportan los
// puertos en escucha reales (servicio activo y sin regla de firewall)
// vía networkState.getListeningPorts.

import type { CommandContext, CommandResponse } from '../../types';
import { getListeningPorts, type ListeningPort } from '../../frameworks/network/networkState';

const SS_HELP = `Usage: ss [options]
  -t  Show TCP sockets
  -u  Show UDP sockets
  -l  Show listening sockets
  -a  Show all sockets (listening + established)
  -p  Show process information
  -n  Do not resolve names
  -h  Show help

Examples:
  ss -tlnp        # Listening TCP sockets with process
  ss -tnp         # Established TCP connections
  ss -tulnp       # Listening TCP + UDP sockets`;

const NETSTAT_HELP = `Usage: netstat [options]
  -t  Show TCP sockets
  -u  Show UDP sockets
  -l  Show listening sockets
  -a  Show all sockets
  -p  Show PID and program name
  -n  Numeric output
  -h  Show help

Examples:
  netstat -tlnp   # Listening TCP with PID/program
  netstat -an     # All sockets (numeric)`;

function peerIp(ctx: CommandContext): string {
  const currentIp = ctx.machine?.machine_info?.ip;
  const other = ctx.allMachines?.find(m => m.id !== ctx.machine?.id && m.machine_info?.type === 'workstation');
  if (other?.machine_info?.ip && other.machine_info.ip !== currentIp) return other.machine_info.ip;
  return '192.168.1.5';
}

// Detecta flags cortos combinados (ej: '-tlnp' contiene t, l, n, p)
function hasFlag(args: string[], flag: string): boolean {
  return args.some(a => a.startsWith('-') && !a.startsWith('--') && a.includes(flag));
}

function tcpListeningLines(ports: ListeningPort[]): string[] {
  return ports.filter(p => p.protocol === 'tcp').map(p => {
    const pid = p.pid ? `pid=${p.pid}` : '';
    return `LISTEN  0      128    0.0.0.0:${p.port}        0.0.0.0:*         users:(("${p.process}",${pid},fd=3))`;
  });
}

function establishedLines(ports: ListeningPort[], peer: string): string[] {
  return ports.filter(p => p.protocol === 'tcp').map((p, i) => {
    const sport = 49000 + i;
    return `ESTAB   0      0      0.0.0.0:${p.port}        ${peer}:${sport}    users:(("${p.process}",pid=${p.pid ?? '?'},fd=4))`;
  });
}

export const cmd_ss = {
  name: 'ss',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) return { output: SS_HELP };
    if (!args.length) return { output: SS_HELP };

    const showUdp = hasFlag(args, 'u');
    const showAll = hasFlag(args, 'a');
    const showListening = hasFlag(args, 'l') || showAll;
    const showEstablished = showAll || !showListening;

    const listening = getListeningPorts(ctx.machine!);
    let ports = showUdp ? listening : listening.filter(p => p.protocol === 'tcp');

    let out = `State    Recv-Q  Send-Q  Local Address:Port  Peer Address:Port Process\n`;
    if (showListening) {
      ports.forEach(p => {
        out += tcpListeningLines([p])[0] + '\n';
      });
    }
    if (showEstablished) {
      const peer = peerIp(ctx);
      establishedLines(ports, peer).forEach(l => { out += l + '\n'; });
    }
    return { output: out.trimEnd() };
  }
};

export const cmd_netstat = {
  name: 'netstat',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) return { output: NETSTAT_HELP };
    if (!args.length) return { output: NETSTAT_HELP };

    const showAll = hasFlag(args, 'a');
    const showListening = hasFlag(args, 'l') || showAll;
    const showEstablished = showAll || !showListening;
    const showProcs = hasFlag(args, 'p');
    const showUdp = hasFlag(args, 'u');

    const listening = getListeningPorts(ctx.machine!);
    const ports = showUdp ? listening : listening.filter(p => p.protocol === 'tcp');

    let out = `Active Internet connections (${showListening && showEstablished ? 'servers and established' : showListening ? 'only servers' : 'established'})\n`;
    out += `Proto Recv-Q Send-Q Local Address           Foreign Address         State       ${showProcs ? 'PID/Program name' : ''}\n`;
    if (showListening) {
      ports.forEach(p => {
        const proc = showProcs ? `${p.pid ?? '?'}/${p.process}` : '';
        out += `${p.protocol.padEnd(5)}    0      0 0.0.0.0:${p.port}          0.0.0.0:*               LISTEN      ${proc}\n`;
      });
    }
    if (showEstablished) {
      const peer = peerIp(ctx);
      ports.forEach((p, i) => {
        const sport = 49000 + i;
        const proc = showProcs ? `${p.pid ?? '?'}/${p.process}` : '';
        out += `${p.protocol.padEnd(5)}    0      0 0.0.0.0:${p.port}          ${peer}:${sport}        ESTABLISHED ${proc}\n`;
      });
    }
    return { output: out.trimEnd() };
  }
};

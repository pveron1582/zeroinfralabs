// ── commands/tools/tcpdump.ts ─────────────────────────────────────
// tcpdump (Tier 1): captura sintética de tráfico entre máquinas del
// estado virtual. -c N limita, -i interfaz, --no-promisc siempre on.

import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser } from '../../utils/users';

const TCPDUMP_HELP = `Usage: tcpdump [OPTIONS]
Dump traffic on a network.

  -i IFACE   Interface (default eth0)
  -c COUNT   Stop after COUNT packets

Examples:
  tcpdump -i eth0 -c 5
  tcpdump -c 3`;

export const cmd_tcpdump = {
  name: 'tcpdump',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) return { output: TCPDUMP_HELP };
    let count = 10;
    let iface = 'eth0';
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-i') { iface = args[++i] ?? 'eth0'; }
      else if (a.startsWith('-i') && a.length > 2) iface = a.slice(2);
      else if (a === '-c') { count = parseInt(args[++i] ?? '10', 10) || 10; }
      else if (a.startsWith('-c') && a.length > 2) count = parseInt(a.slice(2), 10) || 10;
      else if (a.startsWith('-')) return { output: `tcpdump: invalid option -- '${a.replace(/^-+/, '')[0] ?? ''}'`, isError: true };
    }
    count = Math.min(Math.max(1, count), 100);

    const user = getCurrentUser(ctx.machine);
    if (user.uid !== 0 && user.username !== 'root') {
      return { output: `tcpdump: ${iface}: You don't have permission to capture on that device\n(tcpdump: consider running as root)`, isError: true };
    }

    const self = ctx.machine;
    const others = ctx.allMachines.filter(m => m.machine_info.ip !== self.machine_info.ip);
    const peers = others.length > 0 ? others : [self];
    const protos = ['IP', 'ARP', 'IP6', 'ARP'];

    let out = `tcpdump: verbose output suppressed, use -v or -vv for full protocol decode\nlistening on ${iface}, link-type EN10MB (Ethernet), capture size 262144 bytes\n`;
    const baseTime = Date.now();
    for (let i = 0; i < count; i++) {
      const a = peers[i % peers.length];
      const b = peers[(i + 1) % peers.length];
      const proto = protos[i % protos.length];
      const t = new Date(baseTime + i * 137);
      const hh = String(t.getHours()).padStart(2, '0');
      const mm = String(t.getMinutes()).padStart(2, '0');
      const ss = String(t.getSeconds()).padStart(2, '0');
      const frac = String((i * 137) % 1000000).padStart(6, '0');
      out += `${hh}:${mm}:${ss}.${frac} ${proto} ${a.machine_info.ip} > ${b.machine_info.ip}: `;
      if (proto === 'ARP') {
        out += `ARP, Request who-has ${b.machine_info.ip} tell ${a.machine_info.ip}, length 28\n`;
      } else if (proto === 'IP6') {
        out += `ICMP6, neighbor solicitation, length 24\n`;
      } else {
        out += `Flags [S], seq ${i * 2521 + 1000}, win 64240, length 0\n`;
      }
      if (i + 1 < count) out += '';
    }
    out += `\n${count} packets captured\n${count} packets received by filter\n0 packets dropped by kernel\n`;
    return { output: out };
  },
};

// ── commands/builtin/sysinfo.ts ───────────────────────────────────
// Info del sistema (Tier 1): uptime, free, arch, w, last, hostnamectl,
// lsb_release, lscpu. Valores derivados de la máquina (hostname, OS,
// usuarios) y del reloj virtual (cronRunner).

import type { CommandContext, CommandResponse } from '../../types';
import { virtualTime } from '../../frameworks/cron/cronRunner';
import { getCurrentUser } from '../../utils/users';
import { formatBytesBinary } from '../../utils/format';
import { list as listProcesses } from '../../frameworks/process/processManager';

// Boot virtual determinista: el 1er de este mes a las 08:00, más un
// desplazamiento estable por máquina (para que labs distintos difieran).
function bootTime(ctx: CommandContext): Date {
  const t = virtualTime(ctx.machine);
  const host = ctx.machine.machine_info.hostname ?? 'host';
  let seed = 0;
  for (const c of host) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const uptimeSecs = 3600 + (seed % 86400 * 3);
  return new Date(t.getTime() - uptimeSecs * 1000);
}

function fmtUptime(seconds: number, pretty = false): string {
  const days = Math.floor(seconds / 86400);
  const rem = seconds % 86400;
  const h = Math.floor(rem / 3600);
  const m = Math.floor((rem % 3600) / 60);
  if (pretty) {
    if (days > 0) return `${days} day${days === 1 ? '' : 's'}, ${h} hour${h === 1 ? '' : 's'}, ${m} minute${m === 1 ? '' : 's'}`;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}`;
    return `${m} min`;
  }
  if (days > 0) return `${days} day${days === 1 ? '' : 's'}, ${h}:${String(m).padStart(2, '0')}`;
  return `${h}:${String(m).padStart(2, '0')}`;
}

function loadAvg(host: string): string {
  let seed = 0; for (const c of host) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const r = () => ((seed = (seed * 1103515245 + 12345) >>> 0) % 500) / 100;
  return `${(r() / 2).toFixed(2)}, ${(r() / 4).toFixed(2)}, ${(r() / 8).toFixed(2)}`;
}

export const cmd_uptime = {
  name: 'uptime',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) return { output: 'Usage: uptime\nShow how long the system has been running.' };
    const now = virtualTime(ctx.machine);
    const secs = Math.max(0, Math.floor((now.getTime() - bootTime(ctx).getTime()) / 1000));
    if (args.includes('-p') || args.includes('--pretty')) return { output: `up ${fmtUptime(secs, true)}` };
    if (args.includes('-s') || args.includes('--since')) {
      const b = bootTime(ctx);
      const yyyy = b.getFullYear(), mm = String(b.getMonth() + 1).padStart(2, '0'), dd = String(b.getDate()).padStart(2, '0');
      return { output: `${yyyy}-${mm}-${dd} ${String(b.getHours()).padStart(2, '0')}:${String(b.getMinutes()).padStart(2, '0')}:${String(b.getSeconds()).padStart(2, '0')}` };
    }
    const host = ctx.machine.machine_info.hostname ?? 'host';
    return { output: ` ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} up ${fmtUptime(secs)}, 1 user, load average: ${loadAvg(host)}` };
  },
};

export const cmd_free = {
  name: 'free',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.includes('--help')) return { output: 'Usage: free [-h] [-m]\nShow amount of free, used and available memory.\n  -h human-readable (default)\n  -m megabytes' };
    const host = ctx.machine.machine_info.hostname ?? 'host';
    let seed = 42; for (const c of host) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
    const totalKi = seed % 4 === 0 ? 16384 * 1024 : 8192 * 1024; // 8-16 GB
    const usedKi = Math.floor(totalKi * (0.22 + (seed % 25) / 100));
    const freeKi = totalKi - usedKi;
    const buffKi = Math.floor(totalKi * 0.12);
    const swapTotal = totalKi / 2;
    // -m muestra MiB enteros; si no, Ki/Mi/Gi con 1024 (helper compartido).
    const fmt = (ki: number) => args.includes('-m')
      ? `${Math.round(ki / 1024)}`
      : formatBytesBinary(ki * 1024);
    const h = ['Mem:', 'Swap:'];
    return { output: [
      '               total        used        free      shared  buff/cache   available',
      `${h[0].padEnd(7)}${fmt(totalKi).padStart(13)}${fmt(usedKi).padStart(13)}${fmt(freeKi - buffKi).padStart(13)}${fmt(Math.floor(totalKi * 0.02)).padStart(13)}${fmt(buffKi).padStart(13)}${fmt(freeKi).padStart(12)}`,
      `${h[1].padEnd(7)}${fmt(swapTotal).padStart(13)}${fmt(0).padStart(13)}${fmt(swapTotal).padStart(13)}`,
    ].join('\n') };
  },
};

export const cmd_arch = {
  name: 'arch',
  execute: (_args: string[], _ctx: CommandContext): CommandResponse => ({ output: 'x86_64' }),
};

export const cmd_lscpu = {
  name: 'lscpu',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) return { output: 'Usage: lscpu\nDisplay CPU information.' };
    const os = ctx.machine.machine_info.os ?? '';
    const model = os.toLowerCase().includes('kali') || os.toLowerCase().includes('ubuntu') ? 'Intel(R) Core(TM) i7-9700K' : 'Intel(R) Core(TM) i5-8400';
    return { output: [
      'Architecture:                    x86_64',
      '  CPU op-mode(s):                32-bit, 64-bit',
      'CPU(s):                          8',
      '  On-line CPU(s) list:           0-7',
      'Thread(s) per core:              1',
      'Core(s) per socket:              8',
      'Socket(s):                       1',
      'Vendor ID:                       GenuineIntel',
      `Model name:                      ${model}`,
      '    BIOS model name:             Virtual machine',
      'Virtualization:                  none',
      'L1d cache:                       32K',
      'L1i cache:                       32K',
      'L2 cache:                        256K',
      'L3 cache:                        12M',
    ].join('\n') };
  },
};

export const cmd_hostnamectl = {
  name: 'hostnamectl',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const m = ctx.machine;
    if (args.includes('-h') || args.includes('--help')) return { output: 'Usage: hostnamectl\nShow system hostname and related information.' };
    const host = m.machine_info.hostname ?? 'host';
    const os = m.machine_info.os ?? 'Linux';
    let seed = 7; for (const c of host) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
    const kernel = os.toLowerCase().includes('kali') ? 'Linux 6.6.9-amd64' : os.includes('22.04') ? 'Linux 5.15.0-91-generic' : 'Linux 5.4.0-169-generic';
    return { output: [
      `   Static hostname: ${host}`,
      `         Icon name: computer-vm`,
      `           Chassis: vm`,
      `        Machine ID: ${seed.toString(16).padStart(8, '0')}${(seed * 17).toString(16).padStart(8, '0')}${(seed * 257).toString(16).padStart(8, '0')}${(seed % 65535).toString(16).padStart(4, '0')}`,
      `           Boot ID: ${(seed ^ 0xdeadbeef).toString(16)}${(seed >>> 1).toString(16)}`,
      '    Virtualization: none',
      `  Operating System: ${os}`,
      `            Kernel: ${kernel}`,
      '      Architecture: x86-64',
    ].join('\n') };
  },
};

export const cmd_lsb_release = {
  name: 'lsb_release',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const os = ctx.machine.machine_info.os ?? '';
    if (args.includes('-h') || args.includes('--help') || args.length === 0) {
      return { output: 'Usage: lsb_release [OPTION]\nShow distribution information.\n  -a  all fields\n  -d  description only\n  -r  release only\n  -c  codename only' };
    }
    const isUbuntu = /ubuntu/i.test(os);
    const fields = {
      'Distributor ID': isUbuntu ? 'Ubuntu' : os.toLowerCase().includes('kali') ? 'Kali' : 'Debian',
      'Description': os,
      'Release': os.match(/(\d+\.\d+)/)?.[1] ?? (os.toLowerCase().includes('kali') ? '2024.2' : 'rolling'),
      'Codename': isUbuntu ? (os.includes('22.04') ? 'jammy' : os.includes('20.04') ? 'focal' : 'jammy') : 'kali-rolling',
    };
    if (args.includes('-a')) return { output: Object.entries(fields).map(([k, v]) => `${k}:${'\t'}${v}`).join('\n') };
    for (const [fb, key] of [['-d', 'Description'], ['-r', 'Release'], ['-c', 'Codename'], ['-i', 'Distributor ID']] as const) {
      if (args.includes(fb)) return { output: `${key}:\t${fields[key as keyof typeof fields]}` };
    }
    return { output: 'Usage: lsb_release -a' , isError: true };
  },
};

export const cmd_w = {
  name: 'w',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) return { output: 'Usage: w\nShow who is logged in and what they are doing.' };
    const now = virtualTime(ctx.machine);
    const secs = Math.max(0, Math.floor((now.getTime() - bootTime(ctx).getTime()) / 1000));
    const user = getCurrentUser(ctx.machine).username;
    const host = ctx.machine.machine_info.hostname ?? 'host';
    return { output: [
      ` ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} up ${fmtUptime(secs)},  1 user,  load average: ${loadAvg(host)}`,
      'USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT',
      `${user.padEnd(8)} tty7     :0               ${String(now.getHours()).padStart(2, '0')}:01    0.00s  0.05s  0.02s w`,
    ].join('\n') };
  },
};

export const cmd_last = {
  name: 'last',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) return { output: 'Usage: last\nShow listing of last logged in users.' };
    const user = getCurrentUser(ctx.machine).username;
    const b = bootTime(ctx);
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const when = `${day[b.getDay()]} ${MONTHS[b.getMonth()]} ${String(b.getDate()).padStart(2, ' ')} ${String(b.getHours()).padStart(2, '0')}:${String(b.getMinutes()).padStart(2, '0')}`;
    return { output: [
      `${user.padEnd(8)} pts/0        :0               ${when}   still logged in`,
      `reboot   system boot  6.1.0-kali7-amd64 ${when}   still running`,
      '',
      'wtmp begins Sun Sep  1 00:00:00 2026',
    ].join('\n') };
  },
};

// Re-export para que top/htop no dupliquen
export function countProcesses(ctx: CommandContext): number {
  return listProcesses(ctx.machine).length;
}

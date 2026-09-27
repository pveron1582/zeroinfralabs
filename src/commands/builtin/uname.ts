// ── commands/builtin/uname.ts ─────────────────────────────────────
// Nombre e información del sistema (Tier 1). Deriva del SO de la máquina.

import type { CommandContext, CommandResponse } from '../../types';

const UNAME_HELP = `Usage: uname [OPTION]
Print system information.

Options:
  -a  All information (kernel, hostname, version, arch)
  -s  Kernel name (default)
  -n  Network node hostname
  -r  Kernel release
  -v  Kernel version (build)
  -m  Machine hardware (arch)
  -o  Operating system

Examples:
  uname
  uname -a
  uname -r`;

function kernelFor(os: string): { release: string; version: string } {
  const lower = (os || '').toLowerCase();
  if (lower.includes('kali')) {
    return { release: '6.6.9-amd64', version: '#1 SMP PREEMPT_DYNAMIC Kali 6.6.9-1kali1 (2024-01-08)' };
  }
  if (lower.includes('22.04') || lower.includes('22,04')) {
    return { release: '5.15.0-91-generic', version: '#116-Ubuntu SMP Wed Jan 25 21:13:00 UTC 2023' };
  }
  if (lower.includes('20.04')) {
    return { release: '5.4.0-169-generic', version: '#187-Ubuntu SMP Thu Nov 23 14:52:28 UTC 2023' };
  }
  if (lower.includes('windows')) {
    return { release: '10.0.19045', version: 'Microsoft Windows [Version 10.0.19045]' };
  }
  return { release: '5.15.0-91-generic', version: '#116-Ubuntu SMP Wed Jan 25 21:13:00 UTC 2023' };
}

export const cmd_uname = {
  name: 'uname',
  execute: (args: string[], { machine }: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) return { output: UNAME_HELP };

    const os = machine?.machine_info?.os ?? 'Linux';
    const hostname = machine?.machine_info?.hostname ?? 'localhost';
    const { release, version } = kernelFor(os);

    const LONG: Record<string, string> = {
      '--all': 'a', '--kernel-name': 's', '--nodename': 'n', '--kernel-release': 'r',
      '--kernel-version': 'v', '--machine': 'm', '--operating-system': 'o',
    };
    if (args.includes('--version')) return { output: 'uname (GNU coreutils) 9.1' };

    const flags = new Set<string>();
    for (const a of args) {
      if (a === '-' || !a.startsWith('-')) continue;
      if (a.startsWith('--')) {
        if (LONG[a]) { flags.add(LONG[a]); continue; }
        return { output: `uname: unrecognized option '${a}'\nTry 'uname --help' for more information.`, isError: true };
      }
      for (const f of a.slice(1)) {
        if (!'asnrvmo'.includes(f)) {
          return { output: `uname: invalid option -- '${f}'\nTry 'uname --help' for more information.`, isError: true };
        }
        flags.add(f);
      }
    }

    if (flags.size === 0) return { output: 'Linux' };
    if (flags.has('a')) {
      return { output: `Linux ${hostname} ${release} ${version} x86_64 GNU/Linux` };
    }
    const parts: string[] = [];
    if (flags.has('s')) parts.push('Linux');
    if (flags.has('n')) parts.push(hostname);
    if (flags.has('r')) parts.push(release);
    if (flags.has('v')) parts.push(version);
    if (flags.has('m')) parts.push('x86_64');
    if (flags.has('o')) parts.push('GNU/Linux');
    return { output: parts.join(' ') };
  },
};

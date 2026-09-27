// ── commands/builtin/hostname.ts ──────────────────────────────────
// Muestra o cambia el hostname (Tier 1). -I/-i reportan la IP local,
// útil en labs para saber desde dónde se ataca.

import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser, isRoot } from '../../utils/users';

const HOSTNAME_HELP = `Usage: hostname [OPTION] [new-name]
Print or set the system host name.

Options:
  -f  Alias of the bare hostname (FQDN in this simulator)
  -i  IP address of the host
  -I  All IP addresses (same as -i here)

Examples:
  hostname
  hostname -I
  hostname webserver      # requires root`;

export const cmd_hostname = {
  name: 'hostname',
  execute: (args: string[], { machine }: CommandContext): CommandResponse => {
    const hostname = machine?.machine_info?.hostname ?? 'localhost';
    const ip = machine?.machine_info?.ip ?? '127.0.0.1';

    const flags = args.filter(a => a.startsWith('-'));
    if (flags.includes('-h') || flags.includes('--help')) return { output: HOSTNAME_HELP };
    if (flags.some(f => f !== '-f' && f !== '-i' && f !== '-I' && f !== '--fqdn')) {
      return { output: `hostname: invalid option\nTry 'hostname --help' for more information.`, isError: true };
    }

    const positional = args.filter(a => !a.startsWith('-'));
    if (positional.length === 0) {
      if (flags.includes('-i') || flags.includes('-I')) return { output: ip };
      return { output: hostname };
    }

    // Cambiar hostname: solo root (como el real)
    const user = machine ? getCurrentUser(machine) : null;
    if (!machine || !isRoot(user)) {
      return { output: 'hostname: you must be root to change host name', isError: true };
    }
    const next = positional[0];
    if (!/^[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?$/.test(next)) {
      return { output: `hostname: invalid host name '${next}'`, isError: true };
    }
    machine.machine_info.hostname = next;
    return { output: '' };
  },
};

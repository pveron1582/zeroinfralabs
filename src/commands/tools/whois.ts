// ── commands/tools/whois.ts ───────────────────────────────────────
// whois (Tier 1): reporte sintético consistente por host del simulador.

import type { CommandContext, CommandResponse } from '../../types';

const WHOIS_HELP = `Usage: whois HOST
Query the whois database for a host.

Examples:
  whois 192.168.1.10
  whois target.com`;

export const cmd_whois = {
  name: 'whois',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) return { output: WHOIS_HELP };
    const host = args.find(a => !a.startsWith('-'));
    if (!host) return { output: 'Usage: whois HOST', isError: true };

    const m = ctx.allMachines.find(x => x.machine_info.ip === host || x.machine_info.hostname === host);
    if (!m) return { output: `whois: host not found: ${host}\nNo match for '${host}' in the lab registry.`, isError: true };

    const today = new Date();
    const iso = (d: Date) => d.toISOString().split('T')[0];
    const created = new Date(2023, 0, 1);
    const updated = new Date(today.getFullYear() - 1, 3, 25);
    const registrar = m.machine_info.type === 'workstation' ? 'Netlab Clients Inc.' : 'Netlab Hosting LLC';
    const org = m.machine_info.hostname.replace(/[^a-zA-Z0-9]/g, '');

    return { output: `% This is the ZI Labs whois server.
% Notice: this is a virtual record for the lab.

domain:       ${host}
created:      ${iso(created)}
changed:      ${iso(updated)}
organisation: ${org || 'VirtualOrg'}
registrar:    ${registrar}

% For more information on this host, see its network profile.
` };
  },
};

// ── commands/builtin/ufw.ts ─────────────────────────────────────────
// Simulador de Uncomplicated Firewall (ROADMAP Fase 6.2). Wrapper sobre
// las reglas de networkState. Al habilitarse, el firewall aplica un
// default-deny sobre INPUT: los puertos sin regla ACCEPT quedan filtrados.

import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser, isRoot } from '../../utils/users';
import {
  addRule, deleteRule, isUfwEnabled, listRules, resetUfw, setUfwEnabled,
} from '../../frameworks/network/networkState';

const UFW_HELP = `Usage: ufw <command> [options]
  status            Show firewall status and rules
  enable            Enable the firewall (default deny incoming)
  disable           Disable the firewall
  allow <service>   Allow incoming traffic (e.g. 'ufw allow 22/tcp' or 'ufw allow ssh')
  deny <service>    Deny incoming traffic (e.g. 'ufw deny 80')
  reject <service>  Reject incoming traffic (ICMP port unreachable)
  delete <service>  Delete the rule matching <service>
  reset             Disable and flush all rules

Examples:
  ufw status
  ufw enable
  ufw allow 22/tcp
  ufw allow http
  ufw deny 3306`;

const SERVICE_PORTS: Record<string, { port: number; protocol: string }> = {
  ssh: { port: 22, protocol: 'tcp' },
  http: { port: 80, protocol: 'tcp' },
  www: { port: 80, protocol: 'tcp' },
  https: { port: 443, protocol: 'tcp' },
  ftp: { port: 21, protocol: 'tcp' },
  mysql: { port: 3306, protocol: 'tcp' },
  smtp: { port: 25, protocol: 'tcp' },
  dns: { port: 53, protocol: 'udp' },
  'netbios-ssn': { port: 139, protocol: 'tcp' },
  'microsoft-ds': { port: 445, protocol: 'tcp' },
  rdp: { port: 3389, protocol: 'tcp' },
};

function parseServiceSpec(spec: string): { port: number; protocol: string } | null {
  const trimmed = spec.trim();
  const portProto = trimmed.match(/^(\d+)\/(tcp|udp)$/);
  if (portProto) return { port: Number(portProto[1]), protocol: portProto[2] };
  if (/^\d+$/.test(trimmed)) return { port: Number(trimmed), protocol: 'all' };
  return SERVICE_PORTS[trimmed.toLowerCase()] ?? null;
}

export const cmd_ufw = {
  name: 'ufw',
  execute: (args: string[], { machine }: CommandContext): CommandResponse => {
    if (!args.length || args.includes('-h') || args.includes('--help')) {
      return { output: UFW_HELP, isError: !args.length };
    }

    const [action, ...rest] = args;
    const user = getCurrentUser(machine);

    if (action === 'status') {
      return { output: statusOutput(machine.id) };
    }

    if (!isRoot(user)) {
      return { output: 'ufw: Operation not permitted (must be root).', isError: true };
    }

    switch (action) {
      case 'enable':
        setUfwEnabled(machine.id, true);
        return { output: 'Firewall is active and enabled on system startup' };
      case 'disable':
        setUfwEnabled(machine.id, false);
        return { output: 'Firewall stopped and disabled on system startup' };
      case 'allow':
      case 'deny':
      case 'reject': {
        const spec = rest.find(a => !a.startsWith('-'));
        if (!spec) return { output: 'ufw: missing port or service (e.g. `ufw allow 22/tcp`).', isError: true };
        const parsed = parseServiceSpec(spec);
        if (!parsed) return { output: `ufw: invalid port/service: '${spec}'`, isError: true };
        const target = action === 'allow' ? 'ACCEPT' : action === 'deny' ? 'DROP' : 'REJECT';
        addRule(machine.id, {
          chain: 'INPUT',
          protocol: parsed.protocol,
          dport: parsed.port,
          target,
          sourceType: 'ufw',
        });
        return { output: `Rule added` };
      }
      case 'delete': {
        const spec = rest.find(a => !a.startsWith('-'));
        if (!spec) return { output: 'ufw: missing rule to delete.', isError: true };
        const parsed = parseServiceSpec(spec);
        if (!parsed) return { output: `ufw: invalid port/service: '${spec}'`, isError: true };
        const rules = listRules(machine.id);
        const matching = rules.filter(r =>
          r.sourceType === 'ufw' &&
          (parsed.protocol === 'all' || r.protocol === parsed.protocol) &&
          r.dport === parsed.port
        );
        if (matching.length === 0) return { output: 'ufw: no matching rule to delete.', isError: true };
        const rule = matching[0];
        const idxInChain = rules.filter(r => r.chain === rule.chain).indexOf(rule) + 1;
        deleteRule(machine.id, rule.chain, idxInChain);
        return { output: 'Rule deleted' };
      }
      case 'reset': {
        resetUfw(machine.id);
        return { output: 'Resetting all rules to installed defaults. This can be disruptive.' };
      }
      default:
        return { output: `ufw: unrecognized command '${action}'\nTry "ufw -h" for help.`, isError: true };
    }
  }
};

function statusOutput(machineId: string): string {
  const enabled = isUfwEnabled(machineId);
  const rules = listRules(machineId).filter(r => r.sourceType === 'ufw' && r.chain === 'INPUT');
  let out = `Status: ${enabled ? 'active' : 'inactive'}\n`;
  out += `\nTo                         Action      From\n`;
  out += `--                         ------      ----\n`;
  if (rules.length === 0) {
    out += `(no rules)`;
  } else {
    rules.forEach(r => {
      const proto = r.protocol === 'all' ? '' : `/${r.protocol}`;
      const portStr = `${r.dport}${proto}`.padEnd(26);
      const action = r.target === 'ACCEPT' ? 'ALLOW' : r.target === 'DROP' ? 'DENY' : 'REJECT';
      out += `${portStr}${action.padEnd(11)}Anywhere\n`;
    });
  }
  return out;
}

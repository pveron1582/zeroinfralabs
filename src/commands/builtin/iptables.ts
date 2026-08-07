// ── commands/builtin/iptables.ts ────────────────────────────────────
// Simulador de iptables (ROADMAP Fase 6.1). Gestiona reglas del firewall
// por máquina vía networkState. Las reglas DROP/REJECT filtran los puertos
// que reporta nmap/ss/netstat.

import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser, isRoot } from '../../utils/users';
import {
  addRule, deleteRule, flushRules, listRules, setPolicy,
  getPolicy, type FirewallChain, type FirewallRule, type FirewallTarget,
} from '../../frameworks/network/networkState';

const CHAINS: FirewallChain[] = ['INPUT', 'OUTPUT', 'FORWARD'];
const TARGETS: FirewallTarget[] = ['ACCEPT', 'DROP', 'REJECT'];

const IPTABLES_HELP = `Usage: iptables [options]
  -L, --list          List rules in all chains (or one chain)
  -S                  Show rules as commands
  -A, --append <chain> <rulespec>   Append a rule
  -D, --delete <chain> <rulenum>    Delete rule by number
  -F, --flush [chain] Flush rules (all chains if none given)
  -P, --policy <chain> <target>     Set default policy (DROP/ACCEPT)

Examples:
  iptables -L
  iptables -A INPUT -p tcp --dport 22 -j DROP
  iptables -A INPUT -s 192.168.1.5 -j DROP
  iptables -P INPUT DROP
  iptables -D INPUT 1
  iptables -F INPUT`;

export const cmd_iptables = {
  name: 'iptables',
  execute: (args: string[], { machine }: CommandContext): CommandResponse => {
    if (!args.length || args.includes('-h') || args.includes('--help')) {
      return { output: IPTABLES_HELP, isError: !args.length };
    }

    // ── Listar ──
    if (args.includes('-L') || args.includes('--list') || args.includes('-S')) {
      const chainArg = args.find(a => !a.startsWith('-'));
      return { output: listOutput(machine.id, chainArg as FirewallChain) };
    }

    const user = getCurrentUser(machine);
    if (!isRoot(user)) {
      return { output: 'iptables: Operation not permitted (must be root).', isError: true };
    }

    // ── Política por defecto ──
    const policyIdx = args.indexOf('-P') >= 0 ? args.indexOf('-P') : args.indexOf('--policy');
    if (policyIdx >= 0) {
      const chain = args[policyIdx + 1] as FirewallChain;
      const target = args[policyIdx + 2] as FirewallTarget;
      if (!CHAINS.includes(chain)) return { output: `iptables: cadena inválida: ${chain}`, isError: true };
      if (!TARGETS.includes(target)) return { output: `iptables: target inválido: ${target}`, isError: true };
      setPolicy(machine.id, chain, target);
      return { output: `Set default policy for ${chain} to ${target}` };
    }

    // ── Flush ──
    const flushIdx = args.indexOf('-F') >= 0 ? args.indexOf('-F') : args.indexOf('--flush');
    if (flushIdx >= 0) {
      const chain = args[flushIdx + 1];
      if (chain && !CHAINS.includes(chain as FirewallChain)) return { output: `iptables: cadena inválida: ${chain}`, isError: true };
      flushRules(machine.id, chain as FirewallChain | undefined);
      return { output: chain ? `Flushed chain ${chain}` : 'Flushed all chains' };
    }

    // ── Delete ──
    const delIdx = args.indexOf('-D') >= 0 ? args.indexOf('-D') : args.indexOf('--delete');
    if (delIdx >= 0) {
      const chain = args[delIdx + 1] as FirewallChain;
      const ruleNum = Number(args[delIdx + 2]);
      if (!CHAINS.includes(chain)) return { output: `iptables: cadena inválida: ${chain}`, isError: true };
      if (isNaN(ruleNum) || ruleNum < 1) return { output: 'iptables: número de regla inválido.', isError: true };
      if (!deleteRule(machine.id, chain, ruleNum)) return { output: `iptables: Bad rule (does a matching rule exist in that chain?).`, isError: true };
      return { output: `Deleted rule ${ruleNum} in chain ${chain}` };
    }

    // ── Append ──
    const appIdx = args.indexOf('-A') >= 0 ? args.indexOf('-A') : args.indexOf('--append');
    if (appIdx >= 0) {
      const parsed = parseAppend(args, appIdx);
      if (!parsed.ok) return { output: parsed.error, isError: true };
      const rule = addRule(machine.id, parsed.rule);
      return { output: `Added rule ${rule.id} (${rule.target}) to chain ${rule.chain}` };
    }

    return { output: 'Usage: iptables -L | -A <chain> <rulespec> | -D <chain> <n> | -F [chain] | -P <chain> <target>\nTry "iptables -h" for full help.', isError: true };
  }
};

// ── Helpers ──

function parseAppend(
  args: string[],
  appIdx: number
): { ok: true; rule: Omit<FirewallRule, 'id' | 'sourceType'> & { sourceType?: 'iptables' | 'ufw' } } | { ok: false; error: string } {
  const chain = args[appIdx + 1] as FirewallChain;
  if (!CHAINS.includes(chain)) return { ok: false, error: `iptables: cadena inválida: ${chain}` };

  const rule: Omit<FirewallRule, 'id' | 'sourceType'> & { sourceType?: 'iptables' | 'ufw' } = { chain, target: 'ACCEPT', sourceType: 'iptables' };

  for (let i = appIdx + 2; i < args.length; i++) {
    const tok = args[i];
    switch (tok) {
      case '-p':
        rule.protocol = args[++i];
        break;
      case '--dport':
      case '--dports':
        rule.dport = Number(args[++i]);
        break;
      case '--sport':
      case '--sports':
        rule.sport = Number(args[++i]);
        break;
      case '-s':
        rule.source = args[++i];
        break;
      case '-j':
      case '--jump': {
        const target = args[++i] as FirewallTarget;
        if (!TARGETS.includes(target)) return { ok: false, error: `iptables: target inválido: ${target}` };
        rule.target = target;
        break;
      }
      case '-m':
      case '--state':
      case '--syn':
        i++;
        break;
      default:
        if (!tok.startsWith('-')) break;
    }
  }
  return { ok: true, rule };
}

function ruleToLine(rule: FirewallRule): string {
  const target = rule.target.padEnd(7);
  const prot = (rule.protocol || 'all').padEnd(6);
  const source = (rule.source || '0.0.0.0/0').padEnd(20);
  const dest = '0.0.0.0/0';
  let extra = '';
  if (rule.sport !== undefined) extra += `spt:${rule.sport}`;
  if (rule.dport !== undefined) extra += `${extra ? ' ' : ''}dpt:${rule.dport}`;
  return `${target}  ${prot}--  ${source}  ${dest}${extra ? `  ${extra}` : ''}`;
}

function listOutput(machineId: string, onlyChain?: FirewallChain): string {
  const rules = listRules(machineId);
  const chains: FirewallChain[] = onlyChain ? [onlyChain] : CHAINS;
  let out = '';
  chains.forEach(chain => {
    const policy = getPolicy(machineId, chain);
    const chainRules = rules.filter(r => r.chain === chain);
    out += `Chain ${chain} (policy ${policy})\n`;
    out += `target     prot opt source               destination\n`;
    if (chainRules.length === 0) {
      out += `\n`;
    } else {
      chainRules.forEach(r => {
        out += `${ruleToLine(r)}\n`;
      });
      out += `\n`;
    }
  });
  return out.trimEnd();
}

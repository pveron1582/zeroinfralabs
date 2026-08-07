// ── commands/builtin/traceroute.ts ─────────────────────────────────
// Simulador de traceroute
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.

import type { CommandContext, CommandResponse } from '../../types';

const TRACEROUTE_HELP = `Usage: traceroute [options] <host>
Options:
  -m <max_ttl>  Set the max number of hops (default: 30)
  -q <nqueries> Set the number of probes per hop (default: 3)
  -w <waittime> Time to wait for response in seconds (default: 5)
  -h            Display this help

Examples:
  traceroute 192.168.1.10
  traceroute -m 20 google.com`;

const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

export const cmd_traceroute = {
  name: 'traceroute',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) {
      return { output: TRACEROUTE_HELP };
    }

    let maxTtl = 30, queries = 3;
    let target: string | undefined;

    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '-m': maxTtl = parseInt(args[++i], 10); break;
        case '-q': queries = parseInt(args[++i], 10); break;
        default:
          if (!target && !args[i].startsWith('-')) target = args[i];
      }
    }

    if (!target) {
      return { output: 'traceroute: usage error: Hostname required\n\n' + TRACEROUTE_HELP, isError: true };
    }

    if (!IP_REGEX.test(target)) {
      return { output: `traceroute: ${target}: Name or service not known`, isError: true };
    }

    const attackerIp = ctx.machine?.machine_info?.ip || '192.168.1.5';
    const [base1, base2] = attackerIp.split('.');

    let output = `traceroute to ${target} (${target}), ${maxTtl} hops max, 60 byte packets\n`;

    // Check if target exists
    const targetMachine = ctx.allMachines.find(m => m.machine_info.ip === target);
    
    if (!targetMachine) {
      // Target doesn't exist - show timeouts for all hops
      for (let hop = 1; hop <= Math.min(15, maxTtl); hop++) {
        output += ` ${hop.toString().padStart(2)}  `;
        for (let q = 0; q < queries; q++) {
          output += `* `;
        }
        output += `\n`;
      }
      output += `\nDestination not reached after ${Math.min(15, maxTtl)} hops\n`;
      return { output };
    }

    // Target exists - simulate path
    // Determine how many hops based on IP difference
    const targetParts = target.split('.').map(Number);
    const attackerParts = attackerIp.split('.').map(Number);
    
    // Calculate hops needed (simulated)
    const hopCount = targetParts[3] === attackerParts[3] ? 1 : 
                     Math.abs(targetParts[3] - attackerParts[3]) <= 10 ? 2 : 3;

    // Generate intermediate hops
    for (let hop = 1; hop <= hopCount; hop++) {
      const hopIp = hop === hopCount ? target : `${base1}.${base2}.${hop}.${Math.floor(Math.random() * 254 + 1)}`;
      
      output += ` ${hop.toString().padStart(2)}  `;
      
      if (hop === hopCount) {
        // Last hop - target reached
        for (let q = 0; q < queries; q++) {
          const time = (Math.random() * 2.0 + 0.5).toFixed(3);
          output += `${time} ms  `;
        }
        output += `${target} (${target})\n`;
      } else {
        // Intermediate hop
        for (let q = 0; q < queries; q++) {
          const time = (hop * Math.random() + 0.5).toFixed(3);
          output += `${time} ms  `;
        }
        output += `${hopIp} (${hopIp})\n`;
      }
    }

    return { output };
  }
};

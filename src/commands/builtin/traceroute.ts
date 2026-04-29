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

export const cmd_traceroute = {
  name: 'traceroute',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    // Help flag
    if (args.includes('-h') || args.includes('--help')) {
      return { output: TRACEROUTE_HELP };
    }

    // Parse flags
    const maxTtlIdx = args.indexOf('-m');
    const maxTtl = maxTtlIdx >= 0 ? parseInt(args[maxTtlIdx + 1], 10) : 30;
    
    const queriesIdx = args.indexOf('-q');
    const queries = queriesIdx >= 0 ? parseInt(args[queriesIdx + 1], 10) : 3;
    
    const waitIdx = args.indexOf('-w');
    const waitTime = waitIdx >= 0 ? parseInt(args[waitIdx + 1], 10) : 5;

    // Find target (first non-flag argument)
    const target = args.find((arg, idx) => {
      if (arg.startsWith('-')) return false;
      if (idx > 0 && args[idx - 1].startsWith('-')) {
        const prevFlag = args[idx - 1];
        if (['-m', '-q', '-w'].includes(prevFlag)) return false;
      }
      return true;
    });

    if (!target) {
      return { output: 'traceroute: usage error: Hostname required\n\n' + TRACEROUTE_HELP, isError: true };
    }

    // Validate IP format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(target)) {
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
        const hopIp = `${base1}.${base2}.0.${hop}`;
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

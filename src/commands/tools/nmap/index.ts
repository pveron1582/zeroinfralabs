// ── commands/tools/nmap/index.ts ─────────────────────────────────
// Simulador de escaneo de puertos Nmap con flags realistas
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.
// Solo reporta resultados del escaneo para que el laboratorio valide.
//
// Estructura modular:
//   flags.ts    — parseo de flags de CLI
//   help.ts     — texto de help (-h/--help)
//   vendors.ts  — lookup de vendor por MAC (OUI)
//   ports.ts    — parseo de -p/-p- y estado efectivo (firewall/servicios)
//   cidr.ts     — aritmética de redes CIDR
//   outfiles.ts — escritura de -oN/-oG con permisos Unix
//   pingScan.ts — escaneos de descubrimiento (-sn/-sP)
//   portScan.ts — escaneo completo de puertos

import type { CommandContext, CommandResponse } from '../../../types';
import { NMAP_HELP } from './help';
import { parseFlags, extractTargetSpec } from './flags';
import { performNetworkPingScan, performPingScan } from './pingScan';
import { performPortScan } from './portScan';

export const cmd_nmap = {
  name: 'nmap',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.includes('--help') || args.includes('-h')) return { output: NMAP_HELP };
    if (!args.length) return { output: 'Usage: nmap [Scan Type] [Options] <target>\nExample: nmap -sV -p 22,80 192.168.1.10\nFor full help, run: nmap -h or nmap --help', isError: true };

    const flags = parseFlags(args);

    // ── Parse target (IP or CIDR) ──
    const targetSpec = extractTargetSpec(args);
    if (!targetSpec) return { output: 'Error: especifica una IP o red válida (ej: 192.168.1.10 o 192.168.1.0/24).', isError: true };

    // ── Handle CIDR ping scan (-sn with network) ──
    if (targetSpec.includes('/')) {
      if (flags.isPingScan) {
        return performNetworkPingScan(targetSpec, ctx, flags.vLevel);
      }
      return { output: `Nmap: Failed to resolve "${targetSpec}".`, isError: true };
    }

    // ── Single IP target ──
    const target = ctx.allMachines.find(m => m.machine_info.ip === targetSpec);
    if (!target) return { output: `Nmap: Failed to resolve "${targetSpec}".`, isError: true };

    if (flags.isPingScan) {
      return performPingScan(target, targetSpec, flags.vLevel);
    }

    return performPortScan(target, targetSpec, args, flags, ctx);
  }
};

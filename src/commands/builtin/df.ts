// ── commands/builtin/df.ts ──────────────────────────────────────────
// Simulador de df (ROADMAP Fase 9.2). Muestra espacio en disco de cada
// montaje, basado en la cantidad de archivos del filesystem virtual.

import type { CommandContext, CommandResponse } from '../../types';
import { getMounts } from '../../frameworks/fs/mounts';

const TOTAL_MB = 20 * 1024; // 20 GB
const BASE_USED_MB = 4096;

function human(sizeMb: number): string {
  if (sizeMb >= 1024) return `${(sizeMb / 1024).toFixed(1)}G`;
  return `${sizeMb}M`;
}

function usageFor(machine: CommandContext['machine']): number {
  return BASE_USED_MB + machine.files.length * 2;
}

function dfLine(mountpoint: string, total: number, used: number): string {
  const avail = Math.max(0, total - used);
  const pct = Math.round((used / total) * 100);
  const dev = mountpoint === '/' ? '/dev/sda1' : mountpoint;
  return `${dev.padEnd(14)} ${human(total).padEnd(5)} ${human(used).padEnd(5)} ${human(avail).padEnd(5)} ${String(pct).padStart(2)}% ${mountpoint}`;
}

export const cmd_df = {
  name: 'df',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const machine = ctx.machine;
    const human = args.includes('-h') || args.includes('--human-readable');
    const positional = args.filter(a => !a.startsWith('-'));
    const mounts = getMounts(machine);
    const total = TOTAL_MB;
    const used = usageFor(machine);

    let header = 'Filesystem';
    if (human) header = 'Filesystem      Size  Used Avail Use% Mounted on';

    let targets = mounts;
    if (positional.length > 0) {
      const wanted = positional.map(p => (p.endsWith('/') ? p : p + '/'));
      targets = mounts.filter(m => wanted.includes(m.mountpoint) || wanted.includes(m.mountpoint + '/'));
    }

    if (targets.length === 0) {
      return { output: `df: ${positional[0]}: No such file or directory`, isError: true };
    }

    const lines = targets.map(m => dfLine(m.mountpoint, total, used));
    return { output: `${header}\n${lines.join('\n')}`, isError: false };
  }
};

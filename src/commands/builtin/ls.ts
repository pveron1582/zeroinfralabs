// ── commands/builtin/ls.ts ────────────────────────────────────────
// Lista archivos en el directorio actual

import type { CommandContext, CommandResponse } from '../../types';

// Stable file sizes (deterministic, no Math.random)
const FILE_SIZE_SEED: Record<string, number> = {};
function stableSize(path: string): number {
  if (!FILE_SIZE_SEED[path]) {
    let h = 0;
    for (let i = 0; i < path.length; i++) h = ((h << 5) - h + path.charCodeAt(i)) | 0;
    FILE_SIZE_SEED[path] = Math.abs(h % 900) + 100;
  }
  return FILE_SIZE_SEED[path];
}

export const cmd_ls = {
  name: 'ls',
  execute: (_: string[], { machine }: CommandContext): CommandResponse => {
    if (!machine.files?.length) return { output: 'total 0' };
    let out = `total ${machine.files.length * 4}\n`;
    machine.files.forEach(f => {
      const name = f.path.split('/').pop()!;
      out += `-rw-r--r-- 1 admin admin ${stableSize(f.path)} Jan 01 00:00 ${name}\n`;
    });
    return { output: out };
  }
};

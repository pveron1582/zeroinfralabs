// ── commands/builtin/du.ts ──────────────────────────────────────────
// Simulador de du (ROADMAP Fase 9.2). Tamaño de directorios basado en
// los archivos del filesystem virtual (contenido + bloque base 4K).

import type { CommandContext, CommandResponse } from '../../types';
import { findDirEntry } from '../../utils/fs';
import { getCurrentUser } from '../../utils/users';
import { canExecute } from '../../utils/permissions';

const DIR_BLOCK = 4096;

function entrySize(entry: { content?: string; type?: string }): number {
  if (entry.type === 'symlink') return 4096;
  return Math.max(4096, (entry.content ?? '').length);
}

function sizeOf(machine: CommandContext['machine'], dir: string): { bytes: number; files: number } {
  let bytes = DIR_BLOCK;
  let files = 0;
  for (const f of machine.files || []) {
    if (f.path.startsWith(dir + '/')) {
      if (f.path.endsWith('/.dir')) {
        bytes += DIR_BLOCK;
      } else {
        bytes += entrySize(f);
        files++;
      }
    }
  }
  return { bytes, files };
}

function humanSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}G`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${bytes}`;
}

function normalizeDir(raw: string, currentDir: string): string {
  if (raw.startsWith('/')) return raw.replace(/\/+$/, '') || '/';
  return ((currentDir || '/').replace(/\/$/, '') + '/' + raw.replace(/^\.\//, '')).replace(/\/+$/, '') || '/';
}

export const cmd_du = {
  name: 'du',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const machine = ctx.machine;
    const hasFlag = (c: string) => args.some(a => a.startsWith('-') && a !== '-' && a.includes(c));
    const human = hasFlag('h');
    const summarize = hasFlag('s');
    const all = hasFlag('a');
    const positional = args.filter(a => !a.startsWith('-'));
    const target = positional[0] || '.';

    const dir = normalizeDir(target, ctx.currentDir || '/');
    const user = getCurrentUser(machine);

    const dirEntry = findDirEntry(machine, dir);
    if (!dirEntry) {
      return { output: `du: cannot access '${target}': No such file or directory`, isError: true };
    }
    if (!canExecute(machine, dirEntry, user)) {
      return { output: `du: cannot read '${target}': Permission denied`, isError: true };
    }

    const { bytes } = sizeOf(machine, dir);
    const label = human ? humanSize(bytes) : String(bytes);

    if (summarize || !all) {
      return { output: `${label}\t${dir}`, isError: false };
    }

    // Modo -a: listar cada subdirectorio
    const subdirs = new Set<string>();
    for (const f of machine.files || []) {
      if (!f.path.startsWith(dir + '/') || f.path === dir + '/.dir') continue;
      const rel = f.path.slice(dir.length + 1);
      const first = rel.split('/')[0];
      if (f.path.endsWith('/.dir')) subdirs.add(dir + '/' + first);
    }
    const lines = [dir, ...Array.from(subdirs).sort()].map(d => {
      const { bytes: b } = sizeOf(machine, d);
      return `${human ? humanSize(b) : b}\t${d}`;
    });
    return { output: lines.join('\n'), isError: false };
  }
};

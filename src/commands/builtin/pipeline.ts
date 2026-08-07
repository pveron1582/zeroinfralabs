// ── commands/builtin/pipeline.ts ───────────────────────────────────
// Filtros de pipe (ROADMAP Fase 7.3): grep, head, tail, wc, sort, uniq.
// Leen la entrada desde CommandContext.pipedInput. Cuando no hay pipe,
// actúan sobre un argumento de archivo (o stdin vacío en wc).

import type { CommandContext, CommandResponse } from '../../types';
import { findFile } from '../../utils/fs';

// ── helper: leer entrada (pipe > archivo) ──
function input(ctx: CommandContext, fileArg?: string): string | null {
  if (ctx.pipedInput !== undefined) return ctx.pipedInput;
  if (!fileArg) return null;
  const fullPath = fileArg.startsWith('/') ? fileArg : (ctx.currentDir?.replace(/\/$/, '') || '') + '/' + fileArg;
  const file = findFile(ctx.machine, fullPath);
  return file ? (file.content ?? '') : null;
}

// Líneas del contenido (ignora el salto de línea final)
function linesOf(data: string): string[] {
  const trimmed = data.replace(/\n$/, '');
  return trimmed === '' ? [] : trimmed.split('\n');
}

// Parsea opciones de conteo para head/tail: -n 5, -n5, --lines=5, -5
function parseLineCount(args: string[]): { count: number; rest: string[] } {
  let count = 10;
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--lines=')) count = parseInt(a.slice(8), 10) || 10;
    else if (a === '-n') { count = parseInt(args[i + 1] ?? '', 10) || 10; i++; }
    else if (a.startsWith('-n')) count = parseInt(a.slice(2), 10) || 10;
    else if (/^-\d+$/.test(a)) count = parseInt(a.slice(1), 10) || 10;
    else rest.push(a);
  }
  return { count, rest };
}

export const cmd_grep = {
  name: 'grep',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const opts = args.filter(a => a.startsWith('-'));
    const rest = args.filter(a => !a.startsWith('-'));
    if (rest.length === 0) {
      return { output: 'grep: missing pattern.\nUsage: grep [OPTIONS] PATTERN [FILE]', isError: true };
    }
    const pattern = rest[0];
    const hasFlag = (c: string) => opts.some(o => o !== '-' && o.includes(c));
    const invert = hasFlag('v');
    const ignoreCase = hasFlag('i');
    const recursive = hasFlag('r');
    let re: RegExp;
    try {
      re = new RegExp(pattern, ignoreCase ? 'i' : '');
    } catch (e) {
      return { output: `grep: invalid pattern '${pattern}'`, isError: true };
    }

    // ── grep -r: búsqueda recursiva sobre un directorio ──
    if (recursive) {
      const target = rest[1] || '.';
      const dir = target.startsWith('/') ? target.replace(/\/+$/, '') || '/' : (ctx.currentDir?.replace(/\/$/, '') || '') + '/' + target.replace(/^\.\//, '');
      const out: string[] = [];
      for (const f of ctx.machine.files || []) {
        if (f.path.endsWith('/.dir')) continue;
        if (!f.path.startsWith(dir === '/' ? '/' : dir + '/')) continue;
        for (const line of (f.content ?? '').split('\n')) {
          const hit = invert ? !re.test(line) : re.test(line);
          if (hit) out.push(`${f.path}:${line}`);
        }
      }
      return { output: out.join('\n'), isError: false };
    }

    const data = input(ctx, rest[1]);
    if (data === null) {
      return { output: `grep: ${rest[1] ?? 'stdin'}: No such file or directory`, isError: true };
    }

    const matched = linesOf(data).filter(line => invert ? !re.test(line) : re.test(line));
    return { output: matched.join('\n') };
  }
};

export const cmd_head = {
  name: 'head',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const { count, rest } = parseLineCount(args);

    const data = input(ctx, rest[0]);
    if (data === null) {
      return { output: `head: cannot open '${rest[0] ?? ''}' for reading: No such file or directory`, isError: true };
    }
    return { output: linesOf(data).slice(0, count).join('\n') };
  }
};

export const cmd_tail = {
  name: 'tail',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const { count, rest } = parseLineCount(args);

    const data = input(ctx, rest[0]);
    if (data === null) {
      return { output: `tail: cannot open '${rest[0] ?? ''}' for reading: No such file or directory`, isError: true };
    }
    return { output: linesOf(data).slice(-count).join('\n') };
  }
};

export const cmd_wc = {
  name: 'wc',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const rest = args.filter(a => !a.startsWith('-'));
    const data = input(ctx, rest[0]);
    if (data === null) {
      return { output: `wc: ${rest[0] ?? ''}: No such file or directory`, isError: true };
    }
    const lines = linesOf(data).length;
    const words = data.trim() === '' ? 0 : data.trim().split(/\s+/).length;
    const chars = data.length;
    return { output: `${lines} ${words} ${chars}${rest[0] ? ' ' + rest[0] : ''}` };
  }
};

export const cmd_sort = {
  name: 'sort',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const rest = args.filter(a => !a.startsWith('-'));
    const reverse = args.includes('-r') || args.includes('--reverse');
    const numeric = args.includes('-n') || args.includes('--numeric-sort');
    const data = input(ctx, rest[0]);
    if (data === null) {
      return { output: `sort: cannot read: No such file or directory`, isError: true };
    }
    const sorted = linesOf(data).sort((a, b) => {
      if (numeric) return (parseFloat(a) || 0) - (parseFloat(b) || 0);
      return a.localeCompare(b);
    });
    if (reverse) sorted.reverse();
    return { output: sorted.join('\n') };
  }
};

export const cmd_uniq = {
  name: 'uniq',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const rest = args.filter(a => !a.startsWith('-'));
    const data = input(ctx, rest[0]);
    if (data === null) {
      return { output: `uniq: cannot read: No such file or directory`, isError: true };
    }
    const seen = new Set<string>();
    const out: string[] = [];
    linesOf(data).forEach(line => {
      if (!seen.has(line)) {
        seen.add(line);
        out.push(line);
      }
    });
    return { output: out.join('\n') };
  }
};

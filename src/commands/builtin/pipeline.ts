// ── commands/builtin/pipeline.ts ───────────────────────────────────
// Filtros de pipe (ROADMAP Fase 7.3): grep, head, tail, wc, sort, uniq.
// Leen la entrada desde CommandContext.pipedInput. Cuando no hay pipe,
// actúan sobre un argumento de archivo (o stdin vacío en wc).

import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { getCurrentUser } from '../../utils/users';
import { canRead } from '../../utils/permissions';
import { readVirtualFile, buildFileReadMetadata } from '../../utils/fileRead';

// ── helper: leer entrada (pipe > archivo) con permisos Unix ──
type PipeInput =
  | { status: 'ok'; content: string; fromFile: boolean; resolved?: FileEntry }
  | { status: 'error'; error: 'not-found' | 'is-directory' | 'permission-denied' | 'no-input' };

function input(ctx: CommandContext, fileArg?: string): PipeInput {
  if (ctx.pipedInput !== undefined) return { status: 'ok', content: ctx.pipedInput, fromFile: false };
  if (!fileArg) return { status: 'error', error: 'no-input' };
  const user = getCurrentUser(ctx.machine);
  const r = readVirtualFile(ctx.machine, fileArg, ctx.currentDir, user);
  if (!r.ok) return { status: 'error', error: r.error };
  return { status: 'ok', content: r.content, fromFile: true, resolved: r.resolved };
}

function readError(cmd: string, label: string | undefined, error: PipeInput & { status: 'error' }): CommandResponse {
  const target = label ?? '';
  if (error.error === 'permission-denied') return { output: `${cmd}: ${target}: Permission denied`, isError: true };
  if (error.error === 'is-directory') return { output: `${cmd}: ${target}: Is a directory`, isError: true };
  return { output: `${cmd}: ${target}: No such file or directory`, isError: true };
}

// Si la lectura fue desde archivo, adjunta metadata fileRead para misiones.
function withFileRead(base: CommandResponse, ctx: CommandContext, inp: PipeInput): CommandResponse {
  if (inp.status !== 'ok' || !inp.fromFile || !inp.resolved) return base;
  if (base.isError) return base;
  const meta = buildFileReadMetadata(ctx.machine, ctx.allMachines ?? [ctx.machine], inp.resolved);
  return { ...base, type: 'fileRead', fileRead: meta.fileRead, ...(meta.possibleUsers && { possibleUsers: meta.possibleUsers }) };
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
    const showNumbers = hasFlag('n');
    const countOnly = hasFlag('c');
    const onlyMatching = hasFlag('o');
    let re: RegExp;
    try {
      re = new RegExp(pattern, ignoreCase ? 'i' : '');
    } catch {
      return { output: `grep: invalid pattern '${pattern}'`, isError: true };
    }
    // -o: solo el fragmento que matchea (una línea por match)
    const matchRe = (): RegExp => {
      try {
        return new RegExp(pattern, ignoreCase ? 'gi' : 'g');
      } catch {
        return re;
      }
    };
    const renderHits = (line: string): string[] => {
      if (!onlyMatching) return [line];
      return line.match(matchRe()) ?? [];
    };

    // ── grep -r: búsqueda recursiva sobre un directorio ──
    if (recursive) {
      const target = rest[1] || '.';
      const dir = target.startsWith('/') ? target.replace(/\/+$/, '') || '/' : (ctx.currentDir?.replace(/\/$/, '') || '') + '/' + target.replace(/^\.\//, '');
      const rUser = getCurrentUser(ctx.machine);
      if (countOnly) {
        const counts: string[] = [];
        for (const f of ctx.machine.files || []) {
          if (f.path.endsWith('/.dir')) continue;
          if (!f.path.startsWith(dir === '/' ? '/' : dir + '/')) continue;
          if (!canRead(ctx.machine, f, rUser)) continue;
          const n = (f.content ?? '').split('\n').filter(line => invert ? !re.test(line) : re.test(line)).length;
          if (n > 0) counts.push(`${f.path}:${n}`);
        }
        return { output: counts.join('\n'), isError: false };
      }
      const out: string[] = [];
      for (const f of ctx.machine.files || []) {
        if (f.path.endsWith('/.dir')) continue;
        if (!f.path.startsWith(dir === '/' ? '/' : dir + '/')) continue;
        if (!canRead(ctx.machine, f, rUser)) continue;
        (f.content ?? '').split('\n').forEach((line, idx) => {
          const hit = invert ? !re.test(line) : re.test(line);
          if (!hit) return;
          const prefix = showNumbers ? `${f.path}:${idx + 1}:` : `${f.path}:`;
          for (const h of renderHits(line)) out.push(`${prefix}${h}`);
        });
      }
      return { output: out.join('\n'), isError: false };
    }

    const inp = input(ctx, rest[1]);
    if (inp.status === 'error') {
      if (inp.error === 'no-input') return { output: `grep: ${'stdin'}: No such file or directory`, isError: true };
      return readError('grep', rest[1] ?? 'stdin', inp);
    }
    const data = inp.content;

    const lines = linesOf(data);
    if (countOnly) {
      const n = lines.filter(line => invert ? !re.test(line) : re.test(line)).length;
      return { output: String(n) };
    }
    const matched: string[] = [];
    lines.forEach((line, idx) => {
      const hit = invert ? !re.test(line) : re.test(line);
      if (!hit) return;
      const prefix = showNumbers ? `${idx + 1}:` : '';
      for (const h of renderHits(line)) matched.push(`${prefix}${h}`);
    });
    return { output: matched.join('\n') };
  }
};

export const cmd_head = {
  name: 'head',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const { count, rest } = parseLineCount(args);

    const inp = input(ctx, rest[0]);
    if (inp.status === 'error') {
      if (inp.error === 'no-input') return { output: `head: cannot open '${rest[0] ?? ''}' for reading: No such file or directory`, isError: true };
      const e = readError('head', `cannot open '${rest[0] ?? ''}' for reading`, inp);
      // readError formatea como `cmd: label: ...`; head usa comillas propias
      if (inp.error === 'permission-denied') return { output: `head: cannot open '${rest[0] ?? ''}' for reading: Permission denied`, isError: true };
      if (inp.error === 'is-directory') return { output: `head: cannot open '${rest[0] ?? ''}' for reading: Is a directory`, isError: true };
      return e;
    }
    return withFileRead({ output: linesOf(inp.content).slice(0, count).join('\n') }, ctx, inp);
  }
};

export const cmd_tail = {
  name: 'tail',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const { count, rest } = parseLineCount(args);

    const inp = input(ctx, rest[0]);
    if (inp.status === 'error') {
      if (inp.error === 'no-input') return { output: `tail: cannot open '${rest[0] ?? ''}' for reading: No such file or directory`, isError: true };
      if (inp.error === 'permission-denied') return { output: `tail: cannot open '${rest[0] ?? ''}' for reading: Permission denied`, isError: true };
      if (inp.error === 'is-directory') return { output: `tail: cannot open '${rest[0] ?? ''}' for reading: Is a directory`, isError: true };
      return { output: `tail: cannot open '${rest[0] ?? ''}' for reading: No such file or directory`, isError: true };
    }
    return withFileRead({ output: linesOf(inp.content).slice(-count).join('\n') }, ctx, inp);
  }
};

export const cmd_wc = {
  name: 'wc',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const rest = args.filter(a => !a.startsWith('-'));
    const inp = input(ctx, rest[0]);
    if (inp.status === 'error') {
      return readError('wc', rest[0] ?? '', inp);
    }
    const data = inp.content;
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
    const inp = input(ctx, rest[0]);
    if (inp.status === 'error') {
      return { output: `sort: cannot read: ${rest[0] ?? ''}: ${inp.error === 'permission-denied' ? 'Permission denied' : inp.error === 'is-directory' ? 'Is a directory' : 'No such file or directory'}`, isError: true };
    }
    const sorted = linesOf(inp.content).sort((a, b) => {
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
    const inp = input(ctx, rest[0]);
    if (inp.status === 'error') {
      return { output: `uniq: cannot read: ${rest[0] ?? ''}: ${inp.error === 'permission-denied' ? 'Permission denied' : inp.error === 'is-directory' ? 'Is a directory' : 'No such file or directory'}`, isError: true };
    }
    const out: string[] = [];
    let prev: string | null = null;
    for (const line of linesOf(inp.content)) {
      if (line !== prev) {
        out.push(line);
        prev = line;
      }
    }
    return { output: out.join('\n') };
  }
};

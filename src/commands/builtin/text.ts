// ── commands/builtin/text.ts ──────────────────────────────────────
// Filtros de texto por línea (Tier 1): cut, tr, tac, nl, rev, column.
// Leen stdin por pipe o un archivo, como pipeline.ts.

import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser } from '../../utils/users';
import { readVirtualFile } from '../../utils/fileRead';

type TextInput =
  | { status: 'ok'; content: string }
  | { status: 'error'; error: 'not-found' | 'is-directory' | 'permission-denied' | 'no-input' };

function input(ctx: CommandContext, fileArg?: string): TextInput {
  if (ctx.pipedInput !== undefined) return { status: 'ok', content: ctx.pipedInput };
  if (!fileArg) return { status: 'error', error: 'no-input' };
  const user = getCurrentUser(ctx.machine);
  const r = readVirtualFile(ctx.machine, fileArg, ctx.currentDir, user);
  if (!r.ok) return { status: 'error', error: r.error };
  return { status: 'ok', content: r.content };
}

function inputError(cmd: string, label: string | undefined, error: TextInput & { status: 'error' }): CommandResponse {
  const target = label ?? '';
  if (error.error === 'permission-denied') return { output: `${cmd}: ${target}: Permission denied`, isError: true };
  if (error.error === 'is-directory') return { output: `${cmd}: ${target}: Is a directory`, isError: true };
  return { output: `${cmd}: ${target}: No such file or directory`, isError: true };
}

function linesOf(data: string): string[] {
  const trimmed = data.replace(/\n$/, '');
  return trimmed === '' ? [] : trimmed.split('\n');
}

// Parsea listas estilo cut "1,3-5,7-,-3" a predicate sobre índice 1-based.
// max: longitud máxima (campos o caracteres) para rangos abiertos.
function parseList(spec: string, max: number): ((i: number) => boolean) | null {
  const ranges: Array<[number, number]> = [];
  for (const part of spec.split(',')) {
    if (/^\d+$/.test(part)) {
      const n = parseInt(part, 10);
      if (n < 1) return null;
      ranges.push([n, n]);
    } else {
      const m = part.match(/^(\d*)-(\d*)$/);
      if (!m) return null;
      const lo = m[1] === '' ? 1 : parseInt(m[1], 10);
      const hi = m[2] === '' ? max : parseInt(m[2], 10);
      if (lo < 1 || hi < lo) return null;
      ranges.push([lo, Math.min(hi, max)]);
    }
  }
  return (i: number) => ranges.some(([lo, hi]) => i >= lo && i <= hi);
}

export const cmd_cut = {
  name: 'cut',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    let delim = '\t';
    let fields: string | null = null;
    let chars: string | null = null;
    let suppress = false;
    let complement = false;
    const rest: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-d') { delim = (args[++i] ?? '\t')[0] ?? '\t'; }
      else if (a.startsWith('-d') && a.length > 2) { delim = a[2]; }
      else if (a === '-f') { fields = args[++i] ?? ''; }
      else if (a.startsWith('-f') && a.length > 2) { fields = a.slice(2); }
      else if (a === '-c' || a === '-b') { chars = args[++i] ?? ''; }
      else if ((a.startsWith('-c') || a.startsWith('-b')) && a.length > 2) { chars = a.slice(2); }
      else if (a === '-s' || a === '--only-delimited') { suppress = true; }
      else if (a === '--complement') { complement = true; }
      else if (a.startsWith('-')) { return { output: `cut: invalid option -- '${a.replace(/^-+/, '')[0] ?? ''}'`, isError: true }; }
      else rest.push(a);
    }
    if (!fields && !chars) return { output: 'cut: you must specify a list of bytes, characters, or fields', isError: true };

    const inp = input(ctx, rest[0]);
    if (inp.status === 'error') return inputError('cut', rest[0] ?? '', inp);
    const data = inp.content;

    const out: string[] = [];
    for (const line of linesOf(data)) {
      if (chars !== null) {
        const keep = parseList(chars, line.length);
        if (!keep) return { output: `cut: invalid character list`, isError: true };
        let s = '';
        for (let i = 1; i <= line.length; i++) {
          if (keep(i) !== complement) s += line[i - 1];
        }
        out.push(s);
      } else {
        const parts = line.split(delim);
        if (parts.length === 1 && !line.includes(delim)) {
          if (suppress) continue;
          out.push(line);
          continue;
        }
        const keep = parseList(fields!, parts.length);
        if (!keep) return { output: `cut: invalid field list`, isError: true };
        out.push(parts.filter((_, idx) => keep(idx + 1) !== complement).join(delim));
      }
    }
    return { output: out.join('\n') };
  },
};

// Expande sets de tr: rangos a-z, escapes \n \t \r \\, [x*y] repetición.
function expandSet(set: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < set.length; i++) {
    const c = set[i];
    if (c === '\\' && i + 1 < set.length) {
      const n = set[++i];
      out.push(n === 'n' ? '\n' : n === 't' ? '\t' : n === 'r' ? '\r' : n);
    } else if (c === '[' && set[i + 2] === '*' && set[i + 4] === ']') {
      const count = parseInt(set[i + 3], 10) || 1;
      for (let k = 0; k < count; k++) out.push(set[i + 1]);
      i += 4;
    } else if (i + 2 < set.length && set[i + 1] === '-' && set[i + 2] !== '') {
      const lo = c.charCodeAt(0);
      const hi = set[i + 2].charCodeAt(0);
      if (lo <= hi) {
        for (let k = lo; k <= hi; k++) out.push(String.fromCharCode(k));
        i += 2;
      } else {
        out.push(c);
      }
    } else {
      out.push(c);
    }
  }
  return out;
}

export const cmd_tr = {
  name: 'tr',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const opts = args.filter(a => a.startsWith('-') && a !== '-');
    const rest = args.filter(a => !a.startsWith('-') || a === '-');
    const del = opts.some(o => o.includes('d'));
    const squeeze = opts.some(o => o.includes('s'));
    const compl = opts.some(o => o.includes('c') || o.includes('C'));

    let set1 = rest[0] ?? '';
    const set2 = rest[1] ?? '';
    // `tr -d ...` / operandos con '-' literal se preservan por splitArgs
    if (set1 === '-') set1 = '-';
    if (del && rest.length < 1) return { output: 'tr: missing operand', isError: true };
    if (!del && rest.length < 2) {
      // `tr SET` sin SET2 solo vale con -d o -s
      if (!(squeeze && rest.length === 1)) return { output: 'tr: missing operand after SET1\nTry \'tr --help\' for more information.', isError: true };
    }

    const data = ctx.pipedInput ?? '';
    let s1 = expandSet(set1);
    if (compl) {
      const present = new Set(s1);
      s1 = [];
      for (let c = 0; c < 256; c++) {
        const ch = String.fromCharCode(c);
        if (!present.has(ch)) s1.push(ch);
      }
    }

    let out: string;
    if (del) {
      const kill = new Set(s1);
      out = [...data].filter(ch => !kill.has(ch)).join('');
      if (squeeze && set2) {
        const sq = new Set(expandSet(set2));
        out = squeezeStr(out, sq);
      }
    } else {
      const s2 = expandSet(set2);
      const map = new Map<string, string>();
      s1.forEach((ch, i) => map.set(ch, s2[Math.min(i, s2.length - 1)] ?? ch));
      out = [...data].map(ch => (map.has(ch) ? map.get(ch)! : ch)).join('');
      if (squeeze) {
        const sq = new Set(s2.length > 0 ? s2.slice(-1) : s1);
        out = squeezeStr(out, sq);
      }
    }
    return { output: out };
  },
};

function squeezeStr(data: string, set: Set<string>): string {
  let out = '';
  let prev = '';
  for (const ch of data) {
    if (!(ch === prev && set.has(ch))) out += ch;
    prev = ch;
  }
  return out;
}

export const cmd_tac = {
  name: 'tac',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const rest = args.filter(a => !a.startsWith('-'));
    const inp = input(ctx, rest[0]);
    if (inp.status === 'error') return inputError('tac', rest[0] ?? '', inp);
    return { output: linesOf(inp.content).reverse().join('\n') };
  },
};

export const cmd_nl = {
  name: 'nl',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    let bodyNumbering = 't'; // t = non-blank (default), a = all, n = none
    let increment = 1;
    let start = 1;
    let width = 6;
    let sep = '\t';
    const rest: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-b') { bodyNumbering = args[++i] ?? 't'; }
      else if (a.startsWith('-b') && a.length > 2) { bodyNumbering = a.slice(2); }
      else if (a === '-i') { increment = parseInt(args[++i] ?? '', 10) || 1; }
      else if (a.startsWith('-i') && a.length > 2) { increment = parseInt(a.slice(2), 10) || 1; }
      else if (a === '-v') { start = parseInt(args[++i] ?? '', 10) || 1; }
      else if (a.startsWith('-v') && a.length > 2) { start = parseInt(a.slice(2), 10) || 1; }
      else if (a === '-w') { width = parseInt(args[++i] ?? '', 10) || 6; }
      else if (a.startsWith('-w') && a.length > 2) { width = parseInt(a.slice(2), 10) || 6; }
      else if (a === '-s') { sep = args[++i] ?? '\t'; }
      else if (a.startsWith('-s') && a.length > 2) { sep = a.slice(2); }
      else if (a.startsWith('-')) { return { output: `nl: invalid option -- '${a.replace(/^-+/, '')[0] ?? ''}'`, isError: true }; }
      else rest.push(a);
    }

    const inp = input(ctx, rest[0]);
    if (inp.status === 'error') return inputError('nl', rest[0] ?? '', inp);
    const data = inp.content;

    let n = start;
    const out = linesOf(data).map(line => {
      const numbered = bodyNumbering === 'a' || (bodyNumbering === 't' && line !== '');
      if (!numbered) return '';
      const s = `${String(n).padStart(width, ' ')}${sep}${line}`;
      n += increment;
      return s;
    });
    return { output: out.join('\n') };
  },
};

export const cmd_rev = {
  name: 'rev',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const rest = args.filter(a => !a.startsWith('-'));
    const inp = input(ctx, rest[0]);
    if (inp.status === 'error') return inputError('rev', rest[0] ?? '', inp);
    return { output: linesOf(inp.content).map(l => [...l].reverse().join('')).join('\n') };
  },
};

export const cmd_column = {
  name: 'column',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    let table = false;
    let delim: string | null = null;
    let outSep = '  ';
    const rest: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-t' || a === '--table') { table = true; }
      else if (a === '-s') { delim = args[++i] ?? null; }
      else if (a.startsWith('-s') && a.length > 2) { delim = a.slice(2); }
      else if (a === '-o') { outSep = args[++i] ?? '  '; }
      else if (a.startsWith('-o') && a.length > 2) { outSep = a.slice(2); }
      else if (a.startsWith('-')) { return { output: `column: invalid option -- '${a.replace(/^-+/, '')[0] ?? ''}'`, isError: true }; }
      else rest.push(a);
    }
    if (!table) {
      return { output: 'column: only -t (table) mode is supported in this simulator.\nUsage: column -t [-s delim] [-o sep] [FILE]', isError: true };
    }

    const inp = input(ctx, rest[0]);
    if (inp.status === 'error') return inputError('column', rest[0] ?? '', inp);
    const data = inp.content;

    const rows = linesOf(data).map(l => (delim !== null ? l.split(delim) : l.split(/\s+/).filter(Boolean)));
    const widths: number[] = [];
    for (const row of rows) {
      row.forEach((cell, i) => { widths[i] = Math.max(widths[i] ?? 0, cell.length); });
    }
    return {
      output: rows
        .map(row => row.map((cell, i) => (i === row.length - 1 ? cell : cell.padEnd(widths[i]))).join(outSep))
        .join('\n'),
    };
  },
};

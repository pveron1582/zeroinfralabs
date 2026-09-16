// ── frameworks/python/builtins.ts ───────────────────────────────────
// Builtins de Python soportados (print, input, len, range, int, str,
// bool, open) y métodos de str/list/dict/file. input() escribe el
// prompt al buffer y consume la cola de entradas; si no hay datos
// lanza PyInputRequest para que el terminal pida la línea al usuario.

import type { PyValue, PyList, PyDict, PyNativeFn } from './values';
import { pyStr, pyTruthy, pyTypeName, pyRepr, isPyObject } from './values';
import { Env } from './env';
import { PyInputRequest, PyError, typeError, valueError } from './errors';
import type { RunCtx } from './context';

function num(v: PyValue): number {
  return typeof v === 'boolean' ? (v ? 1 : 0) : (v as number);
}

const isNum = (v: PyValue) => typeof v === 'number' || typeof v === 'boolean';

export function makeGlobalEnv(ctx: RunCtx): Env {
  const env = new Env();
  const native = (name: string, call: (args: PyValue[], line: number) => PyValue): PyValue =>
    ({ kind: 'native', name, call });

  env.set('print', native('print', (args) => {
    ctx.state.out += args.map(pyStr).join(' ') + '\n';
    return null;
  }));

  env.set('input', native('input', (args) => {
    const prompt = args.length > 0 ? pyStr(args[0]) : '';
    ctx.state.out += prompt;
    const next = ctx.state.inputQueue.shift();
    if (next === undefined) throw new PyInputRequest(prompt);
    // El terminal del usuario "eco-ea" lo tipeado (tty): pipedInput no hace
    // eco, igual que CPython.
    if (next.echo) ctx.state.out += next.value + '\n';
    return next.value;
  }));

  env.set('len', native('len', (args, line) => {
    const v = args[0];
    if (typeof v === 'string') return v.length;
    if (isPyObject(v)) {
      if (v.kind === 'list' || v.kind === 'tuple') return v.items.length;
      if (v.kind === 'dict') return v.entries.size;
      if (v.kind === 'range') return rangeCount(v.start, v.stop, v.step, line);
      if (v.kind === 'file') return v.lines.length;
    }
    throw typeError(`object of type '${pyTypeName(v)}' has no len()`, line);
  }));

  env.set('range', native('range', (args, line) => {
    if (args.length === 0 || args.length > 3 || !args.every(isNum)) {
      throw typeError('range() espera entre 1 y 3 enteros', line);
    }
    const nums = args.map(num);
    if (args.length === 1) return { kind: 'range', start: 0, stop: nums[0], step: 1 };
    return { kind: 'range', start: nums[0], stop: nums[1], step: args.length === 3 ? nums[2] : 1 };
  }));

  env.set('int', native('int', (args, line) => {
    const v = args[0];
    if (v === undefined || v === null) return 0;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (typeof v === 'number') return Math.trunc(v);
    if (typeof v === 'string') {
      const n = Number(v.trim());
      if (v.trim() === '' || Number.isNaN(n)) {
        throw valueError(`invalid literal for int() with base 10: '${v}'`, line);
      }
      return Math.trunc(n);
    }
    throw typeError(`int() argument must be a string or a number, not '${pyTypeName(v)}'`, line);
  }));

  env.set('str', native('str', (args) => (args.length === 0 ? '' : pyStr(args[0]))));

  env.set('bool', native('bool', (args) => (args.length === 0 ? false : pyTruthy(args[0]))));

  env.set('open', native('open', (args, line) => {
    const path = args.length > 0 ? pyStr(args[0]) : '';
    const mode = args.length > 1 ? pyStr(args[1]) : 'r';
    if (/[wa+]/.test(mode)) {
      throw new PyError('OSError', `escritura no soportada en el simulador (open('${path}', '${mode}'))`, line);
    }
    if (!ctx.opts.readFile) {
      throw new PyError('FileNotFoundError', `[Errno 2] No such file or directory: '${path}'`, line);
    }
    const content = ctx.opts.readFile(path);
    if (content === null) {
      throw new PyError('FileNotFoundError', `[Errno 2] No such file or directory: '${path}'`, line);
    }
    const lines = content.split('\n');
    if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
    return { kind: 'file', path, lines, content };
  }));

  return env;
}

export function rangeCount(start: number, stop: number, step: number, line: number): number {
  if (step === 0) throw valueError('range() arg 3 must not be zero', line);
  const count = step > 0 ? Math.ceil((stop - start) / step) : Math.ceil((start - stop) / -step);
  return Math.max(0, count);
}

// ── Métodos de tipos ────────────────────────────────────────────────

const fn = (name: string, call: PyNativeFn['call']): PyNativeFn => ({ kind: 'native', name, call });

export function getStrMethod(s: string, name: string, _line: number): PyValue | null {
  switch (name) {
    case 'upper': return fn('upper', () => s.toUpperCase());
    case 'lower': return fn('lower', () => s.toLowerCase());
    case 'strip': return fn('strip', () => s.trim());
    case 'split': return fn('split', (args) => {
      if (args.length === 0) {
        return { kind: 'list', items: s.trim() === '' ? [] : s.trim().split(/\s+/) };
      }
      return { kind: 'list', items: s.split(pyStr(args[0])) };
    });
    case 'startswith': return fn('startswith', (args, l) => {
      if (typeof args[0] !== 'string') throw typeError('startswith espera un string', l);
      return s.startsWith(args[0]);
    });
    case 'endswith': return fn('endswith', (args, l) => {
      if (typeof args[0] !== 'string') throw typeError('endswith espera un string', l);
      return s.endsWith(args[0]);
    });
    case 'replace': return fn('replace', (args, l) => {
      if (typeof args[0] !== 'string' || typeof args[1] !== 'string') {
        throw typeError('replace espera dos strings', l);
      }
      return s.split(args[0]).join(args[1]);
    });
    case 'join': return fn('join', (args, l) => {
      const parts = args[0] as PyList | undefined;
      if (!parts || parts.kind !== 'list') throw typeError('join espera una lista', l);
      return parts.items.map(pyStr).join(s);
    });
    default: return null;
  }
}

export function getListMethod(list: PyValue[], name: string): PyValue | null {
  switch (name) {
    case 'append': return fn('append', (args) => { list.push(args[0] ?? null); return null; });
    case 'pop': return fn('pop', (_args, line) => {
      if (list.length === 0) throw new PyError('IndexError', 'pop from empty list', line);
      return list.pop() as PyValue;
    });
    default: return null;
  }
}

export function getDictMethod(dict: PyDict, name: string): PyValue | null {
  const entries = dict.entries;
  switch (name) {
    case 'get': return fn('get', (args) => {
      const key = args[0] ?? null;
      const e = entries.get(hashKey(key));
      if (e) return e.value;
      return args.length > 1 ? args[1] : null;
    });
    case 'keys': return fn('keys', () => ({ kind: 'list', items: [...entries.values()].map(e => e.key) }));
    case 'values': return fn('values', () => ({ kind: 'list', items: [...entries.values()].map(e => e.value) }));
    case 'items': return fn('items', () => ({
      kind: 'list',
      items: [...entries.values()].map(e => ({ kind: 'tuple', items: [e.key, e.value] })),
    }));
    default: return null;
  }
}

export function getFileMethod(f: { kind: 'file'; lines: string[]; content: string }, name: string): PyValue | null {
  switch (name) {
    case 'read': return fn('read', () => f.content);
    case 'close': return fn('close', () => null);
    default: return null;
  }
}

// Clave de dict con chequeo de hashabilidad.
export function hashKey(v: PyValue): string {
  if (v === null) return 'N';
  if (typeof v === 'boolean') return `b:${v}`;
  if (typeof v === 'number') return `n:${v}`;
  if (typeof v === 'string') return `s:${v}`;
  throw new PyError('TypeError', `unhashable type: '${pyTypeName(v)}'`);
}

export function reprKeyForError(v: PyValue): string {
  return pyRepr(v);
}

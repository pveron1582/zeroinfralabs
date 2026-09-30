// ── frameworks/python/values.ts ─────────────────────────────────────
// Valores del subconjunto de Python: tipos, igualdad, verdad y
// representación (str/repr) imitando a CPython.

import type { Stmt } from './ast';

export type PyPrimitive = null | boolean | number | string;

export interface PyList { kind: 'list'; items: PyValue[] }
export interface PyTuple { kind: 'tuple'; items: PyValue[] }
export interface PyDict { kind: 'dict'; entries: Map<string, { key: PyValue; value: PyValue }> }
export interface PyRange { kind: 'range'; start: number; stop: number; step: number }
export interface PyFile { kind: 'file'; path: string; lines: string[]; content: string }
export interface PySocket { kind: 'socket'; host: string | null; port: number | null; connected: boolean; banner: string }
export interface PyModule { kind: 'module'; name: string; attrs: Map<string, PyValue> }
export interface PyFunction {
  kind: 'function';
  name: string;
  params: string[];
  body: Stmt[];
  closure: import('./env').Env;
}
// Funciones nativas (print, str.lower, socket.connect_ex, ...)
export interface PyNativeFn {
  kind: 'native';
  name: string;
  call: (args: PyValue[], line: number) => PyValue;
}
export type PyObjectValue =
  | PyList | PyTuple | PyDict | PyRange | PyFile | PySocket
  | PyModule | PyFunction | PyNativeFn;
export type PyValue =
  | PyPrimitive | PyObjectValue;

// Type guard: los objetos Python tienen `.kind`; los primitivos no.
export function isPyObject(v: PyValue): v is PyObjectValue {
  return typeof v === 'object' && v !== null;
}

export function pyTypeName(v: PyValue): string {
  if (v === null) return 'NoneType';
  if (typeof v === 'boolean') return 'bool';
  if (typeof v === 'number') return Number.isInteger(v) ? 'int' : 'float';
  if (typeof v === 'string') return 'str';
  switch (v.kind) {
    case 'list': return 'list';
    case 'tuple': return 'tuple';
    case 'dict': return 'dict';
    case 'range': return 'range';
    case 'file': return '_io.TextIOWrapper';
    case 'socket': return 'socket';
    case 'module': return 'module';
    case 'function': return 'function';
    case 'native': return 'builtin_function_or_method';
  }
}

export function pyTruthy(v: PyValue): boolean {
  if (v === null) return false;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v.length > 0;
  if (v.kind === 'list' || v.kind === 'tuple') return v.items.length > 0;
  if (v.kind === 'dict') return v.entries.size > 0;
  return true;
}

export function pyEquals(a: PyValue, b: PyValue): boolean {
  if (typeof a === 'number' && typeof b === 'number') return a === b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return a === b;
  // Python: True == 1, False == 0
  if (typeof a === 'boolean' && typeof b === 'number') return (a ? 1 : 0) === b;
  if (typeof a === 'number' && typeof b === 'boolean') return a === (b ? 1 : 0);
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a === 'string') return a === (b as string);
  if ((a as PyList).kind === 'list' && (b as PyList).kind === 'list') {
    const x = a as PyList, y = b as PyList;
    return x.items.length === y.items.length && x.items.every((it, i) => pyEquals(it, y.items[i]));
  }
  if ((a as PyTuple).kind === 'tuple' && (b as PyTuple).kind === 'tuple') {
    const x = a as PyTuple, y = b as PyTuple;
    return x.items.length === y.items.length && x.items.every((it, i) => pyEquals(it, y.items[i]));
  }
  return a === b;
}

export function pyStr(v: PyValue): string {
  if (v === null) return 'None';
  if (typeof v === 'boolean') return v ? 'True' : 'False';
  if (typeof v === 'number') return formatNumber(v);
  if (typeof v === 'string') return v;
  if (v.kind === 'list') return `[${v.items.map(pyRepr).join(', ')}]`;
  if (v.kind === 'tuple') {
    const inner = v.items.map(pyRepr).join(', ');
    return v.items.length === 1 ? `(${inner},)` : `(${inner})`;
  }
  if (v.kind === 'dict') {
    const parts = [...v.entries.values()].map(e => `${pyRepr(e.key)}: ${pyRepr(e.value)}`);
    return `{${parts.join(', ')}}`;
  }
  if (v.kind === 'range') return `range(${v.start}, ${v.stop})`;
  if (v.kind === 'socket') return `<socket object>`;
  if (v.kind === 'function') return `<function ${v.name}>`;
  if (v.kind === 'module') return `<module '${v.name}'>`;
  return `<${pyTypeName(v)} object>`;
}

export function pyRepr(v: PyValue): string {
  if (typeof v === 'string') return `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  return pyStr(v);
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(n);
}

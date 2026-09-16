// ── frameworks/python/evalExpr.ts ───────────────────────────────────
// Evaluador de expresiones: operadores con semántica Python
// (short-circuit de and/or, comparación encadenada, in/not in),
// subíndices con negativos, atributos/métodos y llamadas.

import type { Expr } from './ast';
import type { PyValue } from './values';
import { pyStr, pyTruthy, pyTypeName, pyEquals, isPyObject } from './values';
import type { Env } from './env';
import { PyError, typeError } from './errors';
import type { RunCtx } from './context';
import {
  getStrMethod, getListMethod, getDictMethod, getFileMethod, hashKey,
} from './builtins';
import { getSocketMethod, dictKeyError } from './stdlib';

const asNum = (v: PyValue): number => (typeof v === 'boolean' ? (v ? 1 : 0) : (v as number));
const isNum = (v: PyValue) => typeof v === 'number' || typeof v === 'boolean';

export function evaluate(e: Expr, env: Env, ctx: RunCtx): PyValue {
  switch (e.t) {
    case 'num': return e.value;
    case 'str': return e.value;
    case 'bool': return e.value;
    case 'none': return null;
    case 'fstring':
      return e.parts.map(p => (typeof p === 'string' ? p : pyStr(evaluate(p, env, ctx)))).join('');
    case 'name': return env.get(e.name, e.line);
    case 'list':
      return { kind: 'list', items: e.items.map(it => evaluate(it, env, ctx)) };
    case 'tuple':
      return { kind: 'tuple', items: e.items.map(it => evaluate(it, env, ctx)) };
    case 'dict': {
      const entries = new Map<string, { key: PyValue; value: PyValue }>();
      e.keys.forEach((k, i) => {
        const key = evaluate(k, env, ctx);
        entries.set(hashKey(key), { key, value: evaluate(e.values[i], env, ctx) });
      });
      return { kind: 'dict', entries };
    }
    case 'binop':
      return evalBinOp(e.op, evaluate(e.left, env, ctx), evaluate(e.right, env, ctx), e.line);
    case 'boolop': {
      if (e.op === 'and') {
        let last: PyValue = true;
        for (const v of e.values) {
          last = evaluate(v, env, ctx);
          if (!pyTruthy(last)) return last;
        }
        return last;
      }
      let last: PyValue = false;
      for (const v of e.values) {
        last = evaluate(v, env, ctx);
        if (pyTruthy(last)) return last;
      }
      return last;
    }
    case 'unary':
      if (e.op === 'not') return !pyTruthy(evaluate(e.operand, env, ctx));
      return -asNum(evaluate(e.operand, env, ctx));
    case 'compare': {
      let left = evaluate(e.left, env, ctx);
      for (let i = 0; i < e.ops.length; i++) {
        const right = evaluate(e.comparators[i], env, ctx);
        if (!compare(e.ops[i], left, right, e.line)) return false;
        left = right;
      }
      return true;
    }
    case 'ifexp':
      return pyTruthy(evaluate(e.test, env, ctx))
        ? evaluate(e.body, env, ctx)
        : evaluate(e.orelse, env, ctx);
    case 'call': {
      const callee = evaluate(e.func, env, ctx);
      const args = e.args.map(a => evaluate(a, env, ctx));
      if (isPyObject(callee)) {
        if (callee.kind === 'native') return callee.call(args, e.line);
        if (callee.kind === 'function') return ctx.callFunction(callee, args, e.line);
      }
      throw typeError(`'${pyTypeName(callee)}' object is not callable`, e.line);
    }
    case 'attr': {
      const obj = evaluate(e.obj, env, ctx);
      return getAttr(obj, e.name, ctx, e.line);
    }
    case 'subscript': {
      const obj = evaluate(e.obj, env, ctx);
      const idx = evaluate(e.index, env, ctx);
      return getSubscript(obj, idx, e.line);
    }
  }
}

function getAttr(obj: PyValue, name: string, ctx: RunCtx, line: number): PyValue {
  if (isPyObject(obj)) {
    if (obj.kind === 'module') {
      const attr = obj.attrs.get(name);
      if (attr !== undefined) return attr;
      throw new PyError('AttributeError', `module '${obj.name}' has no attribute '${name}'`, line);
    }
    if (obj.kind === 'list') {
      const m = getListMethod(obj.items, name);
      if (m) return m;
    } else if (obj.kind === 'dict') {
      const m = getDictMethod(obj, name);
      if (m) return m;
    } else if (obj.kind === 'file') {
      const m = getFileMethod(obj, name);
      if (m) return m;
    } else if (obj.kind === 'socket') {
      const m = getSocketMethod(obj, name, ctx, line);
      if (m) return m;
    }
  } else if (typeof obj === 'string') {
    const m = getStrMethod(obj, name, line);
    if (m) return m;
  }
  throw new PyError('AttributeError', `'${pyTypeName(obj)}' object has no attribute '${name}'`, line);
}

function getSubscript(obj: PyValue, idx: PyValue, line: number): PyValue {
  const index = (what: string): number => {
    if (!isNum(idx)) throw typeError(`${what} indices must be integers, not ${pyTypeName(idx)}`, line);
    return asNum(idx);
  };
  if (typeof obj === 'string') {
    const i = index('string');
    const real = i < 0 ? obj.length + i : i;
    if (real < 0 || real >= obj.length) {
      throw new PyError('IndexError', 'string index out of range', line);
    }
    return obj[real];
  }
  if (isPyObject(obj) && (obj.kind === 'list' || obj.kind === 'tuple')) {
    const what = obj.kind;
    const i = index(what);
    const real = i < 0 ? obj.items.length + i : i;
    if (real < 0 || real >= obj.items.length) {
      throw new PyError('IndexError', `${what} index out of range`, line);
    }
    return obj.items[real];
  }
  if (isPyObject(obj) && obj.kind === 'dict') {
    const entry = obj.entries.get(hashKey(idx));
    if (!entry) throw dictKeyError(idx, line);
    return entry.value;
  }
  throw typeError(`'${pyTypeName(obj)}' object is not subscriptable`, line);
}

function compare(op: string, l: PyValue, r: PyValue, line: number): boolean {
  switch (op) {
    case '==': return pyEquals(l, r);
    case '!=': return !pyEquals(l, r);
    case 'in': return contains(l, r, line);
    case 'not in': return !contains(l, r, line);
  }
  // Orden: números y strings
  if (isNum(l) && isNum(r)) {
    const a = asNum(l), b = asNum(r);
    if (op === '<') return a < b;
    if (op === '>') return a > b;
    if (op === '<=') return a <= b;
    if (op === '>=') return a >= b;
  }
  if (typeof l === 'string' && typeof r === 'string') {
    if (op === '<') return l < r;
    if (op === '>') return l > r;
    if (op === '<=') return l <= r;
    if (op === '>=') return l >= r;
  }
  throw typeError(`'${op}' not supported between instances of '${pyTypeName(l)}' and '${pyTypeName(r)}'`, line);
}

function contains(item: PyValue, container: PyValue, line: number): boolean {
  if (typeof container === 'string' && typeof item === 'string') {
    return container.includes(item);
  }
  if (isPyObject(container)) {
    if (container.kind === 'list' || container.kind === 'tuple') {
      return container.items.some(it => pyEquals(it, item));
    }
    if (container.kind === 'dict') {
      return container.entries.has(hashKey(item));
    }
  }
  throw typeError(
    `argument of type '${pyTypeName(container)}' is not iterable`, line);
}

export function evalBinOp(op: string, l: PyValue, r: PyValue, line: number): PyValue {
  if (op === '+') {
    if (isNum(l) && isNum(r)) return asNum(l) + asNum(r);
    if (typeof l === 'string' && typeof r === 'string') return l + r;
    if (isPyObject(l) && isPyObject(r) && l.kind === 'list' && r.kind === 'list') {
      return { kind: 'list', items: [...l.items, ...r.items] };
    }
    if (isPyObject(l) && isPyObject(r) && l.kind === 'tuple' && r.kind === 'tuple') {
      return { kind: 'tuple', items: [...l.items, ...r.items] };
    }
  } else if (op === '*') {
    if (isNum(l) && isNum(r)) return asNum(l) * asNum(r);
    if (typeof l === 'string' && isNum(r)) return l.repeat(Math.max(0, asNum(r)));
    if (isNum(l) && typeof r === 'string') return r.repeat(Math.max(0, asNum(l)));
    if (isPyObject(l) && l.kind === 'list' && isNum(r)) {
      const out: PyValue[] = [];
      for (let i = 0; i < asNum(r); i++) out.push(...l.items);
      return { kind: 'list', items: out };
    }
  } else if (op === '-' || op === '/' || op === '//' || op === '%') {
    if (isNum(l) && isNum(r)) {
      const a = asNum(l), b = asNum(r);
      if ((op === '/' || op === '//' || op === '%') && b === 0) {
        throw new PyError('ZeroDivisionError', op === '%' ? 'integer modulo by zero' : 'division by zero', line);
      }
      if (op === '-') return a - b;
      if (op === '/') return a / b;
      if (op === '//') return Math.floor(a / b);
      return ((a % b) + b) % b;
    }
  } else {
    throw typeError(`operador no soportado '${op}'`, line);
  }
  throw typeError(`unsupported operand type(s) for ${op}: '${pyTypeName(l)}' and '${pyTypeName(r)}'`, line);
}

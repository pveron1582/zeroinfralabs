// ── frameworks/python/interpreter.ts ────────────────────────────────
// Evaluador de statements: control de flujo con señales (break/
// continue/return), try/except/finally, funciones con closure, imports
// y guardia de pasos para evitar bucles infinitos en el navegador.

import type { Stmt } from './ast';
import type { PyValue, PyFunction, PyRange } from './values';
import { pyTruthy, pyTypeName, isPyObject } from './values';
import { Env } from './env';
import { PyError, PySignal, typeError } from './errors';
import type { RunCtx } from './context';
import { DEFAULT_MAX_STEPS, MAX_ITER, MAX_CALL_DEPTH } from './context';
import { evaluate, evalBinOp } from './evalExpr';
import { getModule } from './stdlib';
import { rangeCount } from './builtins';

export function execBlock(body: Stmt[], env: Env, ctx: RunCtx): void {
  for (const stmt of body) execStmt(stmt, env, ctx);
}

export function execStmt(stmt: Stmt, env: Env, ctx: RunCtx): void {
  guardSteps(ctx, stmt.line);
  switch (stmt.t) {
    case 'multi':
      execBlock(stmt.body, env, ctx);
      return;
    case 'assign':
      env.set(stmt.name, evaluate(stmt.value, env, ctx));
      return;
    case 'augassign': {
      const current = env.get(stmt.name, stmt.line);
      const rhs = evaluate(stmt.value, env, ctx);
      env.set(stmt.name, evalBinOp(stmt.op, current, rhs, stmt.line));
      return;
    }
    case 'expr':
      evaluate(stmt.expr, env, ctx);
      return;
    case 'if':
      if (pyTruthy(evaluate(stmt.test, env, ctx))) execBlock(stmt.body, env, ctx);
      else execBlock(stmt.orelse, env, ctx);
      return;
    case 'while':
      while (pyTruthy(evaluate(stmt.test, env, ctx))) {
        guardSteps(ctx, stmt.line);
        try {
          execBlock(stmt.body, env, ctx);
        } catch (e) {
          if (e instanceof PySignal && e.kind === 'break') return;
          if (e instanceof PySignal && e.kind === 'continue') continue;
          throw e;
        }
      }
      return;
    case 'for': {
      const items = pyIterate(evaluate(stmt.iter, env, ctx), stmt.line);
      for (const item of items) {
        guardSteps(ctx, stmt.line);
        env.set(stmt.target, item);
        try {
          execBlock(stmt.body, env, ctx);
        } catch (e) {
          if (e instanceof PySignal && e.kind === 'break') return;
          if (e instanceof PySignal && e.kind === 'continue') continue;
          throw e;
        }
      }
      return;
    }
    case 'def':
      env.set(stmt.name, {
        kind: 'function', name: stmt.name, params: stmt.params, body: stmt.body, closure: env,
      });
      return;
    case 'return':
      throw new PySignal('return', stmt.value ? evaluate(stmt.value, env, ctx) : null);
    case 'import':
      for (const mod of stmt.modules) {
        env.set(mod.as ?? mod.name, getModule(mod.name, ctx, stmt.line));
      }
      return;
    case 'fromimport': {
      const mod = getModule(stmt.module, ctx, stmt.line);
      if (isPyObject(mod) && mod.kind === 'module') {
        for (const name of stmt.names) {
          const attr = mod.attrs.get(name);
          if (attr === undefined) {
            throw new PyError('ImportError', `cannot import name '${name}' from '${stmt.module}'`, stmt.line);
          }
          env.set(name, attr);
        }
        return;
      }
      throw new PyError('ImportError', `cannot import from '${stmt.module}'`, stmt.line);
    }
    case 'try':
      execTry(stmt, env, ctx);
      return;
    case 'break':
      throw new PySignal('break');
    case 'continue':
      throw new PySignal('continue');
    case 'pass':
      return;
  }
  throw typeError('statement no soportado', (stmt as { line: number }).line);
}

// ── try / except / finally ──────────────────────────────────────────

function execTry(
  stmt: Extract<Stmt, { t: 'try' }>,
  env: Env,
  ctx: RunCtx,
): void {
  try {
    execBlock(stmt.body, env, ctx);
  } catch (e) {
    if (e instanceof PyError && stmt.exceptBody.length > 0 && matches(e.pyClass, stmt.exceptName)) {
      if (stmt.exceptVar) env.set(stmt.exceptVar, `${e.pyClass}: ${e.message}`);
      execBlock(stmt.exceptBody, env, ctx);
    } else {
      if (stmt.finallyBody.length > 0) execBlock(stmt.finallyBody, env, ctx);
      throw e;
    }
  }
  if (stmt.finallyBody.length > 0) execBlock(stmt.finallyBody, env, ctx);
}

function matches(pyClass: string, exceptName: string | null): boolean {
  if (exceptName === null || exceptName === 'Exception') return true;
  if (exceptName === 'OSError') {
    return ['OSError', 'ConnectionRefusedError', 'socket.timeout', 'FileNotFoundError'].includes(pyClass);
  }
  return pyClass === exceptName;
}

// ── Funciones ───────────────────────────────────────────────────────

export function callPythonFunction(
  fn: PyFunction, args: PyValue[], line: number, ctx: RunCtx,
): PyValue {
  if (args.length !== fn.params.length) {
    throw typeError(
      `${fn.name}() takes ${fn.params.length} positional argument${fn.params.length === 1 ? '' : 's'} but ${args.length} were given`,
      line,
    );
  }
  const local = new Env(fn.closure);
  fn.params.forEach((p, i) => local.set(p, args[i]));
  // Guard de recursión (P0.2): sin esto, `def f(): f()` reventaba el stack
  // de JS con `RangeError: Maximum call stack size exceeded`, que escapaba
  // del runtime y tumbaba la app. En CPython esto es RecursionError.
  if (ctx.state.callDepth >= MAX_CALL_DEPTH) {
    throw new PyError(
      'RecursionError',
      `maximum recursion depth exceeded (límite del simulador: ${MAX_CALL_DEPTH})`,
      line,
    );
  }
  ctx.state.callDepth++;
  try {
    execBlock(fn.body, local, ctx);
  } catch (e) {
    if (e instanceof PySignal) {
      if (e.kind === 'return') return (e.value ?? null) as PyValue;
      throw new PyError('SyntaxError', `'break' outside loop`, line);
    }
    throw e;
  } finally {
    ctx.state.callDepth--;
  }
  return null;
}

// ── Iterables ───────────────────────────────────────────────────────

function pyIterate(v: PyValue, line: number): PyValue[] {
  if (typeof v === 'string') return v.split('');
  if (isPyObject(v)) {
    if (v.kind === 'list' || v.kind === 'tuple') return [...v.items];
    if (v.kind === 'dict') return [...v.entries.values()].map(e => e.key);
    if (v.kind === 'range') return rangeItems(v, line);
    if (v.kind === 'file') return [...v.lines];
  }
  throw typeError(`'${pyTypeName(v)}' object is not iterable`, line);
}

function rangeItems(r: PyRange, line: number): PyValue[] {
  const count = rangeCount(r.start, r.stop, r.step, line);
  if (count > MAX_ITER) {
    throw new PyError('OverflowError', 'rango demasiado grande para el simulador', line);
  }
  const out: PyValue[] = [];
  for (let i = r.start; r.step > 0 ? i < r.stop : i > r.stop; i += r.step) out.push(i);
  return out;
}

function guardSteps(ctx: RunCtx, line: number): void {
  ctx.state.steps++;
  if (ctx.state.steps > (ctx.opts.maxSteps ?? DEFAULT_MAX_STEPS)) {
    throw new PyError('RuntimeError', 'excedido el límite de pasos del simulador (¿bucle infinito?)', line);
  }
}

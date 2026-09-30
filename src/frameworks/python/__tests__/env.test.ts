// ── frameworks/python/__tests__/env.test.ts ────────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Test DIRECTO de la cadena de scopes. Antes solo se llegaba por rebote
// desde `interpreter.test.ts` (scripts con funciones) y se quedaba sin
// correr el NameError de una variable inexistente.
//
// Nota: `Env.has()` fue borrado en esta tanda — no tenía ningún caller
// (el lookup siempre pasa por `Env.get`).

import { describe, it, expect } from 'vitest';
import { Env } from '../env';
import type { PyError } from '../errors';

describe('Env - lectura y escritura', () => {
  it('set/get en el mismo scope', () => {
    const env = new Env();
    env.set('x', 1);
    expect(env.get('x', 1)).toBe(1);
  });

  it('la lectura camina la cadena de scopes (global → función)', () => {
    const global = new Env();
    global.set('x', 42);
    const local = new Env(global);
    expect(local.get('x', 1)).toBe(42);  // el hijo ve lo del padre
    local.set('y', 7);
    expect(local.get('y', 1)).toBe(7);
    let fallo = false;
    try { global.get('y', 1); } catch { fallo = true; }
    expect(fallo).toBe(true);            // el padre NO ve lo del hijo
  });

  it('el scope hijo tapa al padre sin modificarlo (shadowing)', () => {
    const global = new Env();
    global.set('x', 'global');
    const local = new Env(global);
    local.set('x', 'local');
    expect(local.get('x', 1)).toBe('local');
    expect(global.get('x', 1)).toBe('global');
  });

  it('una variable inexistente lanza NameError con su línea', () => {
    const env = new Env(new Env());
    let err: PyError | undefined;
    try {
      env.get('noExiste', 13);
    } catch (e) {
      err = e as PyError;
    }
    expect(err?.pyClass).toBe('NameError');
    expect(err?.message).toBe("name 'noExiste' is not defined");
    expect(err?.line).toBe(13);
  });

  it('una variable guardada como None se lee como None y no como inexistente', () => {
    const env = new Env();
    env.set('nada', null);
    expect(env.get('nada', 1)).toBeNull();
  });

  it('el parent es de solo lectura: escribir en el hijo no toca al padre', () => {
    const parent = new Env();
    const child = new Env(parent);
    child.set('a', 1);
    expect(child.parent).toBe(parent);
    expect(parent.parent).toBeNull();
    let fallo = false;
    try { parent.get('a', 1); } catch { fallo = true; }
    expect(fallo).toBe(true);
  });
});

// ── frameworks/python/env.ts ────────────────────────────────────────
// Entornos con cadena de scopes (global → local de función). La
// asignación siempre crea en el scope actual; la lectura camina la
// cadena, igual que el modelo mental básico de Python.

import type { PyValue } from './values';
import { nameError } from './errors';

export class Env {
  private readonly vars = new Map<string, PyValue>();
  constructor(public readonly parent: Env | null = null) {}

  get(name: string, line: number): PyValue {
    let scope: Env | null = this as Env | null;
    while (scope) {
      const v = scope.vars.get(name);
      if (v !== undefined || scope.vars.has(name)) return v as PyValue;
      scope = scope.parent;
    }
    throw nameError(name, line);
  }

  set(name: string, value: PyValue): void {
    this.vars.set(name, value);
  }
}

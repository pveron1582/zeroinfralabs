// ── frameworks/python/__tests__/methods.test.ts ────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Test DIRECTO de los métodos de tipo (str/list/dict/file) y de la clave
// de dict. Antes solo se llegaba por rebote desde `interpreter.test.ts`
// y se quedaban sin correr: las rutas de error de `startswith`/`replace`/
// `join`, `pop()` de lista vacía, `dict.get` con default, el `default:
// → null` de cada getter y `hashKey` sobre un valor no hasheable.

import { describe, it, expect } from 'vitest';
import { getStrMethod, getListMethod, getDictMethod, getFileMethod, hashKey, reprKeyForError } from '../builtins';
import type { PyValue, PyNativeFn, PyList, PyDict, PyFile } from '../values';
import type { PyError } from '../errors';

const invocar = (m: PyValue | null, name: string, args: PyValue[] = []): PyValue => {
  expect(m, `falta el método ${name}`).not.toBeNull();
  return (m as PyNativeFn).call(args, 1);
};

/** `getStrMethod` lleva un `_line` que los métodos solo usan en errores. */
const strM = (s: string, name: string, line = 1) => getStrMethod(s, name, line);

const fallo = (fn: () => unknown): PyError => {
  try { fn(); } catch (e) { return e as PyError; }
  throw new Error('no lanzó');
};

const dict = (pairs: Array<[PyValue, PyValue]>): PyDict => ({
  kind: 'dict',
  entries: new Map(pairs.map(([key, value]) => [hashKey(key), { key, value }])),
});

describe('getStrMethod', () => {
  it('upper / lower / strip', () => {
    expect(invocar(strM('  Hola ', 'upper'), 'upper')).toBe('  HOLA ');
    expect(invocar(strM('  Hola ', 'lower'), 'lower')).toBe('  hola ');
    expect(invocar(strM('  Hola ', 'strip'), 'strip')).toBe('Hola');
  });

  it('split con y sin separador', () => {
    expect(invocar(strM('  a  b  c ', 'split'), 'split'))
      .toEqual({ kind: 'list', items: ['a', 'b', 'c'] });
    expect(invocar(strM('', 'split'), 'split')).toEqual({ kind: 'list', items: [] });
    expect(invocar(strM('a,b,,c', 'split'), 'split', [',']))
      .toEqual({ kind: 'list', items: ['a', 'b', '', 'c'] });
  });

  it('startswith / endswith', () => {
    expect(invocar(strM('hola', 'startswith'), 'startswith', ['ho'])).toBe(true);
    expect(invocar(strM('hola', 'startswith'), 'startswith', ['ola'])).toBe(false);
    expect(invocar(strM('hola', 'endswith'), 'endswith', ['la'])).toBe(true);
    expect(invocar(strM('hola', 'endswith'), 'endswith', ['lo'])).toBe(false);
    expect(fallo(() => invocar(strM('hola', 'startswith'), 'startswith', [1])).pyClass).toBe('TypeError');
    expect(fallo(() => invocar(strM('hola', 'endswith'), 'endswith', [null])).message)
      .toBe('endswith espera un string');
  });

  it('replace', () => {
    expect(invocar(strM('a-b-c', 'replace'), 'replace', ['-', '+'])).toBe('a+b+c');
    expect(invocar(strM('a-b', 'replace'), 'replace', ['-', ''])).toBe('ab');
    expect(fallo(() => invocar(strM('a', 'replace'), 'replace', [1, 'x'])).pyClass).toBe('TypeError');
    expect(fallo(() => invocar(strM('a', 'replace'), 'replace', ['a'])).message)
      .toBe('replace espera dos strings');
  });

  it('join', () => {
    const lista: PyList = { kind: 'list', items: ['a', 'b', 3] };
    expect(invocar(strM('-', 'join'), 'join', [lista])).toBe('a-b-3');
    expect(invocar(strM('', 'join'), 'join', [{ kind: 'list', items: [] }])).toBe('');
    expect(fallo(() => invocar(strM('-', 'join'), 'join', ['no-lista'])).message)
      .toBe('join espera una lista');
  });

  it('método desconocido → null (sigue buscando en el siguiente tipo)', () => {
    expect(strM('hola', 'metodoFantasma', 1)).toBeNull();
    expect(getListMethod([], 'metodoFantasma')).toBeNull();
    expect(getDictMethod(dict([]), 'metodoFantasma')).toBeNull();
    const f: PyFile = { kind: 'file', path: '/x', lines: [], content: '' };
    expect(getFileMethod(f, 'metodoFantasma')).toBeNull();
  });
});

describe('getListMethod', () => {
  it('append muta la lista y devuelve None', () => {
    const l: PyValue[] = [];
    expect(invocar(getListMethod(l, 'append'), 'append', [1])).toBeNull();
    expect(invocar(getListMethod(l, 'append'), 'append', [])).toBeNull();
    expect(l).toEqual([1, null]);
  });

  it('pop devuelve el último y falla en lista vacía', () => {
    const l: PyValue[] = [1, 2];
    expect(invocar(getListMethod(l, 'pop'), 'pop')).toBe(2);
    expect(l).toEqual([1]);
    expect(fallo(() => invocar(getListMethod([], 'pop'), 'pop')).pyClass).toBe('IndexError');
  });
});

describe('getDictMethod', () => {
  it('get con y sin default', () => {
    const d = dict([['k', 1]]);
    expect(invocar(getDictMethod(d, 'get'), 'get', ['k'])).toBe(1);
    expect(invocar(getDictMethod(d, 'get'), 'get', ['falta'])).toBeNull();
    expect(invocar(getDictMethod(d, 'get'), 'get', ['falta', 'porDefecto'])).toBe('porDefecto');
    expect(invocar(getDictMethod(d, 'get'), 'get', [])).toBeNull();
    expect(invocar(getDictMethod(d, 'get'), 'get', ['falta', null, 'extra'])).toBeNull();
  });

  it('keys / values / items respetan el orden de inserción', () => {
    const d = dict([['a', 1], ['b', 2]]);
    expect(invocar(getDictMethod(d, 'keys'), 'keys')).toEqual({ kind: 'list', items: ['a', 'b'] });
    expect(invocar(getDictMethod(d, 'values'), 'values')).toEqual({ kind: 'list', items: [1, 2] });
    expect(invocar(getDictMethod(d, 'items'), 'items')).toEqual({
      kind: 'list',
      items: [
        { kind: 'tuple', items: ['a', 1] },
        { kind: 'tuple', items: ['b', 2] },
      ],
    });
    expect(invocar(getDictMethod(dict([]), 'keys'), 'keys')).toEqual({ kind: 'list', items: [] });
  });
});

describe('getFileMethod', () => {
  const f: PyFile = { kind: 'file', path: '/x', lines: ['a'], content: 'a\n' };

  it('read devuelve el contenido y close no-op', () => {
    expect(invocar(getFileMethod(f, 'read'), 'read')).toBe('a\n');
    expect(invocar(getFileMethod(f, 'close'), 'close')).toBeNull();
  });
});

describe('hashKey / reprKeyForError', () => {
  it('canoniza los hashables', () => {
    expect(hashKey(null)).toBe('N');
    expect(hashKey(true)).toBe('b:true');
    expect(hashKey(false)).toBe('b:false');
    expect(hashKey(7)).toBe('n:7');
    expect(hashKey('hola')).toBe('s:hola');
  });

  it('un valor no hasheable es un TypeError de Python', () => {
    expect(fallo(() => hashKey({ kind: 'list', items: [] })).pyClass).toBe('TypeError');
    expect(fallo(() => hashKey({ kind: 'list', items: [] })).message).toBe("unhashable type: 'list'");
    expect(fallo(() => hashKey(dict([]))).message).toBe("unhashable type: 'dict'");
  });

  it('reprKeyForError usa repr (comillas en strings)', () => {
    expect(reprKeyForError('k')).toBe("'k'");
    expect(reprKeyForError(3)).toBe('3');
    expect(reprKeyForError(null)).toBe('None');
  });
});

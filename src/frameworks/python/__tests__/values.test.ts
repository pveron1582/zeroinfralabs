// ── frameworks/python/__tests__/values.test.ts ─────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Test DIRECTO de los valores del subconjunto de Python. Antes solo se
// llegaba por rebote desde `interpreter.test.ts` (scripts que imprimen),
// y se quedaban sin correr casi todas las ramas: `pyTypeName` con objetos,
// `pyTruthy` con algo distinto de un bool, `pyEquals` con listas/tuplas y
// `pyStr` con dict/rango/socket/función/módulo.
//
// Nota: `keyOf()` fue borrado en esta tanda — era copia exacta de
// `builtins.ts hashKey()` y no tenía ningún caller (se usaba el otro).

import { describe, it, expect } from 'vitest';
import { isPyObject, pyTypeName, pyTruthy, pyEquals, pyStr, pyRepr } from '../values';
import { Env } from '../env';
import type { PyValue, PyList, PyTuple, PyDict, PyRange, PyFile, PySocket, PyModule, PyFunction, PyNativeFn } from '../values';

const list = (...items: PyValue[]): PyList => ({ kind: 'list', items });
const tuple = (...items: PyValue[]): PyTuple => ({ kind: 'tuple', items });
const dict = (pairs: Array<[PyValue, PyValue]>): PyDict => ({
  kind: 'dict',
  entries: new Map(pairs.map(([key, value], i) => [`k${i}`, { key, value }])),
});
const range = (start: number, stop: number, step = 1): PyRange => ({ kind: 'range', start, stop, step });
const file: PyFile = { kind: 'file', path: '/etc/passwd', lines: ['a'], content: 'a' };
const sock: PySocket = { kind: 'socket', host: null, port: null, connected: false, banner: '' };
const module: PyModule = { kind: 'module', name: 'sys', attrs: new Map() };
const fnObj: PyFunction = { kind: 'function', name: 'saludar', params: [], body: [], closure: new Env() };
const native: PyNativeFn = { kind: 'native', name: 'print', call: () => null };

describe('isPyObject', () => {
  it('los primitivos no son objetos y los compuestos sí', () => {
    expect(isPyObject(null)).toBe(false);
    expect(isPyObject(true)).toBe(false);
    expect(isPyObject(7)).toBe(false);
    expect(isPyObject('hola')).toBe(false);
    for (const o of [list(), tuple(), dict([]), range(0, 3), file, sock, module, fnObj, native]) {
      expect(isPyObject(o), o.kind).toBe(true);
    }
  });
});

describe('pyTypeName', () => {
  it('nombra los primitivos como CPython', () => {
    expect(pyTypeName(null)).toBe('NoneType');
    expect(pyTypeName(true)).toBe('bool');
    expect(pyTypeName(3)).toBe('int');
    expect(pyTypeName(3.5)).toBe('float');
    expect(pyTypeName('x')).toBe('str');
  });

  it('nombra cada tipo de objeto', () => {
    expect(pyTypeName(list())).toBe('list');
    expect(pyTypeName(tuple())).toBe('tuple');
    expect(pyTypeName(dict([]))).toBe('dict');
    expect(pyTypeName(range(0, 1))).toBe('range');
    expect(pyTypeName(file)).toBe('_io.TextIOWrapper');
    expect(pyTypeName(sock)).toBe('socket');
    expect(pyTypeName(module)).toBe('module');
    expect(pyTypeName(fnObj)).toBe('function');
    expect(pyTypeName(native)).toBe('builtin_function_or_method');
  });
});

describe('pyTruthy', () => {
  it('None y 0 y cadena vacía son falsy', () => {
    expect(pyTruthy(null)).toBe(false);
    expect(pyTruthy(false)).toBe(false);
    expect(pyTruthy(0)).toBe(false);
    expect(pyTruthy(-0)).toBe(false);
    expect(pyTruthy('')).toBe(false);
    expect(pyTruthy(list())).toBe(false);
    expect(pyTruthy(tuple())).toBe(false);
    expect(pyTruthy(dict([]))).toBe(false);
  });

  it('todo lo demás es truthy', () => {
    expect(pyTruthy(true)).toBe(true);
    expect(pyTruthy(1)).toBe(true);
    expect(pyTruthy(-42)).toBe(true);
    expect(pyTruthy('a')).toBe(true);
    expect(pyTruthy(list(1))).toBe(true);
    expect(pyTruthy(tuple(1))).toBe(true);
    expect(pyTruthy(dict([[1, 2]]))).toBe(true);
    expect(pyTruthy(range(0, 1))).toBe(true);
    expect(pyTruthy(file)).toBe(true);
    expect(pyTruthy(sock)).toBe(true);
    expect(pyTruthy(fnObj)).toBe(true);
    expect(pyTruthy(native)).toBe(true);
  });
});

describe('pyEquals', () => {
  it('compara primitivos por valor', () => {
    expect(pyEquals(2, 2)).toBe(true);
    expect(pyEquals(2, 3)).toBe(false);
    expect(pyEquals('a', 'a')).toBe(true);
    expect(pyEquals('a', 'b')).toBe(false);
    expect(pyEquals(null, null)).toBe(true);
    expect(pyEquals(null, 0)).toBe(false);
  });

  it('True == 1 y False == 0 como en Python', () => {
    expect(pyEquals(true, true)).toBe(true);
    expect(pyEquals(true, false)).toBe(false);
    expect(pyEquals(true, 1)).toBe(true);
    expect(pyEquals(false, 0)).toBe(true);
    expect(pyEquals(1, false)).toBe(false);
    expect(pyEquals(0, false)).toBe(true);
    expect(pyEquals(true, 2)).toBe(false);
    expect(pyEquals(1, true)).toBe(true);
    expect(pyEquals(0, true)).toBe(false);
  });

  it('compara listas y tuplas elemento a elemento (recursivo)', () => {
    expect(pyEquals(list(1, 2), list(1, 2))).toBe(true);
    expect(pyEquals(list(1, 2), list(1, 3))).toBe(false);
    expect(pyEquals(list(1, 2), list(1))).toBe(false);
    expect(pyEquals(list(1, 2), tuple(1, 2))).toBe(false); // tipos distintos
    expect(pyEquals(tuple(list(1), 2), tuple(list(1), 2))).toBe(true);
    expect(pyEquals(tuple(list(1), 2), tuple(list(2), 2))).toBe(false);
  });

  it('tipos distintos nunca son iguales y los objetos comparan por identidad', () => {
    expect(pyEquals(1, '1')).toBe(false);
    expect(pyEquals('1', 1)).toBe(false);
    expect(pyEquals(list(), dict([]))).toBe(false);
    const mismo = list(1);
    expect(pyEquals(mismo, mismo)).toBe(true);
    expect(pyEquals(list(1), list(1))).toBe(true);  // por igualdad profunda
    expect(pyEquals(dict([]), dict([]))).toBe(false); // dicts: sin caso propio
    expect(pyEquals(fnObj, fnObj)).toBe(true);
  });
});

describe('pyStr / pyRepr', () => {
  it('reprimea los primitivos como CPython', () => {
    expect(pyStr(null)).toBe('None');
    expect(pyStr(true)).toBe('True');
    expect(pyStr(false)).toBe('False');
    expect(pyStr(42)).toBe('42');
    expect(pyStr(4.5)).toBe('4.5');
    expect(pyStr('hola')).toBe('hola');
  });

  it('str de listas usa repr de los elementos', () => {
    expect(pyStr(list(1, 'a', null))).toBe("[1, 'a', None]");
    expect(pyStr(list())).toBe('[]');
    expect(pyStr(list(list(1)))).toBe('[[1]]');
  });

  it('str de tuplas agrega coma en la tupla de un elemento', () => {
    expect(pyStr(tuple())).toBe('()');
    expect(pyStr(tuple(7))).toBe('(7,)');
    expect(pyStr(tuple(7, 8))).toBe('(7, 8)');
    expect(pyStr(tuple('a'))).toBe("('a',)");
  });

  it('str de dict muestra clave: valor', () => {
    expect(pyStr(dict([]))).toBe('{}');
    expect(pyStr(dict([['k', 1]]))).toBe("{'k': 1}");
    expect(pyStr(dict([['k', 1], ['j', 'v']]))).toBe("{'k': 1, 'j': 'v'}");
  });

  it('str de los objetos restantes', () => {
    expect(pyStr(range(2, 10))).toBe('range(2, 10)');
    expect(pyStr(sock)).toBe('<socket object>');
    expect(pyStr(fnObj)).toBe('<function saludar>');
    expect(pyStr(module)).toBe("<module 'sys'>");
    expect(pyStr(file)).toBe('<_io.TextIOWrapper object>');
    expect(pyStr(native)).toBe('<builtin_function_or_method object>');
  });

  it('repr de un string escapa comillas y barras invertidas', () => {
    expect(pyRepr('hola')).toBe("'hola'");
    expect(pyRepr("no puede ser'")).toBe("'no puede ser\\''");
    expect(pyRepr('ruta\\tmp')).toBe("'ruta\\\\tmp'");
    expect(pyRepr("mix'o\\")).toBe("'mix\\'o\\\\'");
  });

  it('repr de no-strings delega en str', () => {
    expect(pyRepr(1)).toBe('1');
    expect(pyRepr(null)).toBe('None');
    expect(pyRepr(list('a'))).toBe("['a']");
  });
});

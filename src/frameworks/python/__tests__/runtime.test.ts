// ── frameworks/python/__tests__/runtime.test.ts ────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Test DIRECTO de la API pública del intérprete (`runPython`). Antes solo
// se llegaba por rebote desde `interpreter.test.ts` y se quedaban sin
// correr: la cola de `pipedInput` (incluido el corte de la línea final
// vacía), el formato de traceback SIN línea, `parseExpr` y —lo más
// importante— la red de seguridad P0.2 que traduce errores de JS que
// escapan del intérprete (`describeJsError`, que estaba en 0 %).

import { describe, it, expect } from 'vitest';
import { runPython, parseExpr, formatTraceback } from '../runtime';
import { PyError } from '../errors';
import type { PyRunOptions } from '../context';

const opts = (over: Partial<PyRunOptions> = {}): PyRunOptions => ({
  argv: [],
  inputs: [],
  sourceName: '<string>',
  ...over,
});

describe('runPython - resultado feliz', () => {
  it('captura stdout y le quita el salto final (como un stdout real)', () => {
    const r = runPython('print("hola")\nprint("chau")\n', opts());
    expect(r.error).toBeUndefined();
    expect(r.output).toBe('hola\nchau');
    expect(r.connections).toEqual([]);
  });

  it('la salida sin salto final no se recorta', () => {
    const r = runPython('print(input(">> "))', opts({ pipedInput: 'dato' }));
    expect(r.output).toBe('>> dato');
    expect(r.error).toBeUndefined();
  });
});

describe('runPython - input()', () => {
  it('si no queda entrada devuelve needsInput con el prompt', () => {
    const r = runPython('nombre = input("¿quién? ")', opts());
    expect(r.needsInput).toEqual({ prompt: '¿quién? ' });
    expect(r.output).toBe('¿quién? ');
    expect(r.error).toBeUndefined();
  });

  it('las entradas de opts.inputs hacen eco (tty); las de pipedInput no', () => {
    // Con eco, el valor tipeado se escribe a stdout además del prompt.
    const eco = runPython('print(input("> "))', opts({ inputs: ['pepe'] }));
    expect(eco.output).toBe('> pepe\npepe');

    // pipedInput no hace eco (stdout no es una tty), como CPython.
    const piped = runPython('print(input("> "))', opts({ pipedInput: 'pepe' }));
    expect(piped.output).toBe('> pepe');
  });

  it('pipedInput acepta varias líneas', () => {
    const r = runPython('print(input())\nprint(input())', opts({ pipedInput: 'uno\ndos' }));
    expect(r.output).toBe('uno\ndos');
    expect(r.needsInput).toBeUndefined();
  });

  it('pipedInput con salto final descarta la línea vacía (queue.pop)', () => {
    // 3 inputs y solo 2 líneas ⇒ la tercera pide datos al usuario, es
    // decir, la línea vacía final NO quedó en la cola.
    const src = 'print(input())\nprint(input())\nprint(input())';
    const r = runPython(src, opts({ pipedInput: 'a\nb\n' }));
    expect(r.needsInput).toEqual({ prompt: '' });

    // Mismo final sin salto y con una sola línea: también hay 2 entradas.
    expect(runPython(src, opts({ pipedInput: 'a\nb' })).needsInput).toEqual({ prompt: '' });
    expect(runPython(src, opts({ pipedInput: 'a' })).needsInput).toEqual({ prompt: '' });
  });

  it('las entradas consumidas no se reusan entre corridas', () => {
    const r = runPython('print(input())\nprint(input())', opts({ inputs: ['x'] }));
    expect(r.needsInput).toEqual({ prompt: '' });
  });
});

describe('runPython - errores de Python', () => {
  it('un error de Python se formatea como traceback con archivo y línea', () => {
    const r = runPython('a = 1\nprint(a + "x")', opts({ sourceName: 'script.py' }));
    expect(r.output).toBe('');
    expect(r.error).toBe([
      'Traceback (most recent call last):',
      '  File "script.py", line 2, in <module>',
      'TypeError: unsupported operand type(s) for +: \'int\' and \'str\'',
    ].join('\n'));
  });

  it('un PyError sin línea (error interno) omite la parte de línea', () => {
    const r = runPython('d = {[]: 1}', opts({ sourceName: '<string>' }));
    expect(r.error).toContain('File "<string>", in <module>');
    expect(r.error).not.toContain(', line');
    expect(r.error).toContain('TypeError: unhashable type: \'list\'');
  });
});

describe('runPython - red de seguridad P0.2 (errores de JS)', () => {
  const conError = (e: unknown) =>
    runPython('print(open("/x").read())', opts({
      sourceName: '<string>',
      readFile: () => { throw e; },
    }));

  it('un RangeError de stack se traduce a recursión excedida', () => {
    const r = conError(new RangeError('Maximum call stack size exceeded'));
    expect(r.error).toBe([
      'Traceback (most recent call last):',
      '  File "<string>", in <module>',
      'RuntimeError: profundidad de recursión excedida (límite del simulador)',
    ].join('\n'));
  });

  it('otro RangeError se traduce a memoria agotada', () => {
    const r = conError(new RangeError('Invalid string length'));
    expect(r.error).toContain('RuntimeError: memoria agotada: la operación pidió demasiado (límite del simulador)');
  });

  it('un TypeError interno conserva su mensaje', () => {
    const r = conError(new TypeError('x.map is not a function'));
    expect(r.error).toContain('RuntimeError: error interno del intérprete: x.map is not a function');
  });

  it('un Error genérico y un valor no-error también se reportan', () => {
    expect(conError(new Error('fallo del puente')).error).toContain('RuntimeError: fallo del puente');
    expect(conError('crudo').error).toContain('RuntimeError: crudo');
  });

  it('el error de JS no borra lo que el script ya había impreso', () => {
    const r = runPython('print("antes")\nopen("/x")', opts({
      readFile: () => { throw new Error('boom'); },
    }));
    expect(r.output).toBe('antes');
    expect(r.error).toContain('RuntimeError: boom');
  });
});

describe('parseExpr / formatTraceback', () => {
  it('parseExpr parsea una expresión suelta', () => {
    expect(parseExpr('1 + 2', 1)).toMatchObject({ t: 'binop', op: '+' });
    expect(parseExpr('"texto"', 1)).toMatchObject({ t: 'str', value: 'texto' });
  });

  it('formatTraceback con y sin línea', () => {
    expect(formatTraceback(new PyError('ValueError', 'mal', 7), 'a.py')).toBe([
      'Traceback (most recent call last):',
      '  File "a.py", line 7, in <module>',
      'ValueError: mal',
    ].join('\n'));
    expect(formatTraceback(new PyError('TypeError', 'mal2'), 'b.py')).toContain('File "b.py", in <module>');
  });
});

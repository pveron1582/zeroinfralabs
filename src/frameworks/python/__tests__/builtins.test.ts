// ── frameworks/python/__tests__/builtins.test.ts ───────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Test DIRECTO de los builtins del intérprete. Antes solo se llegaba por
// rebote desde `interpreter.test.ts` (scripts felices) y se quedaban sin
// correr todas las rutas de error: `len` de tipos sin longitud, `range`
// mal llamado, `int` con literales inválidos, `open` en modo escritura,
// sin callback `readFile` o con archivo inexistente.

import { describe, it, expect } from 'vitest';
import { makeGlobalEnv, rangeCount } from '../builtins';
import type { PyValue, PyNativeFn, PyFile } from '../values';
import type { PyError } from '../errors';
import type { RunCtx, PyRunOptions } from '../context';

function makeCtx(over: Partial<PyRunOptions> = {}): RunCtx {
  const state = { out: '', connections: [], steps: 0, callDepth: 0, inputQueue: [] as Array<{ value: string; echo: boolean }> };
  const ctx: RunCtx = {
    opts: { argv: [], inputs: [], sourceName: '<test>', ...over },
    state,
    globals: null as never,
    callFunction: () => null as never,
  };
  ctx.globals = makeGlobalEnv(ctx);
  return ctx;
}

const call = (ctx: RunCtx, name: string, args: PyValue[] = [], line = 1): PyValue =>
  (ctx.globals.get(name, line) as PyNativeFn).call(args, line);

const fallo = (fn: () => unknown): PyError => {
  try { fn(); } catch (e) { return e as PyError; }
  throw new Error('no lanzó');
};

const file = (content: string): PyFile => ({
  kind: 'file', path: '/x', lines: content.split('\n'), content,
});

describe('print / input', () => {
  it('print concatena con espacios y cierra con salto', () => {
    const ctx = makeCtx();
    expect(call(ctx, 'print', ['a', 1, null])).toBeNull();
    expect(ctx.state.out).toBe('a 1 None\n');
  });

  it('input sin cola de datos lanza PyInputRequest con el prompt', () => {
    const ctx = makeCtx();
    const e = fallo(() => call(ctx, 'input', ['> ']));
    expect(e).toHaveProperty('prompt', '> ');
    expect(ctx.state.out).toBe('> '); // el prompt sí se escribe antes de pedir
  });

  it('input consume la cola y hace eco solo si viene del tty', () => {
    const ctx = makeCtx();
    ctx.state.inputQueue.push({ value: 'pepe', echo: true });
    expect(call(ctx, 'input', ['> '])).toBe('pepe');
    expect(ctx.state.out).toBe('> pepe\n');

    const ctx2 = makeCtx();
    ctx2.state.inputQueue.push({ value: 'dato', echo: false });
    expect(call(ctx2, 'input')).toBe('dato');
    expect(ctx2.state.out).toBe('');
  });

  it('input sin prompt no escribe nada antes de la respuesta', () => {
    const ctx = makeCtx();
    ctx.state.inputQueue.push({ value: 'x', echo: false });
    expect(call(ctx, 'input', [])).toBe('x');
    expect(ctx.state.out).toBe('');
  });
});

describe('len', () => {
  it('mide strings, listas, tuplas, dicts, rangos y archivos', () => {
    const ctx = makeCtx();
    expect(call(ctx, 'len', ['hola'])).toBe(4);
    expect(call(ctx, 'len', [{ kind: 'list', items: [1, 2, 3] }])).toBe(3);
    expect(call(ctx, 'len', [{ kind: 'tuple', items: [1] }])).toBe(1);
    expect(call(ctx, 'len', [{ kind: 'dict', entries: new Map() }])).toBe(0);
    expect(call(ctx, 'len', [{ kind: 'range', start: 0, stop: 5, step: 1 }])).toBe(5);
    expect(call(ctx, 'len', [file('a\nb\nc')])).toBe(3);
  });

  it('len de tipos objeto sin longitud es un TypeError con su nombre', () => {
    const ctx = makeCtx();
    expect(fallo(() => call(ctx, 'len', [{ kind: 'module', name: 'sys', attrs: new Map() }])).message)
      .toBe("object of type 'module' has no len()");
    expect(fallo(() => call(ctx, 'len', [{ kind: 'function', name: 'f', params: [], body: [], closure: ctx.globals }])).pyClass)
      .toBe('TypeError');
    expect(fallo(() => call(ctx, 'len', [true])).message).toBe("object of type 'bool' has no len()");
  });

  it('len de un tipo sin longitud es un TypeError con su nombre', () => {
    const ctx = makeCtx();
    expect(fallo(() => call(ctx, 'len', [42])).message)
      .toBe("object of type 'int' has no len()");
    expect(fallo(() => call(ctx, 'len', [null])).message)
      .toBe("object of type 'NoneType' has no len()");
  });
});

describe('range', () => {
  it('acepta 1, 2 y 3 argumentos (y booleanos como enteros)', () => {
    const ctx = makeCtx();
    expect(call(ctx, 'range', [3])).toEqual({ kind: 'range', start: 0, stop: 3, step: 1 });
    expect(call(ctx, 'range', [2, 5])).toEqual({ kind: 'range', start: 2, stop: 5, step: 1 });
    expect(call(ctx, 'range', [2, 10, 2])).toEqual({ kind: 'range', start: 2, stop: 10, step: 2 });
    expect(call(ctx, 'range', [true, 3])).toEqual({ kind: 'range', start: 1, stop: 3, step: 1 });
    expect(call(ctx, 'range', [false, 3])).toEqual({ kind: 'range', start: 0, stop: 3, step: 1 });
    expect(call(ctx, 'range', [true, true])).toEqual({ kind: 'range', start: 1, stop: 1, step: 1 });
  });

  it('rechaza 0, 4 o argumentos no numéricos', () => {
    const ctx = makeCtx();
    const esperado = 'range() espera entre 1 y 3 enteros';
    expect(fallo(() => call(ctx, 'range', [])).message).toBe(esperado);
    expect(fallo(() => call(ctx, 'range', [1, 2, 3, 4])).message).toBe(esperado);
    expect(fallo(() => call(ctx, 'range', ['1'])).message).toBe(esperado);
  });
});

describe('rangeCount', () => {
  it('redondea hacia arriba y no baja de 0', () => {
    expect(rangeCount(0, 10, 3, 1)).toBe(4);
    expect(rangeCount(10, 0, -3, 1)).toBe(4);
    expect(rangeCount(0, 0, 2, 1)).toBe(0);
    expect(rangeCount(5, 0, 2, 1)).toBe(0);   // paso positivo hacia atrás
    expect(rangeCount(0, 5, -2, 1)).toBe(0);  // paso negativo hacia adelante
  });

  it('step 0 es un ValueError', () => {
    expect(fallo(() => rangeCount(0, 5, 0, 9)).pyClass).toBe('ValueError');
    expect(fallo(() => rangeCount(0, 5, 0, 9)).line).toBe(9);
  });
});

describe('int / str / bool', () => {
  it('int convierte desde números, booleanos y strings', () => {
    const ctx = makeCtx();
    expect(call(ctx, 'int', [])).toBe(0);        // sin argumentos
    expect(call(ctx, 'int', [null])).toBe(0);
    expect(call(ctx, 'int', [true])).toBe(1);
    expect(call(ctx, 'int', [false])).toBe(0);
    expect(call(ctx, 'int', [7.9])).toBe(7);
    expect(call(ctx, 'int', ['  42 '])).toBe(42);
    expect(call(ctx, 'int', ['-3.5'])).toBe(-3);
  });

  it('int de un string inválido es un ValueError', () => {
    const ctx = makeCtx();
    expect(fallo(() => call(ctx, 'int', ['hola'])).message)
      .toBe("invalid literal for int() with base 10: 'hola'");
    expect(fallo(() => call(ctx, 'int', ['   '])).pyClass).toBe('ValueError');
  });

  it('int de otros tipos es un TypeError', () => {
    const ctx = makeCtx();
    expect(fallo(() => call(ctx, 'int', [{ kind: 'list', items: [] }])).message)
      .toBe("int() argument must be a string or a number, not 'list'");
  });

  it('str y bool sin argumentos dan los defaults de Python', () => {
    const ctx = makeCtx();
    expect(call(ctx, 'str', [])).toBe('');
    expect(call(ctx, 'bool', [])).toBe(false);
    expect(call(ctx, 'str', [null])).toBe('None');
    expect(call(ctx, 'bool', [0])).toBe(false);
    expect(call(ctx, 'bool', ['x'])).toBe(true);
  });
});

describe('open', () => {
  it('lee un archivo existente y descarta el salto final', () => {
    const ctx = makeCtx({ readFile: () => 'a\nb\n' });
    const f = call(ctx, 'open', ['/etc/passwd']) as PyFile;
    expect(f.kind).toBe('file');
    expect(f.lines).toEqual(['a', 'b']);
    expect(f.content).toBe('a\nb\n');
    expect((call(ctx, 'open', ['/x', 'r']) as PyFile).kind).toBe('file');
  });

  it('modo escritura no está soportado', () => {
    for (const mode of ['w', 'a', '+', 'r+']) {
      const ctx = makeCtx({ readFile: () => 'x' });
      expect(fallo(() => call(ctx, 'open', ['/x', mode])).pyClass, mode).toBe('OSError');
    }
  });

  it('sin callback readFile el archivo no existe', () => {
    const ctx = makeCtx();
    expect(fallo(() => call(ctx, 'open', ['/x'])).pyClass).toBe('FileNotFoundError');
  });

  it('si el callback devuelve null tampoco existe', () => {
    const ctx = makeCtx({ readFile: () => null });
    expect(fallo(() => call(ctx, 'open', ['/falta.txt'])).message)
      .toBe("[Errno 2] No such file or directory: '/falta.txt'");
  });

  it('open sin argumentos usa ruta vacía y modo por defecto', () => {
    const ctx = makeCtx({ readFile: (p) => (p === '' ? 'ok' : null) });
    expect((call(ctx, 'open', []) as PyFile).content).toBe('ok');
  });
});

// ── frameworks/python/__tests__/language.test.ts ───────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Tests de SEMÁNTICA del lenguaje que `interpreter.test.ts` no cubría:
// cortos de `and`/`or`, comparaciones entre strings, subíndices inválidos,
// membresía en dict, límites de memoria, `while` con break/continue,
// `from … import`, try/except/finally y las guardas del evaluador.
//
// Huecos que quedan sin cubrir en evalExpr/interpreter y por qué NO se
// fuerzan (defensivos, inalcanzables en runtime):
//  - `evalExpr 254` (`out.length > MAX_ITEMS`): `safeCount()` corta antes
//    (times ≤ floor(MAX_ITEMS / items.length)), así que el total nunca
//    supera MAX_ITEMS; es un cinturón por si safeCount cambia.
//  - `evalExpr 271` (`operador no soportado`): el parser solo emite
//    `+ - * / // %` y el aug-assign usa el mismo set.
//  - `evalExpr 167/173` (else de `op === '>='`): `==`/`!=`/`in`/`not in`
//    retornan antes, así que al llegar ahí el operador es siempre uno de
//    `< > <= >=` y los cuatro tienen su propio `return`.
//  - `evalExpr 259` (else de `- / // %`): la cadena if/else-if solo llega
//    ahí con esos operadores (`+` y `*` tienen su propia rama previa).
//  - `interpreter 94` (`mod.kind === 'module'` falso): `getModule()` o
//    devuelve un módulo o lanza ModuleNotFoundError.
//  - `interpreter 106` (default del switch de statements): el parser solo
//    produce los tipos del union `Stmt`.

import { describe, it, expect } from 'vitest';
import { runPython } from '../runtime';
import type { PyRunOptions } from '../context';

const opts = (over: Partial<PyRunOptions> = {}): PyRunOptions => ({
  argv: [], inputs: [], sourceName: '<string>', ...over,
});

/** Ejecuta y devuelve stdout (falla el test si hubo error). */
const out = (src: string, over: Partial<PyRunOptions> = {}): string => {
  const r = runPython(src, opts(over));
  expect(r.error, `no debía fallar:\n${r.error}`).toBeUndefined();
  return r.output;
};

/** Ejecuta y devuelve el traceback (falla el test si NO hubo error). */
const err = (src: string, over: Partial<PyRunOptions> = {}): string => {
  const r = runPython(src, opts(over));
  expect(r.error, 'debía fallar').toBeDefined();
  return r.error!;
};

describe('expresiones', () => {
  it('el literal None se evalúa e imprime como en Python', () => {
    expect(out('print(None)')).toBe('None');
    expect(out('x = None\nprint(x == None)')).toBe('True');
  });

  it('"and" corta en el primer falsy y "or" devuelve el último falsy', () => {
    expect(out('print(0 and 5)')).toBe('0');
    expect(out("print('' and 5)")).toBe('');
    expect(out('print(0 or 0)')).toBe('0');
    expect(out('print(1 or 0)')).toBe('1');
  });

  it('los booleanos valen 1 y 0 en aritmética', () => {
    expect(out('print(1 + True, 0 * False, True + True)')).toBe('2 0 2');
  });

  it('el ternario con condición falsa toma la rama else', () => {
    expect(out('print(1 if False else 2)')).toBe('2');
    expect(out('print(1 if True else 2)')).toBe('1');
  });

  it('atributos y métodos inexistentes en cada tipo de objeto', () => {
    expect(err('l = [1, 2]\nprint(l.foo)')).toContain("AttributeError: 'list' object has no attribute 'foo'");
    expect(err("d = {'a': 1}\nprint(d.foo)")).toContain("AttributeError: 'dict' object has no attribute 'foo'");
    expect(err('f = open("/x")\nprint(f.foo)', { readFile: () => 'hola' }))
      .toContain("AttributeError: '_io.TextIOWrapper' object has no attribute 'foo'");
    expect(err("print('hola'.foo)")).toContain("AttributeError: 'str' object has no attribute 'foo'");
    expect(err('print((1, 2).foo)')).toContain("AttributeError: 'tuple' object has no attribute 'foo'");
    expect(err('x = 42\nprint(x.foo)')).toContain("AttributeError: 'int' object has no attribute 'foo'");
    expect(err('x = None\nprint(x.foo)')).toContain("AttributeError: 'NoneType' object has no attribute 'foo'");
  });

  it('llamar a algo que no es función es un TypeError', () => {
    expect(err('print((42)())')).toContain("TypeError: 'int' object is not callable");
    expect(err('print(None())')).toContain("TypeError: 'NoneType' object is not callable");
    expect(err('print([1]())')).toContain("TypeError: 'list' object is not callable");
  });
});

describe('atributos y subíndices', () => {
  it('atributo inexistente de un módulo', () => {
    expect(err('import sys\nprint(sys.nada)')).toContain("AttributeError: module 'sys' has no attribute 'nada'");
  });

  it('métodos de archivo: read/close', () => {
    expect(out('f = open("/etc/passwd")\nprint(f.read())', { readFile: () => 'hola\n' })).toBe('hola\n');
    expect(out('f = open("/x")\nprint(f.close())', { readFile: () => 'hola' })).toBe('None');
  });

  it('un índice que no es entero', () => {
    expect(err("print('abc'['a'])")).toContain('TypeError: string indices must be integers, not str');
    expect(err('print([1, 2][None])')).toContain('TypeError: list indices must be integers, not NoneType');
  });

  it('índice fuera de rango en string, lista y tupla', () => {
    expect(err("print('ab'[5])")).toContain('IndexError: string index out of range');
    expect(err('print([1, 2][7])')).toContain('IndexError: list index out of range');
    expect(err('print((1, 2)[-9])')).toContain('IndexError: tuple index out of range');
  });

  it('subscript de algo sin subíndices', () => {
    expect(err('print(42[0])')).toContain("TypeError: 'int' object is not subscriptable");
  });

  it('los índices negativos cuentan desde el final', () => {
    expect(out("print('abcd'[-1])\nprint([1, 2, 3][-2])")).toBe('d\n2');
  });
});

describe('comparaciones y membresía', () => {
  it('distinto de y >=', () => {
    expect(out('print(1 != 2, 1 != 1)')).toBe('True False');
    expect(out('print(5 >= 5, 4 >= 5)')).toBe('True False');
  });

  it('comparaciones lexicográficas entre strings', () => {
    expect(out("print('a' < 'b', 'a' > 'b', 'a' <= 'a', 'a' >= 'b')")).toBe('True False True False');
  });

  it('comparar tipos incompatibles es un TypeError', () => {
    expect(err("print('a' < 1)")).toContain("'<' not supported between instances of 'str' and 'int'");
  });

  it('"in" y "not in" sobre dict miran las claves', () => {
    expect(out("d = {'a': 1}\nprint('a' in d, 'z' in d, 'b' not in d)")).toBe('True False True');
  });

  it('"in" sobre algo que no es iterable', () => {
    expect(err('print(1 in 5)')).toContain("TypeError: argument of type 'int' is not iterable");
    expect(err("import sys\nprint('platform' in sys)"))
      .toContain("TypeError: argument of type 'module' is not iterable");
  });
});

describe('operaciones aritméticas y límites', () => {
  it('concatenación de tuplas', () => {
    expect(out('print((1, 2) + (3, 4))')).toBe('(1, 2, 3, 4)');
  });

  it('repetir string con el número a izquierda o a derecha', () => {
    expect(out("print('ab' * 3)")).toBe('ababab');
    expect(out("print(3 * 'ab')")).toBe('ababab');
    expect(out("print('' * 5, 'a' * 0)")).toBe(' ');
  });

  it('operandos con tipos que no combinan son un TypeError', () => {
    expect(err("print('5' - 1)")).toContain("TypeError: unsupported operand type(s) for -: 'str' and 'int'");
    expect(err('print((1, 2) * 3)')).toContain("TypeError: unsupported operand type(s) for *: 'tuple' and 'int'");
    expect(err("print('a' + 1)")).toContain("TypeError: unsupported operand type(s) for +: 'str' and 'int'");
  });

  it('módulo por cero es ZeroDivisionError con mensaje propio', () => {
    expect(err('print(5 % 0)')).toContain('ZeroDivisionError: integer modulo by zero');
    expect(err('print(5 / 0)')).toContain('ZeroDivisionError: division by zero');
    expect(out('print(7 % 3, -7 % 3)')).toBe('1 2');
  });

  it('un multiplicador no finito es un MemoryError (no revienta el navegador)', () => {
    const gigante = `1${'0'.repeat(309)}`; // → Infinity en JS
    expect(err(`print('a' * ${gigante})`)).toContain('MemoryError: string demasiado grande para el simulador');
    expect(err(`print([1] * ${gigante})`)).toContain('MemoryError: lista demasiado grande para el simulador');
  });
});

describe('bucles y control de flujo', () => {
  it('while con break y continue', () => {
    expect(out(`
i = 0
while True:
    i += 1
    if i == 2:
        continue
    if i > 3:
        break
    print(i)
print(i)
`)).toBe('1\n3\n4');
  });

  it('for con break y continue sobre un rango', () => {
    expect(out(`
total = 0
for i in range(10):
    if i == 1:
        continue
    if i > 3:
        break
    total += i
print(total)
`)).toBe('5'); // 0 + 2 + 3
  });

  it('iterar algo que no es iterable', () => {
    expect(err('for x in 42:\n    print(x)')).toContain("TypeError: 'int' object is not iterable");
    expect(err('import sys\nfor x in sys:\n    print(x)')).toContain("TypeError: 'module' object is not iterable");
  });

  it('un rango con paso negativo recorre hacia atrás', () => {
    expect(out(`
acc = []
for i in range(5, 0, -1):
    acc.append(i)
print(acc)
`)).toBe('[5, 4, 3, 2, 1]');
  });

  it('un rango demasiado grande no llega a materializarse', () => {
    expect(err('for i in range(300000):\n    pass'))
      .toContain('OverflowError: rango demasiado grande para el simulador');
  });

  it('break fuera de bucle dentro de una función', () => {
    expect(err('def f():\n    break\nf()')).toContain("SyntaxError: 'break' outside loop");
  });
});

describe('funciones e imports', () => {
  it('una función sin return devuelve None', () => {
    expect(out('def f():\n    x = 1\nprint(f())')).toBe('None');
  });

  it('la cantidad de argumentos es exacta (mensaje con argumento en singular)', () => {
    expect(err('def f(a):\n    pass\nprint(f())'))
      .toContain('TypeError: f() takes 1 positional argument but 0 were given');
    expect(err('def g(a, b):\n    pass\nprint(g(1))'))
      .toContain('TypeError: g() takes 2 positional arguments but 1 were given');
    expect(out('def h(a):\n    return a * 2\nprint(h(3))')).toBe('6');
  });

  it('from … import trae los atributos del módulo', () => {
    expect(out('from time import sleep\nsleep(1)\nprint("ok")')).toBe('ok');
  });

  it('from … import de un nombre inexistente es ImportError', () => {
    expect(err('from time import strftime')).toContain("ImportError: cannot import name 'strftime' from 'time'");
  });

  it('import con alias', () => {
    expect(out('import sys as sistema\nprint(sistema.platform)')).toBe('linux');
  });

  it('import de varios módulos en una sola línea', () => {
    expect(out('import sys, time\nprint(sys.platform, time.time() > 0)')).toBe('linux True');
  });
});

describe('try / except / finally', () => {
  it('except OSError atrapa también ConnectionRefusedError y ejecuta finally', () => {
    expect(out(`
import socket
try:
    s = socket.socket()
    s.connect(("10.0.0.1", 80))
except OSError as e:
    print("capturado")
finally:
    print("fin")
`)).toBe('capturado\nfin');
  });

  it('el finally se ejecuta aunque la excepción no se capture (y sigue propagando)', () => {
    const r = runPython(`
try:
    open("/falta.txt")
except ValueError:
    print("no era ValueError")
finally:
    print("fin")
`, opts({ readFile: () => null }));
    expect(r.output).toBe('fin');
    expect(r.error).toContain('FileNotFoundError');
  });

  it('except sin nombre atrapa cualquier excepción', () => {
    expect(out('try:\n    1 + "a"\nexcept:\n    print("capturado")')).toBe('capturado');
  });

  it('el mensaje de la excepción queda en la variable del except', () => {
    expect(out('try:\n    1 + "a"\nexcept Exception as e:\n    print(e)'))
      .toContain('TypeError');
  });
});

// ── frameworks/python/__tests__/syntax.test.ts ─────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Tests de LEXER y PARSER que `interpreter.test.ts` no cubría: escapes de
// string, string sin cerrar, indentación inconsistente, comentarios a media
// línea, NEWLINE de cierre sin salto final, líneas en blanco, `;`, else/elif,
// subíndices anidados, errores de `for`/`try`/`from`, ternario sin else,
// número inválido, tupla vacía y f-strings (llaves escapadas, comillas y
// errores de llave).
//
// Nota: `lexer.isKeyword()` fue borrado en esta tanda — no tenía ningún
// caller (el parser usa `isNameToken` y su propio `atKw`).
//
// Huecos de `parser.ts` que quedan sin cubrir y por qué NO se fuerzan
// (defensivos, inalcanzables en runtime):
//  - `parser 17 / 235` (saltear un NEWLINE suelto): el lexer emite un
//    NEWLINE por línea con contenido y cada statement lo consume con
//    `endLine()`; el único NEWLINE extra posible es el de la línea 130
//    (llave sin cerrar) y ahí el parse ya falló antes de llegar ahí.
//  - `parser 238` (else del `if peek === 'DEDENT'`): `parseBlock` sale del
//    bucle por DEDENT o por EOF, y el lexer siempre cierra los bloques
//    con DEDENT (líneas 132-135) antes del EOF.
//  - `parser 253` (else de `endLine` = EOF): la línea 126/130 del lexer
//    siempre emite NEWLINE antes del EOF, así que `endLine` nunca ve EOF.

import { describe, it, expect } from 'vitest';
import { runPython } from '../runtime';
import { tokenize } from '../lexer';
import type { PyRunOptions } from '../context';

const opts = (over: Partial<PyRunOptions> = {}): PyRunOptions => ({
  argv: [], inputs: [], sourceName: '<string>', ...over,
});

const out = (src: string): string => {
  const r = runPython(src, opts());
  expect(r.error, `no debía fallar:\n${r.error}`).toBeUndefined();
  return r.output;
};

const err = (src: string): string => {
  const r = runPython(src, opts());
  expect(r.error, 'debía fallar').toBeDefined();
  return r.error!;
};

describe('lexer', () => {
  it('resuelve los escapes de string (\\n, \\t y \\)', () => {
    expect(out(String.raw`print('a\nb')`)).toBe('a\nb');
    expect(out(String.raw`print('a\tb')`)).toBe('a\tb');
    expect(out(String.raw`print('a\\b')`)).toBe(String.raw`a\b`);
  });

  it('un string sin cerrar es un SyntaxError', () => {
    expect(err(String.raw`print('hola)`)).toContain('SyntaxError: EOL while scanning string literal');
  });

  it('una indentación que no coincide con ningún nivel exterior', () => {
    expect(err('if True:\n    x = 1\n y = 2\n'))
      .toContain('SyntaxError: unindent does not match any outer indentation level');
  });

  it('un comentario a media línea corta el tokenizado', () => {
    expect(out('x = 1  # esto es un comentario\nprint(x)')).toBe('1');
    expect(out('# comentario entero\nprint("ok")')).toBe('ok');
  });

  it('un carácter inesperado es SyntaxError', () => {
    expect(err('x = $')).toContain("SyntaxError: invalid syntax (carácter inesperado '$')");
  });

  it('la última línea sin salto final igual emite NEWLINE', () => {
    const toks = tokenize('x = (1');
    expect(toks[toks.length - 1].type).toBe('EOF');
    expect(toks[toks.length - 2].type).toBe('NEWLINE');
  });

  it('normaliza \\r\\n y respeta la indentación anidada', () => {
    expect(out('if True:\r\n    if True:\r\n        print("ok")')).toBe('ok');
  });

  it('resuelve las comillas escapadas dentro de un string', () => {
    expect(out(String.raw`print('a\'b')`)).toBe("a'b");
    expect(out(String.raw`print('a\"b')`)).toBe('a"b');
    // escape desconocido: CPython lo deja literal
    expect(out(String.raw`print('a\q')`)).toBe(String.raw`a\q`);
  });

  it('una expresión que cruza líneas dentro de [], () o {} no corta el statement', () => {
    expect(out('x = [\n    1,\n    2\n]\nprint(len(x))')).toBe('2');
    expect(out('x = (\n    1 +\n    2\n)\nprint(x)')).toBe('3');
  });

  it('la indentación también puede ser con tabuladores', () => {
    expect(out('if True:\n\tprint("tab")')).toBe('tab');
  });
});

describe('parser de statements', () => {
  it('salta líneas en blanco al principio del programa y dentro de un bloque', () => {
    expect(out('\n\nprint(1)')).toBe('1');
    expect(out('if True:\n    print(1)\n\n    print(2)')).toBe('1\n2');
  });

  it('acepta statements separados por ";"', () => {
    expect(out('x = 1;\nprint(x)')).toBe('1');
    expect(out('x = 1; y = 2\nprint(x, y)')).toBe('1 2');
  });

  it('rechaza la asignación a subíndice, también con subíndices anidados', () => {
    expect(err('d = {}\nd[0] = 1')).toContain('asignación a subíndice no soportada');
    expect(err('d = {}\nd[k[0]] = 1')).toContain('asignación a subíndice no soportada');
  });

  it('else y elif encadenados', () => {
    expect(out('if False:\n    print("no")\nelse:\n    print("si")')).toBe('si');
    expect(out(`
x = 2
if x == 1:
    print("uno")
elif x == 2:
    print("dos")
elif x == 3:
    print("tres")
else:
    print("otro")
`)).toBe('dos');
  });

  it('un for sin "in" es SyntaxError', () => {
    expect(err('for x range(3):\n    print(x)')).toContain("SyntaxError: se esperaba 'in'");
  });

  it('un try sin except ni finally es SyntaxError', () => {
    expect(err('try:\n    pass')).toContain("SyntaxError: se esperaba 'except' o 'finally'");
  });

  it('un from sin la palabra import es SyntaxError', () => {
    expect(err('from time time')).toContain("SyntaxError: se esperaba 'import'");
  });

  it('una función sin nombre es SyntaxError', () => {
    expect(err('def 1():\n    pass')).toContain('SyntaxError: se esperaba el nombre de la función');
  });

  it('return sin valor devuelve None', () => {
    expect(out('def f():\n    return\nprint(f())')).toBe('None');
    expect(out('def f():\n    return 7\nprint(f())')).toBe('7');
  });

  it('aug-assign con %=', () => {
    expect(out('x = 10\nx %= 3\nprint(x)')).toBe('1');
    expect(out('x = 10\nx //= 3\nprint(x)')).toBe('3');
  });

  it('un elif sin else cierra la cadena', () => {
    expect(out('if False:\n    print("a")\nelif True:\n    print("b")')).toBe('b');
  });

  it('varios nombres en un from … import', () => {
    expect(out('from time import time, sleep\nsleep(1)\nprint(time() > 0)')).toBe('True');
  });

  it('dos ";" seguidos es SyntaxError (fin de statement)', () => {
    expect(err('x = 1;;')).toContain('SyntaxError: sintaxis inválida');
  });
});

describe('parser de expresiones', () => {
  it('un paréntesis sin cerrar es SyntaxError', () => {
    expect(err('x = (1 + 2')).toContain("SyntaxError: se esperaba ')'");
  });

  it('un ternario sin else es SyntaxError', () => {
    expect(err('x = 1 if True')).toContain("SyntaxError: se esperaba 'else'");
  });

  it('un número mal formado es SyntaxError', () => {
    expect(err('x = 1.2.3')).toContain("SyntaxError: número inválido '1.2.3'");
  });

  it('paréntesis simples, tupla vacía y listas/dicts', () => {
    expect(out('print((1 + 2) * 2)')).toBe('6');
    expect(out('x = ()\nprint(len(x))')).toBe('0');
    expect(out('print(len([1, 2, 3]), len({}))')).toBe('3 0');
    expect(out('print((1, 2), (3, 4))')).toBe('(1, 2) (3, 4)');
  });

  it('operador "not in"', () => {
    expect(out("print('a' not in ['b'], 'a' not in ['a'])")).toBe('True False');
  });

  it('None como expresión', () => {
    expect(out('x = None\nprint(x)')).toBe('None');
  });
});

describe('f-strings', () => {
  it('escapa las llaves dobles', () => {
    expect(out(String.raw`print(f"{{hola}}")`)).toBe('{hola}');
  });

  it('interpola expresiones con comillas y llaves anidadas adentro', () => {
    expect(out(`d = {'k': 1}\nprint(f"{d['k']}")`)).toBe('1');
    expect(out(String.raw`print(f"{ {'k': 1} }")`)).toBe("{'k': 1}");
    // El lexer resuelve `\\` antes de que el parser vea el f-string: así la
    // expresión queda como `'a\'b'` y findBraceEnd tiene que saltear la
    // comilla escapada dentro de las comillas.
    expect(out(String.raw`print(f"{'a\\'b'}")`)).toBe("a'b");
  });

  it('una llave de cierre faltante es SyntaxError', () => {
    expect(err(String.raw`print(f"{x")`)).toContain("SyntaxError: f-string: falta '}' de cierre");
  });

  it('basura después de la expresión es SyntaxError', () => {
    expect(err(String.raw`print(f"{1 2}")`)).toContain('SyntaxError: sintaxis inválida en expresión');
  });

  it('una llave simple en el texto es SyntaxError', () => {
    expect(err(String.raw`print(f"a}b")`)).toContain("SyntaxError: '}' inesperado en f-string");
  });
});

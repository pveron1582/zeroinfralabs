// ── frameworks/python/__tests__/interpreter.test.ts ─────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Tests del mini-intérprete de Python: features del lenguaje y stdlib
// simulada. Nombres en español (convención del repo).

import { describe, it, expect } from 'vitest';
import { runPython } from '../runtime';
import type { PyRunOptions } from '../context';

const base = (over: Partial<PyRunOptions> = {}): PyRunOptions => ({
  argv: ['<string>'],
  inputs: [],
  sourceName: '<string>',
  ...over,
});

const run = (src: string, over: Partial<PyRunOptions> = {}) => runPython(src, base(over));

describe('print y f-strings', () => {
  it('debe imprimir texto simple', () => {
    expect(run(`print('Hola desde Python')`).output).toBe('Hola desde Python');
  });

  it('debe imprimir con varios argumentos separados por espacio', () => {
    expect(run(`print('Hola', 'mundo')`).output).toBe('Hola mundo');
  });

  it('debe evaluar expresiones dentro de f-strings', () => {
    expect(run(`ip = '10.0.0.11'\npuerto = 445\nprint(f"{ip}:{puerto} está abierto")`).output)
      .toBe('10.0.0.11:445 está abierto');
  });

  it('debe soportar indexing dentro de f-strings', () => {
    const src = `servicios = {22: 'SSH', 445: 'SMB'}\np = 445\nprint(f"{p} → {servicios[p]}")`;
    expect(run(src).output).toBe('445 → SMB');
  });
});

describe('variables y tipos', () => {
  it('debe manejar ints, floats y strings', () => {
    expect(run(`x = 7\ny = 2\nprint(x + y, x * y, x / y, x // y, x % y)`).output)
      .toBe('9 14 3.5 3 1');
  });

  it('debe concatenar y repetir strings', () => {
    expect(run(`s = 'foo' + 'bar'\nprint(s, 'ab' * 3)`).output).toBe('foobar ababab');
  });

  it('debe listar, concatenar y usar len', () => {
    expect(run(`abiertos = [22, 80]\nprint(abiertos + [443], len(abiertos))`).output)
      .toBe('[22, 80, 443] 2');
  });

  it('debe soportar índices negativos', () => {
    expect(run(`print('hola'[-1], [1, 2, 3][-2])`).output).toBe('a 2');
  });

  it('debe soportar tuplas', () => {
    expect(run(`host = '10.0.0.11'\np = 22\nprint((host, p))`).output)
      .toBe("('10.0.0.11', 22)");
  });

  it('debe fallar con TypeError al mezclar tipos', () => {
    const r = run(`print('puerto ' + 445)`);
    expect(r.error).toContain("TypeError: unsupported operand type(s) for +: 'str' and 'int'");
  });
});

describe('condiciones', () => {
  it('debe manejar if/elif/else', () => {
    const src = `p = 445\nif p == 22:\n    print('SSH')\nelif p == 445:\n    print('SMB')\nelse:\n    print('otro')`;
    expect(run(src).output).toBe('SMB');
  });

  it('debe soportar and/or/not', () => {
    expect(run(`p = 80\nif p > 0 and p < 1024:\n    print('well-known')`).output).toBe('well-known');
    expect(run(`p = 80\nif not p == 22 or p == 80:\n    print('ok')`).output).toBe('ok');
  });

  it('debe soportar in / not in', () => {
    expect(run(`abiertos = [22, 80]\nprint(445 in abiertos, 22 in abiertos, 'sh' in 'ssh')`).output)
      .toBe('False True True');
  });

  it('debe soportar el ternario (ifexp)', () => {
    expect(run(`r = 0\nprint('abierto' if r == 0 else 'cerrado')`).output).toBe('abierto');
  });

  it('debe soportar suites de una línea', () => {
    expect(run(`p = 22\nif p == 22: print('SSH')`).output).toBe('SSH');
  });
});

describe('bucles', () => {
  it('debe iterar range() con for', () => {
    expect(run(`total = 0\nfor i in range(1, 5):\n    total += i\nprint(total)`).output).toBe('10');
  });

  it('debe iterar listas', () => {
    expect(run(`for p in [22, 80, 445]:\n    print(p)`).output).toBe('22\n80\n445');
  });

  it('debe iterar strings y dicts', () => {
    expect(run(`for c in 'ab':\n    print(c)\nd = {1: 'a', 2: 'b'}\nfor k in d:\n    print(k)`).output)
      .toBe('a\nb\n1\n2');
  });

  it('debe soportar break y continue', () => {
    const src = `for i in range(10):\n    if i == 2:\n        continue\n    if i == 4:\n        break\n    print(i)`;
    expect(run(src).output).toBe('0\n1\n3');
  });

  it('debe iterar while con condición', () => {
    expect(run(`i = 0\nwhile i < 3:\n    print(i)\n    i += 1`).output).toBe('0\n1\n2');
  });
});

describe('funciones', () => {
  it('debe definir y llamar funciones con parámetros y return', () => {
    const src = `def escanear(host, puerto):\n    return f"probando {host}:{puerto}"\nprint(escanear('10.0.0.11', 445))`;
    expect(run(src).output).toBe('probando 10.0.0.11:445');
  });

  it('debe ver variables globales desde una función', () => {
    expect(run(`limite = 100\ndef dentro(n):\n    return n < limite\nprint(dentro(50))`).output)
      .toBe('True');
  });

  it('debe fallar con argumentos de más', () => {
    const r = run(`def f(a):\n    return a\nf(1, 2)`);
    expect(r.error).toContain('TypeError: f() takes 1 positional argument but 2 were given');
  });
});

describe('métodos de tipos', () => {
  it('debe usar métodos de string', () => {
    expect(run(`print('  Hola '.strip().lower().upper())`).output).toBe('HOLA');
    expect(run(`print('a,b,c'.split(','))`).output).toBe("['a', 'b', 'c']");
    expect(run(`print('http://x'.startswith('http'), 'py'.replace('p', 'j'))`).output)
      .toBe("True jy");
    expect(run(`print('-'.join(['10', '0', '0', '11']))`).output).toBe('10-0-0-11');
  });

  it('debe usar append y pop de listas', () => {
    // CPython evalúa los args de print antes de convertirlos a str:
    // pop() muta la lista, por eso el primer arg ya sale como [1].
    expect(run(`l = [1]\nl.append(2)\nprint(l, l.pop(), l)`).output).toBe('[1] 2 [1]');
  });

  it('debe usar get/keys/values/items de dicts', () => {
    expect(run(`d = {22: 'SSH'}\nprint(d.get(22), d.get(99, 'n/d'), d.keys(), d.values())`).output)
      .toBe("SSH n/d [22] ['SSH']");
  });
});

describe('import y sys', () => {
  it('debe exponer sys.argv', () => {
    const r = run(`import sys\nprint(sys.argv[0], len(sys.argv))`, { argv: ['scan.py', '10.0.0.11'] });
    expect(r.output).toBe('scan.py 2');
  });

  it('debe fallar con ModuleNotFoundError para módulos no soportados', () => {
    expect(run(`import paramiko`).error).toContain("ModuleNotFoundError: No module named 'paramiko'");
  });
});

describe('socket simulado', () => {
  const connect = (_host: string, port: number) =>
    port === 22
      ? { ok: true, banner: 'OpenSSH 8.9p1', service: 'ssh', version: 'OpenSSH 8.9p1' }
      : { ok: false, errno: 111 };

  it('debe reportar puertos abiertos con connect_ex y leer banner con recv', () => {
    const src = [
      'import socket',
      "s = socket.socket()",
      "r = s.connect_ex(('10.0.0.11', 22))",
      'print(r)',
      "print(s.recv(1024))",
    ].join('\n');
    const result = run(src, { connect });
    expect(result.output).toBe('0\nOpenSSH 8.9p1');
    expect(result.connections).toHaveLength(1);
    expect(result.connections[0]).toMatchObject({ host: '10.0.0.11', port: 22, ok: true });
  });

  it('debe devolver errno en puertos cerrados con connect_ex', () => {
    const src = `import socket\ns = socket.socket()\nprint(s.connect_ex(('10.0.0.11', 445)))`;
    const result = run(src, { connect });
    expect(result.output).toBe('111');
  });

  it('debe lanzar ConnectionRefusedError con connect() a puerto cerrado', () => {
    const src = `import socket\ns = socket.socket()\ns.connect(('10.0.0.11', 445))`;
    const r = run(src, { connect });
    expect(r.error).toContain('ConnectionRefusedError');
  });

  it('debe fallar recv() sin conexión previa', () => {
    const src = `import socket\ns = socket.socket()\nprint(s.recv(1024))`;
    expect(run(src, { connect }).error).toContain('OSError');
  });
});

describe('try/except/finally', () => {
  it('debe capturar excepciones con except genérico', () => {
    const src = `try:\n    x = int('no-es-numero')\n    print('nunca')\nexcept:\n    print('capturado')`;
    expect(run(src).output).toBe('capturado');
  });

  it('debe capturar por clase y bindear el error con as', () => {
    const src = `try:\n    print(no_existo)\nexcept NameError as e:\n    print('ok', type(e) if False else e)`;
    expect(run(src).output).toContain('ok');
  });

  it('debe ejecutar finally siempre', () => {
    const src = `s = 'x'\ntry:\n    s = s + 1\nexcept Exception:\n    s = 'capturado'\nfinally:\n    print('fin')\nprint(s)`;
    expect(run(src).output).toBe('fin\ncapturado');
  });

  it('debe dejar pasar excepciones no capturadas como traceback', () => {
    const src = `try:\n    1 / 0\nexcept NameError:\n    print('no')`;
    expect(run(src).error).toContain('ZeroDivisionError: division by zero');
  });
});

describe('input() y open()', () => {
  it('debe leer de la cola de inputs', () => {
    const src = `nombre = input('Quién sos? ')\nprint('Hola', nombre)`;
    const r = run(src, { inputs: ['kali'] });
    // La entrada tipeada hace eco (tty): prompt + valor en la misma línea.
    expect(r.output).toBe('Quién sos? kali\nHola kali');
    expect(r.needsInput).toBeUndefined();
  });

  it('debe pedir input() al terminal cuando no hay datos', () => {
    const src = `nombre = input('Quién sos? ')\nprint('Hola', nombre)`;
    const r = run(src);
    expect(r.output).toBe('Quién sos? ');
    expect(r.needsInput?.prompt).toBe('Quién sos? ');
  });

  it('debe leer de pipedInput cuando hay pipe', () => {
    const r = run(`print(input())`, { pipedInput: 'linea-pipe' });
    expect(r.output).toBe('linea-pipe');
  });

  it('debe leer archivos del filesystem simulado con open()', () => {
    const r = run(
      `for linea in open('/tmp/wordlist.txt'):\n    print(linea.strip())`,
      { readFile: () => 'admin\ntoor\n' },
    );
    expect(r.output).toBe('admin\ntoor');
  });

  it('debe fallar con FileNotFoundError si el archivo no existe', () => {
    const r = run(`open('/tmp/no-existe.txt')`, { readFile: () => null });
    expect(r.error).toContain("FileNotFoundError: [Errno 2] No such file or directory: '/tmp/no-existe.txt'");
  });
});

describe('errores y límites', () => {
  it('debe producir traceback de NameError con línea', () => {
    const r = run(`print('uno')\nprint(no_existo)`);
    expect(r.output).toBe('uno');
    expect(r.error).toContain('Traceback (most recent call last):');
    expect(r.error).toContain('line 2');
    expect(r.error).toContain("NameError: name 'no_existo' is not defined");
  });

  it('debe producir SyntaxError para indentación inválida', () => {
    expect(run(`if True:\nprint(1)`).error).toContain('SyntaxError');
  });

  it('debe cortar bucles infinitos con el límite de pasos', () => {
    const r = run(`while True:\n    x = 1`);
    expect(r.error).toContain('RuntimeError');
  });

  it('debe soportar statements separados por ; (one-liner de -c)', () => {
    expect(run(`nombre = 'kali'; print('Hola', nombre)`).output).toBe('Hola kali');
  });

  it('debe soportar comparaciones de strings y KeyError', () => {
    expect(run(`d = {}\nd['falta']`).error).toContain("KeyError: 'falta'");
  });
});

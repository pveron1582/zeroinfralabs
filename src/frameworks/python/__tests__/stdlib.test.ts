// ── frameworks/python/__tests__/stdlib.test.ts ─────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Test DIRECTO de los módulos stdlib simulados. Antes solo se llegaba por
// rebote desde `interpreter.test.ts` y se quedaban sin correr: `import
// time` (que estaba en 0 %, igual que `makeTime`), la conexión exitosa de
// `socket.connect` (banner y estado), las dos trampas de argumentos de
// `connect`, el caso en el que el comando no inyecta callback `connect`
// y el `default` de métodos de socket inexistentes.

import { describe, it, expect } from 'vitest';
import { runPython } from '../runtime';
import type { PyRunOptions, ConnectResult } from '../context';

const opts = (over: Partial<PyRunOptions> = {}): PyRunOptions => ({
  argv: [],
  inputs: [],
  sourceName: '<string>',
  ...over,
});

const script = (...lineas: string[]) => lineas.join('\n');

describe('módulos del stdlib', () => {
  it('import de un módulo no soportado es ModuleNotFoundError', () => {
    const r = runPython('import json', opts());
    expect(r.error).toContain("ModuleNotFoundError: No module named 'json'");
    expect(r.error).toContain('el simulador soporta: sys, socket, time');
  });

  it('sys expone argv y platform', () => {
    const r = runPython('import sys\nprint(sys.argv)\nprint(sys.platform)', opts({ argv: ['x.py', 'a'] }));
    expect(r.output).toBe("['x.py', 'a']\nlinux");
    expect(r.error).toBeUndefined();
  });

  it('time.time() devuelve segundos y time.sleep no retiene nada', () => {
    const r = runPython(script(
      'import time',
      'time.sleep(1)',
      'print(time.time() > 0)',
      'print("después")',
    ), opts());
    expect(r.error).toBeUndefined();
    expect(r.output).toBe('True\ndespués');
  });
});

describe('socket.connect', () => {
  it('conexión exitosa: guarda banner y estado, recv lo devuelve', () => {
    const r = runPython(script(
      'import socket',
      's = socket.socket()',
      's.connect(("192.168.1.10", 80))',
      'print(s.recv())',
      's.close()',
    ), opts({ connect: () => ({ ok: true, banner: 'nginx/1.24', service: 'http', version: '1.24' }) }));
    expect(r.error).toBeUndefined();
    expect(r.output).toBe('nginx/1.24');
    expect(r.connections).toEqual([
      { host: '192.168.1.10', port: 80, ok: true, service: 'http', version: '1.24' },
    ]);
  });

  it('conexión sin banner: recv devuelve cadena vacía y tras close da OSError', () => {
    const r = runPython(script(
      'import socket',
      's = socket.socket()',
      's.connect(("10.0.0.1", 22))',
      'print(s.recv())',
      's.close()',
      's.recv()',
    ), opts({ connect: () => ({ ok: true }) }));
    expect(r.output).toBe('');
    expect(r.error).toContain('OSError: [Errno 107] Transport endpoint is not connected');
    expect(r.connections[0]).toEqual({ host: '10.0.0.1', port: 22, ok: true, service: undefined, version: undefined });
  });

  it('sin callback connect, connect_ex devuelve errno y connect lanza', () => {
    const sinCallback = runPython(script(
      'import socket',
      's = socket.socket()',
      'print(s.connect_ex(("10.0.0.1", 80)))',
    ), opts());
    expect(sinCallback.output).toBe('113');

    const conError = runPython(script(
      'import socket',
      's = socket.socket()',
      's.connect(("10.0.0.1", 80))',
    ), opts());
    expect(conError.error).toContain('ConnectionRefusedError: [Errno 113] Connection refused');
    expect(conError.connections).toEqual([{ host: '10.0.0.1', port: 80, ok: false }]);
  });

  it('errno 110 al conectar se traduce a socket.timeout', () => {
    const r = runPython(script(
      'import socket',
      's = socket.socket()',
      's.connect(("10.0.0.1", 443))',
    ), opts({ connect: () => ({ ok: false, errno: 110 }) }));
    expect(r.error).toContain('socket.timeout: timed out');
  });

  it('connect_ex con error devuelve el errno y deja el socket desconectado', () => {
    const r = runPython(script(
      'import socket',
      's = socket.socket()',
      'print(s.connect_ex(("10.0.0.1", 445)))',
      'print(s.recv())',
    ), opts({ connect: () => ({ ok: false, errno: 111 }) }));
    expect(r.output).toBe('111');
    expect(r.error).toContain('OSError: [Errno 107] Transport endpoint is not connected');
  });

  it('connect espera una tupla (host, puerto)', () => {
    const r = runPython(script('import socket', 's = socket.socket()', 's.connect("10.0.0.1")'), opts());
    expect(r.error).toContain('TypeError: connect espera una tupla (host, puerto)');
  });

  it('connect espera (string, entero)', () => {
    const r = runPython(script('import socket', 's = socket.socket()', 's.connect((10, 80))'), opts());
    expect(r.error).toContain('TypeError: connect espera (string, entero)');
  });

  it('settimeout existe y un método desconocido es AttributeError', () => {
    const ok = runPython(script(
      'import socket',
      's = socket.socket()',
      's.settimeout(2)',
      'print("ok")',
    ), opts());
    expect(ok.output).toBe('ok');

    const mal = runPython(script('import socket', 's = socket.socket()', 's.desconectar()'), opts());
    expect(mal.error).toContain("AttributeError: 'socket' object has no attribute 'desconectar'");
  });

  it('todos los intentos quedan registrados para la metadata de scanResults', () => {
    const conect: ConnectResult = { ok: true, banner: 'SSH-2.0', service: 'ssh', version: '8.2' };
    const r = runPython(script(
      'import socket',
      'a = socket.socket()',
      'a.connect(("192.168.1.5", 22))',
      'b = socket.socket()',
      'b.connect_ex(("192.168.1.6", 445))',
    ), opts({ connect: () => conect }));
    expect(r.error).toBeUndefined();
    expect(r.connections).toHaveLength(2);
    expect(r.connections.map(c => `${c.host}:${c.port}=${c.ok}`)).toEqual([
      '192.168.1.5:22=true',
      '192.168.1.6:445=true',
    ]);
  });
});

describe('defaults de connect (argumentos y errno)', () => {
  it('connect y connect_ex sin argumentos son un TypeError', () => {
    const a = runPython(script('import socket', 's = socket.socket()', 's.connect()'), opts());
    expect(a.error).toContain('TypeError: connect espera una tupla (host, puerto)');

    const b = runPython(script('import socket', 's = socket.socket()', 'print(s.connect_ex())'), opts());
    expect(b.error).toContain('TypeError: connect espera una tupla (host, puerto)');
  });

  it('un fallo sin errno reporta ECONNREFUSED (111) por defecto', () => {
    const r = runPython(script(
      'import socket',
      's = socket.socket()',
      's.connect(("10.0.0.1", 80))',
    ), opts({ connect: () => ({ ok: false }) }));
    expect(r.error).toContain('[Errno 111] Connection refused');
    expect(r.connections[0]).toEqual({ host: '10.0.0.1', port: 80, ok: false });
  });

  it('connect_ex con banner lo guarda; sin errno devuelve 111', () => {
    const ok = runPython(script(
      'import socket',
      's = socket.socket()',
      'print(s.connect_ex(("10.0.0.1", 21)))',
      'print(s.recv())',
    ), opts({ connect: () => ({ ok: true, banner: '220 FTP listo' }) }));
    expect(ok.output).toBe('0\n220 FTP listo');

    const ko = runPython(script(
      'import socket',
      's = socket.socket()',
      'print(s.connect_ex(("10.0.0.1", 21)))',
    ), opts({ connect: () => ({ ok: false }) }));
    expect(ko.output).toBe('111');

    // Sin banner, recv devuelve cadena vacía (res.banner ?? '')
    const sinBanner = runPython(script(
      'import socket',
      's = socket.socket()',
      'print(s.connect_ex(("10.0.0.1", 21)))',
      'print(s.recv())',
    ), opts({ connect: () => ({ ok: true }) }));
    expect(sinBanner.output).toBe('0\n');
    expect(sinBanner.error).toBeUndefined();
  });
});

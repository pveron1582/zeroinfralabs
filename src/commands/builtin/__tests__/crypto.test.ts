// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_md5sum, cmd_sha256sum, cmd_base64, cmd_strings } from '../crypto';
import type { Machine } from '../../../types';

const mk = (): Machine => ({
  id: 'm',
  machine_info: { hostname: 't', ip: '10.0.0.1', mac: '', os: 'Ubuntu', status: 'up', type: 'server' },
  discovery_level: 4, scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [
    { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o700 },
    { path: '/root/hello.txt', content: 'hello\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    { path: '/root/bin', content: '\x01\x02\xffabcd\x00efgh\x00\x11\x22\x33', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
  ],
} as unknown as Machine);

const ctx = (m: Machine, extra: object = {}) =>
  ({ machine: m, allMachines: [m], currentDir: '/root', ...extra }) as any;

describe('cmd_md5sum', () => {
  it('debe hashear archivo (vector RFC)', () => {
    const result = cmd_md5sum.execute(['hello.txt'], ctx(mk()));
    expect(result.isError).toBeFalsy();
    expect(result.output).toBe('5d41402abc4b2a76b9719d911017c592  hello.txt');
  });

  it('debe hashear stdin', () => {
    const result = cmd_md5sum.execute([], ctx(mk(), { pipedInput: 'hello' }));
    expect(result.output).toBe('5d41402abc4b2a76b9719d911017c592  -');
  });

  it('debe fallar si no existe', () => {
    expect(cmd_md5sum.execute(['/nope'], ctx(mk())).isError).toBe(true);
  });
});

describe('cmd_sha256sum', () => {
  it('debe hashear archivo (vector FIPS)', () => {
    const result = cmd_sha256sum.execute(['hello.txt'], ctx(mk()));
    expect(result.isError).toBeFalsy();
    expect(result.output).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824  hello.txt');
  });

  it('debe hashear stdin', () => {
    const result = cmd_sha256sum.execute([], ctx(mk(), { pipedInput: 'abc' }));
    expect(result.output).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad  -');
  });
});

describe('cmd_base64', () => {
  it('debe codificar y decodificar', () => {
    const m = mk();
    expect(cmd_base64.execute([], ctx(m, { pipedInput: 'hello' })).output).toBe('aGVsbG8=');
    expect(cmd_base64.execute(['-d'], ctx(m, { pipedInput: 'aGVsbG8=' })).output).toBe('hello');
  });

  it('debe codificar ASCII puro', () => {
    const m = mk();
    expect(cmd_base64.execute([], ctx(m, { pipedInput: 'hello world' })).output).toBe('aGVsbG8gd29ybGQ=');
    expect(cmd_base64.execute(['-d'], ctx(m, { pipedInput: 'aGVsbG8gd29ybGQ=' })).output).toBe('hello world');
  });

  it('debe fallar con base64 inválido', () => {
    expect(cmd_base64.execute(['-d'], ctx(mk(), { pipedInput: '!!!' })).isError).toBe(true);
  });
});

describe('cmd_strings', () => {
  it('debe extraer corridas imprimibles', () => {
    const result = cmd_strings.execute(['bin'], ctx(mk()));
    expect(result.output).toContain('abcd');
    expect(result.output).toContain('efgh');
    expect(result.output).not.toContain('\x00');
  });

  it('debe respetar -n', () => {
    const result = cmd_strings.execute(['-n', '3', 'bin'], ctx(mk()));
    // corridas de largo 4 ('abcd', 'efgh') quedan
    expect(result.output).toContain('abcd');
    expect(result.output).toContain('efgh');
    const strict = cmd_strings.execute(['-n', '6', 'bin'], ctx(mk()));
    expect(strict.output).toBe('');
  });

  it('debe fallar sin archivo', () => {
    expect(cmd_strings.execute([], ctx(mk())).isError).toBe(true);
  });
});

// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_cut, cmd_tr, cmd_tac, cmd_nl, cmd_rev, cmd_column } from '../text';
import type { Machine } from '../../../types';

const mk = (files: Machine['files'] = []): Machine => ({
  id: 'm',
  machine_info: { hostname: 't', ip: '10.0.0.1', mac: '', os: 'Ubuntu', status: 'up', type: 'server' },
  discovery_level: 4, scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [
    { path: '/etc/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    ...files,
  ],
} as unknown as Machine);

const ctx = (m: Machine, extra: object = {}) =>
  ({ machine: m, allMachines: [m], currentDir: '/', ...extra }) as any;

describe('cmd_cut', () => {
  it('debe cortar campos con -d -f', () => {
    const result = cmd_cut.execute(['-d:', '-f1', '/etc/passwd'], ctx(mk()));
    expect(result.isError).toBeFalsy();
    expect(result.output).toBe('root\nuser');
  });

  it('debe soportar rangos y múltiples campos', () => {
    const result = cmd_cut.execute(['-d:', '-f1,7', '/etc/passwd'], ctx(mk()));
    expect(result.output.split('\n')[0]).toBe('root:/bin/bash');
  });

  it('debe cortar caracteres con -c', () => {
    const result = cmd_cut.execute(['-c1-4', '/etc/passwd'], ctx(mk()));
    expect(result.output.split('\n')[0]).toBe('root');
  });

  it('debe fallar sin lista', () => {
    expect(cmd_cut.execute(['/etc/passwd'], ctx(mk())).isError).toBe(true);
  });
});

describe('cmd_tr', () => {
  it('debe traducir minúsculas', () => {
    const result = cmd_tr.execute(['a-z', 'A-Z'], ctx(mk(), { pipedInput: 'hello' }));
    expect(result.output).toBe('HELLO');
  });

  it('debe borrar con -d', () => {
    const result = cmd_tr.execute(['-d', 'l'], ctx(mk(), { pipedInput: 'hello' }));
    expect(result.output).toBe('heo');
  });

  it('debe comprimir con -s', () => {
    const result = cmd_tr.execute(['-s', 'l'], ctx(mk(), { pipedInput: 'hello' }));
    expect(result.output).toBe('helo');
  });
});

describe('cmd_tac', () => {
  it('debe invertir líneas', () => {
    const result = cmd_tac.execute([], ctx(mk(), { pipedInput: 'a\nb\nc' }));
    expect(result.output).toBe('c\nb\na');
  });
});

describe('cmd_nl', () => {
  it('debe numerar no vacías por defecto', () => {
    const result = cmd_nl.execute([], ctx(mk(), { pipedInput: 'a\n\nb' }));
    expect(result.output).toContain('1\ta');
    expect(result.output).toContain('2\tb');
  });

  it('debe numerar todo con -ba', () => {
    const result = cmd_nl.execute(['-ba'], ctx(mk(), { pipedInput: 'a\n\nb' }));
    expect(result.output).toContain('2\t');
  });
});

describe('cmd_rev', () => {
  it('debe invertir caracteres', () => {
    const result = cmd_rev.execute([], ctx(mk(), { pipedInput: 'abc\nde' }));
    expect(result.output).toBe('cba\ned');
  });
});

describe('cmd_column', () => {
  it('debe alinear tabla con -t', () => {
    const result = cmd_column.execute(['-t'], ctx(mk(), { pipedInput: 'a bb\nccc d' }));
    expect(result.output).toBe('a    bb\nccc  d');
  });

  it('debe soportar -s y -o', () => {
    const result = cmd_column.execute(['-t', '-s:', '-o', '|'], ctx(mk(), { pipedInput: 'a:bb\nccc:d' }));
    expect(result.output).toBe('a  |bb\nccc|d');
  });

  it('debe exigir -t', () => {
    expect(cmd_column.execute([], ctx(mk(), { pipedInput: 'a' })).isError).toBe(true);
  });
});

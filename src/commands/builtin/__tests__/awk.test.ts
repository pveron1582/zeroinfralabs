// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_awk } from '../awk';
import type { Machine } from '../../../types';

const PASSWD = 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash\nnobody:x:99:99::/:/bin/false\n';

const mk = (): Machine => ({
  id: 'm',
  machine_info: { hostname: 't', ip: '10.0.0.1', mac: '', os: 'Ubuntu', status: 'up', type: 'server' },
  discovery_level: 4, scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [
    { path: '/etc/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/etc/passwd', content: PASSWD, type: 'text', owner: 'root', group: 'root', mode: 0o644 },
  ],
} as unknown as Machine);

const ctx = (m: Machine, extra: object = {}) =>
  ({ machine: m, allMachines: [m], currentDir: '/', ...extra }) as any;

describe('cmd_awk', () => {
  it('debe imprimir campos con -F', () => {
    const result = cmd_awk.execute(['-F:', '{print $1}', '/etc/passwd'], ctx(mk()));
    expect(result.isError).toBeFalsy();
    expect(result.output).toBe('root\nuser\nnobody');
  });

  it('debe filtrar por comparación numérica', () => {
    const result = cmd_awk.execute(['-F:', '$3 > 100 {print $1}', '/etc/passwd'], ctx(mk()));
    expect(result.output).toBe('user');
  });

  it('debe filtrar por regex', () => {
    const result = cmd_awk.execute(['-F:', '/bash/ {print $1}', '/etc/passwd'], ctx(mk()));
    expect(result.output).toBe('root\nuser');
  });

  it('debe soportar BEGIN, END y NR', () => {
    const result = cmd_awk.execute(['BEGIN {print "start"} {print NR": "$1} END {print NR}'], ctx(mk(), { pipedInput: 'a\nb' }));
    expect(result.output).toBe('start\n1: a\n2: b\n2');
  });

  it('debe concatenar sin coma y separar con coma', () => {
    const m = mk();
    expect(cmd_awk.execute(['{print $1"-"$2}'], ctx(m, { pipedInput: 'a b' })).output).toBe('a-b');
    expect(cmd_awk.execute(['{print $1, $2}'], ctx(m, { pipedInput: 'a b' })).output).toBe('a b');
  });

  it('debe soportar $NF y next', () => {
    const m = mk();
    expect(cmd_awk.execute(['-F:', '{print $NF}', '/etc/passwd'], ctx(m)).output.split('\n')[0]).toBe('/bin/bash');
    const result = cmd_awk.execute(['/bash/ {next} {print $1}'], ctx(m, { pipedInput: 'x bash\ny' }));
    expect(result.output).toBe('y');
  });

  it('debe fallar sin programa y con archivo inexistente', () => {
    const m = mk();
    expect(cmd_awk.execute([], ctx(m)).isError).toBe(true);
    expect(cmd_awk.execute(['{print}', '/nope'], ctx(m)).isError).toBe(true);
  });
});

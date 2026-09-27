// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_stat } from '../stat';
import type { Machine } from '../../../types';

const mk = (): Machine => ({
  id: 'm',
  machine_info: { hostname: 't', ip: '10.0.0.1', mac: '', os: 'Ubuntu', status: 'up', type: 'server' },
  discovery_level: 4, scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [
    { path: '/etc/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    { path: '/home/user/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 },
    { path: '/home/user/script.sh', content: '#!/bin/bash\necho hi\n', type: 'text', owner: 'user', group: 'user', mode: 0o755 },
  ],
} as unknown as Machine);

const ctx = (m: Machine) => ({ machine: m, allMachines: [m], currentDir: '/' }) as any;

describe('cmd_stat', () => {
  it('debe mostrar estado completo de un archivo', () => {
    const result = cmd_stat.execute(['/etc/passwd'], ctx(mk()));
    expect(result.isError).toBeFalsy();
    expect(result.output).toContain('File: /etc/passwd');
    expect(result.output).toContain('Size: 32');
    expect(result.output).toContain('regular file');
    expect(result.output).toContain('0644/-rw-r--r--');
    expect(result.output).toContain('root');
    expect(result.output).toContain('Access: 2');
    expect(result.output).toContain('Modify: 2');
    expect(result.output).toContain('Birth: -');
  });

  it('debe mostrar directorios', () => {
    const result = cmd_stat.execute(['/home/user'], ctx(mk()));
    expect(result.isError).toBeFalsy();
    expect(result.output).toContain('directory');
    expect(result.output).toContain('Size: 4096');
  });

  it('debe fallar si no existe', () => {
    const result = cmd_stat.execute(['/nope'], ctx(mk()));
    expect(result.isError).toBe(true);
    expect(result.output).toContain('No such file or directory');
  });

  it('debe soportar -c con formato', () => {
    const result = cmd_stat.execute(['-c', '%a %U %G %s %n', '/home/user/script.sh'], ctx(mk()));
    expect(result.isError).toBeFalsy();
    expect(result.output).toBe('755 user user 20 /home/user/script.sh');
  });

  it('debe procesar varios archivos y marcar error parcial', () => {
    const result = cmd_stat.execute(['/etc/passwd', '/nope'], ctx(mk()));
    expect(result.isError).toBe(true);
    expect(result.output).toContain('File: /etc/passwd');
    expect(result.output).toContain('No such file or directory');
  });
});

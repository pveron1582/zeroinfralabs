// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_file } from '../file';
import type { Machine } from '../../../types';

const mk = (): Machine => ({
  id: 'm',
  machine_info: { hostname: 't', ip: '10.0.0.1', mac: '', os: 'Ubuntu', status: 'up', type: 'server' },
  discovery_level: 4, scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [
    { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o700 },
    { path: '/root/empty.txt', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    { path: '/root/run.sh', content: '#!/bin/bash\necho hi\n', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/root/notes.txt', content: 'hello world\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    { path: '/root/data.json', content: '{"a": 1}\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    { path: '/root/link', content: '/root/notes.txt', type: 'symlink', linkTarget: '/root/notes.txt', owner: 'root', group: 'root', mode: 0o777 },
    { path: '/root/blob.bin', content: '\x01\x02\x03\x04\xff\xfebinary', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
  ],
} as unknown as Machine);

const ctx = (m: Machine) => ({ machine: m, allMachines: [m], currentDir: '/root' }) as any;

describe('cmd_file', () => {
  it('debe detectar directorio, vacío y texto', () => {
    const m = mk();
    expect(cmd_file.execute(['/root'], ctx(m)).output).toContain('directory');
    expect(cmd_file.execute(['empty.txt'], ctx(m)).output).toContain('empty');
    expect(cmd_file.execute(['notes.txt'], ctx(m)).output).toContain('ASCII text');
  });

  it('debe detectar shebang, symlink y JSON', () => {
    const m = mk();
    expect(cmd_file.execute(['run.sh'], ctx(m)).output).toContain('Bourne-Again shell script');
    expect(cmd_file.execute(['link'], ctx(m)).output).toContain('symbolic link');
    expect(cmd_file.execute(['data.json'], ctx(m)).output).toContain('JSON data');
  });

  it('debe detectar binario como data', () => {
    const m = mk();
    const result = cmd_file.execute(['blob.bin'], ctx(m));
    expect(result.output).toContain('data');
  });

  it('debe soportar -b sin prefijo', () => {
    const m = mk();
    const result = cmd_file.execute(['-b', 'notes.txt'], ctx(m));
    expect(result.output).toBe('ASCII text');
  });

  it('debe fallar si no existe', () => {
    const m = mk();
    const result = cmd_file.execute(['/nope'], ctx(m));
    expect(result.isError).toBe(true);
    expect(result.output).toContain('No such file or directory');
  });
});

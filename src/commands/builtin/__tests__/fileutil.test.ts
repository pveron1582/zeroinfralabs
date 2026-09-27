// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_basename, cmd_dirname, cmd_realpath } from '../fileutil';
import type { Machine } from '../../../types';

const mk = (): Machine => ({
  id: 'm',
  machine_info: { hostname: 't', ip: '10.0.0.1', mac: '', os: 'Ubuntu', status: 'up', type: 'server' },
  discovery_level: 4, scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [
    { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o700 },
    { path: '/root/wallpaper', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    { path: '/root/link', content: '/root/wallpaper', type: 'symlink', linkTarget: '/root/wallpaper', owner: 'root', group: 'root', mode: 0o777 },
  ],
} as unknown as Machine);

const ctx = (m: Machine) => ({ machine: m, allMachines: [m], currentDir: '/root' }) as any;

describe('cmd_basename', () => {
  it('debe quitar directorio y sufijo', () => {
    expect(cmd_basename.execute(['/usr/bin/sort'], ctx(mk())).output).toBe('sort');
    expect(cmd_basename.execute(['include/stdio.h', '.h'], ctx(mk())).output).toBe('stdio');
    expect(cmd_basename.execute(['/etc/'], ctx(mk())).output).toBe('etc');
  });
});

describe('cmd_dirname', () => {
  it('debe quitar el último componente', () => {
    const m = mk();
    expect(cmd_dirname.execute(['/usr/bin/sort'], ctx(m)).output).toBe('/usr/bin');
    expect(cmd_dirname.execute(['x/y/../z'], ctx(m)).output).toBe('x/y/..');
    expect(cmd_dirname.execute(['file.txt'], ctx(m)).output).toBe('.');
    expect(cmd_dirname.execute(['/root/'], ctx(m)).output).toBe('/');
  });
});

describe('cmd_realpath', () => {
  it('debe resolver rutas', () => {
    const m = mk();
    expect(cmd_realpath.execute(['wallpaper'], ctx(m)).output).toBe('/root/wallpaper');
    expect(cmd_realpath.execute(['../etc/./passwd'], ctx(m)).output).toBe('/etc/passwd');
  });

  it('debe resolver symlinks', () => {
    const m = mk();
    expect(cmd_realpath.execute(['link'], ctx(m)).output).toBe('/root/wallpaper');
  });

  it('debe fallar con -e si no existe', () => {
    const m = mk();
    const result = cmd_realpath.execute(['-e', '/root/nope'], ctx(m));
    expect(result.isError).toBe(true);
    expect(result.output).toContain('No such file or directory');
  });

  it('debe fallar sin argumento', () => {
    expect(cmd_realpath.execute([], ctx(mk())).isError).toBe(true);
  });
});

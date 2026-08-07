import { describe, it, expect } from 'vitest';
import { cmd_chgrp } from '../chgrp';
import type { Machine, CommandContext } from '../../../types';

function makeMachine(overrides?: Partial<Machine>): Machine {
  return {
    id: 'target-01',
    machine_info: { hostname: 'target', ip: '192.168.1.100', mac: '00:11:22:33:44:55', os: 'Linux', status: 'up', type: 'workstation' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/etc/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/etc/group', content: 'root:x:0:root\nuser:x:1000:user\nwww-data:x:33:www-data\ndevelopers:x:2000:user,www-data\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/home/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/home/user/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 },
      { path: '/home/user/file.txt', content: 'data', type: 'text', owner: 'user', group: 'user', mode: 0o644 },
      { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o700 },
    ],
    ...overrides,
  };
}

describe('cmd_chgrp', () => {
  it('debe mostrar error si no hay argumentos', () => {
    const machine = makeMachine();
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chgrp.execute([], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('usage: chgrp');
  });

  it('debe mostrar error si el grupo no existe', () => {
    const machine = makeMachine();
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chgrp.execute(['nogroup', 'file.txt'], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('invalid group');
  });

  it('debe cambiar grupo como root', () => {
    const machine = makeMachine({ id: 'attacker-01' });
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chgrp.execute(['www-data', 'file.txt'], context);
    expect(result.isError).toBe(false);
    const file = machine.files.find(f => f.path === '/home/user/file.txt');
    expect(file?.group).toBe('www-data');
  });

  it('debe permitir cambio a grupo del que el usuario es miembro (no-root)', () => {
    const machine = makeMachine({
      id: 'target-01',
      found_credentials: [{ file: '', user: 'user', pass: 'pass', verified: true, service: 'ssh' }],
    });
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chgrp.execute(['developers', 'file.txt'], context);
    expect(result.isError).toBe(false);
    const file = machine.files.find(f => f.path === '/home/user/file.txt');
    expect(file?.group).toBe('developers');
  });

  it('debe denegar cambio a grupo del que el usuario NO es miembro (no-root)', () => {
    const machine = makeMachine({
      id: 'target-01',
      found_credentials: [{ file: '', user: 'user', pass: 'pass', verified: true, service: 'ssh' }],
    });
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chgrp.execute(['www-data', 'file.txt'], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Operation not permitted');
  });

  it('debe denegar cambio si el usuario no es dueño del archivo (no-root)', () => {
    const machine = makeMachine({
      id: 'target-01',
      found_credentials: [{ file: '', user: 'user', pass: 'pass', verified: true, service: 'ssh' }],
    });
    const context = { currentDir: '/root/', machine } as CommandContext;
    const result = cmd_chgrp.execute(['developers', '.'], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Operation not permitted');
  });

  it('debe cambiar recursivamente con -R', () => {
    const machine = makeMachine({ id: 'attacker-01' });
    const context = { currentDir: '/home/', machine } as CommandContext;
    const result = cmd_chgrp.execute(['-R', 'developers', 'user'], context);
    expect(result.isError).toBe(false);
    const dir = machine.files.find(f => f.path === '/home/user/.dir');
    expect(dir?.group).toBe('developers');
    const file = machine.files.find(f => f.path === '/home/user/file.txt');
    expect(file?.group).toBe('developers');
  });

  it('debe fallar si el archivo no existe', () => {
    const machine = makeMachine({ id: 'attacker-01' });
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chgrp.execute(['www-data', 'noexiste.txt'], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('No such file or directory');
  });

  it('debe mostrar error con opción inválida', () => {
    const machine = makeMachine({ id: 'attacker-01' });
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chgrp.execute(['-x', 'www-data', 'file.txt'], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('invalid option');
  });
});

import { describe, it, expect } from 'vitest';
import { cmd_chown } from '../chown';
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
      { path: '/etc/group', content: 'root:x:0:root\nuser:x:1000:user\nwww-data:x:33:www-data\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/home/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/home/user/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 },
      { path: '/home/user/file.txt', content: 'data', type: 'text', owner: 'user', group: 'user', mode: 0o644 },
    ],
    ...overrides,
  };
}

describe('cmd_chown', () => {
  it('debe mostrar error si no hay argumentos', () => {
    const machine = makeMachine();
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chown.execute([], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('usage: chown');
  });

  it('debe denegar operación si no es root', () => {
    const machine = makeMachine({ id: 'target-01' });
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chown.execute(['root', 'file.txt'], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Operation not permitted');
  });

  it('debe cambiar owner como root', () => {
    const machine = makeMachine({ id: 'attacker-01' });
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chown.execute(['root', 'file.txt'], context);
    expect(result.isError).toBe(false);
    const file = machine.files.find(f => f.path === '/home/user/file.txt');
    expect(file?.owner).toBe('root');
  });

  it('debe cambiar owner:group como root', () => {
    const machine = makeMachine({ id: 'attacker-01' });
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chown.execute(['www-data:www-data', 'file.txt'], context);
    expect(result.isError).toBe(false);
    const file = machine.files.find(f => f.path === '/home/user/file.txt');
    expect(file?.owner).toBe('www-data');
    expect(file?.group).toBe('www-data');
  });

  it('debe cambiar solo grupo con owner: vacío no es válido', () => {
    const machine = makeMachine({ id: 'attacker-01' });
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chown.execute([':www-data', 'file.txt'], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('invalid user');
  });

  it('debe fallar con usuario inexistente', () => {
    const machine = makeMachine({ id: 'attacker-01' });
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chown.execute(['noexiste', 'file.txt'], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('invalid user');
  });

  it('debe fallar con grupo inexistente', () => {
    const machine = makeMachine({ id: 'attacker-01' });
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chown.execute(['root:nogroup', 'file.txt'], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('invalid group');
  });

  it('debe cambiar recursivamente con -R', () => {
    const machine = makeMachine({ id: 'attacker-01' });
    const context = { currentDir: '/home/', machine } as CommandContext;
    const result = cmd_chown.execute(['-R', 'root', 'user'], context);
    expect(result.isError).toBe(false);
    const dir = machine.files.find(f => f.path === '/home/user/.dir');
    expect(dir?.owner).toBe('root');
    const file = machine.files.find(f => f.path === '/home/user/file.txt');
    expect(file?.owner).toBe('root');
  });

  it('debe fallar si el archivo no existe', () => {
    const machine = makeMachine({ id: 'attacker-01' });
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chown.execute(['root', 'noexiste.txt'], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('No such file or directory');
  });

  it('debe mostrar error con opción inválida', () => {
    const machine = makeMachine({ id: 'attacker-01' });
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chown.execute(['-x', 'root', 'file.txt'], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('invalid option');
  });
});

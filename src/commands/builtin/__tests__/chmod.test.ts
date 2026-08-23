import { describe, it, expect } from 'vitest';
import { cmd_chmod } from '../chmod';
import type { Machine, CommandContext } from '../../../types';

function makeMachine(overrides?: Partial<Machine>): Machine {
  return {
    id: 'test-machine',
    machine_info: { hostname: 'test', ip: '192.168.1.100', mac: '00:11:22:33:44:55', os: 'Linux', status: 'up', type: 'workstation' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/home/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/home/user/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 },
      { path: '/home/user/file.txt', content: 'hello', type: 'text', owner: 'user', group: 'user', mode: 0o644 },
      { path: '/home/user/script.sh', content: '#!/bin/bash', type: 'text', owner: 'user', group: 'user', mode: 0o644 },
      { path: '/etc/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    ],
    ...overrides,
  };
}

describe('cmd_chmod', () => {
  it('debe mostrar error si no hay argumentos', () => {
    const context = { currentDir: '/home/user/', machine: makeMachine() } as CommandContext;
    const result = cmd_chmod.execute([], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('usage: chmod');
  });

  it('debe mostrar error si solo hay mode sin archivo', () => {
    const context = { currentDir: '/home/user/', machine: makeMachine() } as CommandContext;
    const result = cmd_chmod.execute(['755'], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('usage: chmod');
  });

  it('debe cambiar permisos con modo octal', () => {
    const machine = makeMachine();
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chmod.execute(['755', 'script.sh'], context);
    expect(result.isError).toBe(false);
    const file = machine.files.find(f => f.path === '/home/user/script.sh');
    expect(file?.mode).toBe(0o755);
  });

  it('debe cambiar permisos con modo simbólico (u+x)', () => {
    const machine = makeMachine();
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chmod.execute(['u+x', 'script.sh'], context);
    expect(result.isError).toBe(false);
    const file = machine.files.find(f => f.path === '/home/user/script.sh');
    expect(file?.mode).toBe(0o744);
  });

  it('debe soportar bits especiales simbólicos (u+s = SUID)', () => {
    const machine = makeMachine();
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chmod.execute(['u+s', 'script.sh'], context);
    expect(result.isError).toBe(false);
    const file = machine.files.find(f => f.path === '/home/user/script.sh');
    expect(file?.mode).toBe(0o4644);
  });

  it('debe soportar g+s (SGID) y +t (sticky en directorio)', () => {
    const machine = makeMachine();
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    cmd_chmod.execute(['g+s', 'script.sh'], context);
    expect(machine.files.find(f => f.path === '/home/user/script.sh')?.mode).toBe(0o2644);
    // sticky sobre el home del usuario (directorio propio)
    cmd_chmod.execute(['+t', '/home/user'], context);
    expect(machine.files.find(f => f.path === '/home/user/.dir')?.mode).toBe(0o1755);
  });

  it('debe soportar cláusulas múltiples separadas por coma', () => {
    const machine = makeMachine();
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chmod.execute(['u+x,g+s', 'script.sh'], context);
    expect(result.isError).toBe(false);
    // 644 → u+x da 744 → g+s agrega SGID
    const file = machine.files.find(f => f.path === '/home/user/script.sh');
    expect(file?.mode).toBe(0o2744);
  });

  it('preserva el bit SUID en operaciones simbólicas que no lo mencionan', () => {
    const machine = makeMachine({
      files: [
        { path: '/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
        { path: '/usr/bin/tool', content: '[ELF]', type: 'binary', owner: 'root', group: 'root', mode: 0o4755 },
        { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      ],
    });
    // root ejecuta chmod u+x sobre el binario ya SUID
    const context = { currentDir: '/', machine } as CommandContext;
    cmd_chmod.execute(['u+x', '/usr/bin/tool'], context);
    const file = machine.files.find(f => f.path === '/usr/bin/tool');
    expect(file?.mode).toBe(0o4755); // SUID intacto
  });

  it('debe cambiar permisos con modo simbólico (g-w)', () => {
    const machine = makeMachine();
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chmod.execute(['g-w', 'file.txt'], context);
    expect(result.isError).toBe(false);
    const file = machine.files.find(f => f.path === '/home/user/file.txt');
    expect(file?.mode).toBe(0o644);
  });

  it('debe cambiar permisos con modo simbólico (o=r)', () => {
    const machine = makeMachine();
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chmod.execute(['o=r', 'file.txt'], context);
    expect(result.isError).toBe(false);
    const file = machine.files.find(f => f.path === '/home/user/file.txt');
    expect(file?.mode).toBe(0o644);
  });

  it('debe cambiar permisos recursivamente con -R', () => {
    const machine = makeMachine();
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chmod.execute(['-R', '700', 'misarchivos'], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('No such file or directory');
  });

  it('debe cambiar permisos recursivamente con -R en directorio', () => {
    const machine = makeMachine();
    const context = { currentDir: '/home/', machine } as CommandContext;
    const result = cmd_chmod.execute(['-R', '700', 'user'], context);
    expect(result.isError).toBe(false);
    const dir = machine.files.find(f => f.path === '/home/user/.dir');
    expect(dir?.mode).toBe(0o700);
    const file = machine.files.find(f => f.path === '/home/user/file.txt');
    expect(file?.mode).toBe(0o700);
  });

  it('debe denegar cambio si no es el dueño (ni root)', () => {
    const machine = makeMachine();
    const context = { currentDir: '/etc/', machine } as CommandContext;
    const result = cmd_chmod.execute(['777', 'passwd'], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Operation not permitted');
  });

  it('debe mostrar error si el archivo no existe', () => {
    const machine = makeMachine();
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chmod.execute(['755', 'noexiste.txt'], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('No such file or directory');
  });

  it('debe mostrar error si el modo es inválido', () => {
    const machine = makeMachine();
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chmod.execute(['xyz', 'file.txt'], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('invalid mode');
  });

  it('debe mostrar error si la opción es inválida', () => {
    const machine = makeMachine();
    const context = { currentDir: '/home/user/', machine } as CommandContext;
    const result = cmd_chmod.execute(['-x', '755', 'file.txt'], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('invalid option');
  });
});

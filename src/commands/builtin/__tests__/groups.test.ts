import { describe, it, expect } from 'vitest';
import { cmd_groups } from '../groups';
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
      { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\ndeveloper:x:1001:1001:Developer:/home/developer:/bin/bash\n', type: 'text' },
      { path: '/etc/group', content: 'root:x:0:root\nuser:x:1000:user\nwww-data:x:33:www-data\ndeveloper:x:1001:developer\ndevelopers:x:2000:developer\nstaff:x:2001:user,developer\nsudo:x:27:user\n', type: 'text' },
    ],
    ...overrides,
  };
}

describe('cmd_groups', () => {
  it('debe mostrar grupos del usuario actual', () => {
    const machine = makeMachine({
      id: 'target-01',
      found_credentials: [{ file: '', user: 'user', pass: 'pass', verified: true, service: 'ssh' }],
    });
    const context = { machine } as CommandContext;
    const result = cmd_groups.execute([], context);
    expect(result.output).toContain('user :');
    expect(result.output).toContain('user');
    expect(result.output).toContain('staff');
    expect(result.output).toContain('sudo');
    expect(result.isError).toBe(undefined);
  });

  it('debe mostrar grupos de otro usuario', () => {
    const machine = makeMachine();
    const context = { machine } as CommandContext;
    const result = cmd_groups.execute(['developer'], context);
    expect(result.output).toContain('developer :');
    expect(result.output).toContain('developers');
    expect(result.output).toContain('staff');
    expect(result.isError).toBe(undefined);
  });

  it('debe mostrar root cuando la máquina es atacante', () => {
    const machine = makeMachine({ id: 'attacker-01' });
    const context = { machine } as CommandContext;
    const result = cmd_groups.execute([], context);
    expect(result.output).toContain('root :');
    expect(result.isError).toBe(undefined);
  });

  it('debe mostrar error si el usuario no existe', () => {
    const machine = makeMachine();
    const context = { machine } as CommandContext;
    const result = cmd_groups.execute(['noexiste'], context);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('no such user');
  });
});

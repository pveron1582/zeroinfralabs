// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_hostname } from '../hostname';
import type { Machine } from '../../../types';

const mk = (asRoot: boolean): Machine => ({
  id: 'm',
  ...(asRoot ? { su_user: 'root' } : {}),
  machine_info: { hostname: 'kali', ip: '192.168.1.5', mac: '', os: 'Kali', status: 'up', type: 'workstation' },
  discovery_level: 4, scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: asRoot
    ? [{ path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\n', type: 'text' }]
    : [{ path: '/etc/passwd', content: 'kali:x:1000:1000:kali:/home/kali:/bin/bash\n', type: 'text' }],
} as unknown as Machine);

describe('cmd_hostname', () => {
  it('debe mostrar el hostname', () => {
    const m = mk(false);
    const result = cmd_hostname.execute([], { machine: m, allMachines: [m], currentMissionId: 1 } as any);
    expect(result.output).toBe('kali');
  });

  it('debe mostrar la IP con -I', () => {
    const m = mk(false);
    const result = cmd_hostname.execute(['-I'], { machine: m, allMachines: [m], currentMissionId: 1 } as any);
    expect(result.output).toBe('192.168.1.5');
  });

  it('debe cambiar el hostname como root', () => {
    const m = mk(true);
    const result = cmd_hostname.execute(['webserver'], { machine: m, allMachines: [m], currentMissionId: 1 } as any);
    expect(result.isError).toBeFalsy();
    expect(m.machine_info.hostname).toBe('webserver');
  });

  it('debe exigir root para cambiarlo', () => {
    const m = mk(false);
    const result = cmd_hostname.execute(['webserver'], { machine: m, allMachines: [m], currentMissionId: 1 } as any);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('must be root');
    expect(m.machine_info.hostname).toBe('kali');
  });

  it('debe rechazar nombres inválidos', () => {
    const m = mk(true);
    const result = cmd_hostname.execute(['bad!name'], { machine: m, allMachines: [m], currentMissionId: 1 } as any);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('invalid host name');
  });
});

// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_uname } from '../uname';
import type { Machine } from '../../../types';

const kali = {
  id: 'k',
  machine_info: { hostname: 'kali-attacker', ip: '192.168.1.5', mac: '', os: 'Kali Linux 2024.2', status: 'up', type: 'workstation' },
  discovery_level: 4, scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [], files: [],
} as unknown as Machine;

const ctx = { machine: kali, allMachines: [kali], currentMissionId: 1 } as any;

describe('cmd_uname', () => {
  it('debe mostrar Linux por defecto', () => {
    expect(cmd_uname.execute([], ctx).output).toBe('Linux');
  });

  it('debe mostrar todo con -a', () => {
    const out = cmd_uname.execute(['-a'], ctx).output;
    expect(out).toContain('Linux kali-attacker');
    expect(out).toContain('x86_64 GNU/Linux');
    expect(out).toContain('6.6.9');
  });

  it('debe mostrar kernel de Ubuntu 22.04', () => {
    const ubuntu = { ...kali, machine_info: { ...kali.machine_info, os: 'Ubuntu 22.04 LTS' } } as unknown as Machine;
    const out = cmd_uname.execute(['-r'], { ...ctx, machine: ubuntu } as any).output;
    expect(out).toContain('5.15.0-91-generic');
  });

  it('debe combinar flags (-s -r -m)', () => {
    const out = cmd_uname.execute(['-s', '-r', '-m'], ctx).output;
    expect(out).toContain('Linux');
    expect(out).toContain('6.6.9-amd64');
    expect(out).toContain('x86_64');
  });

  it('debe rechazar flag inválido', () => {
    const result = cmd_uname.execute(['-z'], ctx);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('invalid option');
  });
});

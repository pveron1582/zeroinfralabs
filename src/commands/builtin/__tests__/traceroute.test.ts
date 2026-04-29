// ── commands/builtin/__tests__/traceroute.test.ts ────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_traceroute } from '../traceroute';
import type { Machine } from '../../../types';

describe('cmd_traceroute', () => {
  const createMockMachine = (id: string, ip: string): Machine => ({
    id,
    machine_info: { hostname: 'target', ip, mac: '08:00:27:C4:D5:E6', os: 'Ubuntu 20.04 LTS', status: 'up', type: 'server' },
    discovery_level: 0,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  });

  it('debe mostrar error sin argumentos', () => {
    const result = cmd_traceroute.execute([], {
      machine: { machine_info: {} } as any,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('usage error');
  });

  it('debe hacer traceroute a host existente', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10')];

    const result = cmd_traceroute.execute(['192.168.1.10'], {
      machine: { machine_info: { ip: '192.168.1.5' } } as any,
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('traceroute to 192.168.1.10');
    expect(result.output).toContain('192.168.1.10 (192.168.1.10)');
    expect(result.output).toMatch(/\d+\s+\d+\.\d+ ms/); // latencia
  });

  it('debe mostrar timeouts para host inexistente', () => {
    const result = cmd_traceroute.execute(['10.0.0.99'], {
      machine: { machine_info: { ip: '192.168.1.5' } } as any,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('traceroute to 10.0.0.99');
    expect(result.output).toContain('*');
    expect(result.output).toContain('Destination not reached');
  });

  it('debe respetar flag -m para max hops', () => {
    const result = cmd_traceroute.execute(['-m', '10', '10.0.0.99'], {
      machine: { machine_info: { ip: '192.168.1.5' } } as any,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('10 hops max');
    expect(result.output).toContain('Destination not reached after 10 hops');
  });

  it('debe respetar flag -q para probes por hop', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10')];

    const result = cmd_traceroute.execute(['-q', '2', '192.168.1.10'], {
      machine: { machine_info: { ip: '192.168.1.5' } } as any,
      allMachines: machines,
      currentMissionId: 1
    } as any);

    // Debe haber 2 tiempos por hop
    const lines = result.output.split('\n').filter(l => l.match(/^\s*\d+/));
    lines.forEach(line => {
      const timeMatches = line.match(/\d+\.\d+ ms/g);
      if (timeMatches) {
        expect(timeMatches.length).toBeLessThanOrEqual(2);
      }
    });
  });

  it('debe mostrar ayuda con -h', () => {
    const result = cmd_traceroute.execute(['-h'], {
      machine: { machine_info: {} } as any,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('Usage:');
    expect(result.output).toContain('-m');
    expect(result.output).toContain('max_ttl');
  });

  it('debe rechazar IP inválida', () => {
    const result = cmd_traceroute.execute(['invalid'], {
      machine: { machine_info: {} } as any,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('Name or service not known');
  });
});

// ── commands/tools/__tests__/nmap.test.ts ────────────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_nmap } from '../nmap';
import type { Machine } from '../../../types';

describe('cmd_nmap', () => {
  const createMockMachine = (id: string, ip: string, discoveryLevel: number = 0): Machine => ({
    id,
    machine_info: { hostname: 'target', ip, mac: '00:00:00:00:00:00', os: 'Ubuntu', status: 'up', type: 'server' },
    discovery_level: discoveryLevel,
    scan_results: {
      ports: [
        { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2' },
        { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache 2.4' },
      ]
    },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [
      { id: 1, task: 'Reconocimiento', text: 'arp-scan', targetMachineId: id, discoveryLevel: 1 },
      { id: 2, task: 'Escaneo', text: 'nmap', targetMachineId: id, discoveryLevel: 2 },
    ],
    files: [],
  });

  it('debe requerir una IP', () => {
    const result = cmd_nmap.execute([], { allMachines: [], currentMissionId: 1 } as any);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Uso:');
  });

  it('debe requerir reconocimiento previo (discovery_level >= 1)', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 0)];
    const result = cmd_nmap.execute(['-sV', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('Primero realiza el reconocimiento');
  });

  it('debe escanear puertos si hay reconocimiento previo', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sV', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('Nmap scan report');
    expect(result.output).toContain('22/tcp');
    expect(result.output).toContain('80/tcp');
    expect(result.output).toContain('OpenSSH');
    expect(result.output).toContain('Apache');
  });

  it('debe mostrar versiones con -sV', () => {
    const machines = [createMockMachine('target-01', '192.168.1.10', 1)];
    const result = cmd_nmap.execute(['-sV', '192.168.1.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('VERSION');
    expect(result.output).toContain('OpenSSH 8.2');
  });

  it('debe fallar si IP no existe', () => {
    const result = cmd_nmap.execute(['-sV', '192.168.1.99'], {
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('Failed to resolve');
  });
});

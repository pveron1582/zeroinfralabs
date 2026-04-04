// ── commands/tools/__tests__/hydra.test.ts ──────────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_hydra } from '../hydra';
import type { Machine } from '../../../types';

describe('cmd_hydra', () => {
  const createMockMachine = (discoveryLevel: number = 2): Machine => ({
    id: 'target-01',
    machine_info: { hostname: 'target', ip: '10.10.10.10', mac: '00:00:00:00:00:00', os: 'Ubuntu', status: 'up', type: 'server' },
    discovery_level: discoveryLevel,
    scan_results: {
      ports: [
        { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH', credentials: { user: 'gonzalo', pass: 'Quier0unaunment0' } },
      ]
    },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  });

  const createMockAttacker = (): Machine => ({
    id: 'attacker-01',
    machine_info: { hostname: 'kali', ip: '192.168.1.10', mac: '00:00:00:00:00:01', os: 'Kali Linux', status: 'up', type: 'workstation' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/usr/share/wordlists/rockyou.txt', content: 'password123\nadmin123\nQuier0unaunment0\nletmein\n', type: 'file' }
    ],
  });

  it('debe requerir parámetros -l y -P', () => {
    const result = cmd_hydra.execute([], { allMachines: [], currentMissionId: 1 } as any);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Usage:');
  });

  it('debe requerir rockyou.txt como wordlist', () => {
    const machines = [createMockMachine()];
    const result = cmd_hydra.execute(['-l', 'root', '-P', 'passwords.txt', '10.10.10.10', 'ssh'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('/usr/share/wordlists/rockyou.txt');
  });

  it('debe requerir escaneo previo (discovery_level >= 2)', () => {
    const machines = [createMockMachine(0)]; // Sin escaneo previo
    const result = cmd_hydra.execute(['-l', 'root', '-P', '/usr/share/wordlists/rockyou.txt', '10.10.10.10', 'ssh'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('Primero escanea puertos');
  });

  it('debe encontrar credenciales correctas', () => {
    const machines = [createMockMachine(2), createMockAttacker()];
    const result = cmd_hydra.execute(['-l', 'gonzalo', '-P', '/usr/share/wordlists/rockyou.txt', '10.10.10.10', 'ssh'], {
      allMachines: machines,
      currentMissionId: 3
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('login: gonzalo');
    expect(result.output).toContain('password: Quier0unaunment0');
    expect(result.output).toContain('1 valid password found');
    expect(result.foundCredentials).toEqual({
      machineId: 'target-01',
      user: 'gonzalo',
      pass: 'Quier0unaunment0',
      file: '/etc/hydra_ssh.txt',
      service: 'ssh'
    });
  });

  it('debe fallar si el servicio no existe', () => {
    const machines = [createMockMachine(2)];
    const result = cmd_hydra.execute(['-l', 'gonzalo', '-P', '/usr/share/wordlists/rockyou.txt', '10.10.10.10', 'ftp'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('servicio ftp no encontrado');
  });
});

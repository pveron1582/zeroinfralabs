// ── commands/tools/__tests__/ssh.test.ts ─────────────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_ssh } from '../ssh';
import type { Machine } from '../../../types';

describe('cmd_ssh', () => {
  const createMockMachine = (discoveryLevel: number = 3, withSSH: boolean = true): Machine => ({
    id: 'target-01',
    machine_info: { hostname: 'target', ip: '10.10.10.10', mac: '00:00:00:00:00:00', os: 'Ubuntu 22.04', status: 'up', type: 'server' },
    discovery_level: discoveryLevel,
    scan_results: {
      ports: withSSH
        ? [{ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH', credentials: { user: 'root', pass: 'toor' } }]
        : []
    },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [
      { id: 1, task: 'Step 1', text: 'Recon', targetMachineId: 'target-01', discoveryLevel: 1 },
      { id: 2, task: 'Step 2', text: 'Scan', targetMachineId: 'target-01', discoveryLevel: 2 },
      { id: 3, task: 'Step 3', text: 'Brute', targetMachineId: 'target-01', discoveryLevel: 3 },
      { id: 4, task: 'Step 4', text: 'SSH', targetMachineId: 'target-01', discoveryLevel: 4 },
    ],
    files: [{ path: '/root/flag.txt', content: 'THM{TEST}', type: 'text' }],
  });

  const createAttacker = (): Machine => ({
    id: 'attacker-01',
    machine_info: { hostname: 'kali', ip: '10.10.10.5', mac: '00:00:00:00:00:01', os: 'Kali Linux', status: 'up', type: 'workstation' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  });

  it('debe requerir user@ip', () => {
    const result = cmd_ssh.execute([], { allMachines: [], currentMissionId: 1 } as any);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('usage:');
  });

  it('debe requerir fuerza bruta previa (discovery_level >= 3)', () => {
    const machines = [createMockMachine(2), createAttacker()];
    const result = cmd_ssh.execute(['root@10.10.10.10', 'toor'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('Primero descubre credenciales');
  });

  it('debe conectar con credenciales correctas', () => {
    const machines = [createMockMachine(3), createAttacker()];
    const result = cmd_ssh.execute(['root@10.10.10.10', 'toor'], {
      allMachines: machines,
      currentMissionId: 4
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.output).toContain('Warning: Permanently added');
    expect(result.output).toContain('Welcome to Ubuntu');
    expect(result.output).toContain('Last login:');
  });

  it('debe rechazar credenciales incorrectas', () => {
    const machines = [createMockMachine(3), createAttacker()];
    const result = cmd_ssh.execute(['root@10.10.10.10', 'wrongpassword'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('Permission denied');
  });

  it('debe requerir contraseña', () => {
    const machines = [createMockMachine(3), createAttacker()];
    const result = cmd_ssh.execute(['root@10.10.10.10'], {
      allMachines: machines,
      currentMissionId: 1
    } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('password');
  });

  it('debe completar misión final si es el paso correcto', () => {
    const machines = [createMockMachine(3), createAttacker()];
    const result = cmd_ssh.execute(['root@10.10.10.10', 'toor'], {
      allMachines: machines,
      currentMissionId: 4
    } as any);

    expect(result.completedMissionId).toBe(4);
    expect(result.newMachineId).toBe('target-01');
  });

  it('debe dar acceso pero no completar misión si hay pasos previos pendientes (línea 46)', () => {
    // Este test cubre la línea 46: output += '\n\n[!] Acceso concedido, pero aún hay pasos previos pendientes...'
    // Crear una máquina donde SSH no es el paso actual (currentMissionId no coincide con ningún step)
    const mockMachineNoMatch: Machine = {
      id: 'target-01',
      machine_info: { hostname: 'target', ip: '10.10.10.10', mac: '00:00:00:00:00:00', os: 'Ubuntu 22.04', status: 'up', type: 'server' },
      discovery_level: 4,
      scan_results: {
        ports: [{ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH', credentials: { user: 'root', pass: 'toor' } }]
      },
      web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
      learning_steps: [
        { id: 1, task: 'Step 1', text: 'Recon', targetMachineId: 'target-01', discoveryLevel: 1 },
        { id: 2, task: 'Step 2', text: 'Scan', targetMachineId: 'target-01', discoveryLevel: 2 },
      ], // Solo tiene steps 1 y 2, NO el step 3 o 4
      files: [],
    };
    const machines = [mockMachineNoMatch, createAttacker()];
    // currentMissionId=99 no existe en learning_steps, así que canComplete será false
    const result = cmd_ssh.execute(['root@10.10.10.10', 'toor'], {
      allMachines: machines,
      currentMissionId: 99
    } as any);

    expect(result.isError).toBeUndefined();
    expect(result.newMachineId).toBe('target-01');
    expect(result.completedMissionId).toBeUndefined(); // No completa porque el step no existe
    expect(result.output).toContain('pasos previos pendientes');
  });
});

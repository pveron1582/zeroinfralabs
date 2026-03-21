// ── commands/tools/__tests__/nc.test.ts ────────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_nc } from '../nc';
import type { Machine, CommandContext } from '../../../types';

describe('cmd_nc', () => {
  const mockMachine: Machine = {
    id: 'test-machine',
    machine_info: {
      hostname: 'test-host',
      ip: '192.168.1.100',
      mac: '00:00:00:00:00:00',
      os: 'Kali Linux',
      status: 'up',
      type: 'workstation',
    },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  };

  // Máquina con step de listener (simula escenario LFI-RCE)
  const lfiTarget: Machine = {
    id: 'lab-scenario-04-lfi',
    machine_info: {
      hostname: 'lfi-lab',
      ip: '192.168.20.11',
      mac: '00:00:00:00:00:01',
      os: 'Ubuntu 20.04',
      status: 'up',
      type: 'server',
    },
    discovery_level: 3,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'Apache', cms: 'none', directories: [] },
    learning_steps: [
      { id: 4, task: 'Setup Listener', text: 'nc -nlvp 4444', targetMachineId: 'lab-scenario-04-lfi', discoveryLevel: 3 },
    ],
    files: [],
  };

  // Contexto sin escenario de listener (máquina atacante sola)
  const ctxNoListener: CommandContext = {
    machine: mockMachine,
    allMachines: [mockMachine],
    currentMissionId: 1,
  };

  // Contexto con step de listener activo (misión 4)
  const ctxWithListener: CommandContext = {
    machine: mockMachine,
    allMachines: [mockMachine, lfiTarget],
    currentMissionId: 4,
  };

  it('debe mostrar ayuda si no hay argumentos', () => {
    const result = cmd_nc.execute([], ctxNoListener);
    expect(result.output).toContain('usage: nc');
    expect(result.output).toContain('-l');
    expect(result.output).toContain('-nlvp 4444');
  });

  it('debe activar listener y completar misión cuando hay step de listener activo', () => {
    const result = cmd_nc.execute(['-nlvp', '4444'], ctxWithListener);
    expect(result.output).toContain('listening on');
    expect(result.output).toContain('4444');
    expect(result.isError).toBe(false);
    expect(result.completedMissionId).toBe(4); // Resuelto dinámicamente, no hardcodeado
    expect(result.blockingCommand).toBeDefined();
    expect(result.blockingCommand?.message).toContain('4444');
    expect(result.blockingCommand?.cancelKey).toBe('c');
    expect(result.blockingCommand?.listeningPort).toBe(4444);
  });

  it('nc sin step de listener activo no completa ninguna misión', () => {
    const result = cmd_nc.execute(['-nlvp', '4444'], ctxNoListener);
    expect(result.output).toContain('listening');
    expect(result.completedMissionId).toBeUndefined();
    expect(result.blockingCommand).toBeDefined(); // El listener igual se activa
  });

  it('debe aceptar múltiples órdenes de argumentos (-vlnp, -pvnl, etc)', () => {
    const testCases = [
      ['-n', '-l', '-v', '-p', '9999'],
      ['-vlnp', '8888'],
      ['-pvnl', '7777'],
      ['-l', '-p', '6666', '-v', '-n'],
    ];

    testCases.forEach((args) => {
      const result = cmd_nc.execute(args, ctxWithListener);
      expect(result.output).toContain('listening');
      expect(result.blockingCommand).toBeDefined();
      expect(result.blockingCommand?.listeningPort).toBeGreaterThan(6000);
    });
  });

  it('debe rechazar puerto inválido', () => {
    const result = cmd_nc.execute(['-nlvp', 'invalid'], ctxNoListener);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('port');
  });

  it('debe rechazar puerto fuera de rango', () => {
    const result = cmd_nc.execute(['-nlvp', '99999'], ctxNoListener);
    expect(result.isError).toBe(true);
  });

  it('debe rechazar conexión a host inexistente', () => {
    const result = cmd_nc.execute(['example.com', '80'], ctxNoListener);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('refused');
  });

  it('debe mostrar error si falta puerto en modo conectar', () => {
    const result = cmd_nc.execute(['example.com'], ctxNoListener);
    expect(result.isError).toBe(true);
  });
});

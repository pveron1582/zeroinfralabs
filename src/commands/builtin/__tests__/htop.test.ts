// ── commands/builtin/__tests__/htop.test.ts ───────────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_htop } from '../htop';
import type { Machine } from '../../../types';

describe('cmd_htop', () => {
  const createMockMachine = (os: string): Machine => ({
    id: 'test-machine',
    machine_info: { hostname: 'test', ip: '192.168.1.10', mac: '08:00:27:C4:D5:E6', os, status: 'up', type: 'server' },
    discovery_level: 0,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  });

  it('debe mostrar interfaz htop con barras de CPU', () => {
    const machine = createMockMachine('Ubuntu 20.04 LTS');

    const result = cmd_htop.execute([], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('CPU0 [');
    expect(result.output).toContain('CPU1 [');
    expect(result.output).toContain('█'); // Bar characters
    expect(result.output).toContain('░');
  });

  it('debe mostrar barras de Memoria y Swap', () => {
    const machine = createMockMachine('Ubuntu 20.04 LTS');

    const result = cmd_htop.execute([], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('Mem [');
    expect(result.output).toContain('Swp [');
    expect(result.output).toContain('M/'); // Memory indicators
  });

  it('debe retornar blockingCommand con cancelKey q', () => {
    const machine = createMockMachine('Ubuntu 20.04 LTS');

    const result = cmd_htop.execute([], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.blockingCommand).toBeDefined();
    expect(result.blockingCommand?.cancelKey).toBe('q');
    expect(result.blockingCommand?.clearScreen).toBe(true);
    expect(result.blockingCommand?.message).toContain('htop');
  });

  it('debe mostrar proceso htop resaltado', () => {
    const machine = createMockMachine('Ubuntu 20.04 LTS');

    const result = cmd_htop.execute([], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('>  600'); // Highlighted htop process
    expect(result.output).toContain('htop');
  });

  it('debe mostrar menu de funcion keys', () => {
    const machine = createMockMachine('Ubuntu 20.04 LTS');

    const result = cmd_htop.execute([], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('F1Help');
    expect(result.output).toContain('F10Quit');
    expect(result.output).toContain('F3Search');
  });

  it('debe mostrar procesos de Linux', () => {
    const machine = createMockMachine('Ubuntu 20.04 LTS');

    const result = cmd_htop.execute([], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('systemd');
    expect(result.output).toContain('sshd');
    expect(result.output).toContain('nginx');
    expect(result.output).toContain('mysqld');
  });

  it('debe mostrar procesos de Windows', () => {
    const machine = createMockMachine('Windows Server 2019');

    const result = cmd_htop.execute([], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain('System');
    expect(result.output).toContain('svchost.exe');
    expect(result.output).toContain('httpd.exe');
  });

  it('debe incluir instrucciones para salir', () => {
    const machine = createMockMachine('Ubuntu 20.04 LTS');

    const result = cmd_htop.execute([], {
      machine,
      allMachines: [],
      currentMissionId: 1
    } as any);

    expect(result.output).toContain("Press 'q' or F10 to exit.");
  });
});

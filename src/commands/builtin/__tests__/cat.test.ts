// ── commands/builtin/__tests__/cat.test.ts ───────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_cat } from '../cat';
import type { Machine } from '../../../types';

describe('cmd_cat', () => {
  const createMockMachine = (files: any[] = []): Machine => ({
    id: 'test-01',
    machine_info: { hostname: 'test', ip: '10.0.0.1', mac: '00:00:00:00:00:00', os: 'Linux', status: 'up', type: 'server' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files,
  });

  it('debe mostrar error si no se especifica archivo', () => {
    const machine = createMockMachine([]);
    const result = cmd_cat.execute([], { machine } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('uso: cat');
  });

  it('debe mostrar contenido de archivo existente', () => {
    const machine = createMockMachine([
      { path: '/home/user/flag.txt', content: 'THM{TEST_FLAG}', type: 'text' },
    ]);
    const result = cmd_cat.execute(['flag.txt'], { machine } as any);

    expect(result.output).toBe('THM{TEST_FLAG}');
    expect(result.isError).toBeUndefined();
  });

  it('debe manejar path con ./', () => {
    const machine = createMockMachine([
      { path: '/home/user/config.txt', content: 'CONFIG_DATA', type: 'text' },
    ]);
    const result = cmd_cat.execute(['./config.txt'], { machine } as any);

    expect(result.output).toBe('CONFIG_DATA');
  });

  it('debe mostrar error si archivo no existe', () => {
    const machine = createMockMachine([]);
    const result = cmd_cat.execute(['nonexistent.txt'], { machine } as any);

    expect(result.isError).toBe(true);
    expect(result.output).toContain('No such file');
  });

  it('debe completar misión al leer note.txt (escenario 05)', () => {
    const machine = createMockMachine([
      { path: '/root/note.txt', content: 'To: john\nURGENT', type: 'text' },
    ]);
    machine.learning_steps = [
      { id: 5, task: 'Read Note', text: 'cat note.txt', discoveryLevel: 2, targetMachineId: 'target-01' },
    ];
    const result = cmd_cat.execute(['note.txt'], { machine, allMachines: [machine] } as any);

    expect(result.output).toContain('john');
    expect(result.completedMissionId).toBe(5);
  });
});

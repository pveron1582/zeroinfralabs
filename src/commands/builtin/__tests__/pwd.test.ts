// ── commands/builtin/__tests__/pwd.test.ts ───────────────────────
// Tests para cmd_pwd: imprime el directorio actual del contexto.

import { describe, it, expect } from 'vitest';
import { cmd_pwd } from '../pwd';
import type { CommandContext } from '../../../types';
import type { Machine } from '../../../types';

const makeMachine = (): Machine => ({
  id: 'attacker-01',
  machine_info: { hostname: 'kali', ip: '192.168.1.10', mac: '00:00:00:00:00:00', os: 'Kali Linux', status: 'up', type: 'workstation' },
  discovery_level: 4,
  scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [],
});

const ctx = (currentDir: string): CommandContext => ({
  machine: makeMachine(),
  allMachines: [makeMachine()],
  currentMissionId: 1,
  currentDir,
});

describe('cmd_pwd', () => {
  it('debe imprimir el directorio actual', () => {
    const result = cmd_pwd.execute([], ctx('/root'));
    expect(result.output).toBe('/root');
    expect(result.isError).toBeUndefined();
  });

  it('debe imprimir /home/kali cuando el currentDir es /home/kali', () => {
    const result = cmd_pwd.execute([], ctx('/home/kali'));
    expect(result.output).toBe('/home/kali');
  });

  it('debe devolver / si el currentDir viene vacío', () => {
    const result = cmd_pwd.execute([], ctx(''));
    expect(result.output).toBe('/');
  });

  it('debe ignorar argumentos extra como pwd real', () => {
    const result = cmd_pwd.execute(['-L'], ctx('/root'));
    expect(result.output).toBe('/root');
  });
});

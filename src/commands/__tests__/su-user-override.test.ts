// ── commands/__tests__/su-user-override.test.ts ───────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Aislamiento de identidad por terminal (HIGH #2): ctx.suUserOverride se
// vuelca a utils/users como override de ejecución DURANTE el comando y se
// restaura al terminar (incluye pipelines), sin escribir machine.su_user.
import { describe, it, expect, beforeEach } from 'vitest';
import { executeCommand } from '../index';
import { setExecutionSuUser, getExecutionSuUser } from '../../utils/users';
import type { Machine } from '../../types';

function makeTarget(overrides: Partial<Machine> = {}): Machine {
  return {
    id: 'victim-01',
    machine_info: {
      hostname: 'target', ip: '10.0.0.5', mac: '08:00:27:00:00:01',
      os: 'Ubuntu 20.04 LTS', status: 'up', type: 'server',
    },
    discovery_level: 3,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      {
        path: '/etc/passwd',
        type: 'text',
        content: 'root:x:0:0:root:/root:/bin/bash\ncarla:x:1001:1001:Carla:/home/carla:/bin/bash\n',
        owner: 'root',
        group: 'root',
        mode: 0o644,
      },
    ],
    ...overrides,
  } as Machine;
}

const req = (machine: Machine, extra: Record<string, unknown> = {}) => ({
  line: 'whoami',
  machine,
  allMachines: [machine],
  currentMissionId: 1,
  terminalId: 't-A',
  ...extra,
});

describe('suUserOverride en la ejecución (aislamiento por terminal)', () => {
  beforeEach(() => {
    setExecutionSuUser(undefined);
  });

  it('whoami con suUserOverride devuelve ese usuario sin machine.su_user', () => {
    const target = makeTarget();
    const result = executeCommand(req(target, { suUserOverride: 'root' }));
    expect(result.output).toBe('root');
    expect(target.su_user).toBeUndefined();
  });

  it('sin override whoami devuelve el usuario base de la máquina', () => {
    const target = makeTarget();
    const result = executeCommand(req(target));
    expect(result.output).toBe('user');
  });

  it('el override se restaura al terminar (no queda identidad pegada)', () => {
    const target = makeTarget();
    executeCommand(req(target, { suUserOverride: 'root' }));
    expect(getExecutionSuUser()).toBeUndefined();
    const after = executeCommand(req(target));
    expect(after.output).toBe('user');
  });

  it('el override fluye por los segmentos de un pipeline', () => {
    const target = makeTarget();
    const result = executeCommand(req(target, {
      suUserOverride: 'root',
      line: 'whoami | grep root',
    }));
    expect(result.output).toContain('root');
  });

  it('modo legacy: machine.su_user sigue funcionando sin override', () => {
    const target = makeTarget({ su_user: 'carla' });
    const result = executeCommand(req(target));
    expect(result.output).toBe('carla');
  });

  it('el override de una terminal no afecta a la siguiente ejecución de otra', () => {
    const target = makeTarget();
    const a = executeCommand(req(target, { terminalId: 't-A', suUserOverride: 'root' }));
    expect(a.output).toBe('root');
    const b = executeCommand(req(target, { terminalId: 't-B' }));
    expect(b.output).toBe('user');
  });
});

// ── test/fixtures.ts ──────────────────────────────────────────────
// Máquinas y misiones mínimas para tests de estado.
//
// Desde P1 3.3 el store arranca con un workspace VACÍO (no importa la capa
// de labs), así que los tests del store siembran su propio escenario en vez
// de heredar el lab 01 por un import oculto. Estos builders son la forma
// canónica de hacerlo: sin labs, sin fs-models, sin buildScenario.

import type { Machine, Mission, Scenario } from '../types';

/** Id de la máquina que siembran los fixtures (tests del store). */
export const TEST_MACHINE_ID = 'm1';

export function makeTestMachine(overrides: Partial<Machine> = {}): Machine {
  return {
    id: TEST_MACHINE_ID,
    machine_info: {
      hostname: 'kali',
      ip: '10.0.0.1',
      mac: '08:00:27:aa:bb:cc',
      os: 'Kali Linux 2026.1',
      status: 'up',
      type: 'workstation',
      family: 'linux',
    },
    discovery_level: 0,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
    ...overrides,
  };
}

export function makeTestMission(overrides: Partial<Mission> = {}): Mission {
  return {
    id: 1,
    title: 'Mission 1',
    titleEs: 'Misión 1',
    description: 'Do the thing',
    descriptionEs: 'Hacé la cosa',
    status: 'active',
    targetMachineId: TEST_MACHINE_ID,
    discoveryLevel: 0,
    hintLevel: 0,
    ...overrides,
  };
}

export function makeTestScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: 'lab-test',
    name: 'Lab de test',
    description: 'Escenario mínimo para tests de estado',
    difficulty: 'easy',
    category: 'test',
    network_range: '10.0.0.0/24',
    initialMachineId: TEST_MACHINE_ID,
    machines: [makeTestMachine()],
    missions: [makeTestMission()],
    ...overrides,
  };
}

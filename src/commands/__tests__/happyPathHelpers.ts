// ── commands/__tests__/happyPathHelpers.ts ────────────────────────
// Shared utilities for happy path tests

import { beforeEach, expect } from 'vitest';
import { executeCommand, resetMsfState } from '../index';
import { resetFtpSessions } from '../tools';
import { shellManager } from '../../shells';
import type { Machine } from '../../types';

export function setupBeforeEach() {
  beforeEach(() => {
    resetMsfState();
    resetFtpSessions();
    shellManager.reset();
  });
}

export const createAttacker = (): Machine => ({
  id: 'attacker-01',
  machine_info: {
    hostname: 'kali-attacker',
    ip: '192.168.1.10',
    mac: '08:00:27:AA:BB:CC',
    os: 'Kali Linux 2026.1',
    status: 'up',
    type: 'workstation',
  },
  discovery_level: 4,
  scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [
    { path: '/usr/share/wordlists/rockyou.txt', content: '123456\npassword\nQuier0unaument0\ndev2024\ntoor', type: 'text' }
  ],
});

export const exec = (
  line: string,
  machine: Machine,
  allMachines: Machine[],
  currentMissionId: number
) => executeCommand(line, machine, allMachines, currentMissionId, undefined, '/');

export const withLevel = (machine: Machine, level: number): Machine => ({
  ...machine,
  discovery_level: level,
});

export const evolveState = (
  machines: Machine[],
  result: ReturnType<typeof exec>
): Machine[] => {
  if (!result.completedMissionId) return machines;

  return machines.map(machine => {
    const step = machine.learning_steps.find(s => s.id === result.completedMissionId);
    if (step?.discoveryLevel !== undefined) {
      return {
        ...machine,
        discovery_level: Math.max(machine.discovery_level, step.discoveryLevel),
      };
    }
    return machine;
  });
};

export const expectSuccess = (result: ReturnType<typeof exec>) => {
  expect(result.isError).not.toBe(true);
};

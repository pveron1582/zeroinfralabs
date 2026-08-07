// ── commands/__tests__/happyPathHelpers.ts ────────────────────────
// Shared utilities for happy path tests

import { beforeEach, expect } from 'vitest';
import { executeCommand, resetMsfState } from '../index';
import { resetFtpSessions } from '../tools';
import { shellManager } from '../../frameworks/shells';
import type { CommandResponse, Machine } from '../../types';

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
  result: CommandResponse
): Machine[] => {
  // Free commands: update discovery level based on metadata
  return machines.map(machine => {
    let newLevel = machine.discovery_level;

    // arp-scan discovered hosts
    const hosts = 'discoveredHosts' in result ? result.discoveredHosts : undefined;
    if (hosts && hosts.length > 0) {
      newLevel = Math.max(newLevel, 1);
    }

    // nmap discovered ports for this machine
    const scanRes = 'scanResults' in result ? result.scanResults : undefined;
    if (scanRes && scanRes.targetId === machine.id) {
      newLevel = Math.max(newLevel, 2);
    }
    const ports = 'discoveredPorts' in result ? result.discoveredPorts : undefined;
    if (ports === machine.id) {
      newLevel = Math.max(newLevel, 2);
    }

    // gobuster found directories for this machine's web server
    const foundDirs = 'foundDirectories' in result ? result.foundDirectories : undefined;
    if (foundDirs?.targetId === machine.id) {
      newLevel = Math.max(newLevel, 3);
    }

    // hydra found credentials for this machine
    const foundCreds = 'foundCredentials' in result ? result.foundCredentials : undefined;
    if (foundCreds?.machineId === machine.id) {
      newLevel = Math.max(newLevel, 3);
    }

    // SSH/FTP login achieved
    const ssh = 'sshSession' in result ? result.sshSession : undefined;
    if (ssh?.targetId === machine.id && ssh.authenticated) {
      newLevel = Math.max(newLevel, 4);
    }
    const ftp = 'ftpSession' in result ? result.ftpSession : undefined;
    if (ftp?.targetId === machine.id && ftp.loggedIn) {
      newLevel = Math.max(newLevel, 3);
    }

    if (newLevel !== machine.discovery_level) {
      return { ...machine, discovery_level: newLevel };
    }
    return machine;
  });
};

export const expectSuccess = (result: CommandResponse) => {
  expect(result.isError).not.toBe(true);
};

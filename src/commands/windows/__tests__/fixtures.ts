// ── commands/windows/__tests__/fixtures.ts ────────────────────────
// Fixtures y helpers compartidos de los tests W1 (pack cmd.exe).

import { executeCommand } from '../../index';
import { createWindowsFileSystem } from '../../../fs-models/fs-windows';
import { withWindowsSampleFiles } from '../../../fs-models/__fixtures__/windowsSampleFiles';
import type { CommandResponse, Machine } from '../../../types';

export function winMachine(overrides: Partial<Machine> = {}): Machine {
  return {
    id: 'win-01',
    machine_info: {
      hostname: 'win-server',
      ip: '10.10.10.50',
      mac: '52:54:00:12:34:56',
      os: 'Windows Server 2019',
      status: 'up',
      type: 'victim',
      family: 'windows',
    },
    discovery_level: 4,
    scan_results: {
      ports: [
        { port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version: 'SMBv2' },
        { port: 3389, protocol: 'tcp', state: 'open', service: 'ms-wbt-server', version: 'rdp' },
        { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'IIS' },
      ],
    },
    web_enumeration: { web_server: 'iis', cms: 'none', directories: [] },
    learning_steps: [],
    files: withWindowsSampleFiles(createWindowsFileSystem()),
    win: { currentUser: 'Administrator', isAdmin: true, computerName: 'WIN-SERVER' },
    ...overrides,
  };
}

/** Variante sin privilegios: mismo usuario, uid 1000 (sin bypass root). */
export function nonAdminMachine(): Machine {
  return winMachine({
    win: { currentUser: 'Administrator', isAdmin: false, computerName: 'WIN-SERVER' },
  });
}

export interface ExecOpts {
  currentDir?: string;
  allMachines?: Machine[];
  env?: Record<string, string>;
  setEnv?: (env: Record<string, string>) => void;
  setCurrentDir?: (dir: string) => void;
}

export function exec(line: string, machine: Machine, opts: ExecOpts = {}): CommandResponse {
  return executeCommand({
    line,
    machine,
    allMachines: opts.allMachines ?? [machine],
    currentMissionId: 1,
    currentDir: opts.currentDir ?? '/C:/Users/Administrator',
    env: opts.env,
    setEnv: opts.setEnv,
    setCurrentDir: opts.setCurrentDir,
  });
}

export const HOME = '/C:/Users/Administrator';

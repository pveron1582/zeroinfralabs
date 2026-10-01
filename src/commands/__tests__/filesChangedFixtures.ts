// ── commands/__tests__/filesChangedFixtures.ts ─────────────────────
// Fixtures y helpers compartidos por los dos tests de la convención
// `filesChanged`: las reglas estáticas (`files-changed-contract.test.ts`)
// y las regresiones de comportamiento (`files-changed-behavior.test.ts`).

import { setMachineFiles } from '../../store/slices/machineMutations';
import type { CommandContext, Machine } from '../../types';

export function file(path: string, content: string, mode = 0o644) {
  return { path, content, type: 'text' as const, owner: 'root', group: 'root', mode };
}

export function mkTarget(): Machine {
  return {
    id: 'target-01',
    machine_info: { hostname: 'victima', ip: '10.10.10.11', mac: '00:11:22:33:44:55', os: 'Ubuntu', status: 'up', type: 'server' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'Apache', cms: 'none', directories: [{ path: '/', status: 200, description: 'home' }] },
    learning_steps: [],
    files: [],
  };
}

export function mkKali(): Machine {
  return {
    id: 'attacker-01',
    machine_info: { hostname: 'kali', ip: '10.10.10.5', mac: '00:11:22:33:44:66', os: 'Kali', status: 'up', type: 'workstation' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      file('/etc/passwd', 'root:x:0:0:root:/root:/bin/bash\n'),
      file('/root/.dir', '', 0o700),
      file('/root/flag.txt', 'FLAG{test}\n', 0o600),
      file('/var/log/.dir', '', 0o755),
      file('/usr/bin/.dir', '', 0o755),
      // Pre-existe para que hashcat lo SOBRESCRIBA (él sólo declara, no muta).
      file('/root/out.txt', 'RESULTADO VIEJO\n'),
      // dpkg sólo declara (agrega /usr/bin/nmap) sin mutar machine.files.
      file('/root/nmap.deb', 'Package: nmap\nVersion: 7.94-1\nArchitecture: amd64\n'),
    ],
  };
}

export const ctxFor = (machine: Machine, allMachines: Machine[]): CommandContext => ({
  machine,
  allMachines,
  currentMissionId: 1,
  currentDir: '/root',
  terminalId: 'contract',
});

/** Aplica el snapshot exactamente como lo hace responseHandlers.ts. */
export const apply = (machine: Machine, snapshot: Machine['files']) =>
  setMachineFiles([machine], machine.id, snapshot)[0];

export const pathsOf = (machine: Machine) => machine.files.map(f => f.path);

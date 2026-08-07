// ── commands/__tests__/nmap-output-permissions.test.ts ─────────────
// Tests that nmap -oN / -oG:
//   - Asigna owner/group/mode del usuario local al archivo creado
//   - Deniega creación en directorio donde el user no tiene w+x
//   - Deniega sobreescritura de archivo sin permiso de write

import { describe, it, expect, beforeEach } from 'vitest';
import type { Machine } from '../../../types';
import { cmd_nmap } from '../nmap';
import { useScenarioStore } from '../../../store/scenarioStore';

const PASSWD = 'root:x:0:0:root:/root:/bin/bash\nkali:x:1000:1000:kali:/home/kali:/bin/bash\nbob:x:1001:1001:bob:/home/bob:/bin/bash';
const GROUP = 'root:x:0:\nkali:x:1000:\nbob:x:1001:';

let localMachine: Machine;
let targetMachine: Machine;

function setup() {
  useScenarioStore.setState({
    machines: [],
  });
  // Máquina víctima (no attacker) con identidad SSH de kali
  localMachine = {
    id: 'victim-kali',
    machine_info: { hostname: 'victim', ip: '10.0.0.1', mac: '00:00:00:00:00:01', os: 'Linux', status: 'up', type: 'victim' },
    discovery_level: 4,
    scan_results: { ports: [{ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2', credentials: { user: 'kali', pass: 'p' } }] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    found_credentials: [{ file: '', user: 'kali', pass: 'p', verified: true, service: 'ssh' }],
    files: [
      { path: '/etc/passwd', content: PASSWD, type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/etc/group', content: GROUP, type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
      { path: '/home/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/home/kali/.dir', content: '', type: 'text', owner: 'kali', group: 'kali', mode: 0o755 },
      { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/root/.secret.txt', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o600 },
      { path: '/usr/bin/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    ],
  };
  targetMachine = {
    id: 'target-01',
    machine_info: { hostname: 'victim', ip: '10.0.0.100', mac: '00:00:00:00:00:64', os: 'Linux', status: 'up', type: 'server' },
    discovery_level: 4,
    scan_results: { ports: [{ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2' }] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  };
}

beforeEach(setup);

describe('nmap -oN con permisos', () => {
  const execNmap = (args: string[]) => cmd_nmap.execute(args, {
    allMachines: [localMachine, targetMachine],
    currentMissionId: 0,
    machine: localMachine,
    currentDir: '/tmp',
  } as any) as any;

  it('kali puede guardar -oN en /tmp (world-writable)', () => {
    const result = execNmap(['-oN', '/tmp/scan.txt', '10.0.0.100']);
    expect(result.createdFiles).toBeDefined();
    expect(result.createdFiles).toHaveLength(1);
    const file = result.createdFiles![0];
    expect(file.path).toBe('/tmp/scan.txt');
    expect(file.owner).toBe('kali');
    expect(file.group).toBe('kali');
    expect(file.mode).toBeGreaterThan(0);
  });

  it('kali puede guardar -oN en /home/kali (owner=kali)', () => {
    const result = execNmap(['-oN', '/home/kali/report.txt', '10.0.0.100']);
    expect(result.createdFiles).toBeDefined();
    expect(result.createdFiles).toHaveLength(1);
  });

  it('debe denegar -oN en /root/.secret.txt existente (0600 root, kali no puede editar)', () => {
    const result = execNmap(['-oN', '/root/.secret.txt', '10.0.0.100']);
    expect(result.output).toContain('Permission denied');
    expect(result.createdFiles ?? []).toHaveLength(0);
  });

  it('debe denegar -oN en /usr/bin (0755 root, kali sin w)', () => {
    const result = execNmap(['-oN', '/usr/bin/scan.txt', '10.0.0.100']);
    expect(result.output).toContain('Permission denied');
    expect(result.createdFiles ?? []).toHaveLength(0);
  });
});

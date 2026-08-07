// ── shells/ftp/__tests__/FtpSession-permissions.test.ts ────────────
// Tests for ftp session permission enforcement on `get`:
//   - Files world-readable (0644) can be downloaded
//   - Files owned by root with mode 0600 cannot be downloaded by anonymous
//   - Downloaded files carry owner/group/mode from the local attacker machine

import { describe, it, expect, beforeEach } from 'vitest';
import type { Machine } from '../../../../types';
import type { FtpState } from '../FtpSession';
import { ftpSession } from '../FtpSession';
import type { ShellContext } from '../../ShellSession';

const PASSWD = 'root:x:0:0:root:/root:/bin/bash\nkali:x:1000:1000:kali:/home/kali:/bin/bash';
const GROUP = 'root:x:0:\nkali:x:1000:';

let target: Machine;
let local: Machine;
let ctx: ShellContext;

function loggedInState(targetId: string, targetIp: string): FtpState {
  return {
    connected: true,
    targetIp,
    targetId,
    username: 'anonymous',
    password: '',
    loggedIn: true,
    step: 'connected',
  };
}

beforeEach(() => {
  local = {
    id: 'kali-attacker',
    machine_info: { hostname: 'kali', ip: '10.0.0.1', mac: '00:00:00:00:00:01', os: 'Kali', status: 'up', type: 'workstation' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    found_credentials: [],
    files: [
      { path: '/etc/passwd', content: PASSWD, type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/etc/group', content: GROUP, type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    ],
  };
  target = {
    id: 'ftp-server',
    machine_info: { hostname: 'ftp-server', ip: '10.0.0.50', mac: '00:00:00:00:00:32', os: 'Linux', status: 'up', type: 'server' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/srv/ftp/.dir', content: '', type: 'text', owner: 'ftp', group: 'ftp', mode: 0o755 },
      { path: '/srv/ftp/public.txt', content: 'public', type: 'text', owner: 'ftp', group: 'ftp', mode: 0o644 },
      { path: '/srv/ftp/secret.txt', content: 'secret', type: 'text', owner: 'root', group: 'root', mode: 0o600 },
    ],
  };
  ctx = {
    machine: local,
    allMachines: [local, target],
    currentMissionId: 0,
    currentDir: '/root',
    setCurrentDir: () => {},
  };
});

describe('ftp get permission enforcement', () => {
  it('debe permitir descargar archivo world-readable', () => {
    const state = loggedInState(target.id, target.machine_info.ip);
    const { result } = ftpSession.executeCommand('get public.txt', state, ctx);
    expect(result.isError).toBeUndefined();
    expect(result.downloadedFile).toBeDefined();
    expect(result.downloadedFile!.path).toBe('/root/public.txt');
    expect(result.downloadedFile!.content).toBe('public');
  });

  it('debe denegar descarga de archivo con permisos restrictivos (0600 root)', () => {
    const state = loggedInState(target.id, target.machine_info.ip);
    const { result } = ftpSession.executeCommand('get secret.txt', state, ctx);
    expect(result.output).toContain('Permission denied');
    expect(result.downloadedFile).toBeUndefined();
  });

  it('debe asignar owner/group/mode del atacante al archivo descargado', () => {
    const state = loggedInState(target.id, target.machine_info.ip);
    const { result } = ftpSession.executeCommand('get public.txt', state, ctx);
    expect(result.downloadedFile).toBeDefined();
    const df = result.downloadedFile!;
    // Kali (attacker via attacker-flag) is root
    expect(df.owner).toBeDefined();
    expect(df.group).toBeDefined();
    expect(df.mode).toBeGreaterThan(0);
  });
});

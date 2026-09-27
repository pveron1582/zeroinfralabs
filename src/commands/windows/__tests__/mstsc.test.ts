// ── commands/windows/__tests__/mstsc.test.ts ─────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { cmd_mstsc } from '../mstsc';
import { resetShellManager, isShellSessionActive, getCurrentShellName } from '../../shellIntegration';
import type { Machine } from '../../../types';

const win = (ports: Machine['scan_results']['ports'], known?: Record<string, string>): Machine => ({
  id: 'win-01',
  machine_info: {
    hostname: 'WIN7-LAB',
    ip: '192.168.60.10',
    mac: '08:00:27:C4:D5:E6',
    os: 'Windows 7',
    status: 'up',
    type: 'workstation',
    family: 'windows',
  },
  discovery_level: 2,
  scan_results: { ports },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [],
  win: { currentUser: 'win7user', isAdmin: false, computerName: 'WIN7-LAB' },
  known_passwords: known,
});

const rdpPort = {
  port: 3389, protocol: 'tcp', state: 'open' as const,
  service: 'ms-wbt-server', version: 'Microsoft Terminal Services',
};

const ctx = (machines: Machine[]) => ({
  allMachines: machines,
  currentMissionId: 1,
  terminalId: 'test-mstsc',
} as any);

describe('cmd_mstsc', () => {
  beforeEach(() => {
    resetShellManager();
  });

  it('debe pedir /v:<ip-o-hostname>', () => {
    const r = cmd_mstsc.execute([], ctx([]));
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Uso: mstsc');
  });

  it('debe fallar si el host no existe', () => {
    const r = cmd_mstsc.execute(['/v:10.0.0.9'], ctx([win([rdpPort])]));
    expect(r.isError).toBe(true);
    expect(r.output).toContain('No se puede encontrar');
  });

  it('debe fallar si el puerto 3389 no está abierto', () => {
    const m = win([{ port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version: 'SMB' }]);
    const r = cmd_mstsc.execute(['/v:192.168.60.10'], ctx([m]));
    expect(r.isError).toBe(true);
    expect(r.output).toContain('3389');
    expect(r.output).toContain('mstsc:');
  });

  it('debe autenticar one-shot con credenciales conocidas y emitir desktopAction', () => {
    const m = win([rdpPort], { Administrator: 'P@ssw0rd123!' });
    const r = cmd_mstsc.execute(
      ['/v:192.168.60.10', '/u:Administrator', '/p:P@ssw0rd123!'],
      ctx([m]),
    );
    expect(r.isError).toBeUndefined();
    expect(r.desktopAction).toEqual({
      action: 'connect', machineId: 'win-01', ip: '192.168.60.10',
    });
    const fc = 'foundCredentials' in r ? r.foundCredentials : undefined;
    expect(fc).toMatchObject({
      machineId: 'win-01', user: 'Administrator', pass: 'P@ssw0rd123!',
    });
  });

  it('debe rechazar el one-shot con password incorrecta', () => {
    const m = win([rdpPort], { Administrator: 'P@ssw0rd123!' });
    const r = cmd_mstsc.execute(
      ['/v:192.168.60.10', '/u:Administrator', '/p:mala'],
      ctx([m]),
    );
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Permission denied');
    const fu = 'failedUser' in r ? r.failedUser : undefined;
    expect(fu).toMatchObject({ machineId: 'win-01', user: 'Administrator' });
    expect(r.desktopAction).toBeUndefined();
  });

  it('debe abrir la sesión interactiva sin usuario (paso username)', () => {
    const r = cmd_mstsc.execute(['/v:192.168.60.10'], ctx([win([rdpPort])]));
    expect(isShellSessionActive('test-mstsc')).toBe(true);
    expect(getCurrentShellName('test-mstsc')).toBe('rdp');
    expect(r.output).toContain('Conectando a 192.168.60.10:3389');
  });

  it('debe abrir la sesión interactiva con /u en el paso password', () => {
    const r = cmd_mstsc.execute(['/v:192.168.60.10', '/u:Administrator'], ctx([win([rdpPort])]));
    const rs = 'rdpSession' in r ? r.rdpSession : undefined;
    expect(rs).toMatchObject({
      active: true, targetIp: '192.168.60.10', username: 'Administrator', step: 'password',
    });
  });

  it('debe resolver el host por hostname de Windows (WIN7-LAB)', () => {
    const r = cmd_mstsc.execute(['/v:WIN7-LAB'], ctx([win([rdpPort])]));
    expect(isShellSessionActive('test-mstsc')).toBe(true);
    expect(r.isError).toBeUndefined();
  });
});

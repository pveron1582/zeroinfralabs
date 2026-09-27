// ── commands/windows/__tests__/winpeas.test.ts ─────────────────────
// winPEAS (W4): enumera servicios y credenciales legibles (metadata).

import { describe, it, expect } from 'vitest';
import { exec, winMachine, nonAdminMachine } from './fixtures';
import { createWindowsFileSystem } from '../../../fs-models/fs-windows';
import { withWindowsSampleFiles } from '../../../fs-models/__fixtures__/windowsSampleFiles';
import type { Machine } from '../../../types';

function labMachine(): Machine {
  return winMachine({
    machine_info: {
      hostname: 'WIN7-LAB',
      ip: '192.168.60.11',
      mac: '08:00:27:C4:D5:E6',
      os: 'Windows 7 Professional SP1 x64',
      status: 'up',
      type: 'workstation',
      family: 'windows',
    },
    files: withWindowsSampleFiles(
      createWindowsFileSystem({ username: 'win7user', computerName: 'WIN7-LAB' }),
      'win7user',
    ),
    win: { currentUser: 'win7user', isAdmin: false, computerName: 'WIN7-LAB' },
  });
}

describe('cmd winpeas', () => {
  it('lista servicios y encabezado del equipo', () => {
    const r = exec('winpeas', labMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('winPEAS');
    expect(r.output).toContain('WIN7-LAB');
    expect(r.output).toContain('win7user');
    expect(r.output).toContain('Servicios');
    expect(r.output).toContain('svchost');
  });

  it('encuentra credenciales en notes.txt y emite foundCredentials', () => {
    const r = exec('winpeas', labMachine());
    const fc = 'foundCredentials' in r ? r.foundCredentials : undefined;
    expect(fc).toBeDefined();
    expect(fc?.machineId).toBe('win-01');
    expect(fc?.user).toBe('Administrator');
    expect(fc?.pass).toBe('P@ssw0rd123!');
    expect(fc?.file).toContain('notes.txt');
    expect(r.output).toContain('Credenciales encontradas');
    expect(r.output).toContain('P@ssw0rd123!');
  });

  it('emite fileRead del archivo con credenciales', () => {
    const r = exec('winpeas', labMachine());
    const fr = 'fileRead' in r ? r.fileRead : undefined;
    expect(fr).toBeDefined();
    expect(fr?.path).toContain('notes.txt');
    expect(fr?.machineId).toBe('win-01');
  });

  it('no encuentra credenciales si el FS no tiene pares Username/Password legibles', () => {
    const m = nonAdminMachine();
    m.files = m.files.filter(f => !f.path.includes('notes.txt') && !f.path.includes('web.config'));
    const r = exec('winpeas', m);
    expect(r.isError).not.toBe(true);
    expect('foundCredentials' in r ? r.foundCredentials : undefined).toBeUndefined();
    expect(r.output).toContain('No se detectaron credenciales');
  });

  it('marca Admin según la identidad actual', () => {
    const admin = winMachine();
    const rAdmin = exec('winpeas', admin);
    expect(rAdmin.output).toContain('Admin:         Sí');

    const low = labMachine();
    const rLow = exec('winpeas', low);
    expect(rLow.output).toContain('Admin:         No');
  });
});

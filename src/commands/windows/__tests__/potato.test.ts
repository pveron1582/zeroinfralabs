// ── commands/windows/__tests__/potato.test.ts ──────────────────────
// Potato (W4): escalada de privilegios → privescCompleted (metadata).

import { describe, it, expect } from 'vitest';
import { exec, winMachine, nonAdminMachine } from './fixtures';
import { createWindowsFileSystem } from '../../../fs-models/fs-windows';
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
    files: createWindowsFileSystem({ username: 'win7user', computerName: 'WIN7-LAB' }),
    win: { currentUser: 'win7user', isAdmin: false, computerName: 'WIN7-LAB' },
  });
}

describe('cmd potato', () => {
  it('escala de baja privilegio a admin y emite privescCompleted', () => {
    const m = labMachine();
    const r = exec('potato', m);
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('Potato');
    expect(r.output).toContain('win7user');
    expect(r.output).toContain('administrador');
    const pa = 'privescAttempted' in r ? r.privescAttempted : undefined;
    const pc = 'privescCompleted' in r ? r.privescCompleted : undefined;
    expect(pa).toBe(true);
    expect(pc).toBe(m.id);
  });

  it('no escala si el usuario ya es administrador', () => {
    const r = exec('potato', winMachine());
    expect(r.output).toContain('Ya eres administrador');
    expect('privescCompleted' in r ? r.privescCompleted : undefined).toBeUndefined();
  });

  it('no escala si privesc_completed ya está activo', () => {
    const m = labMachine();
    m.privesc_completed = true;
    const r = exec('potato', m);
    expect(r.output).toContain('Ya eres administrador');
    expect('privescCompleted' in r ? r.privescCompleted : undefined).toBeUndefined();
  });

  it('en máquina no Windows el comando no existe (dispatch dual)', () => {
    const m = nonAdminMachine();
    m.machine_info.family = undefined;
    const r = exec('potato', m);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Command not found: potato');
  });
});

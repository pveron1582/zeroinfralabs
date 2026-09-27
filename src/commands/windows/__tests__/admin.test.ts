// ── commands/windows/__tests__/admin.test.ts ──────────────────────
// sc, reg, net, schtasks y shutdown (W1).

import { describe, it, expect, beforeEach } from 'vitest';
import { exec, winMachine, nonAdminMachine } from './fixtures';
import { resetProcessManager } from '../../../frameworks/process/processManager';

beforeEach(() => {
  resetProcessManager();
});

describe('sc (servicios)', () => {
  it('sc query sin nombre lista servicios', () => {
    const r = exec('sc query', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('SERVICE_NAME: svchost');
    expect(r.output).toContain('RUNNING');
  });

  it('sc query de un servicio concreto', () => {
    const r = exec('sc query svchost', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('SERVICE_NAME: svchost');
    expect(r.output).toContain('STATE');
  });

  it('sc query servicio inexistente → error', () => {
    const r = exec('sc query nosvc', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('no existe');
  });

  it('sc stop sin admin → Acceso denegado', () => {
    const r = exec('sc stop svchost', nonAdminMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Acceso denegado');
  });

  it('sc stop y start como admin cambian el estado', () => {
    const m = winMachine();
    const stop = exec('sc stop httpd', m);
    expect(stop.isError).not.toBe(true);
    expect(stop.output).toContain('STOPPED');

    const start = exec('sc start httpd', m);
    expect(start.isError).not.toBe(true);
    expect(start.output).toContain('RUNNING');
  });
});

describe('reg query (registro)', () => {
  it('clave existente como admin → valores', () => {
    const r = exec('reg query SOFTWARE\\Microsoft', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('SOFTWARE\\Microsoft');
    expect(r.output).toContain('Windows NT\\CurrentVersion');
  });

  it('clave HKLM abreviada funciona', () => {
    const r = exec('reg query HKLM\\SOFTWARE\\Microsoft', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('CurrentVersion');
  });

  it('como no admin → Acceso denegado (hives 0600)', () => {
    const r = exec('reg query SOFTWARE\\Microsoft', nonAdminMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Acceso denegado');
  });

  it('clave inexistente como admin → no encontrada', () => {
    const r = exec('reg query SOFTWARE\\NoExisteCorp', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('no puede encontrar la clave');
  });

  it('sin argumentos → usage', () => {
    const r = exec('reg', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Uso:');
  });
});

describe('net (cuentas y red)', () => {
  it('net user lista cuentas del SAM', () => {
    const r = exec('net user', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('Administrator');
    expect(r.output).toContain('Guest');
    expect(r.output).toContain('completó correctamente');
  });

  it('net user Administrator muestra detalle', () => {
    const r = exec('net user Administrator', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('Administrator');
    expect(r.output).toContain('Administradores');
  });

  it('net user cuenta inexistente → error', () => {
    const r = exec('net user fantasma', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('no se encuentra');
  });

  it('net localgroup lista grupos', () => {
    const r = exec('net localgroup', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('Administradores');
    expect(r.output).toContain('Usuarios');
  });

  it('net localgroup administrators lista miembros', () => {
    const r = exec('net localgroup administrators', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('Administrator');
    expect(r.output).toContain('completó correctamente');
  });

  it('net localgroup grupo inexistente → error', () => {
    const r = exec('net localgroup fantasma', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('no existe');
  });

  it('net view muestra otros hosts', () => {
    const src = winMachine();
    const other = winMachine({
      id: 'win-02',
      machine_info: { ...winMachine().machine_info, hostname: 'win-02', ip: '10.10.10.60' },
      win: { currentUser: 'Administrator', isAdmin: true, computerName: 'WIN-02' },
    });
    const r = exec('net view', src, { allMachines: [src, other] });
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('\\\\WIN-02');
  });

  it('net sin subcomando → usage', () => {
    const r = exec('net', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Uso:');
  });
});

describe('schtasks / shutdown', () => {
  it('schtasks /query muestra la tabla de tareas', () => {
    const r = exec('schtasks /query', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('Informe de tarea');
    expect(r.output).toContain('BackupNocturno');
    expect(r.output).toContain('completó correctamente');
  });

  it('schtasks sin flags también muestra query por defecto', () => {
    const r = exec('schtasks', winMachine());
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('Informe de tarea');
  });

  it('schtasks /create → usage (no soportado)', () => {
    const r = exec('schtasks /create', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Uso:');
  });

  it('shutdown /r → mensaje de reinicio', () => {
    const r = exec('shutdown /r', winMachine());
    expect(r.output).toContain('reiniciará');
  });

  it('shutdown /s → mensaje de apagado', () => {
    const r = exec('shutdown /s', winMachine());
    expect(r.output).toContain('cerrará');
  });

  it('shutdown /a → anula apagado', () => {
    const r = exec('shutdown /a', winMachine());
    expect(r.output).toContain('anulado');
  });

  it('shutdown sin flags → usage', () => {
    const r = exec('shutdown', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Uso:');
  });
});

// ── commands/windows/__tests__/system.test.ts ─────────────────────
// whoami, systeminfo, ipconfig, netstat, tasklist, taskkill, ping,
// tracert y hostname (W1).

import { describe, it, expect, beforeEach } from 'vitest';
import { exec, winMachine, nonAdminMachine } from './fixtures';
import { resetProcessManager } from '../../../frameworks/process/processManager';
import { resetNetworkState } from '../../../frameworks/network/networkState';

beforeEach(() => {
  resetProcessManager();
  resetNetworkState();
});

describe('hostname / whoami / systeminfo', () => {
  it('hostname devuelve el nombre del equipo Windows', () => {
    expect(exec('hostname', winMachine()).output).toBe('WIN-SERVER');
  });

  it('whoami sin flags devuelve el usuario', () => {
    expect(exec('whoami', winMachine()).output).toBe('Administrator');
  });

  it('whoami /groups como admin incluye Administradores', () => {
    const r = exec('whoami /groups', winMachine());
    expect(r.output).toContain('Administradores');
    expect(r.output).toContain('completó correctamente');
  });

  it('whoami /groups sin admin no incluye Administradores', () => {
    const r = exec('whoami /groups', nonAdminMachine());
    expect(r.output).not.toContain('Administradores');
  });

  it('whoami /priv como admin habilita SeDebugPrivilege', () => {
    const r = exec('whoami /priv', winMachine());
    expect(r.output).toContain('SeDebugPrivilege');
    expect(r.output).toContain('Habilitado');
  });

  it('whoami con flag inválido → error', () => {
    const r = exec('whoami /x', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('opción no válida');
  });

  it('systeminfo muestra hostname, OS e IP', () => {
    const r = exec('systeminfo', winMachine());
    expect(r.output).toContain('WIN-SERVER');
    expect(r.output).toContain('Windows Server 2019');
    expect(r.output).toContain('10.10.10.50');
    expect(r.output).toContain('Nombre de host');
  });
});

describe('ipconfig / netstat', () => {
  it('ipconfig muestra IP y gateway', () => {
    const r = exec('ipconfig', winMachine());
    expect(r.output).toContain('Configuración IP de Windows');
    expect(r.output).toContain('10.10.10.50');
    expect(r.output).toContain('10.10.10.1');
  });

  it('ipconfig /all agrega MAC y DHCP', () => {
    const r = exec('ipconfig /all', winMachine());
    expect(r.output).toContain('52-54-00-12-34-56');
    expect(r.output).toContain('DHCP');
  });

  it('netstat lista puertos en escucha con LISTENING', () => {
    const r = exec('netstat', winMachine());
    expect(r.output).toContain('LISTENING');
    expect(r.output).toContain('10.10.10.50:445');
    expect(r.output).toContain('10.10.10.50:80');
  });
});

describe('tasklist / taskkill', () => {
  it('tasklist muestra procesos Windows', () => {
    const r = exec('tasklist', winMachine());
    expect(r.output).toContain('svchost.exe');
    expect(r.output).toContain('cmd.exe');
    expect(r.output).toContain('PID');
  });

  it('taskkill /PID mata el proceso', () => {
    const m = winMachine();
    const r = exec('taskkill /PID 200 /F', m);
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('PID 200');
    const after = exec('tasklist', m);
    expect(after.output).not.toContain('svchost.exe');
  });

  it('taskkill PID inexistente → error', () => {
    const r = exec('taskkill /PID 9999 /F', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('no se encontró');
  });

  it('taskkill sin PID → usage', () => {
    const r = exec('taskkill', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Uso:');
  });
});

describe('ping / tracert', () => {
  it('ping a host conocido → respuestas y estadísticas', () => {
    const other = winMachine({
      id: 'win-02',
      machine_info: {
        hostname: 'win-02', ip: '10.10.10.60', mac: '52:54:00:00:00:02',
        os: 'Windows Server 2019', status: 'up', type: 'victim', family: 'windows',
      },
      win: { currentUser: 'Administrator', isAdmin: true, computerName: 'WIN-02' },
    });
    const src = winMachine();
    const r = exec('ping -n 4 10.10.10.60', src, { allMachines: [src, other] });
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('Respuesta desde 10.10.10.60');
    expect(r.output).toContain('0% de pérdida');
    expect(r.output).toContain('TTL=128');
  });

  it('ping a hostname desconocido → error', () => {
    const r = exec('ping noexiste', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('No se puede encontrar el host');
  });

  it('ping a IP inalcanzable → 100% pérdida', () => {
    const r = exec('ping -n 2 999.999.999.999', winMachine());
    // isIpv4 pasa → ip existe como literal pero no hay máquina → timeouts
    expect(r.output).toContain('Tiempo de espera agotado');
    expect(r.output).toContain('100% de pérdida');
  });

  it('tracert a host conocido → Traza completa', () => {
    const src = winMachine();
    const other = winMachine({ id: 'win-02', machine_info: { ...winMachine().machine_info, hostname: 'win-02', ip: '10.10.10.60' } });
    const r = exec('tracert 10.10.10.60', src, { allMachines: [src, other] });
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('Traza a la dirección 10.10.10.60');
    expect(r.output).toContain('Traza completa');
  });

  it('tracert hostname inválido → no se puede resolver', () => {
    const r = exec('tracert noexiste', winMachine());
    expect(r.isError).toBe(true);
    expect(r.output).toContain('No se puede resolver');
  });

  it('traceroute es alias de tracert', () => {
    const src = winMachine();
    const r = exec('traceroute 10.10.10.60', src, { allMachines: [src] });
    expect(r.output).toContain('Traza');
  });
});

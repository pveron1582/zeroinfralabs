// ── frameworks/process/__tests__/processManager.test.ts ────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Test DIRECTO del ProcessManager. Antes solo se llegaba por rebote desde
// `fase5-processes.test.ts` (ps/kill/systemctl), y se quedaban sin correr:
// los daemons derivados de puertos abiertos (ftp/smb/rdp), el filtro de
// `list()` sobre pids matados, y las guardas de servicio inexistente en
// stop/start.
//
// Nota: el `return false` de la línea 106 de `list()` (servicio detenido)
// sigue sin alcanzarse: `stopService` agrega el servicio a `stopped` y TODOS
// sus pids a `killed` a la vez, así que siempre corta antes el filtro de la
// línea 105. Los pids de `buildProcessList` son constantes: no aparecen
// procesos "nuevos" de un servicio ya detenido. Es código defensivo.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildProcessList, list, getProcess, isServiceRunning,
  killPid, stopService, startService, resetProcessManager,
} from '../processManager';
import type { Machine, FileEntry } from '../../../types';

function makeMachine(over: { os?: string; ports?: Machine['scan_results']['ports'] } = {}): Machine {
  return {
    id: 'target-01',
    machine_info: {
      hostname: 'target-server', ip: '192.168.1.10', mac: '08:00:27:A1:B2:C3',
      os: over.os ?? 'Ubuntu 20.04 LTS', status: 'up', type: 'server',
    },
    discovery_level: 0,
    scan_results: { ports: over.ports ?? [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [{ path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 } as FileEntry],
  } as Machine;
}

const svc = (procs: { service?: string }[]) => new Set(procs.map(p => p.service).filter(Boolean));

beforeEach(() => resetProcessManager());

describe('buildProcessList - daemons derivados de puertos', () => {
  it('un puerto ftp abierto agrega vsftpd', () => {
    const m = makeMachine({ ports: [{ port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version: 'vsFTPd 3.0.3' }] });
    const procs = buildProcessList(m);
    expect(procs.some(p => p.service === 'vsftpd' && p.pid === 410)).toBe(true);
  });

  it('un puerto smb abierto agrega smbd', () => {
    const m = makeMachine({ ports: [{ port: 445, protocol: 'tcp', state: 'open', service: 'smb', version: 'samba' }] });
    expect(svc(buildProcessList(m)).has('smb')).toBe(true);
  });

  it('un puerto rdp abierto agrega xrdp', () => {
    const m = makeMachine({ os: 'Windows 7', ports: [{ port: 3389, protocol: 'tcp', state: 'open', service: 'rdp', version: '' }] });
    expect(svc(buildProcessList(m)).has('xrdp')).toBe(true);
  });

  it('un puerto cerrado no levanta daemon', () => {
    const m = makeMachine({ ports: [{ port: 21, protocol: 'tcp', state: 'closed', service: 'ftp', version: '' }] });
    expect(svc(buildProcessList(m)).has('vsftpd')).toBe(false);
  });

  it('la máquina Windows corre cmd.exe y la Linux bash', () => {
    expect(svc(buildProcessList(makeMachine()))).not.toBeUndefined();
    expect(buildProcessList(makeMachine()).some(p => p.name === 'bash')).toBe(true);
    expect(buildProcessList(makeMachine({ os: 'Windows 7' })).some(p => p.name === 'cmd.exe')).toBe(true);
  });
});

describe('killPid / stopService / startService', () => {
  it('killPid de un pid inexistente devuelve false', () => {
    expect(killPid(makeMachine(), 999999)).toBe(false);
  });

  it('killPid mata el proceso y lo saca de list()', () => {
    const m = makeMachine();
    expect(killPid(m, 350)).toBe(true); // nginx
    expect(list(m).some(p => p.pid === 350)).toBe(false);
    // El pid sigue "conocido" por el manager, solo que filtrado.
    expect(getProcess(m, 350)).toBeUndefined();
  });

  it('killPid sobre un proceso con servicio detiene también el servicio', () => {
    const m = makeMachine();
    killPid(m, 350); // nginx
    expect(isServiceRunning(m, 'nginx')).toBe(false);
    expect(list(m).some(p => p.service === 'nginx')).toBe(false);
  });

  it('killPid sobre un proceso sin servicio no detiene servicios', () => {
    const m = makeMachine();
    expect(killPid(m, 2)).toBe(true); // kthreadd, sin service
    expect(isServiceRunning(m, 'nginx')).toBe(true);
  });

  it('stopService de un servicio inexistente devuelve false', () => {
    expect(stopService(makeMachine(), 'servicio-fantasma')).toBe(false);
  });

  it('startService de un servicio inexistente devuelve false', () => {
    expect(startService(makeMachine(), 'servicio-fantasma')).toBe(false);
  });

  it('stop + start de un servicio real lo apaga y lo vuelve a levantar', () => {
    const m = makeMachine();
    expect(stopService(m, 'nginx')).toBe(true);
    expect(isServiceRunning(m, 'nginx')).toBe(false);
    expect(list(m).some(p => p.service === 'nginx')).toBe(false);

    expect(startService(m, 'nginx')).toBe(true);
    expect(isServiceRunning(m, 'nginx')).toBe(true);
    expect(list(m).some(p => p.service === 'nginx')).toBe(true);
  });

  it('el estado de procesos es por máquina', () => {
    const a = makeMachine();
    const b = { ...makeMachine(), id: 'target-02' } as Machine;
    killPid(a, 350);
    expect(list(b).some(p => p.pid === 350)).toBe(true);
  });

  it('resetProcessManager restaura todo', () => {
    const m = makeMachine();
    killPid(m, 350);
    stopService(m, 'sshd');
    resetProcessManager();
    expect(list(m).some(p => p.pid === 350)).toBe(true);
    expect(isServiceRunning(m, 'ssh')).toBe(true);
  });
});

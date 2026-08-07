// ── commands/__tests__/fase5-processes.test.ts ──────────────────────
// Tests de la Fase 5 del ROADMAP: procesos, kill, systemctl, journalctl.

import { describe, it, expect, beforeEach } from 'vitest';
import { cmd_ps } from '../builtin/ps';
import { cmd_top } from '../builtin/top';
import { cmd_kill } from '../builtin/kill';
import { cmd_systemctl, cmd_service } from '../builtin/systemctl';
import { cmd_journalctl } from '../builtin/journalctl';
import { list, resetProcessManager } from '../../frameworks/process/processManager';
import type { Machine } from '../../types';

function makeMachine(overrides: Partial<Machine> = {}): Machine {
  return {
    id: 'target-01',
    machine_info: { hostname: 'target-server', ip: '192.168.1.10', mac: '08:00:27:A1:B2:C3', os: 'Ubuntu 20.04 LTS', status: 'up', type: 'server' },
    discovery_level: 0,
    scan_results: {
      ports: [
        { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2p1' },
        { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'nginx' },
        { port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version: 'vsFTPd 3.0.3' },
      ],
    },
    web_enumeration: { web_server: 'nginx', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000:Admin:/home/admin:/bin/bash\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    ],
    ...overrides,
  };
}

function makeRootMachine(overrides: Partial<Machine> = {}): Machine {
  return makeMachine({ id: 'attacker-01', ...overrides });
}

function ctx(machine: Machine) {
  return { machine, allMachines: [machine], currentMissionId: 1, currentDir: '/', language: 'es' as const };
}

describe('Fase 5 - procesos', () => {
  beforeEach(() => {
    resetProcessManager();
  });

  it('ps aux muestra los procesos del sistema', () => {
    const machine = makeMachine();
    const result = cmd_ps.execute(['aux'], ctx(machine));
    expect(result.output).toContain('sshd');
    expect(result.output).toContain('nginx');
    expect(result.output).toContain('mysqld');
    expect(result.output).toContain('vsftpd');
  });

  it('ps -ef usa el formato estándar', () => {
    const machine = makeMachine();
    const result = cmd_ps.execute(['-ef'], ctx(machine));
    expect(result.output).toContain('USER');
    expect(result.output).toContain('PID');
    expect(result.output).toContain('CMD');
  });

  it('ps sin opciones muestra solo los procesos del shell', () => {
    const machine = makeMachine();
    const result = cmd_ps.execute([], ctx(machine));
    expect(result.output).toContain('PID TTY');
    expect(result.output).toContain('bash');
    expect(result.output).not.toContain('sshd');
  });

  it('kill termina un proceso y desaparece de ps', () => {
    const machine = makeRootMachine();
    const res = cmd_kill.execute(['100'], ctx(machine)); // sshd
    expect(res.isError).toBeFalsy();
    expect(list(machine).some(p => p.pid === 100)).toBe(false);
    expect(cmd_ps.execute(['aux'], ctx(machine)).output).not.toContain('sshd');
  });

  it('kill -9 fuerza la terminación', () => {
    const machine = makeRootMachine();
    const res = cmd_kill.execute(['-9', '360'], ctx(machine)); // mysqld
    expect(res.isError).toBeFalsy();
    expect(list(machine).some(p => p.pid === 360)).toBe(false);
  });

  it('kill -l lista las señales disponibles', () => {
    const machine = makeMachine();
    const res = cmd_kill.execute(['-l'], ctx(machine));
    expect(res.output).toContain('KILL');
    expect(res.output).toContain('TERM');
    expect(res.output).toContain('HUP');
  });

  it('kill con pid inexistente devuelve error', () => {
    const machine = makeRootMachine();
    const res = cmd_kill.execute(['9999'], ctx(machine));
    expect(res.isError).toBe(true);
    expect(res.output).toContain('No existe tal proceso');
  });

  it('kill con señal no fatal (USR1) no termina el proceso', () => {
    const machine = makeRootMachine();
    const res = cmd_kill.execute(['-USR1', '100'], ctx(machine));
    expect(res.isError).toBeFalsy();
    expect(list(machine).some(p => p.pid === 100)).toBe(true);
  });

  it('un usuario sin privilegios no puede matar procesos ajenos', () => {
    const machine = makeMachine(); // usuario 'user' (no root)
    const res = cmd_kill.execute(['100'], ctx(machine)); // sshd de root
    expect(res.isError).toBe(true);
    expect(res.output).toContain('Operation not permitted');
    expect(list(machine).some(p => p.pid === 100)).toBe(true);
  });

  it('systemctl status lista los servicios con su estado', () => {
    const machine = makeMachine();
    const res = cmd_systemctl.execute(['status'], ctx(machine));
    expect(res.output).toContain('ssh.service');
    expect(res.output).toContain('nginx.service');
    expect(res.output).toContain('mysql.service');
    expect(res.output).toContain('active (running)');
  });

  it('systemctl stop detiene el servicio y su proceso desaparece', () => {
    const machine = makeRootMachine();
    const res = cmd_systemctl.execute(['stop', 'ssh'], ctx(machine));
    expect(res.isError).toBeFalsy();
    expect(res.output).toContain('stopped');
    expect(cmd_systemctl.execute(['status', 'ssh'], ctx(machine)).output).toContain('inactive (dead)');
    expect(cmd_ps.execute(['aux'], ctx(machine)).output).not.toContain('sshd');
  });

  it('systemctl start reactiva el servicio', () => {
    const machine = makeRootMachine();
    cmd_systemctl.execute(['stop', 'ssh'], ctx(machine));
    cmd_systemctl.execute(['start', 'ssh'], ctx(machine));
    expect(cmd_systemctl.execute(['status', 'ssh'], ctx(machine)).output).toContain('active (running)');
    expect(list(machine).some(p => p.service === 'ssh')).toBe(true);
  });

  it('systemctl stop/start requiere root', () => {
    const machine = makeMachine();
    const res = cmd_systemctl.execute(['stop', 'ssh'], ctx(machine));
    expect(res.isError).toBe(true);
    expect(res.output).toContain('Operation not permitted');
  });

  it('service funciona como alias de systemctl', () => {
    const machine = makeRootMachine();
    expect(cmd_service.execute(['ssh', 'status'], ctx(machine)).output).toContain('active (running)');
    const restart = cmd_service.execute(['nginx', 'restart'], ctx(machine));
    expect(restart.output).toContain('restarted');
    expect(list(machine).some(p => p.service === 'nginx')).toBe(true);
  });

  it('el estado del servicio se refleja en top', () => {
    const machine = makeRootMachine();
    cmd_systemctl.execute(['stop', 'nginx'], ctx(machine));
    expect(cmd_top.execute([], ctx(machine)).output).not.toContain('nginx');
  });

  it('journalctl -u filtra logs del servicio', () => {
    const machine = makeMachine({
      files: [
        { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
        { path: '/var/log/syslog', content: 'Mar 19 10:23:45 target-server sshd[1234]: Accepted password for admin from 192.168.1.100 port 54321 ssh2\nMar 19 10:24:12 target-server nginx[999]: started', type: 'text', owner: 'syslog', group: 'adm', mode: 0o640 },
      ],
    });
    const res = cmd_journalctl.execute(['-u', 'ssh'], ctx(machine));
    expect(res.output).toContain('-- Logs begin at');
    expect(res.output).toContain('Accepted password');
  });

  it('journalctl genera logs para servicios sin archivos', () => {
    const machine = makeMachine();
    const res = cmd_journalctl.execute(['-u', 'nginx'], ctx(machine));
    expect(res.output).toContain('-- Logs begin at');
    expect(res.output).toContain('nginx');
  });

  it('journalctl -f es un comando bloqueante', () => {
    const machine = makeMachine();
    const res = cmd_journalctl.execute(['-f'], ctx(machine));
    const bc = 'blockingCommand' in res ? res.blockingCommand : undefined;
    expect(bc).toBeDefined();
    expect(bc?.cancelKey).toBe('q');
  });
});

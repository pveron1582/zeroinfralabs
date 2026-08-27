// ── commands/__tests__/fase8-cron.test.ts ───────────────────────────
// Tests de la Fase 8 del ROADMAP: crontab (-l/-e/-r/-u), reloj virtual
// (date/sleep) y ejecución de cron jobs (cronRunner) con generación de
// logs en /var/log/syslog y efectos sobre el filesystem.

import { describe, it, expect, beforeEach } from 'vitest';
import { cmd_crontab } from '../builtin/crontab';
import { cmd_date } from '../builtin/date';
import { cmd_sleep } from '../builtin/sleep';
import { cmd_journalctl } from '../builtin/journalctl';
import { executeCommand } from '../index';
import {
  parseCrontab, listCronJobs, runCron, resetCron, virtualTime, formatDate,
} from '../../frameworks/cron/cronRunner';
import { stopService, resetProcessManager } from '../../frameworks/process/processManager';
import type { Machine } from '../../types';

const SYSLOG_BASE = 'Mar 19 10:00:01 target-server systemd[1]: Started Daily apt download activities.\n';
const CRONTAB_ETC = `# /etc/crontab: system-wide crontab
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

* * * * * root /usr/local/bin/backup.sh
17 * * * *   root    cd / && run-parts --report /etc/cron.hourly
*/2 * * * *  root    touch /tmp/heartbeat
`;

function makeMachine(overrides: Partial<Machine> = {}): Machine {
  return {
    id: 'target-01',
    machine_info: { hostname: 'target-server', ip: '192.168.1.10', mac: '08:00:27:A1:B2:C3', os: 'Ubuntu 20.04 LTS', status: 'up', type: 'server' },
    discovery_level: 0,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'nginx', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000:Admin:/home/admin:/bin/bash\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/etc/crontab', content: CRONTAB_ETC, type: 'text', owner: 'root', group: 'root', mode: 0o600 },
      { path: '/var/log/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/var/log/syslog', content: SYSLOG_BASE, type: 'text', owner: 'root', group: 'adm', mode: 0o640 },
      { path: '/var/spool/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/var/spool/cron/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/var/spool/cron/crontabs/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o700 },
      { path: '/var/spool/cron/crontabs/admin', content: '* * * * * /usr/bin/echo backup > /tmp/admin_backup.txt\n', type: 'text', owner: 'admin', group: 'admin', mode: 0o600 },
      { path: '/usr/local/bin/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
    ],
    ...overrides,
  };
}

function makeRootMachine(overrides: Partial<Machine> = {}): Machine {
  return makeMachine({
    id: 'attacker-01',
    machine_info: { hostname: 'kali', ip: '192.168.1.5', mac: '08:00:27:AA:BB:CC', os: 'Kali Linux 2024.2', status: 'up', type: 'workstation' },
    ...overrides,
  });
}

function ctx(machine: Machine) {
  return { machine, allMachines: [machine], currentMissionId: 1, currentDir: '/', language: 'es' as const };
}

function applyResult(machine: Machine, r: { filesChanged?: Machine['files'] | null }) {
  if (r.filesChanged) machine.files = r.filesChanged;
}

beforeEach(() => {
  resetCron();
  resetProcessManager();
});

describe('Fase 8 - parseCrontab/listCronJobs', () => {
  it('parseCrontab: parsea /etc/crontab con columna de usuario', () => {
    const jobs = parseCrontab(CRONTAB_ETC, '/etc/crontab');
    expect(jobs).toHaveLength(3);
    expect(jobs[0]).toMatchObject({ user: 'root', command: '/usr/local/bin/backup.sh' });
    expect(jobs[1]).toMatchObject({ user: 'root', minute: '17' });
  });

  it('parseCrontab: ignora comentarios y variables', () => {
    const jobs = parseCrontab('# hola\nSHELL=/bin/bash\nPATH=/x\n* * * * * root echo hi\n', '/etc/crontab');
    expect(jobs).toHaveLength(1);
    expect(jobs[0].user).toBe('root');
    expect(jobs[0].command).toBe('echo hi');
  });

  it('parseCrontab: crontab de usuario corre como su dueño (no root)', () => {
    const jobs = parseCrontab('0 3 * * * /usr/bin/backup', '/var/spool/cron/crontabs/admin');
    expect(jobs).toHaveLength(1);
    expect(jobs[0].user).toBe('admin');
    expect(jobs[0].command).toBe('/usr/bin/backup');
  });

  it('listCronJobs: agrega /etc/crontab + crontabs de usuarios', () => {
    const machine = makeMachine();
    const jobs = listCronJobs(machine);
    expect(jobs.length).toBeGreaterThanOrEqual(4);
    expect(jobs.some(j => j.source === '/etc/crontab')).toBe(true);
    expect(jobs.some(j => j.source === '/var/spool/cron/crontabs/admin')).toBe(true);
  });
});

describe('Fase 8 - runCron (ejecución)', () => {
  it('runCron: ejecuta tareas * * * * * y genera logs en syslog', () => {
    const machine = makeMachine();
    const res = runCron(machine, 1);
    expect(res.ran.length).toBeGreaterThanOrEqual(2);
    expect(res.logLines.some(l => l.includes('CRON') && l.includes('backup.sh'))).toBe(true);
    expect(res.filesChanged).toBeDefined();
    applyResult(machine, res);
    const syslog = machine.files.find(f => f.path === '/var/log/syslog');
    expect(syslog?.content).toContain('CRON[3');
    expect(syslog?.content).toContain('CMD (/usr/local/bin/backup.sh)');
  });

  it('runCron: los jobs con */2 solo corren en ticks pares', () => {
    const machine = makeMachine();
    let res = runCron(machine, 1); // tick 0 → minuto 0, par → heartbeat corre
    applyResult(machine, res);
    expect(machine.files.some(f => f.path === '/tmp/heartbeat')).toBe(true);
    res = runCron(machine, 1); // tick 1 → minuto 1, impar → no corre
    applyResult(machine, res);
    const before = machine.files.filter(f => f.path === '/tmp/heartbeat').length;
    res = runCron(machine, 1); // tick 2 → minuto 2, par → toca
    applyResult(machine, res);
    expect(before).toBe(1);
  });

  it('runCron: efectos sobre el filesystem (echo > y >>)', () => {
    const machine = makeMachine();
    const res = runCron(machine, 1);
    applyResult(machine, res);
    const f = machine.files.find(f => f.path === '/tmp/admin_backup.txt');
    expect(f?.content).toContain('backup');
    const syslog = machine.files.find(f => f.path === '/var/log/syslog');
    expect(syslog?.content).toContain('admin_backup');
  });

  it('runCron: no ejecuta si el servicio cron está detenido', () => {
    const machine = makeMachine();
    stopService(machine, 'cron');
    const res = runCron(machine, 1);
    expect(res.ran).toHaveLength(0);
    expect(res.logLines).toHaveLength(0);
  });

  it('runCron: avanza el reloj aunque no corra nada', () => {
    const machine = makeMachine();
    stopService(machine, 'cron');
    const before = virtualTime(machine).getTime();
    runCron(machine, 5);
    const after = virtualTime(machine).getTime();
    expect(after - before).toBe(5 * 60_000);
  });

  it('runCron: el log de un job de spool muestra al dueño (no root)', () => {
    const machine = makeMachine();
    const res = runCron(machine, 1);
    applyResult(machine, res);
    const syslog = machine.files.find(f => f.path === '/var/log/syslog');
    expect(syslog?.content).toMatch(/\(admin\) CMD \(\/usr\/bin\/echo backup > \/tmp\/admin_backup\.txt\)/);
  });

  it('runCron: redirección con texto entre comillas escribe la frase completa', () => {
    const machine = makeMachine();
    machine.files = machine.files.map(f =>
      f.path === '/etc/crontab'
        ? { ...f, content: '* * * * * root /usr/bin/echo "hola mundo cron" > /tmp/frase.txt\n' }
        : f
    );
    const res = runCron(machine, 1);
    applyResult(machine, res);
    const f = machine.files.find(f2 => f2.path === '/tmp/frase.txt');
    expect(f?.content).toBe('hola mundo cron\n');
  });
});

describe('Fase 8 - crontab', () => {
  it('crontab -l: lista la crontab del usuario', () => {
    const machine = makeMachine();
    const r = cmd_crontab.execute(['-l'], { ...ctx(machine), machine: { ...machine, found_credentials: [{ file: '', user: 'admin', pass: 'p', verified: true, service: 'ssh' }] } });
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('admin_backup.txt');
  });

  it('crontab -l: sin crontab muestra "no crontab for"', () => {
    const machine = makeRootMachine();
    const r = cmd_crontab.execute(['-l'], ctx(machine));
    expect(r.output).toBe('no crontab for root');
  });

  it('crontab -e: abre nano con la ruta del spool y crea los dirs', () => {
    const machine = makeMachine();
    machine.files = machine.files.filter(f => f.path !== '/var/spool/cron/crontabs/admin');
    const r = cmd_crontab.execute(['-e'], { ...ctx(machine), machine: { ...machine, found_credentials: [{ file: '', user: 'admin', pass: 'p', verified: true, service: 'ssh' }] } });
    expect(r.isError).not.toBe(true);
    expect('nanoFile' in r && r.nanoFile?.path).toBe('/var/spool/cron/crontabs/admin');
    expect(r.nanoFile?.content).toContain('m h  dom mon dow');
  });

  it('crontab -e: preserva contenido existente', () => {
    const machine = makeMachine();
    const r = cmd_crontab.execute(['-e'], { ...ctx(machine), machine: { ...machine, found_credentials: [{ file: '', user: 'admin', pass: 'p', verified: true, service: 'ssh' }] } });
    expect(r.nanoFile?.content).toContain('admin_backup.txt');
  });

  it('crontab -r: elimina la crontab', () => {
    const machine = makeMachine();
    const r = cmd_crontab.execute(['-r'], { ...ctx(machine), machine: { ...machine, found_credentials: [{ file: '', user: 'admin', pass: 'p', verified: true, service: 'ssh' }] } });
    expect(r.isError).not.toBe(true);
    applyResult(machine, r);
    expect(machine.files.some(f => f.path === '/var/spool/cron/crontabs/admin')).toBe(false);
  });

  it('crontab -u: solo root puede operar sobre otras crontabs', () => {
    const machine = makeMachine();
    const r = cmd_crontab.execute(['-u', 'admin', '-l'], ctx(machine));
    expect(r.isError).toBe(true);
    expect(r.output).toContain('superuser');
  });

  it('crontab -u: root puede listar crontab de otro usuario', () => {
    const machine = makeRootMachine();
    machine.files.push({ path: '/var/spool/cron/crontabs/bob', content: '* * * * * /bin/true\n', type: 'text', owner: 'bob', group: 'bob', mode: 0o600 });
    const r = cmd_crontab.execute(['-u', 'bob', '-l'], ctx(machine));
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('/bin/true');
  });
});

describe('Fase 8 - date y sleep', () => {
  it('date: muestra el reloj virtual base', () => {
    const machine = makeMachine();
    const r = cmd_date.execute([], ctx(machine));
    expect(r.output).toMatch(/Tue Mar 19 10:00:00 UTC 2024/);
  });

  it('sleep: avanza el reloj y ejecuta cron jobs', () => {
    const machine = makeMachine();
    const r = cmd_sleep.execute(['60'], ctx(machine));
    expect(r.isError).not.toBe(true);
    expect(r.filesChanged).toBeDefined();
    expect(formatDate(virtualTime(machine))).toMatch(/10:01:00/);
    applyResult(machine, r);
    const syslog = machine.files.find(f => f.path === '/var/log/syslog');
    expect(syslog?.content).toContain('CMD (touch /tmp/heartbeat)');
  });

  it('sleep: argumento inválido', () => {
    const machine = makeMachine();
    const r = cmd_sleep.execute(['abc'], ctx(machine));
    expect(r.isError).toBe(true);
  });

  it('sleep: integración vía executeCommand persiste filesChanged', () => {
    const machine = makeMachine();
    const r = executeCommand('sleep 60', machine, [machine], 1);
    applyResult(machine, r);
    const syslog = machine.files.find(f => f.path === '/var/log/syslog');
    expect(syslog?.content).toContain('CRON');
  });

  it('sleep: journalctl -u cron muestra las tareas ejecutadas', () => {
    const machine = makeMachine();
    const r = cmd_sleep.execute(['60'], ctx(machine));
    applyResult(machine, r);
    const j = cmd_journalctl.execute(['-u', 'cron', '-n', '5'], ctx(machine));
    expect(j.output).toContain('CRON');
    expect(j.output).toContain('backup.sh');
  });
});

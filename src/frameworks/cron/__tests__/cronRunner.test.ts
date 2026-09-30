// ── frameworks/cron/__tests__/cronRunner.test.ts ───────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Test DIRECTO del simulador de cron. Antes solo se llegaba por rebote
// desde `fase8-cron.test.ts` (comandos crontab/date/sleep) y se quedaban
// sin correr: líneas mal formadas, fuentes que no son /etc/crontab ni
// spool, campos en rango (`1-5`) y exactos (`15`), los cortes por hora y
// por mes, la lectura desde el overlay cuando dos jobs tocan el mismo
// archivo, un efecto sobre un directorio inexistente, y la creación de
// /var/log/syslog cuando no existía.

import { describe, it, expect, beforeEach } from 'vitest';
import { parseCrontab, listCronJobs, runCron, resetCron, virtualTime } from '../cronRunner';
import { resetProcessManager, stopService } from '../../process/processManager';
import type { CronJob } from '../cronRunner';
import type { FileEntry, Machine } from '../../../types';

const dir = (p: string): FileEntry => ({ path: `${p}/.dir`, content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 });
const file = (p: string, content: string): FileEntry => ({ path: p, content, type: 'text', owner: 'root', group: 'root', mode: 0o644 });

function makeMachine(crontab: string, withSyslog = true): Machine {
  const files: FileEntry[] = [dir('/'), dir('/etc'), dir('/tmp'), dir('/var'), dir('/var/log'), file('/etc/crontab', crontab)];
  if (withSyslog) files.push(file('/var/log/syslog', ''));
  return {
    id: 'target-01',
    machine_info: { hostname: 'target-server', ip: '192.168.1.10', mac: '08:00:27:A1:B2:C3', os: 'Ubuntu 20.04 LTS', status: 'up', type: 'server' },
    discovery_level: 0,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'nginx', cms: 'none', directories: [] },
    learning_steps: [],
    files,
  } as Machine;
}

/** Aplica los cambios que runCron devuelve sin mutar en el test. */
function apply(m: Machine, changed: FileEntry[] | null): void {
  if (changed) m.files = changed;
}

const content = (m: Machine, p: string) => m.files.find(f => f.path === p)?.content;

beforeEach(() => { resetCron(); resetProcessManager(); });

describe('parseCrontab - fuentes y líneas', () => {
  it('parsea /etc/crontab con columna de usuario', () => {
    const jobs = parseCrontab('*/5 * * * * root /usr/bin/backup\n', '/etc/crontab');
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({ user: 'root', command: '/usr/bin/backup', minute: '*/5' });
  });

  it('una fuente que no es /etc/crontab ni spool corre como root con todo como comando', () => {
    // /etc/cron.d/* no lleva columna de usuario en este simulador.
    const jobs = parseCrontab('0 2 * * * echo hola\n', '/etc/cron.d/backup');
    expect(jobs).toHaveLength(1);
    expect(jobs[0].user).toBe('root');
    expect(jobs[0].command).toBe('echo hola');
  });

  it('una línea con menos de 6 campos se descarta', () => {
    const jobs = parseCrontab('* * * * * root echo ok\nsolo tres campos\n* * * * * root echo ok2\n', '/etc/crontab');
    expect(jobs.map(j => j.command)).toEqual(['echo ok', 'echo ok2']);
  });

  it('listCronJobs junta /etc/crontab con los crontabs de spool', () => {
    const m = makeMachine('* * * * * root echo sistema\n');
    m.files.push(file('/var/spool/.dir', ''), file('/var/spool/cron/.dir', ''), file('/var/spool/cron/crontabs/.dir', ''));
    m.files.push(file('/var/spool/cron/crontabs/admin', '0 3 * * * /usr/bin/backup\n'));
    const jobs = listCronJobs(m);
    expect(jobs.map(j => j.user)).toEqual(['root', 'admin']);
  });
});

describe('isDue - rangos, valores exactos y cortes', () => {
  it('un campo en rango (1-5) solo vence dentro del rango', () => {
    const m = makeMachine('1-5 * * * * root touch /tmp/rango.txt\n');
    expect(runCron(m, 1).ran).toHaveLength(0);          // minuto 0: fuera
    const r = runCron(m, 1);                            // minuto 1: dentro
    expect(r.ran).toHaveLength(1);
    apply(m, r.filesChanged);
    expect(content(m, '/tmp/rango.txt')).toBe('');
  });

  it('un campo con valor exacto (15) vence solo en ese minuto', () => {
    const m = makeMachine('15 * * * * root touch /tmp/exacto.txt\n');
    expect(runCron(m, 16).ran.map(j => j.minute)).toEqual(['15']);
    expect(virtualTime(m).getUTCMinutes()).toBe(16);
  });

  it('una hora que no coincide corta antes de mirar mes/día', () => {
    // BASE_TIME = 10:00 → la hora "3" nunca coincide.
    const m = makeMachine('* 3 * * * root touch /tmp/nunca.txt\n');
    expect(runCron(m, 1).ran).toEqual([]);
    expect(m.files.some(f => f.path === '/tmp/nunca.txt')).toBe(false);
  });

  it('un mes que no coincide corta antes de mirar día', () => {
    // BASE_TIME = marzo (mes 3) → el mes "6" nunca coincide.
    const m = makeMachine('* * * 6 * root touch /tmp/nunca2.txt\n');
    expect(runCron(m, 1).ran).toEqual([]);
    expect(m.files.some(f => f.path === '/tmp/nunca2.txt')).toBe(false);
  });

  it('si solo dow está restringido, el día tiene que coincidir', () => {
    // 2024-03-19 es martes (dow=2) y día 19.
    const m = makeMachine('* * * * 2 root touch /tmp/martes.txt\n');
    expect(runCron(m, 1).ran).toHaveLength(1);
  });

  it('si dom y dow están restringidos basta con que coincida uno (POSIX)', () => {
    // dow=2 (martes) coincide aunque dom no sea el 19.
    const m = makeMachine('* * 1 * 2 root touch /tmp/posix.txt\n');
    expect(runCron(m, 1).ran).toHaveLength(1);
  });

  it('con el daemon cron detenido no corre nada', () => {
    const m = makeMachine('* * * * * root touch /tmp/no-cron.txt\n');
    stopService(m, 'cron');
    expect(runCron(m, 1).ran).toEqual([]);
    expect(m.files.some(f => f.path === '/tmp/no-cron.txt')).toBe(false);
  });
});

describe('efectos sobre el filesystem', () => {
  it('dos efectos sobre el mismo archivo en un tick se encadenan vía overlay', () => {
    const m = makeMachine('* * * * * root echo hola > /tmp/a.txt\n* * * * * root echo mundo >> /tmp/a.txt\n');
    const r = runCron(m, 1);
    expect(r.ran).toHaveLength(2);
    apply(m, r.filesChanged);
    expect(content(m, '/tmp/a.txt')).toBe('hola\nmundo\n');
  });

  it('un efecto sobre un directorio inexistente se descarta sin romper', () => {
    const m = makeMachine('* * * * * root touch /noexiste/archivo.txt\n');
    const r = runCron(m, 1);
    expect(r.ran).toHaveLength(1);
    apply(m, r.filesChanged);
    expect(m.files.some(f => f.path === '/noexiste/archivo.txt')).toBe(false);
  });

  it('el echo con comillas conserva los espacios del texto', () => {
    const m = makeMachine('* * * * * root echo "dos palabras" > /tmp/q.txt\n');
    apply(m, runCron(m, 1).filesChanged);
    expect(content(m, '/tmp/q.txt')).toBe('dos palabras\n');
  });

  it('si /var/log/syslog no existe, runCron lo crea con la línea de arranque', () => {
    const m = makeMachine('* * * * * root touch /tmp/x.txt\n', false);
    const r = runCron(m, 1);
    expect(r.logLines).toHaveLength(1);
    apply(m, r.filesChanged);
    expect(content(m, '/var/log/syslog')).toContain('target-server syslog: cron started');
    expect(content(m, '/var/log/syslog')).toContain('CRON');
    expect(content(m, '/var/log/syslog')).toContain('touch /tmp/x.txt');
  });

  it('si /var/log/syslog existe, la entrada nueva se acumula al final', () => {
    const m = makeMachine('* * * * * root touch /tmp/x.txt\n');
    const prev = content(m, '/var/log/syslog')!;
    const r = runCron(m, 1);
    apply(m, r.filesChanged);
    const now = content(m, '/var/log/syslog')!;
    expect(now.startsWith(prev)).toBe(true);
    expect(now.length).toBeGreaterThan(prev.length);
  });

  it('runCron sin tareas no devuelve cambios de archivo', () => {
    const m = makeMachine('# nada que hacer\n');
    const r = runCron(m, 1);
    expect(r.ran).toEqual([]);
    expect(r.logLines).toEqual([]);
    expect(r.filesChanged).toBeNull();
  });
});

describe('estado del reloj', () => {
  it('el reloj avanza por máquina de forma independiente', () => {
    const m1 = makeMachine('* * * * * root echo a\n');
    const m2 = { ...makeMachine('* * * * * root echo b\n'), id: 'target-02' } as Machine;
    runCron(m1, 5);
    expect(virtualTime(m1).getUTCMinutes()).toBe(5);
    expect(virtualTime(m2).getUTCMinutes()).toBe(0);
    runCron(m2, 2);
    expect(virtualTime(m2).getUTCMinutes()).toBe(2);
  });

  it('resetCron devuelve el reloj a la hora base', () => {
    const m = makeMachine('* * * * * root echo a\n');
    runCron(m, 7);
    resetCron();
    expect(virtualTime(m).toISOString()).toBe('2024-03-19T10:00:00.000Z');
  });
});

describe('parseCrontab - forma de los jobs', () => {
  it('cada job guarda los 5 campos de horario y su origen', () => {
    const [job]: CronJob[] = parseCrontab('0 2 * * 1 root true\n', '/etc/crontab');
    expect(job).toEqual({
      minute: '0', hour: '2', dom: '*', month: '*', dow: '1',
      user: 'root', command: 'true', source: '/etc/crontab',
    });
  });
});

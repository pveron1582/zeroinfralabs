// ── frameworks/cron/cronRunner.ts ───────────────────────────────────
// Simulador de cron (ROADMAP Fase 8.2). Mantiene un reloj virtual por
// máquina (no persistente, patrón ProcessManager/networkState/packageManager).
// Lee tareas de /etc/crontab y /var/spool/cron/crontabs/<user>, simula su
// ejecución al avanzar el tiempo (vía sleep) y genera entradas en
// /var/log/syslog con efectos reales sobre el filesystem.

import type { FileEntry, Machine } from '../../types';
import { findFile, findDirEntry, defaultOwnership, buildNewFile } from '../../utils/fs';
import { isServiceRunning } from '../process/processManager';

export interface CronJob {
  minute: string;
  hour: string;
  dom: string;
  month: string;
  dow: string;
  user: string;
  command: string;
  source: string;
}

export interface CronRunResult {
  ran: CronJob[];
  logLines: string[];
  filesChanged: FileEntry[] | null;
}

const BASE_TIME = new Date('2024-03-19T10:00:00Z');
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Reloj virtual: minutos transcurridos desde BASE_TIME, por máquina
const ticks = new Map<string, number>();

export function resetCron(): void {
  ticks.clear();
}

export function virtualTime(machine: Machine): Date {
  const t = ticks.get(machine.id) ?? 0;
  return new Date(BASE_TIME.getTime() + t * 60_000);
}

// ── Parseo de crontabs ──────────────────────────────────────────────
export function parseCrontab(content: string, source: string): CronJob[] {
  const jobs: CronJob[] = [];
  // Los crontabs de usuario (/var/spool/cron/crontabs/<user>) no llevan
  // columna de usuario: el dueño es quien está en el nombre del archivo.
  const SPOOL_PREFIX = '/var/spool/cron/crontabs/';
  const spoolUser = source.startsWith(SPOOL_PREFIX)
    ? source.slice(SPOOL_PREFIX.length) || null
    : null;
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('SHELL=') || line.startsWith('PATH=')) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 6) continue;
    const [minute, hour, dom, month, dow, ...rest] = parts;
    let user = 'root';
    let command: string;
    if (spoolUser) {
      user = spoolUser;
      command = rest.join(' ');
    }
    // /etc/crontab (sistema) incluye columna de usuario
    else if (source === '/etc/crontab' && rest.length >= 2 && /^[a-z_][a-z0-9_-]*$/.test(rest[0])) {
      user = rest[0];
      command = rest.slice(1).join(' ');
    } else {
      command = rest.join(' ');
    }
    jobs.push({ minute, hour, dom, month, dow, user, command, source });
  }
  return jobs;
}

export function listCronJobs(machine: Machine): CronJob[] {
  const jobs: CronJob[] = [];
  const etc = findFile(machine, '/etc/crontab');
  if (etc?.content) jobs.push(...parseCrontab(etc.content, '/etc/crontab'));
  for (const f of machine.files || []) {
    if (!f.path.startsWith('/var/spool/cron/crontabs/') || f.path.endsWith('/.dir')) continue;
    if (f.content) {
      jobs.push(...parseCrontab(f.content, f.path));
    }
  }
  return jobs;
}

// ── Matcher de horario ──────────────────────────────────────────────
function fieldMatches(field: string, value: number): boolean {
  if (field === '*') return true;
  const step = field.match(/^\*\/(\d+)$/);
  if (step) return value % parseInt(step[1], 10) === 0;
  for (const r of field.split(',')) {
    const dash = r.split('-');
    if (dash.length === 2) {
      const lo = parseInt(dash[0], 10);
      const hi = parseInt(dash[1], 10);
      if (value >= lo && value <= hi) return true;
    } else if (parseInt(r, 10) === value) {
      return true;
    }
  }
  return false;
}

function isDue(job: CronJob, d: Date): boolean {
  if (!fieldMatches(job.minute, d.getUTCMinutes())) return false;
  if (!fieldMatches(job.hour, d.getUTCHours())) return false;
  if (!fieldMatches(job.month, d.getUTCMonth() + 1)) return false;
  // POSIX: si dom Y dow están restringidos (no *), basta con que UNO
  // coincida; si solo uno está restringido, debe coincidir ese.
  const domOk = fieldMatches(job.dom, d.getUTCDate());
  const dowOk = fieldMatches(job.dow, d.getUTCDay());
  const bothRestricted = job.dom !== '*' && job.dow !== '*';
  return bothRestricted ? (domOk || dowOk) : (domOk && dowOk);
}

// ── Efectos de la ejecución ─────────────────────────────────────────
const ROOT_USER = { username: 'root', uid: 0, gid: 0, home: '/root', shell: '/bin/bash', groups: [0] };

function findParentDirEntry(machine: Machine, fullPath: string): FileEntry | null {
  const clean = fullPath.endsWith('/') && fullPath.length > 1 ? fullPath.slice(0, -1) : fullPath;
  const parentPath = clean.substring(0, clean.lastIndexOf('/')) || '/';
  return findDirEntry(machine, parentPath);
}

/**
 * Resuelve un archivo consultando primero el overlay local (cambios de ESTA
 * ejecución) y luego el filesystem de la máquina. Sin esto, dos efectos
 * sobre el mismo archivo en un mismo tick (touch + append) no se encadenan.
 */
function resolveFile(machine: Machine, overlay: Map<string, FileEntry>, path: string): FileEntry | null {
  const local = overlay.get(path);
  if (local) return local;
  return findFile(machine, path);
}

/** Aplica un efecto de archivo sobre el overlay (nunca muta machine.files). */
function ensureFile(machine: Machine, overlay: Map<string, FileEntry>, rawPath: string, content: string, append: boolean): void {
  const fullPath = rawPath.startsWith('/') ? rawPath : `/tmp/${rawPath}`;
  const parent = findParentDirEntry(machine, fullPath);
  if (!parent) return;
  const existing = resolveFile(machine, overlay, fullPath);
  const ownership = defaultOwnership(machine, ROOT_USER, 0o644);
  if (existing) {
    overlay.set(fullPath, {
      ...existing,
      content: append ? (existing.content ?? '') + content : content,
    });
    return;
  }
  overlay.set(fullPath, buildNewFile(fullPath, content, 'text', ownership));
}

function applyJobEffect(machine: Machine, overlay: Map<string, FileEntry>, job: CronJob): void {
  const cmd = job.command.trim();
  const m = cmd.match(/^(\S+)(?:\s+(.*))?$/);
  const prog = m?.[1] ?? cmd;
  const rest = (m?.[2] ?? '').trim();

  if (prog === 'touch') {
    for (const p of rest.split(/\s+/).filter(Boolean)) ensureFile(machine, overlay, p, '', false);
    return;
  }

  // Redirección simple: <texto> [>>|>] <archivo>. El texto puede ir
  // entre comillas (`echo "a b" > f` escribe `a b`, no `a`).
  const redir = rest.match(/^(.+?)\s*(>>|>)\s*(\S+)\s*$/);
  if (redir) {
    const rawText = redir[1].trim();
    const unwrapped = rawText.match(/^"(.*)"$/) ?? rawText.match(/^'(.*)'$/);
    const text = unwrapped ? unwrapped[1] : rawText;
    ensureFile(machine, overlay, redir[3], `${text}\n`, redir[2] === '>>');
  }
}

// ── Ejecución (avance del reloj virtual) ────────────────────────────
function cronLine(machine: Machine, job: CronJob, d: Date): string {
  const hostname = machine.machine_info?.hostname || 'target-server';
  const mon = MONTHS[d.getUTCMonth()];
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const pid = 3000 + (ticks.get(machine.id) ?? 0) % 1000;
  return `${mon} ${day} ${hh}:${mm}:01 ${hostname} CRON[${pid}]: (${job.user}) CMD (${job.command})`;
}

function appendToSyslog(machine: Machine, overlay: Map<string, FileEntry>, logLines: string[]): void {
  const path = '/var/log/syslog';
  const hostname = machine.machine_info?.hostname || 'target-server';
  const existing = resolveFile(machine, overlay, path);
  const newContent = logLines.map(l => l + '\n').join('');
  const parent = findParentDirEntry(machine, path);
  if (existing) {
    overlay.set(path, { ...existing, content: (existing.content ?? '') + newContent });
  } else if (parent) {
    const ownership = { owner: 'root', group: 'adm', mode: 0o640 };
    overlay.set(path, buildNewFile(path, `${hostname} syslog: cron started\n${newContent}`, 'text', ownership));
  }
}

/**
 * Avanza el reloj virtual `minutes` minutos y ejecuta las tareas que
 * correspondan (si el servicio cron está corriendo). Genera entradas en
 * /var/log/syslog y aplica efectos simples sobre el filesystem
 * (touch, echo >/>>).
 */
export function runCron(machine: Machine, minutes = 1): CronRunResult {
  const ran: CronJob[] = [];
  const logLines: string[] = [];
  // Overlay local de cambios de archivo: los efectos cron se acumulan acá y
  // NO mutan machine.files; runCron devuelve el filesChanged consolidado para
  // que el comando lo emita como metadata (patrón canónico, M1).
  const overlay = new Map<string, FileEntry>();
  const daemonUp = isServiceRunning(machine, 'cron');
  const jobs = listCronJobs(machine);

  for (let m = 0; m < minutes; m++) {
    const t = ticks.get(machine.id) ?? 0;
    const d = new Date(BASE_TIME.getTime() + t * 60_000);
    if (daemonUp) {
      for (const job of jobs) {
        if (isDue(job, d)) {
          ran.push(job);
          logLines.push(cronLine(machine, job, d));
          applyJobEffect(machine, overlay, job);
        }
      }
    }
    ticks.set(machine.id, t + 1);
  }

  let filesChanged: FileEntry[] | null = null;
  if (logLines.length > 0) {
    appendToSyslog(machine, overlay, logLines);
  }
  if (overlay.size > 0) {
    // Consolidar: reemplaza los archivos tocados del FS y agrega los nuevos,
    // preservando el orden de machine.files (Map mantiene inserción).
    const byPath = new Map<string, FileEntry>(machine.files.map(f => [f.path, f]));
    for (const [path, entry] of overlay) {
      byPath.set(path, entry);
    }
    filesChanged = [...byPath.values()];
  }
  return { ran, filesChanged, logLines };
}

// ── Formato de fecha para `date` ────────────────────────────────────
export function formatDate(d: Date): string {
  const wd = WEEKDAYS[d.getUTCDay()];
  const mon = MONTHS[d.getUTCMonth()];
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return `${wd} ${mon} ${day} ${hh}:${mm}:${ss} UTC ${d.getUTCFullYear()}`;
}

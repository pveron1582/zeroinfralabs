// ── frameworks/process/processManager.ts ─────────────────────────────
// Gestor de procesos simulados (ROADMAP Fase 5.1).
// Deriva la lista base de procesos desde la máquina (SO + puertos/servicios
// abiertos) y mantiene estado por máquina de procesos matados y servicios
// detenidos. El estado NO es persistente (igual que ShellManager).

import type { Machine } from '../../types';
import { getCurrentUser } from '../../utils/users';

export interface SimProcess {
  pid: number;
  name: string;
  user: string;
  cpu: number;
  mem: number;
  state: string;
  tty: string;
  time: string;
  command: string;
  service?: string;
}

export interface ServiceInfo {
  name: string;
  description: string;
  running: boolean;
}

// ── Estado por máquina (no persistente) ──────────────────────────────
const killedPids = new Map<string, Set<number>>();
const stoppedServices = new Map<string, Set<string>>();

function killedSet(machineId: string): Set<number> {
  let s = killedPids.get(machineId);
  if (!s) { s = new Set(); killedPids.set(machineId, s); }
  return s;
}

function stoppedSet(machineId: string): Set<string> {
  let s = stoppedServices.get(machineId);
  if (!s) { s = new Set(); stoppedServices.set(machineId, s); }
  return s;
}

// ── Construcción de la lista base ────────────────────────────────────
export function buildProcessList(machine: Machine): SimProcess[] {
  const os = machine.machine_info?.os || 'Linux';
  const isWindows = os.toLowerCase().includes('windows');
  const shellUser = getCurrentUser(machine).username;
  const procs: SimProcess[] = [];

  if (isWindows) {
    procs.push(
      { pid: 1, name: 'System Idle Process', user: 'SYSTEM', cpu: 0, mem: 0.1, state: 'S', tty: '?', time: '00:00:04', command: 'System Idle Process' },
      { pid: 2, name: 'System', user: 'SYSTEM', cpu: 0, mem: 0.2, state: 'S', tty: '?', time: '00:00:00', command: 'System' },
      { pid: 100, name: 'services.exe', user: 'SYSTEM', cpu: 0.2, mem: 1.0, state: 'Ss', tty: '?', time: '00:00:05', command: 'services.exe' },
      { pid: 200, name: 'svchost.exe', user: 'SYSTEM', cpu: 0.4, mem: 2.5, state: 'S', tty: '?', time: '00:01:15', command: 'svchost.exe', service: 'svchost' },
      { pid: 300, name: 'explorer.exe', user: 'admin', cpu: 0.1, mem: 3.0, state: 'Ssl', tty: '?', time: '00:02:30', command: 'explorer.exe' },
      { pid: 350, name: 'httpd.exe', user: 'SYSTEM', cpu: 1.5, mem: 2.0, state: 'S', tty: '?', time: '00:00:45', command: 'httpd.exe', service: 'httpd' },
      { pid: 400, name: 'lsass.exe', user: 'SYSTEM', cpu: 0.3, mem: 1.2, state: 'S', tty: '?', time: '00:00:45', command: 'lsass.exe' },
      { pid: 450, name: 'winlogon.exe', user: 'SYSTEM', cpu: 0.1, mem: 0.8, state: 'Ssl', tty: '?', time: '00:01:20', command: 'winlogon.exe' },
    );
  } else {
    procs.push(
      { pid: 1, name: 'systemd', user: 'root', cpu: 0.0, mem: 0.1, state: 'Ss', tty: '?', time: '00:00:01', command: 'systemd', service: 'systemd' },
      { pid: 2, name: 'kthreadd', user: 'root', cpu: 0.0, mem: 0.0, state: 'S', tty: '?', time: '00:00:00', command: 'kthreadd' },
      { pid: 100, name: 'sshd', user: 'root', cpu: 0.3, mem: 0.5, state: 'Ss', tty: '?', time: '00:00:02', command: 'sshd: /usr/sbin/sshd -D', service: 'ssh' },
      { pid: 200, name: 'cron', user: 'root', cpu: 0.0, mem: 0.2, state: 'S', tty: '?', time: '00:01:15', command: 'crond', service: 'cron' },
      { pid: 300, name: 'systemd-journal', user: 'root', cpu: 0.0, mem: 0.3, state: 'Ssl', tty: '?', time: '00:02:30', command: 'systemd-journald' },
      { pid: 350, name: 'nginx', user: 'www-data', cpu: 1.5, mem: 2.0, state: 'S', tty: '?', time: '00:00:30', command: 'nginx: worker process', service: 'nginx' },
      { pid: 360, name: 'mysqld', user: 'mysql', cpu: 2.0, mem: 5.5, state: 'S', tty: '?', time: '00:00:25', command: 'mysqld', service: 'mysql' },
      { pid: 370, name: 'rsyslogd', user: 'syslog', cpu: 0.1, mem: 0.4, state: 'S', tty: '?', time: '00:00:15', command: 'rsyslogd', service: 'rsyslog' },
    );
  }

  // Daemons adicionales según puertos abiertos
  for (const port of machine.scan_results?.ports || []) {
    if (port.state !== 'open') continue;
    const svc = port.service?.toLowerCase() || '';
    if (svc === 'ftp' && !procs.some(p => p.service === 'vsftpd')) {
      procs.push({ pid: 410, name: 'vsftpd', user: 'ftp', cpu: 0.2, mem: 0.3, state: 'S', tty: '?', time: '00:00:03', command: 'vsftpd', service: 'vsftpd' });
    } else if (svc === 'smb' && !procs.some(p => p.service === 'smb')) {
      procs.push({ pid: 420, name: 'smbd', user: 'root', cpu: 0.4, mem: 1.1, state: 'S', tty: '?', time: '00:00:20', command: 'smbd', service: 'smb' });
    } else if (svc === 'rdp' && !procs.some(p => p.service === 'xrdp')) {
      procs.push({ pid: 430, name: 'xrdp', user: 'root', cpu: 0.2, mem: 0.9, state: 'S', tty: '?', time: '00:00:10', command: 'xrdp', service: 'xrdp' });
    }
  }

  // Shell del usuario actual
  procs.push({ pid: 500, name: 'bash', user: shellUser, cpu: 0.1, mem: 0.3, state: 'R+', tty: 'pts/0', time: '00:00:05', command: 'bash' });

  return procs;
}

// ── Lectura (aplica filtros de estado) ───────────────────────────────
export function list(machine: Machine): SimProcess[] {
  const killed = killedPids.get(machine.id);
  const stopped = stoppedServices.get(machine.id);
  return buildProcessList(machine).filter(p => {
    if (killed?.has(p.pid)) return false;
    if (p.service && stopped?.has(p.service)) return false;
    return true;
  });
}

export function getProcess(machine: Machine, pid: number): SimProcess | undefined {
  return list(machine).find(p => p.pid === pid);
}

export function isServiceRunning(machine: Machine, service: string): boolean {
  return list(machine).some(p => p.service === service);
}

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  systemd: 'System and Service Manager',
  ssh: 'OpenBSD Secure Shell server',
  nginx: 'High performance web server and reverse proxy server',
  mysql: 'MySQL Community Server',
  vsftpd: 'vsftpd FTP server',
  smb: 'SMB/CIFS file server',
  xrdp: 'xrdp daemon',
  cron: 'Regular background program processing daemon',
  rsyslog: 'System Logging Service',
  httpd: 'Apache HTTP Server',
  svchost: 'Host Process for Windows Services',
};

export function getAllServices(machine: Machine): ServiceInfo[] {
  const stopped = stoppedServices.get(machine.id);
  const killed = killedPids.get(machine.id);
  return buildProcessList(machine)
    .filter(p => p.service)
    .map(p => ({
      name: p.service!,
      description: SERVICE_DESCRIPTIONS[p.service!] || `${p.service} service`,
      running: !(stopped?.has(p.service!) ?? false) && !(killed?.has(p.pid) ?? false),
    }));
}

// ── Mutaciones ───────────────────────────────────────────────────────
export function killPid(machine: Machine, pid: number): boolean {
  const proc = buildProcessList(machine).find(p => p.pid === pid);
  if (!proc) return false;
  killedSet(machine.id).add(pid);
  if (proc.service) stoppedSet(machine.id).add(proc.service);
  return true;
}

export function stopService(machine: Machine, service: string): boolean {
  const procs = buildProcessList(machine).filter(p => p.service === service);
  if (procs.length === 0) return false;
  stoppedSet(machine.id).add(service);
  procs.forEach(p => killedSet(machine.id).add(p.pid));
  return true;
}

export function startService(machine: Machine, service: string): boolean {
  const procs = buildProcessList(machine).filter(p => p.service === service);
  if (procs.length === 0) return false;
  stoppedSet(machine.id).delete(service);
  procs.forEach(p => killedSet(machine.id).delete(p.pid));
  return true;
}

export function resetProcessManager(): void {
  killedPids.clear();
  stoppedServices.clear();
}

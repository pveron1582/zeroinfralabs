// ── frameworks/fs/mounts.ts ────────────────────────────────────────
// Tabla de montajes simulada (ROADMAP Fase 9.1). Deriva los montajes
// base desde /etc/fstab y mantiene estado por máquina de dispositivos
// montados/desmontados por el usuario (NO persistente, patrón
// ProcessManager/networkState).

import type { Machine } from '../../types';
import { findFile, findDirEntry } from '../../utils/fs';

export interface MountEntry {
  device: string;
  mountpoint: string;
  fs: string;
  options: string;
  system?: boolean;
}

// ── Estado por máquina (no persistente) ─────────────────────────────
const mounted = new Map<string, Set<string>>(); // machineId -> mountpoints montados por usuario

function mountedSet(machineId: string): Set<string> {
  let s = mounted.get(machineId);
  if (!s) { s = new Set(); mounted.set(machineId, s); }
  return s;
}

export function resetMounts(): void {
  mounted.clear();
}

// ── Parseo de /etc/fstab ────────────────────────────────────────────
export function parseFstab(content: string): MountEntry[] {
  const entries: MountEntry[] = [];
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 3) continue;
    const [device, mountpoint, fs] = parts;
    const options = parts[3] ?? 'defaults';
    if (fs === 'swap') continue;
    entries.push({ device, mountpoint, fs, options });
  }
  return entries;
}

export function getFstabEntries(machine: Machine): MountEntry[] {
  const fstab = findFile(machine, '/etc/fstab');
  if (!fstab?.content) return [];
  return parseFstab(fstab.content);
}

// ── Tabla de montajes actual ────────────────────────────────────────
export function getMounts(machine: Machine): MountEntry[] {
  const entries: MountEntry[] = [
    { device: '/dev/sda1', mountpoint: '/', fs: 'ext4', options: 'rw,relatime', system: true },
    { device: 'proc', mountpoint: '/proc', fs: 'proc', options: 'rw,nosuid,nodev,noexec', system: true },
    { device: 'sysfs', mountpoint: '/sys', fs: 'sysfs', options: 'rw,nosuid,nodev,noexec', system: true },
    { device: 'devtmpfs', mountpoint: '/dev', fs: 'devtmpfs', options: 'rw,nosuid', system: true },
  ];

  for (const f of getFstabEntries(machine)) {
    if (f.mountpoint === '/' || entries.some(e => e.mountpoint === f.mountpoint)) continue;
    entries.push({ ...f, options: f.options, system: true });
  }

  const extra = mountedSet(machine.id);
  for (const mp of extra) {
    entries.push({ device: extraDevice(machine, mp), mountpoint: mp, fs: 'ext4', options: 'rw,relatime' });
  }
  return entries;
}

const deviceByMount = new Map<string, Map<string, string>>();

function extraDevice(machine: Machine, mountpoint: string): string {
  let m = deviceByMount.get(machine.id);
  if (!m) { m = new Map(); deviceByMount.set(machine.id, m); }
  return m.get(mountpoint) ?? `/dev/sdb1`;
}

export function isMounted(machine: Machine, mountpoint: string): boolean {
  return getMounts(machine).some(m => m.mountpoint === mountpoint);
}

export function mountDevice(machine: Machine, device: string, mountpoint: string): boolean {
  if (!findDirEntry(machine, mountpoint)) return false;
  if (isMounted(machine, mountpoint)) return false;
  mountedSet(machine.id).add(mountpoint);
  let m = deviceByMount.get(machine.id);
  if (!m) { m = new Map(); deviceByMount.set(machine.id, m); }
  m.set(mountpoint, device);
  return true;
}

export function unmount(machine: Machine, mountpoint: string): boolean {
  const system = getMounts(machine).find(m => m.mountpoint === mountpoint && m.system);
  if (system) return false;
  return mountedSet(machine.id).delete(mountpoint);
}

// ── utils/permissions.ts ──────────────────────────────────────────
// Chequeo de permisos Unix (rwx) sobre FileEntry

import type { Machine, FileEntry, User } from '../types';
import { getGroups } from './users';

const DIR_MODE_DEFAULT = 0o755;
const FILE_MODE_DEFAULT = 0o644;

function isDir(file: FileEntry): boolean {
  return file.path.endsWith('.dir');
}

function getEffectiveMode(file: FileEntry): number {
  if (file.mode !== undefined && file.mode !== null) return file.mode;
  return isDir(file) ? DIR_MODE_DEFAULT : FILE_MODE_DEFAULT;
}

function getOwner(file: FileEntry): string {
  return file.owner ?? 'root';
}

function getGroup(file: FileEntry): string {
  return file.group ?? 'root';
}

function userBelongsToGroup(machine: Machine, user: User, groupName: string): boolean {
  const group = getGroups(machine).find(g => g.name === groupName);
  if (!group) return false;
  return group.members.includes(user.username) || user.gid === group.gid;
}

export function checkPermission(
  machine: Machine,
  file: FileEntry,
  user: User | null,
  operation: 'read' | 'write' | 'execute'
): boolean {
  if (!user) return false;
  if (user.uid === 0 || user.username === 'root') return true;

  const mode = getEffectiveMode(file);
  const owner = getOwner(file);
  const group = getGroup(file);

  let bits: number;
  if (user.username === owner) {
    bits = (mode >> 6) & 7;
  } else if (userBelongsToGroup(machine, user, group)) {
    bits = (mode >> 3) & 7;
  } else {
    bits = mode & 7;
  }

  switch (operation) {
    case 'read':    return (bits & 4) !== 0;
    case 'write':   return (bits & 2) !== 0;
    case 'execute': return (bits & 1) !== 0;
  }
}

export function canRead(machine: Machine, file: FileEntry, user: User | null): boolean {
  return checkPermission(machine, file, user, 'read');
}

export function canWrite(machine: Machine, file: FileEntry, user: User | null): boolean {
  return checkPermission(machine, file, user, 'write');
}

export function canExecute(machine: Machine, file: FileEntry, user: User | null): boolean {
  return checkPermission(machine, file, user, 'execute');
}

export function canEditFile(machine: Machine, file: FileEntry, user: User | null): boolean {
  return canWrite(machine, file, user);
}

export function canCreateInDir(machine: Machine, parentDirEntry: FileEntry | null, user: User | null): boolean {
  if (!user) return false;
  if (user.uid === 0 || user.username === 'root') return true;
  if (!parentDirEntry) return false;
  return canWrite(machine, parentDirEntry, user) && canExecute(machine, parentDirEntry, user);
}

export function canDeleteInDir(
  machine: Machine,
  parentDirEntry: FileEntry | null,
  targetFile: FileEntry | null,
  user: User | null
): boolean {
  if (!user) return false;
  if (user.uid === 0 || user.username === 'root') return true;
  if (!parentDirEntry) return false;
  if (!canWrite(machine, parentDirEntry, user) || !canExecute(machine, parentDirEntry, user)) {
    return false;
  }
  const parentMode = parentDirEntry.mode ?? 0o755;
  if (!hasStickyBit(parentMode)) return true;
  if (!targetFile) return true;
  const targetOwner = targetFile.owner ?? 'root';
  return user.username === targetOwner;
}

export function hasSuid(mode: number): boolean {
  return (mode & 0o4000) !== 0;
}

export function hasSgid(mode: number): boolean {
  return (mode & 0o2000) !== 0;
}

export function hasStickyBit(mode: number): boolean {
  return (mode & 0o1000) !== 0;
}

export function formatMode(mode: number, isDirectory: boolean): string {
  const typeChar = isDirectory ? 'd' : '-';
  const suid = hasSuid(mode);
  const sgid = hasSgid(mode);
  const sticky = hasStickyBit(mode);

  const owner = formatTriplet((mode >> 6) & 7, suid, 'owner');
  const group = formatTriplet((mode >> 3) & 7, sgid, 'group');
  const other = formatTriplet(mode & 7, sticky, 'other');

  return `${typeChar}${owner}${group}${other}`;
}

function formatTriplet(bits: number, special: boolean, position: 'owner' | 'group' | 'other'): string {
  const r = (bits & 4) ? 'r' : '-';
  const w = (bits & 2) ? 'w' : '-';
  let x: string;
  if (bits & 1) {
    x = special ? (position === 'other' ? 't' : 's') : 'x';
  } else {
    x = special ? (position === 'other' ? 'T' : 'S') : '-';
  }
  return `${r}${w}${x}`;
}

export function formatModeFromFile(file: FileEntry): string {
  return formatMode(getEffectiveMode(file), isDir(file));
}

// ── utils/fs.ts ────────────────────────────────────────────────────
// Helpers compartidos de filesystem virtual: lookup de archivos/dirs,
// construcción de FileEntry para archivos nuevos, parent dir resolution.
// Reemplaza las 10+ copias duplicadas en mkdir, touch, echo, cp, mv,
// rm, rmdir, nano.

import type { FileEntry, Machine, User } from '../types';
import { getPrimaryGroupName } from './users';

export function findFile(machine: { files: FileEntry[] }, fullPath: string): FileEntry | null {
  const clean = fullPath.endsWith('/') && fullPath.length > 1 ? fullPath.slice(0, -1) : fullPath;
  return (
    machine.files.find(f => f.path === clean) ||
    machine.files.find(f => f.path === clean + '/.dir') ||
    null
  );
}

export function findDirEntry(machine: { files: FileEntry[] }, dirPath: string): FileEntry | null {
  let clean = dirPath.endsWith('/') && dirPath.length > 1 ? dirPath.slice(0, -1) : dirPath;
  if (clean === '/' || clean === '') clean = '';
  return machine.files.find(f => f.path === clean + '/.dir') ?? null;
}

export function findParentDir(machine: { files: FileEntry[] }, fullPath: string): FileEntry | null {
  const clean = fullPath.endsWith('/') && fullPath.length > 1 ? fullPath.slice(0, -1) : fullPath;
  const parentPath = clean.substring(0, clean.lastIndexOf('/')) || '/';
  return findDirEntry(machine, parentPath);
}

export function resolveParentDirPath(fullPath: string): string {
  const clean = fullPath.endsWith('/') && fullPath.length > 1 ? fullPath.slice(0, -1) : fullPath;
  if (clean === '/' || clean === '') return '/';
  const idx = clean.lastIndexOf('/');
  if (idx <= 0) return '/';
  return clean.substring(0, idx);
}

export function isDirectoryEntry(file: FileEntry): boolean {
  return file.path.endsWith('/.dir');
}

/**
 * ¿`filePath` es el directorio `dir` o está dentro de él?
 *
 * Es el predicado de "todo lo que cuelga de este directorio" para `rm -r`,
 * `cp -r`, `mv`, `rmdir`, `chgrp -R` y `chown -R`. Usar `path.startsWith(dir)`
 * a secas confunde un hermano que comparte prefijo: con `dir = /home/user/x`,
 * `/home/user/xyz/secreto` también empieza con ese string y `rm -rf` se
 * llevaba también `xyz` (pérdida de datos irreversible en los labs).
 *
 * `dir` puede venir con o sin barra final: la normaliza.
 */
export function isUnderPath(filePath: string, dir: string): boolean {
  const base = dir.length > 1 ? dir.replace(/\/+$/, '') : dir;
  if (base === '' || base === '/') return filePath.startsWith('/');
  return filePath === base || filePath.startsWith(base + '/');
}

export interface NewFileOwnership {
  owner: string;
  group: string;
  mode: number;
}

export function defaultOwnership(machine: Machine, user: User, mode: number): NewFileOwnership {
  return {
    owner: user.username,
    group: getPrimaryGroupName(machine, user),
    mode,
  };
}

export function buildNewFile(
  path: string,
  content: string,
  type: 'text' | 'hash' | 'binary' | 'symlink',
  ownership: NewFileOwnership
): FileEntry {
  return {
    path,
    content,
    type,
    owner: ownership.owner,
    group: ownership.group,
    mode: ownership.mode,
  };
}

/** Resuelve un enlace simbólico hasta el archivo real (seguimiento recursivo). */
export function resolveSymlink(machine: { files: FileEntry[] }, entry: FileEntry): FileEntry {
  let current = entry;
  const seen = new Set<string>([entry.path]);
  while (current.type === 'symlink' && current.linkTarget) {
    const targetPath = current.linkTarget.startsWith('/')
      ? current.linkTarget
      : ((current.path.substring(0, current.path.lastIndexOf('/')) || '/') + '/' + current.linkTarget);
    const clean = targetPath.endsWith('/') && targetPath.length > 1 ? targetPath.slice(0, -1) : targetPath;
    const next = machine.files.find(f => f.path === clean || f.path === clean + '/.dir');
    if (!next || seen.has(next.path)) break;
    seen.add(next.path);
    current = next;
  }
  return current;
}

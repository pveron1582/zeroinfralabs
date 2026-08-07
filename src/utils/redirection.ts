// ── utils/redirection.ts ───────────────────────────────────────────
// Parseo de redirecciones (>, >>) y escritura compartida de output a
// archivo. Usado por echo y por el executor para redirección global.

import type { FileEntry, Machine } from '../types';
import { getCurrentUser } from './users';
import { canCreateInDir, canEditFile } from './permissions';
import { findFile, findParentDir, defaultOwnership, buildNewFile } from './fs';
import { normalizePath, resolvePath } from './path';
import { applyUmask } from '../commands/builtin/umask';

export interface RedirectionResult {
  text: string;
  operator: '>' | '>>' | null;
  filename: string | null;
}

export function parseRedirection(args: string[]): RedirectionResult {
  const gtIndex = args.indexOf('>');
  const dgtIndex = args.indexOf('>>');
  const useDgt = dgtIndex !== -1 && (gtIndex === -1 || dgtIndex < gtIndex);

  if (!useDgt && gtIndex === -1) {
    return { text: args.join(' '), operator: null, filename: null };
  }

  const idx = useDgt ? dgtIndex : gtIndex!;
  const text = args.slice(0, idx).join(' ');
  const filename = args.slice(idx + 1).join(' ');
  return { text, operator: useDgt ? '>>' : '>', filename: filename || null };
}

// ── Escritura de output a archivo (redirección > y >>) ─────────────
export type WriteResult =
  | { ok: true; filesChanged: FileEntry[] }
  | { ok: false; error: string };

export function writeOutputToFile(
  machine: Machine,
  currentDir: string | undefined,
  umask: number,
  rawPath: string,
  content: string,
  operator: '>' | '>>'
): WriteResult {
  const currentUser = getCurrentUser(machine);
  const homeDir = currentUser.home;
  const fullPath = normalizePath(resolvePath(rawPath, currentDir || '/', homeDir));
  const cleanPath = fullPath.endsWith('/') && fullPath.length > 1 ? fullPath.slice(0, -1) : fullPath;

  const parentDir = findParentDir(machine, cleanPath);
  if (!parentDir) {
    return { ok: false, error: `cannot write '${rawPath}': No such file or directory` };
  }

  const existing = findFile(machine, cleanPath);
  if (existing) {
    if (!canEditFile(machine, existing, currentUser)) {
      return { ok: false, error: `cannot write to '${rawPath}': Permission denied` };
    }
  } else {
    if (!canCreateInDir(machine, parentDir, currentUser)) {
      return { ok: false, error: `cannot write '${rawPath}': Permission denied` };
    }
  }

  const newFiles: FileEntry[] = [...machine.files];
  if (existing) {
    const idx = newFiles.findIndex(f => f.path === existing.path);
    if (idx !== -1) {
      newFiles[idx] = {
        ...newFiles[idx],
        content: operator === '>' ? content : newFiles[idx].content + content,
      };
    }
  } else {
    const ownership = defaultOwnership(machine, currentUser, applyUmask(0o666, umask));
    newFiles.push(buildNewFile(cleanPath, content, 'text', ownership));
  }

  machine.files = newFiles;
  return { ok: true, filesChanged: newFiles };
}

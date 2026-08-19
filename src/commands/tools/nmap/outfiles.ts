// ── commands/tools/nmap/outfiles.ts ──────────────────────────────
// Escritura de -oN/-oG a archivos con permisos Unix (owner/group/mode)

import type { CommandContext, FileEntry } from '../../../types';
import { normalizePath, resolvePath } from '../../../utils/path';
import { getCurrentUser } from '../../../utils/users';
import { canCreateInDir, canEditFile } from '../../../utils/permissions';
import { findFile, findParentDir, defaultOwnership } from '../../../utils/fs';
import { applyUmask } from '../../builtin/umask';

export interface NmapFileWriter {
  tryAddCreatedFile: (rawPath: string, content: string) => void;
  createdFiles: FileEntry[];
  createdFileErrors: string[];
}

/**
 * Fabrica el escritor de archivos de nmap (-oN/-oG).
 * Si hay máquina local valida permisos y asigna owner/group/mode;
 * si no (tests legacy, contextos sin máquina) crea archivos sin metadata.
 */
export function createNmapFileWriter(ctx: CommandContext, currentDir: string): NmapFileWriter {
  const writer: NmapFileWriter = {
    createdFiles: [],
    createdFileErrors: [],
    tryAddCreatedFile(rawPath: string, content: string) {
      const localMachine = ctx.machine;
      if (!localMachine) {
        const fullPath = rawPath.startsWith('/') ? rawPath : `${currentDir}/${rawPath}`;
        writer.createdFiles.push({ path: cleanPath(fullPath), content, type: 'text' });
        return;
      }
      const nmapUser = getCurrentUser(localMachine);
      const nmapHome = nmapUser.home ?? '/root';
      const targetPath = cleanPath(normalizePath(resolvePath(rawPath, currentDir, nmapHome)));
      const parentDir = findParentDir(localMachine, targetPath);
      const existing = findFile(localMachine, targetPath);
      if (existing) {
        if (!canEditFile(localMachine, existing, nmapUser)) {
          writer.createdFileErrors.push(`nmap: cannot write to '${rawPath}': Permission denied`);
          return;
        }
      } else {
        if (!canCreateInDir(localMachine, parentDir, nmapUser)) {
          writer.createdFileErrors.push(`nmap: cannot create '${rawPath}': Permission denied`);
          return;
        }
      }
      const ownership = existing
        ? { owner: existing.owner ?? 'root', group: existing.group ?? 'root', mode: existing.mode ?? applyUmask(0o644, ctx.umask ?? 0o022) }
        : defaultOwnership(localMachine, nmapUser, applyUmask(0o644, ctx.umask ?? 0o022));
      writer.createdFiles.push({
        path: targetPath, content, type: 'text',
        owner: ownership.owner, group: ownership.group, mode: ownership.mode,
      });
    },
  };
  return writer;
}

function cleanPath(fullPath: string): string {
  return fullPath.endsWith('/') && fullPath.length > 1 ? fullPath.slice(0, -1) : fullPath;
}

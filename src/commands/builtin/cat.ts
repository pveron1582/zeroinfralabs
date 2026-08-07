// ── commands/builtin/cat.ts ───────────────────────────────────────
// Muestra contenido de archivos
// Solo lee archivos y reporta metadata para que el laboratorio valide.

import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser } from '../../utils/users';
import { canRead } from '../../utils/permissions';
import { resolveSymlink } from '../../utils/fs';
import { buildFileReadMetadata } from '../../utils/fileRead';

// Helper para normalizar paths
function normalizePath(filePath: string): string {
  let normalized = filePath.replace(/^\.\//, '');
  if (normalized.endsWith('/')) {
    return normalized;
  }
  return normalized;
}

export const cmd_cat = {
  name: 'cat',
  execute: (args: string[], { machine, allMachines, currentDir }: CommandContext): CommandResponse => {
    if (!args[0]) return { output: 'usage: cat <file>', isError: true };

    const rawPath = args[0];
    const normalizedPath = normalizePath(rawPath);

    if (normalizedPath.endsWith('/')) {
      return { output: `cat: ${rawPath}: Is a directory`, isError: true };
    }

    // Resolver paths relativos contra currentDir
    const fullPath = rawPath.startsWith('/') ? rawPath : (currentDir?.replace(/\/$/, '') || '') + '/' + rawPath;

    const file = machine.files?.find(f => {
      if (f.path === normalizedPath) return true;
      if (f.path === rawPath) return true;
      if (f.path === fullPath) return true;
      if (f.path.endsWith('/' + normalizedPath)) return true;
      if (f.path.endsWith('/' + rawPath)) return true;
      if (f.path.endsWith('/' + fullPath)) return true;
      return false;
    });

    if (!file) {
      return { output: `cat: ${rawPath}: No such file or directory`, isError: true };
    }

    const currentUser = getCurrentUser(machine);
    const resolved = file.type === 'symlink' ? resolveSymlink(machine, file) : file;
    if (!canRead(machine, resolved, currentUser)) {
      return { output: `cat: ${rawPath}: Permission denied`, isError: true };
    }

    // Metadata compartida para que el laboratorio valide (flag/nota/payload)
    // y detecte usuarios mencionados (possibleUsers → EnumerationPanel).
    const fileMetadata = buildFileReadMetadata(machine, allMachines, resolved);

    return {
      output: resolved.content,
      type: 'fileRead',
      fileRead: fileMetadata.fileRead,
      ...(fileMetadata.possibleUsers && { possibleUsers: fileMetadata.possibleUsers }),
    };
  }
};

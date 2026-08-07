import type { CommandContext, CommandResponse } from '../../types';
import { normalizePath, resolvePath } from '../../utils/path';
import { getCurrentUser, ROOT_USER } from '../../utils/users';
import { canRead, canEditFile, canCreateInDir } from '../../utils/permissions';
import { findFile, findParentDir, resolveSymlink } from '../../utils/fs';
import { buildFileReadMetadata } from '../../utils/fileRead';

export const cmd_nano = {
  name: 'nano',
  description: 'Open file editor',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    const { currentDir, machine, allMachines } = context;

    if (args.length === 0) {
      return {
        output: '',
        nanoFile: { path: '', content: '' },
      };
    }

    // `sudo nano <file>` eleva la identidad a root: puede leer y modificar
    // archivos restringidos que el usuario solo puede leer (p.ej. /etc/passwd).
    const elevated = context.elevatedEdit === true;
    const currentUser = elevated ? ROOT_USER : getCurrentUser(machine);
    const homeDir = currentUser.home;
    const rawPath = args[0];

    const fullPath = normalizePath(resolvePath(rawPath, currentDir || '/', homeDir));
    const cleanPath = fullPath.endsWith('/') ? fullPath.slice(0, -1) : fullPath;

    const existing = findFile(machine, fullPath);

    if (!existing) {
      const parentDir = findParentDir(machine, cleanPath);
      if (!parentDir) {
        return { output: `nano: '${rawPath}': No such file or directory`, isError: true };
      }
      if (!canCreateInDir(machine, parentDir, currentUser)) {
        return { output: `nano: '${rawPath}': Permission denied`, isError: true };
      }
      return {
        output: '',
        nanoFile: { path: cleanPath, content: '', elevated },
      };
    }

    if (!canRead(machine, existing, currentUser)) {
      return { output: `nano: '${rawPath}': Permission denied`, isError: true };
    }

    // Resolver symlinks y emitir metadata de lectura (igual que `cat`): así
    // leer una flag/nota con nano valida la misión del laboratorio.
    const resolved = existing.type === 'symlink' ? resolveSymlink(machine, existing) : existing;
    const readOnly = !canEditFile(machine, resolved, currentUser);
    const fileMetadata = buildFileReadMetadata(machine, allMachines ?? [machine], resolved);

    return {
      output: '',
      nanoFile: {
        path: cleanPath,
        content: resolved.content,
        readOnly,
        elevated,
        existingSnapshot: {
          owner: resolved.owner ?? 'root',
          group: resolved.group ?? 'root',
          mode: resolved.mode ?? 0o644,
        },
      },
      fileRead: fileMetadata.fileRead,
      ...(fileMetadata.possibleUsers && { possibleUsers: fileMetadata.possibleUsers }),
    };
  },
};

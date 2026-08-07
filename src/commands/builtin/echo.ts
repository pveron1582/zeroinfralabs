import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { normalizePath, resolvePath } from '../../utils/path';
import { getCurrentUser } from '../../utils/users';
import { canCreateInDir, canEditFile } from '../../utils/permissions';
import { findFile, findParentDir, defaultOwnership, buildNewFile } from '../../utils/fs';
import { parseRedirection } from '../../utils/redirection';
import { applyUmask } from '../builtin/umask';

export const cmd_echo = {
  name: 'echo',
  description: 'Display text or write to file with redirection',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    const { currentDir, machine } = context;

    if (args.length === 0) {
      return { output: '' };
    }

    const { text, operator, filename: rawFilename } = parseRedirection(args);

    if (!operator || !rawFilename) {
      return { output: text };
    }

    const currentUser = getCurrentUser(machine);
    const homeDir = currentUser.home;
    const fullPath = normalizePath(resolvePath(rawFilename, currentDir || '/', homeDir));
    const cleanPath = fullPath.endsWith('/') ? fullPath.slice(0, -1) : fullPath;

    const parentDir = findParentDir(machine, cleanPath);

    if (!parentDir) {
      return { output: `echo: cannot write '${rawFilename}': No such file or directory`, isError: true };
    }

    const existing = findFile(machine, fullPath);

    if (existing) {
      if (!canEditFile(machine, existing, currentUser)) {
        return { output: `echo: cannot write to '${rawFilename}': Permission denied`, isError: true };
      }
    } else {
      if (!canCreateInDir(machine, parentDir, currentUser)) {
        return { output: `echo: cannot write '${rawFilename}': Permission denied`, isError: true };
      }
    }

    const newFiles: FileEntry[] = [...machine.files];
    const content = text + '\n';
    const umask = context.umask ?? 0o022;

    if (existing) {
      const idx = newFiles.findIndex(f => f.path === existing.path);
      if (operator === '>') {
        if (idx !== -1) newFiles[idx] = { ...newFiles[idx], content };
      } else {
        if (idx !== -1) newFiles[idx] = { ...newFiles[idx], content: newFiles[idx].content + content };
      }
    } else {
      const ownership = defaultOwnership(machine, currentUser, applyUmask(0o666, umask));
      newFiles.push(buildNewFile(cleanPath, content, 'text', ownership));
    }

    machine.files = newFiles;
    return { output: text, filesChanged: newFiles };
  },
};

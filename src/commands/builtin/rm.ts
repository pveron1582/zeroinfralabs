import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { normalizePath, resolvePath } from '../../utils/path';
import { getCurrentUser } from '../../utils/users';
import { canCreateInDir, canDeleteInDir } from '../../utils/permissions';
import { findFile, findDirEntry, resolveParentDirPath } from '../../utils/fs';

export const cmd_rm = {
  name: 'rm',
  description: 'Remove files or directories',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    const { currentDir, machine } = context;

    if (args.length === 0) {
      return { output: 'usage: rm [-rf] file...', isError: true };
    }

    let recursive = false;
    let force = false;
    const targets: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '-r' || arg === '-rf' || arg === '-fr') {
        recursive = true;
        if (arg === '-rf' || arg === '-fr') force = true;
      } else if (arg === '-f') {
        force = true;
      } else if (arg.startsWith('-')) {
        return { output: `rm: invalid option -- '${arg.slice(1)}'`, isError: true };
      } else {
        targets.push(arg);
      }
    }

    if (targets.length === 0) {
      return { output: 'rm: missing operand', isError: true };
    }

    const currentUser = getCurrentUser(machine);
    const homeDir = currentUser.home;
    const results: string[] = [];
    const newFiles: FileEntry[] = [...machine.files];

    for (const target of targets) {
      const fullPath = normalizePath(resolvePath(target, currentDir || '/', homeDir));
      const cleanPath = fullPath.endsWith('/') ? fullPath.slice(0, -1) : fullPath;
      const entry = findFile({ files: newFiles }, fullPath);

      if (!entry) {
        if (force) {
          results.push('');
          continue;
        }
        results.push(`rm: cannot remove '${target}': No such file or directory`);
        continue;
      }

      const isDir = entry.path.endsWith('/.dir');

      if (isDir && !recursive) {
        results.push(`rm: cannot remove '${target}': Is a directory`);
        continue;
      }

      const parentPath = isDir
        ? resolveParentDirPath(cleanPath.replace(/\/\.dir$/, ''))
        : resolveParentDirPath(cleanPath);
      const parentDir = findDirEntry({ files: newFiles }, parentPath);

      if (!parentDir) {
        results.push(`rm: cannot remove '${target}': No such file or directory`);
        continue;
      }

      if (!canCreateInDir(machine, parentDir, currentUser)) {
        results.push(`rm: cannot remove '${target}': Permission denied`);
        continue;
      }

      if (!canDeleteInDir(machine, parentDir, entry, currentUser)) {
        results.push(`rm: cannot remove '${target}': Operation not permitted`);
        continue;
      }

      if (isDir) {
        const dirPrefix = cleanPath.endsWith('/.dir') ? cleanPath.slice(0, -5) : cleanPath;
        const children = newFiles.filter(f => f.path.startsWith(dirPrefix) && f.path !== entry.path);
        if (children.length > 0 && !recursive) {
          results.push(`rm: cannot remove '${target}': Directory not empty`);
          continue;
        }
        for (let i = newFiles.length - 1; i >= 0; i--) {
          if (newFiles[i].path.startsWith(dirPrefix)) newFiles.splice(i, 1);
        }
      } else {
        const idx = newFiles.findIndex(f => f.path === entry.path);
        if (idx !== -1) newFiles.splice(idx, 1);
      }

      results.push('');
    }

    machine.files = newFiles;
    return {
      output: results.join('\n'),
      isError: results.some(r => r.length > 0),
      filesChanged: newFiles,
    };
  },
};

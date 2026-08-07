import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { normalizePath, resolvePath } from '../../utils/path';
import { getCurrentUser } from '../../utils/users';
import { canCreateInDir } from '../../utils/permissions';
import { findFile, findParentDir, defaultOwnership, buildNewFile } from '../../utils/fs';
import { applyUmask } from './umask';

export const cmd_touch = {
  name: 'touch',
  description: 'Create empty files or update timestamps',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    const { currentDir, machine } = context;

    if (args.length === 0) {
      return { output: 'usage: touch file...', isError: true };
    }

    const currentUser = getCurrentUser(machine);
    const homeDir = currentUser.home;
    const umask = context.umask ?? 0o022;
    const results: string[] = [];
    const newFiles: FileEntry[] = [...machine.files];

    for (const arg of args) {
      if (arg.startsWith('-')) {
        results.push(`touch: invalid option -- '${arg.slice(1)}'`);
        continue;
      }

      const fullPath = normalizePath(resolvePath(arg, currentDir || '/', homeDir));
      const cleanPath = fullPath.endsWith('/') ? fullPath.slice(0, -1) : fullPath;
      const existing = findFile(machine, fullPath);

      if (existing) {
        results.push('');
        continue;
      }

      const parentDir = findParentDir(machine, cleanPath);
      if (!parentDir) {
        results.push(`touch: cannot touch '${arg}': No such file or directory`);
        continue;
      }

      if (!canCreateInDir(machine, parentDir, currentUser)) {
        results.push(`touch: cannot touch '${arg}': Permission denied`);
        continue;
      }

      const ownership = defaultOwnership(machine, currentUser, applyUmask(0o666, umask));
      newFiles.push(buildNewFile(cleanPath, '', 'text', ownership));
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

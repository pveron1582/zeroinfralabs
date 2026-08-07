import type { CommandContext, CommandResponse } from '../../types';
import { normalizePath, ensureTrailingSlash } from '../../utils/path';
import { getCurrentUser } from '../../utils/users';
import { canExecute } from '../../utils/permissions';

export const cmd_cd = {
  name: 'cd',
  execute: (args: string[], { machine, currentDir, setCurrentDir }: CommandContext): CommandResponse => {
    if (!machine.files || machine.files.length === 0) {
      return { output: `cd: No such file or directory`, isError: true };
    }

    const currentUser = getCurrentUser(machine);
    const isRootUser = currentUser.uid === 0;
    const homeDir = currentUser.home;

    const target = args[0] || homeDir;

    let resolvedPath: string;
    if (target === '/') {
      resolvedPath = '/';
    } else if (target === '..') {
      const parts = currentDir.split('/').filter(Boolean);
      parts.pop();
      resolvedPath = parts.length === 0 ? '/' : '/' + parts.join('/') + '/';
    } else if (target === '~' || target === '') {
      resolvedPath = ensureTrailingSlash(homeDir);
    } else if (target.startsWith('/')) {
      resolvedPath = ensureTrailingSlash(target);
    } else if (target.startsWith('~')) {
      const rest = target.length > 1 ? target.slice(1).replace(/^\//, '') : '';
      resolvedPath = ensureTrailingSlash(homeDir + (rest ? '/' + rest : ''));
    } else {
      resolvedPath = normalizePath(ensureTrailingSlash(currentDir) + target);
    }

    // Find the directory entry
    const dirPath = resolvedPath === '/' ? '' : resolvedPath.replace(/\/$/, '');
    const dirEntry = machine.files.find(f =>
      f.path === dirPath + '/.dir'
    );

    if (!dirEntry) {
      return { output: `cd: ${target}: No such file or directory`, isError: true };
    }

    // Check execute permission
    if (!isRootUser && !canExecute(machine, dirEntry, currentUser)) {
      return { output: `cd: ${target}: Permission denied`, isError: true };
    }

    if (setCurrentDir) {
      setCurrentDir(resolvedPath);
    }

    return { output: '' };
  }
};

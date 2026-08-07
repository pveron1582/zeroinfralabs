import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { normalizePath, resolvePath } from '../../utils/path';
import { getCurrentUser } from '../../utils/users';
import { canCreateInDir, canDeleteInDir } from '../../utils/permissions';
import { findDirEntry, findParentDir, resolveParentDirPath } from '../../utils/fs';

export const cmd_rmdir = {
  name: 'rmdir',
  description: 'Remove empty directories',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    const { currentDir, machine } = context;

    if (args.length === 0) {
      return {
        output: 'usage: rmdir [-p] directory...\n  -p  remove parent directories as needed',
        isError: true,
      };
    }

    let removeParents = false;
    const directories: string[] = [];

    for (const arg of args) {
      if (arg === '-p') {
        removeParents = true;
      } else if (arg.startsWith('-')) {
        return {
          output: `rmdir: invalid option -- '${arg.slice(1)}'\nTry 'rmdir --help' for more information.`,
          isError: true,
        };
      } else {
        directories.push(arg);
      }
    }

    if (directories.length === 0) {
      return {
        output: 'rmdir: missing operand\nTry \'rmdir --help\' for more information.',
        isError: true,
      };
    }

    const currentUser = getCurrentUser(machine);
    const homeDir = currentUser.home;

    const results: string[] = [];
    const newFiles: FileEntry[] = [...machine.files];

    for (const dir of directories) {
      try {
        if (dir === '/') {
          results.push(`rmdir: failed to remove '${dir}': Invalid argument`);
          continue;
        }

        const fullPath = normalizePath(resolvePath(dir, currentDir || '/', homeDir));

        const target = findDirEntry({ files: newFiles }, fullPath);
        if (!target) {
          results.push(`rmdir: failed to remove '${dir}': No such file or directory`);
          continue;
        }

        const parentEntry = findParentDir({ files: newFiles }, fullPath);
        if (!canCreateInDir(machine, parentEntry, currentUser)) {
          results.push(`rmdir: failed to remove '${dir}': Permission denied`);
          continue;
        }

        const parentPath = resolveParentDirPath(fullPath);
        const parentDirEntry = findDirEntry({ files: newFiles }, parentPath);
        if (!canDeleteInDir(machine, parentDirEntry, target, currentUser)) {
          results.push(`rmdir: failed to remove '${dir}': Operation not permitted`);
          continue;
        }

        const filesInDir = newFiles.filter(f =>
          f.path.startsWith(fullPath) && f.path !== fullPath + '.dir'
        );

        if (filesInDir.length > 0) {
          results.push(`rmdir: failed to remove '${dir}': Directory not empty`);
          continue;
        }

        if (removeParents) {
          const parts = fullPath.split('/').filter(p => p);
          for (let i = parts.length; i > 0; i--) {
            const pathToRemove = '/' + parts.slice(0, i).join('/') + '/';
            const dirIndex = newFiles.findIndex(f => f.path === pathToRemove + '.dir');
            if (dirIndex === -1) continue;

            const hasFiles = newFiles.some(f =>
              f.path.startsWith(pathToRemove) && f.path !== pathToRemove + '.dir'
            );

            if (!hasFiles) {
              const parentForRemoval = findParentDir({ files: newFiles }, pathToRemove);
              if (canCreateInDir(machine, parentForRemoval, currentUser)) {
                newFiles.splice(dirIndex, 1);
              } else {
                break;
              }
            } else {
              break;
            }
          }
        } else {
          const index = newFiles.findIndex(f => f.path === fullPath + '.dir');
          if (index !== -1) {
            newFiles.splice(index, 1);
          }
        }

      } catch (error) {
        results.push(`rmdir: failed to remove '${dir}': ${error}`);
      }
    }

    machine.files = newFiles;
    return {
      output: results.length > 0 ? results.join('\n') : '',
      isError: results.length > 0,
      filesChanged: newFiles,
    };
  },
};

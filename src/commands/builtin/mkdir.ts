import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { normalizePath, resolvePath } from '../../utils/path';
import { getCurrentUser } from '../../utils/users';
import { canCreateInDir } from '../../utils/permissions';
import { findDirEntry, findParentDir, defaultOwnership, buildNewFile } from '../../utils/fs';
import { applyUmask } from './umask';

export const cmd_mkdir = {
  name: 'mkdir',
  description: 'Create directories',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    const { currentDir, machine } = context;

    if (args.length === 0) {
      return {
        output: 'usage: mkdir [-p] directory_name...\n  -p  create parent directories as needed',
        isError: true,
      };
    }

    let createParents = false;
    const directories: string[] = [];

    for (const arg of args) {
      if (arg === '-p') {
        createParents = true;
      } else if (arg.startsWith('-')) {
        return {
          output: `mkdir: invalid option -- '${arg.slice(1)}'\nTry 'mkdir --help' for more information.`,
          isError: true,
        };
      } else {
        directories.push(arg);
      }
    }

    if (directories.length === 0) {
      return {
        output: 'mkdir: missing operand\nTry \'mkdir --help\' for more information.',
        isError: true,
      };
    }

    const currentUser = getCurrentUser(machine);
    const homeDir = currentUser.home;
    const umask = context.umask ?? 0o022;
    const results: string[] = [];
    const newFiles: FileEntry[] = [...machine.files];
    const fsView = { files: newFiles };

    for (const dir of directories) {
      try {
        const fullPath = normalizePath(resolvePath(dir, currentDir || '/', homeDir));

        if (findDirEntry(fsView, fullPath)) {
          results.push(`mkdir: cannot create directory '${dir}': File exists`);
          continue;
        }

        if (createParents) {
          const parts = fullPath.split('/').filter(p => p);
          let currentPath = '';
          let permissionOk = true;

          for (const part of parts) {
            currentPath += '/' + part;
            if (!findDirEntry(fsView, currentPath)) {
              const parentForThis = findParentDir(fsView, currentPath);
              if (!parentForThis) {
                results.push(`mkdir: cannot create directory '${dir}': No such file or directory`);
                permissionOk = false;
                break;
              }
              if (!canCreateInDir(machine, parentForThis, currentUser)) {
                results.push(`mkdir: cannot create directory '${dir}': Permission denied`);
                permissionOk = false;
                break;
              }
              const ownership = defaultOwnership(machine, currentUser, applyUmask(0o777, umask));
              newFiles.push(buildNewFile(currentPath + '/.dir', '', 'text', ownership));
            }
          }

          if (!permissionOk) continue;
        } else {
          const parentEntry = findParentDir(fsView, fullPath);
          if (!parentEntry) {
            results.push(`mkdir: cannot create directory '${dir}': No such file or directory`);
            continue;
          }
          if (!canCreateInDir(machine, parentEntry, currentUser)) {
            results.push(`mkdir: cannot create directory '${dir}': Permission denied`);
            continue;
          }
          if (dir.startsWith('/')) {
            const parts = fullPath.split('/').filter(p => p);
            let currentPath = '';
            let interrupted = false;

            for (let i = 0; i < parts.length - 1; i++) {
              currentPath += '/' + parts[i];
              if (!findDirEntry(fsView, currentPath)) {
                results.push(`mkdir: cannot create directory '${dir}': No such file or directory`);
                interrupted = true;
                break;
              }
            }
            if (interrupted) continue;
          }

          const ownership = defaultOwnership(machine, currentUser, applyUmask(0o777, umask));
          newFiles.push(buildNewFile(fullPath + '.dir', '', 'text', ownership));
        }

      } catch (error) {
        results.push(`mkdir: cannot create directory '${dir}': ${error}`);
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

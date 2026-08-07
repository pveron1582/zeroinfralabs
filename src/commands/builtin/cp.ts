import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { normalizePath, resolvePath } from '../../utils/path';
import { getCurrentUser } from '../../utils/users';
import { canRead, canCreateInDir, canEditFile, canDeleteInDir } from '../../utils/permissions';
import { findFile, findDirEntry, resolveParentDirPath, defaultOwnership, buildNewFile } from '../../utils/fs';
import { applyUmask } from '../builtin/umask';

export const cmd_cp = {
  name: 'cp',
  description: 'Copy files or directories',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    const { currentDir, machine } = context;

    if (args.length < 2) {
      return { output: 'usage: cp [-r] source destination', isError: true };
    }

    let recursive = false;
    const sources: string[] = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-r') {
        recursive = true;
      } else if (args[i].startsWith('-')) {
        return { output: `cp: invalid option -- '${args[i].slice(1)}'`, isError: true };
      } else {
        sources.push(args[i]);
      }
    }

    if (sources.length < 2) {
      return { output: 'usage: cp [-r] source destination', isError: true };
    }

    const destination = sources.pop()!;
    const currentUser = getCurrentUser(machine);
    const homeDir = currentUser.home;
    const umask = context.umask ?? 0o022;

    const destFullPath = normalizePath(resolvePath(destination, currentDir || '/', homeDir));
    const destClean = destFullPath.endsWith('/') ? destFullPath.slice(0, -1) : destFullPath;

    const destParentPath = resolveParentDirPath(destClean);
    const destParentDir = findDirEntry(machine, destParentPath);
    if (!destParentDir) {
      return { output: `cp: cannot create '${destination}': No such file or directory`, isError: true };
    }

    if (!canCreateInDir(machine, destParentDir, currentUser)) {
      return { output: `cp: cannot create '${destination}': Permission denied`, isError: true };
    }

    const destExists = findFile(machine, destFullPath);
    const destIsDir = destExists?.path.endsWith('/.dir');
    const results: string[] = [];
    const newFiles: FileEntry[] = [...machine.files];

    for (const src of sources) {
      const srcFullPath = normalizePath(resolvePath(src, currentDir || '/', homeDir));
      const srcEntry = findFile({ files: newFiles }, srcFullPath);

      if (!srcEntry) {
        results.push(`cp: cannot stat '${src}': No such file or directory`);
        continue;
      }

      const srcIsDir = srcEntry.path.endsWith('/.dir');

      if (srcIsDir && !recursive) {
        results.push(`cp: omitting directory '${src}'`);
        continue;
      }

      if (!canRead(machine, srcEntry, currentUser)) {
        results.push(`cp: cannot read '${src}': Permission denied`);
        continue;
      }

      const srcClean = srcFullPath.endsWith('/') ? srcFullPath.slice(0, -1) : srcFullPath;

      let targetPath: string;
      if (destIsDir) {
        const srcName = srcClean.split('/').pop() || srcClean;
        targetPath = destClean + '/' + srcName;
      } else if (sources.length > 1) {
        results.push(`cp: target '${destination}' is not a directory`);
        continue;
      } else {
        targetPath = destClean;
      }

      const existingTarget = findFile({ files: newFiles }, targetPath + (srcIsDir ? '/.dir' : ''));
      if (existingTarget) {
        if (!canEditFile(machine, existingTarget, currentUser)) {
          results.push(`cp: cannot overwrite '${targetPath}': Permission denied`);
          continue;
        }
        const targetParentPath = resolveParentDirPath(targetPath);
        const targetParentDir = findDirEntry(machine, targetParentPath);
        if (!canDeleteInDir(machine, targetParentDir, existingTarget, currentUser)) {
          results.push(`cp: cannot overwrite '${targetPath}': Operation not permitted`);
          continue;
        }
        const idx = newFiles.findIndex(f => f.path === existingTarget.path);
        if (idx !== -1) newFiles.splice(idx, 1);
      }

      if (srcIsDir) {
        const srcPrefix = srcClean;
        const srcEntries = newFiles.filter(f => f.path.startsWith(srcPrefix));
        for (const entry of srcEntries) {
          const relPath = entry.path.slice(srcPrefix.length);
          const newPath = targetPath + relPath;
          const defaultMode = entry.path.endsWith('/.dir') ? 0o755 : 0o644;
          newFiles.push({ ...entry, path: newPath, mode: entry.mode ?? defaultMode });
        }
      } else {
        const defaultMode = 0o644;
        const mode = applyUmask(defaultMode, umask);
        const fileType = (srcEntry.type === 'text' || srcEntry.type === 'binary' || srcEntry.type === 'hash')
          ? srcEntry.type
          : 'text';
        newFiles.push(buildNewFile(
          targetPath,
          srcEntry.content,
          fileType,
          defaultOwnership(machine, currentUser, srcEntry.mode ?? mode)
        ));
      }
      results.push('');
    }

    machine.files = newFiles;
    return {
      output: results.join('\n'),
      isError: results.some(r => r.length > 0 && !r.startsWith('cp:')),
      filesChanged: newFiles,
    };
  },
};

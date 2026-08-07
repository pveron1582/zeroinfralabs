import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { normalizePath, resolvePath } from '../../utils/path';
import { getCurrentUser } from '../../utils/users';
import { canCreateInDir, canDeleteInDir } from '../../utils/permissions';
import { findFile, findDirEntry, resolveParentDirPath } from '../../utils/fs';

export const cmd_mv = {
  name: 'mv',
  description: 'Move or rename files',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    const { currentDir, machine } = context;

    if (args.length < 2) {
      return { output: 'usage: mv source destination', isError: true };
    }

    const currentUser = getCurrentUser(machine);
    const homeDir = currentUser.home;
    const sources: string[] = [];
    const destIdx = args.length - 1;

    for (let i = 0; i <= destIdx; i++) {
      if (args[i].startsWith('-')) {
        return { output: `mv: invalid option -- '${args[i].slice(1)}'`, isError: true };
      }
      if (i < destIdx) sources.push(args[i]);
    }

    const destination = args[destIdx];

    const destFullPath = normalizePath(resolvePath(destination, currentDir || '/', homeDir));
    const destClean = destFullPath.endsWith('/') ? destFullPath.slice(0, -1) : destFullPath;
    const destExists = findFile(machine, destFullPath);
    const destIsDir = destExists?.path.endsWith('/.dir');

    const results: string[] = [];
    const newFiles: FileEntry[] = [...machine.files];

    for (const src of sources) {
      const srcFullPath = normalizePath(resolvePath(src, currentDir || '/', homeDir));
      const srcEntry = findFile({ files: newFiles }, srcFullPath);

      if (!srcEntry) {
        results.push(`mv: cannot stat '${src}': No such file or directory`);
        continue;
      }

      const srcIsDir = srcEntry.path.endsWith('/.dir');
      const srcClean = srcFullPath.endsWith('/') ? srcFullPath.slice(0, -1) : srcFullPath;
      const srcParentPath = resolveParentDirPath(srcClean);
      const srcParentDir = findDirEntry({ files: newFiles }, srcParentPath);

      if (!canCreateInDir(machine, srcParentDir, currentUser)) {
        results.push(`mv: cannot move '${src}': Permission denied`);
        continue;
      }
      if (!canDeleteInDir(machine, srcParentDir, srcEntry, currentUser)) {
        results.push(`mv: cannot move '${src}': Operation not permitted`);
        continue;
      }

      let targetPath: string;
      if (destIsDir) {
        const srcName = srcClean.split('/').pop() || srcClean;
        targetPath = destClean + '/' + srcName;
      } else if (sources.length > 1) {
        results.push(`mv: target '${destination}' is not a directory`);
        continue;
      } else {
        targetPath = destClean;
      }

      const destParentPath = resolveParentDirPath(targetPath);
      const destParentDir = findDirEntry({ files: newFiles }, destParentPath);
      if (!destParentDir) {
        results.push(`mv: cannot move to '${destination}': No such file or directory`);
        continue;
      }
      if (!canCreateInDir(machine, destParentDir, currentUser)) {
        results.push(`mv: cannot move to '${destination}': Permission denied`);
        continue;
      }

      const existing = findFile({ files: newFiles }, targetPath + (srcIsDir ? '/.dir' : ''));
      if (existing) {
        const idx = newFiles.findIndex(f => f.path === existing.path);
        if (idx !== -1) newFiles.splice(idx, 1);
      }

      if (srcIsDir) {
        const srcPrefix = srcClean;
        const srcEntries = newFiles.filter(f => f.path.startsWith(srcPrefix));
        for (const entry of srcEntries) {
          const relPath = entry.path.slice(srcPrefix.length);
          newFiles.push({ ...entry, path: targetPath + relPath });
        }
        for (let i = newFiles.length - 1; i >= 0; i--) {
          if (newFiles[i].path.startsWith(srcPrefix)) newFiles.splice(i, 1);
        }
      } else {
        const idx = newFiles.findIndex(f => f.path === srcEntry.path);
        if (idx !== -1) {
          newFiles.splice(idx, 1);
          newFiles.push({ ...srcEntry, path: targetPath });
        }
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

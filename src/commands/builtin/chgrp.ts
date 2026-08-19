// ── commands/builtin/chgrp.ts ──────────────────────────────────────
// Comando chgrp: Cambiar el grupo de archivos/directorios

import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { normalizePath, resolvePath } from '../../utils/path';
import { getCurrentUser, getGroups } from '../../utils/users';
import { findFile } from '../../utils/fs';

export const cmd_chgrp = {
  name: 'chgrp',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    const { currentDir, machine } = context;
    const currentUser = getCurrentUser(machine);
    const isRoot = currentUser.uid === 0 || currentUser.username === 'root';
    const homeDir = currentUser.home;

    if (args.length < 2) {
      return {
        output: 'usage: chgrp [-R] group file...\n  -R  recursive',
        isError: true,
      };
    }

    let recursive = false;
    let groupArg: string | null = null;
    const targets: string[] = [];

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-R' || args[i] === '--recursive') {
        recursive = true;
      } else if (args[i].startsWith('-') && args[i] !== '--') {
        return { output: `chgrp: invalid option -- '${args[i].slice(1)}'`, isError: true };
      } else if (groupArg === null) {
        groupArg = args[i];
      } else {
        targets.push(args[i]);
      }
    }

    if (!groupArg || targets.length === 0) {
      return { output: 'usage: chgrp [-R] group file...', isError: true };
    }

    const groups = getGroups(machine);

    // Validar que el grupo exista
    const targetGroup = groups.find(g => g.name === groupArg);
    if (!targetGroup) {
      return { output: `chgrp: invalid group: '${groupArg}'`, isError: true };
    }

    // Regla real de Unix: un usuario no-root solo puede cambiar el grupo
    // a un grupo del que él mismo sea miembro
    if (!isRoot) {
      const isMember = targetGroup.members.includes(currentUser.username) ||
                       currentUser.gid === targetGroup.gid;
      if (!isMember) {
        return { output: 'chgrp: changing group: Operation not permitted', isError: true };
      }
    }

    const results: string[] = [];
    const newFiles: FileEntry[] = [...machine.files];

    for (const target of targets) {
      const fullPath = normalizePath(resolvePath(target, currentDir || '/', homeDir));
      const file = findFile(machine, fullPath);

      if (!file) {
        results.push(`chgrp: cannot access '${target}': No such file or directory`);
        continue;
      }

      // El usuario debe ser dueño del archivo (o root)
      if (!isRoot && file.owner !== currentUser.username) {
        results.push(`chgrp: changing group of '${target}': Operation not permitted`);
        continue;
      }

      const fileIdx = newFiles.findIndex(f => f.path === file.path);
      if (fileIdx !== -1) newFiles[fileIdx] = { ...newFiles[fileIdx], group: groupArg };

      if (recursive && file.path.endsWith('.dir')) {
        const dirPrefix = file.path.slice(0, -4);
        for (let i = 0; i < newFiles.length; i++) {
          const f = newFiles[i];
          if (!f.path.startsWith(dirPrefix) || f.path === file.path) continue;
          if (!isRoot && f.owner !== currentUser.username) continue;
          newFiles[i] = { ...f, group: groupArg };
        }
      }
    }

    machine.files = newFiles;
    return {
      output: results.length > 0 ? results.join('\n') : '',
      isError: results.length > 0,
      filesChanged: newFiles,
    };
  }
};

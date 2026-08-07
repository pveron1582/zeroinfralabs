// ── commands/builtin/chown.ts ──────────────────────────────────────
// Comando chown: Cambiar el dueño de archivos/directorios

import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { normalizePath, resolvePath } from '../../utils/path';
import { getCurrentUser, getUsers, getGroups } from '../../utils/users';
import { findFile } from '../../utils/fs';

export const cmd_chown = {
  name: 'chown',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    const { currentDir, machine } = context;
    const currentUser = getCurrentUser(machine);
    const isRoot = currentUser.uid === 0 || currentUser.username === 'root';
    const homeDir = currentUser.home;

    if (args.length < 2) {
      return {
        output: 'usage: chown [-R] owner[:group] file...\n  -R  recursive',
        isError: true,
      };
    }

    let recursive = false;
    let ownerSpec: string | null = null;
    let targets: string[] = [];

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-R' || args[i] === '--recursive') {
        recursive = true;
      } else if (args[i].startsWith('-') && args[i] !== '--') {
        return { output: `chown: invalid option -- '${args[i].slice(1)}'`, isError: true };
      } else if (ownerSpec === null) {
        ownerSpec = args[i];
      } else {
        targets.push(args[i]);
      }
    }

    if (!ownerSpec || targets.length === 0) {
      return { output: 'usage: chown [-R] owner[:group] file...', isError: true };
    }

    // Solo root puede cambiar owner
    if (!isRoot) {
      return { output: 'chown: changing owner: Operation not permitted', isError: true };
    }

    const users = getUsers(machine);
    const groups = getGroups(machine);

    // Parsear owner[:group]
    const colonIdx = ownerSpec.indexOf(':');
    let newOwner: string;
    let newGroup: string | null = null;

    if (colonIdx === -1) {
      newOwner = ownerSpec;
    } else {
      newOwner = ownerSpec.slice(0, colonIdx);
      const groupPart = ownerSpec.slice(colonIdx + 1);
      if (groupPart) newGroup = groupPart;
    }

    // Validar que el owner exista
    if (!users.find(u => u.username === newOwner)) {
      return { output: `chown: invalid user: '${newOwner}'`, isError: true };
    }

    // Validar grupo si se especificó
    if (newGroup && !groups.find(g => g.name === newGroup)) {
      return { output: `chown: invalid group: '${newGroup}'`, isError: true };
    }

    const results: string[] = [];
    const newFiles: FileEntry[] = [...machine.files];

    for (const target of targets) {
      const fullPath = normalizePath(resolvePath(target, currentDir || '/', homeDir));
      const file = findFile(machine, fullPath);

      if (!file) {
        results.push(`chown: cannot access '${target}': No such file or directory`);
        continue;
      }

      const fileIdx = newFiles.findIndex(f => f.path === file.path);
      if (fileIdx !== -1) {
        const updated = { ...newFiles[fileIdx], owner: newOwner };
        if (newGroup) updated.group = newGroup;
        newFiles[fileIdx] = updated;
      }

      if (recursive && file.path.endsWith('.dir')) {
        const dirPrefix = file.path.slice(0, -4);
        for (let i = 0; i < newFiles.length; i++) {
          const f = newFiles[i];
          if (!f.path.startsWith(dirPrefix) || f.path === file.path) continue;
          const updated = { ...f, owner: newOwner };
          if (newGroup) updated.group = newGroup;
          newFiles[i] = updated;
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

// ── commands/builtin/chmod.ts ──────────────────────────────────────
// Comando chmod: Cambiar permisos de archivos/directorios

import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { normalizePath, resolvePath } from '../../utils/path';
import { getCurrentUser } from '../../utils/users';
import { findFile } from '../../utils/fs';

function parseSymbolicMode(expr: string, currentMode: number): number | null {
  // Formato: [ugoa][+-=][rwx]
  const match = expr.match(/^([ugoa]+)?([+\-=])([rwx]+)$/);
  if (!match) return null;

  const who = match[1] || 'a';
  const op = match[2];
  const perms = match[3];

  let bits = 0;
  if (perms.includes('r')) bits |= 4;
  if (perms.includes('w')) bits |= 2;
  if (perms.includes('x')) bits |= 1;

  let result = currentMode;
  const applyTo = (shift: number) => {
    const shifted = bits << shift;
    if (op === '+') result |= shifted;
    else if (op === '-') result &= ~shifted;
    else if (op === '=') {
      // Clear the bits for this scope first
      const mask = 7 << shift;
      result &= ~mask;
      result |= shifted;
    }
  };

  if (who.includes('u')) applyTo(6);
  if (who.includes('g')) applyTo(3);
  if (who.includes('o')) applyTo(0);
  if (who.includes('a')) {
    applyTo(6);
    applyTo(3);
    applyTo(0);
  }

  return result;
}

export const cmd_chmod = {
  name: 'chmod',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    const { currentDir, machine } = context;
    const currentUser = getCurrentUser(machine);
    const isRoot = currentUser.uid === 0 || currentUser.username === 'root';
    const homeDir = currentUser.home;

    if (args.length < 2) {
      return {
        output: 'usage: chmod [-R] mode file...\n  -R  recursive',
        isError: true,
      };
    }

    let recursive = false;
    let modeArg: string | null = null;
    const targets: string[] = [];

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-R' || args[i] === '--recursive') {
        recursive = true;
      } else if (args[i].startsWith('-') && args[i] !== '--') {
        return { output: `chmod: invalid option -- '${args[i].slice(1)}'`, isError: true };
      } else if (modeArg === null) {
        modeArg = args[i];
      } else {
        targets.push(args[i]);
      }
    }

    if (!modeArg || targets.length === 0) {
      return { output: 'usage: chmod [-R] mode file...', isError: true };
    }

    const results: string[] = [];
    const newFiles: FileEntry[] = [...machine.files];

    for (const target of targets) {
      const fullPath = normalizePath(resolvePath(target, currentDir || '/', homeDir));
      const file = findFile(machine, fullPath);

      if (!file) {
        results.push(`chmod: cannot access '${target}': No such file or directory`);
        continue;
      }

      // Only owner or root can change permissions
      if (!isRoot && file.owner !== currentUser.username) {
        results.push(`chmod: changing permissions of '${target}': Operation not permitted`);
        continue;
      }

      const currentMode = file.mode ?? (fullPath.endsWith('.dir') ? 0o755 : 0o644);

      let newMode: number | null = null;

      // Try octal mode first
      const octalMatch = modeArg.match(/^0?([0-7]{1,4})$/);
      if (octalMatch) {
        newMode = parseInt(octalMatch[1], 8);
      } else {
        // Try symbolic mode
        newMode = parseSymbolicMode(modeArg, currentMode);
      }

      if (newMode === null || newMode < 0 || newMode > 0o7777) {
        results.push(`chmod: invalid mode: '${modeArg}'`);
        continue;
      }

      const fileIdx = newFiles.findIndex(f => f.path === file.path);
      if (fileIdx !== -1) newFiles[fileIdx] = { ...newFiles[fileIdx], mode: newMode };

      if (recursive && file.path.endsWith('.dir')) {
        const dirPrefix = file.path.slice(0, -4);
        for (let i = 0; i < newFiles.length; i++) {
          const f = newFiles[i];
          if (f.path.startsWith(dirPrefix) && f.path !== file.path) {
            if (!isRoot && f.owner !== currentUser.username) continue;
            newFiles[i] = { ...f, mode: newMode };
          }
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

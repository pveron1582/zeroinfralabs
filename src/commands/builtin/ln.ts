// ── commands/builtin/ln.ts ──────────────────────────────────────────
// Simulador de ln (ROADMAP Fase 9.3). Crea enlaces simbólicos
// representados como FileEntry con type 'symlink' + linkTarget.
// `ls -l` los muestra como `name -> target` y `cat` sigue el enlace.

import type { CommandContext, CommandResponse, FileEntry } from '../../types';
import { getCurrentUser } from '../../utils/users';
import { canCreateInDir } from '../../utils/permissions';
import { findFile, findParentDir, findDirEntry, defaultOwnership, buildNewFile } from '../../utils/fs';
import { normalizePath, resolvePath } from '../../utils/path';
import { applyUmask } from '../builtin/umask';

export const cmd_ln = {
  name: 'ln',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const machine = ctx.machine;
    const user = getCurrentUser(machine);
    const symbolic = args.includes('-s') || args.includes('--symbolic');
    const force = args.includes('-f') || args.includes('--force');
    const rest = args.filter(a => !a.startsWith('-'));

    if (rest.length < 2) {
      return { output: 'ln: missing operand\nTry \'ln --help\' for more information.', isError: true };
    }

    const target = rest[0];
    const linkName = rest[rest.length - 1];
    const homeDir = user.home;

    if (symbolic) {
      const fullLinkPath = normalizePath(resolvePath(linkName, ctx.currentDir || '/', homeDir));
      const cleanLinkPath = fullLinkPath.endsWith('/') && fullLinkPath.length > 1 ? fullLinkPath.slice(0, -1) : fullLinkPath;

      // El destino debe existir (target o link ya existente)
      const targetResolved = findFile(machine, normalizePath(resolvePath(target, ctx.currentDir || '/', homeDir)));
      if (!targetResolved) {
        return { output: `ln: failed to create symbolic link '${linkName}': No such file or directory`, isError: true };
      }

      const existing = findFile(machine, cleanLinkPath);
      if (existing) {
        if (!force) {
          return { output: `ln: failed to create symbolic link '${linkName}': File exists`, isError: true };
        }
        machine.files = machine.files.filter(f => f.path !== existing.path);
      }

      const parentDir = findParentDir(machine, cleanLinkPath);
      if (!parentDir) {
        return { output: `ln: failed to create symbolic link '${linkName}': No such file or directory`, isError: true };
      }
      if (!canCreateInDir(machine, parentDir, user)) {
        return { output: `ln: failed to create symbolic link '${linkName}': Permission denied`, isError: true };
      }

      const linkTarget = target.startsWith('/')
        ? target
        : normalizePath(resolvePath(target, ctx.currentDir || '/', homeDir));
      const ownership = defaultOwnership(machine, user, applyUmask(0o777, ctx.umask ?? 0o022));
      const entry: FileEntry = buildNewFile(cleanLinkPath, linkTarget, 'symlink', ownership);
      entry.linkTarget = linkTarget;
      machine.files.push(entry);
      return { output: '', isError: false, filesChanged: [...machine.files] };
    }

    // ln sin -s: hard link (solo puede referenciar archivos del mismo FS)
    const source = findFile(machine, normalizePath(resolvePath(target, ctx.currentDir || '/', homeDir)));
    if (!source) {
      return { output: `ln: failed to access '${target}': No such file or directory`, isError: true };
    }
    if (source.path.endsWith('/.dir') || findDirEntry(machine, source.path)) {
      return { output: `ln: '${target}': hard link not allowed for directory`, isError: true };
    }
    const fullLinkPath = normalizePath(resolvePath(linkName, ctx.currentDir || '/', homeDir));
    const cleanLinkPath = fullLinkPath.endsWith('/') && fullLinkPath.length > 1 ? fullLinkPath.slice(0, -1) : fullLinkPath;
    const parentDir = findParentDir(machine, cleanLinkPath);
    if (!parentDir || !canCreateInDir(machine, parentDir, user)) {
      return { output: `ln: failed to create hard link '${linkName}': Permission denied`, isError: true };
    }
    if (findFile(machine, cleanLinkPath)) {
      return { output: `ln: failed to create hard link '${linkName}': File exists`, isError: true };
    }
    machine.files.push({ ...source, path: cleanLinkPath, content: source.content });
    return { output: '', isError: false, filesChanged: [...machine.files] };
  }
};

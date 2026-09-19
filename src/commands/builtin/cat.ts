// ── commands/builtin/cat.ts ───────────────────────────────────────
// Muestra contenido de archivos
// Solo lee archivos y reporta metadata para que el laboratorio valide.

import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser } from '../../utils/users';
import { canRead } from '../../utils/permissions';
import { findFile, resolveSymlink } from '../../utils/fs';
import { buildFileReadMetadata } from '../../utils/fileRead';

function resolveFile(machine: CommandContext['machine'], rawPath: string, currentDir: string | undefined) {
  const normalizedPath = rawPath.replace(/^\.\//, '');
  const fullPath = rawPath.startsWith('/') ? rawPath : (currentDir?.replace(/\/$/, '') || '') + '/' + rawPath;
  const cand = rawPath.startsWith('/') ? rawPath : fullPath;
  const direct = findFile(machine, cand);
  if (direct) return direct;
  return machine.files?.find(f => {
    if (f.path === normalizedPath) return true;
    if (f.path === rawPath) return true;
    if (f.path === fullPath) return true;
    if (f.path.endsWith('/' + normalizedPath)) return true;
    if (f.path.endsWith('/' + rawPath)) return true;
    if (f.path.endsWith('/' + fullPath)) return true;
    return false;
  }) ?? null;
}

export const cmd_cat = {
  name: 'cat',
  execute: (args: string[], { machine, allMachines, currentDir }: CommandContext): CommandResponse => {
    const showNumbers = args.includes('-n') || args.includes('--number');
    const fileArgs = args.filter(a => !a.startsWith('-'));

    if (fileArgs.length === 0) {
      return { output: 'usage: cat <file>', isError: true };
    }

    const currentUser = getCurrentUser(machine);
    const outputs: string[] = [];
    let isError = false;
    let firstMetadata: ReturnType<typeof buildFileReadMetadata> | null = null;

    for (const rawPath of fileArgs) {
      const normalizedPath = rawPath.replace(/^\.\//, '');
      if (normalizedPath.endsWith('/')) {
        outputs.push(`cat: ${rawPath}: Is a directory`);
        isError = true;
        continue;
      }

      const file = resolveFile(machine, rawPath, currentDir);
      if (!file) {
        outputs.push(`cat: ${rawPath}: No such file or directory`);
        isError = true;
        continue;
      }

      const resolved = file.type === 'symlink' ? (resolveSymlink(machine, file) ?? file) : file;
      if (resolved.type === 'symlink') {
        outputs.push(`cat: ${rawPath}: No such file or directory`);
        isError = true;
        continue;
      }
      if (!canRead(machine, resolved, currentUser)) {
        outputs.push(`cat: ${rawPath}: Permission denied`);
        isError = true;
        continue;
      }

      let content = resolved.content ?? '';
      if (showNumbers) {
        const lines = content.replace(/\n$/, '').split('\n');
        content = lines.map((l, i) => `${String(i + 1).padStart(6, ' ')}\t${l}`).join('\n');
        if (content) content += '\n';
        // Si el archivo estaba vacío, cat -n no produce salida (como Unix)
        if (lines.length === 1 && lines[0] === '') content = '';
      }

      outputs.push(content.replace(/\n$/, ''));
      if (!firstMetadata) {
        firstMetadata = buildFileReadMetadata(machine, allMachines, resolved);
      }
    }

    const output = outputs.join('\n');

    if (firstMetadata) {
      return {
        output,
        isError: isError ? true : undefined,
        type: 'fileRead',
        fileRead: firstMetadata.fileRead,
        ...(firstMetadata.possibleUsers && { possibleUsers: firstMetadata.possibleUsers }),
      };
    }

    return { output, isError: isError ? true : undefined };
  }
};

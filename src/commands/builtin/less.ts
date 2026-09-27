// ── commands/builtin/less.ts ──────────────────────────────────────
// Paginadores less/more (Tier 1). En el simulador no hay scroll
// interactivo: vuelcan el contenido (stdin por pipe o archivo).
// Soportan -N (números de línea). Respetan permisos de lectura.

import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser } from '../../utils/users';
import { canRead } from '../../utils/permissions';
import { resolveSymlink } from '../../utils/fs';
import { buildFileReadMetadata } from '../../utils/fileRead';
import { resolveFile } from './cat';

const LESS_HELP = `Usage: less [OPTION] [FILE]
Show file contents (non-interactive dump in this simulator).

Options:
  -N  Show line numbers
  -h  Display this help

Also reads from a pipe:  cat file | less
See also: more`;

const MORE_HELP = `Usage: more [OPTION] [FILE]
Show file contents (non-interactive dump in this simulator).

Options:
  -N  Show line numbers
  -h  Display this help

Also reads from a pipe:  cat file | more
See also: less`;

function runPager(name: 'less' | 'more', args: string[], ctx: CommandContext): CommandResponse {
  const { machine, allMachines, currentDir, pipedInput } = ctx;
  if (args.includes('-h') || args.includes('--help')) {
    return { output: name === 'less' ? LESS_HELP : MORE_HELP };
  }
  const showNumbers = args.includes('-N') || args.includes('--LINE-NUMBERS');
  const fileArgs = args.filter(a => !a.startsWith('-'));

  let content: string | null = null;
  let resolvedForMeta: import('../../types').FileEntry | null = null;
  if (fileArgs.length > 0) {
    const rawPath = fileArgs[0];
    const file = machine ? resolveFile(machine, rawPath, currentDir) : null;
    if (!file) {
      return { output: `${name}: ${rawPath}: No such file or directory`, isError: true };
    }
    const resolved = file.type === 'symlink' ? (resolveSymlink(machine!, file) ?? file) : file;
    if (resolved.type === 'symlink') {
      return { output: `${name}: ${rawPath}: No such file or directory`, isError: true };
    }
    const currentUser = getCurrentUser(machine!);
    if (!canRead(machine!, resolved, currentUser)) {
      return { output: `${name}: ${rawPath}: Permission denied`, isError: true };
    }
    content = resolved.content ?? '';
    resolvedForMeta = resolved;
  } else if (pipedInput !== undefined) {
    content = pipedInput;
  } else {
    return { output: `${name === 'less' ? 'Missing filename ("less --help" for help)' : 'Usage: more [OPTION] [FILE]'}`, isError: true };
  }

  if (showNumbers) {
    const lines = content.replace(/\n$/, '').split('\n');
    if (!(lines.length === 1 && lines[0] === '')) {
      content = lines.map((l, i) => `${String(i + 1).padStart(6, ' ')}\t${l}`).join('\n');
    } else {
      content = '';
    }
  }
  const output = content.replace(/\n$/, '');
  if (resolvedForMeta && machine) {
    const meta = buildFileReadMetadata(machine, allMachines ?? [machine], resolvedForMeta);
    return { output, type: 'fileRead', fileRead: meta.fileRead, ...(meta.possibleUsers && { possibleUsers: meta.possibleUsers }) };
  }
  return { output };
}

export const cmd_less = {
  name: 'less',
  execute: (args: string[], ctx: CommandContext): CommandResponse => runPager('less', args, ctx),
};

export const cmd_more = {
  name: 'more',
  execute: (args: string[], ctx: CommandContext): CommandResponse => runPager('more', args, ctx),
};

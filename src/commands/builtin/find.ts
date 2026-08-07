// ── commands/builtin/find.ts ────────────────────────────────────────
// Simulador de find (ROADMAP Fase 9.4). Busca archivos por nombre
// (glob), permisos SUID (-perm -4000) o propietario (-user). Recorre
// todo el filesystem virtual partiendo de un directorio base.

import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser } from '../../utils/users';
import { canExecute } from '../../utils/permissions';
import { findDirEntry } from '../../utils/fs';

const FIND_HELP = `Usage: find [path...] [expression]
  find / -name "*.txt"      buscar por nombre (glob)
  find / -perm -4000        buscar archivos SUID
  find / -user root         buscar archivos de un usuario
  find / -type f            solo archivos regulares
  find / -type d            solo directorios`;

function globToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`);
}

function matchName(filePath: string, pattern: string): boolean {
  const base = filePath.split('/').filter(Boolean).pop() || filePath;
  if (pattern.includes('/')) return globToRegExp(pattern).test(filePath);
  return globToRegExp(pattern).test(base);
}

export const cmd_find = {
  name: 'find',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const machine = ctx.machine;
    const user = getCurrentUser(machine);

    if (args.length === 0) {
      return { output: FIND_HELP, isError: true };
    }

    // Separar paths de expresiones (los paths no empiezan con -)
    const paths: string[] = [];
    let exprStart = 0;
    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith('-')) break;
      paths.push(args[i]);
      exprStart = i + 1;
    }
    const base = (paths[0] || '.').startsWith('/') ? (paths[0] || '.').replace(/\/+$/, '') || '/' : (ctx.currentDir || '/').replace(/\/$/, '') + '/' + (paths[0] || '.');
    const exprArgs = args.slice(exprStart);

    let namePattern: string | null = null;
    let perm: number | null = null;
    let fileUser: string | null = null;
    let type: string | null = null;

    for (let i = 0; i < exprArgs.length; i++) {
      const a = exprArgs[i];
      if (a === '-name' || a === '-iname') namePattern = exprArgs[i + 1];
      else if (a === '-perm') perm = parseInt((exprArgs[i + 1] ?? '').replace(/^-/, ''), 8) || 0;
      else if (a === '-user') fileUser = exprArgs[i + 1];
      else if (a === '-type') type = exprArgs[i + 1];
      else if (a === '-maxdepth') { /* ignorado: simulación de un solo nivel de opciones */ }
    }

    const baseDirEntry = findDirEntry(machine, base);
    if (baseDirEntry && !canExecute(machine, baseDirEntry, user)) {
      return { output: `find: '${base}': Permission denied`, isError: true };
    }

    const results: string[] = [];
    for (const f of machine.files || []) {
      const isDir = f.path.endsWith('/.dir');
      const displayPath = isDir ? f.path.slice(0, -4) : f.path;
      if (!displayPath.startsWith(base === '/' ? '/' : base + '/')) continue;

      if (type) {
        if (type === 'f' && isDir) continue;
        if (type === 'd' && !isDir) continue;
        if (type !== 'f' && type !== 'd') continue;
      }
      if (namePattern && !matchName(displayPath, namePattern)) continue;
      if (perm !== null && ((f.mode ?? 0) & perm) !== perm) continue;
      if (fileUser && (f.owner ?? 'root') !== fileUser) continue;

      results.push(displayPath);
    }

    return { output: results.length ? results.join('\n') : '', isError: false };
  }
};

// ── commands/builtin/fileutil.ts ──────────────────────────────────
// basename / dirname / realpath (Tier 1). basename/dirname son
// string-puros; realpath resuelve relativo/absoluto + symlink.

import type { CommandContext, CommandResponse } from '../../types';
import { normalizePath, resolvePath } from '../../utils/path';
import { findFile, resolveSymlink } from '../../utils/fs';

const BASENAME_HELP = `Usage: basename NAME [SUFFIX]
Strip directory and optionally the trailing SUFFIX.

Examples:
  basename /usr/bin/sort       # sort
  basename include/stdio.h .h  # stdio`;

const DIRNAME_HELP = `Usage: dirname NAME
Strip the last component (basename) from NAME; prints the directory.

Examples:
  dirname /usr/bin/sort     # /usr/bin
  dirname x/y/../z          # x/..

Description:
  Pure path operation — does not check that the file exists.`;

const REALPATH_HELP = `Usage: realpath [OPTION] NAME...
Print the resolved path.

Options:
  -e   All path components must exist (file or directory)
  -m   No path component required (default in this simulator)

Examples:
  realpath ../etc/passwd
  realpath -e /root/../etc/./passwd`;

export const cmd_basename = {
  name: 'basename',
  execute: (args: string[], _ctx: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) return { output: BASENAME_HELP };
    const parts = args.filter(a => !a.startsWith('-'));
    if (parts.length === 0) {
      return { output: 'basename: missing operand\nTry \'basename --help\' for more information.', isError: true };
    }
    const name = parts[0];
    const suffix = parts[1];
    // basename('/etc/') → 'etc' (el basename real ignora las / finales)
    let base = name.replace(/\/+$/, '') || name;
    base = base.split('/').pop() || base;
    if (suffix && base.endsWith(suffix) && base !== suffix) {
      base = base.slice(0, -suffix.length);
    }
    return { output: base };
  },
};

export const cmd_dirname = {
  name: 'dirname',
  execute: (args: string[], _ctx: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) return { output: DIRNAME_HELP };
    const parts = args.filter(a => !a.startsWith('-'));
    if (parts.length === 0) {
      return { output: 'dirname: missing operand\nTry \'dirname --help\' for more information.', isError: true };
    }
    const out: string[] = [];
    for (const path of parts) {
      // dirname('/etc/x/') → '/etc' (el dir de '/etc/x' tras sacar barras finales)
      const p = path.replace(/\/+$/, '') || path;
      const idx = p.lastIndexOf('/');
      if (idx === -1) out.push('.');
      else if (idx === 0) out.push('/');
      else out.push(p.slice(0, idx));
    }
    return { output: out.join('\n') };
  },
};

export const cmd_realpath = {
  name: 'realpath',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) return { output: REALPATH_HELP };
    let mustExist = false;
    const names: string[] = [];
    for (const a of args) {
      if (a === '-e') mustExist = true;
      else if (a === '-m') mustExist = false;
      else if (a.startsWith('-')) return { output: `realpath: invalid option -- '${a.replace(/^-+/, '')[0] ?? ''}'`, isError: true };
      else names.push(a);
    }
    if (names.length === 0) {
      return { output: 'realpath: missing operand\nTry \'realpath --help\' for more information.', isError: true };
    }
    const home = ctx.currentDir ?? '/';
    const out: string[] = [];
    let failed = false;
    for (const name of names) {
      let full = normalizePath(resolvePath(name, ctx.currentDir || '/', home));
      if (full.endsWith('/') && full.length > 1) full = full.slice(0, -1);
      let entry = ctx.machine?.files ? (findFile(ctx.machine, full) ?? findFile(ctx.machine, full + '.dir') ?? null) : null;
      if (entry?.type === 'symlink') {
        entry = resolveSymlink(ctx.machine!, entry) ?? entry;
      }
      let entryPath: string | null = null;
      if (entry) {
        const p = entry.path;
        entryPath = p.endsWith('/.dir') ? p.slice(0, -4) : p;
      }
      if (mustExist && !entry) {
        out.push(`realpath: ${name}: No such file or directory`);
        failed = true;
        continue;
      }
      // realpath imprime el destino del symlink si existe la entrada
      out.push(entryPath ?? full);
    }
    return { output: out.join('\n'), isError: failed ? true : undefined };
  },
};

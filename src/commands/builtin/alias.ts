// ── commands/builtin/alias.ts ─────────────────────────────────────
// Alias de shell (Tier 1). La tabla vive en el executor (aislada por
// terminal) y se expone vía ctx.shellAliases; la expansión ocurre en
// executeCommandInternal antes de pipes/redirecciones.

import type { CommandContext, CommandResponse } from '../../types';

export const ALIAS_HELP = `Usage: alias [name='value' ...]
Define or list shell aliases.

Examples:
  alias
  alias ll='ls -l'
  alias gs='git status'

Description:
  Aliases expand the first word of each command (and each pipe
  segment). They are per-terminal and not persisted.`;

export const UNALIAS_HELP = `Usage: unalias name [name ...]
  unalias -a          Remove all aliases

Examples:
  unalias ll
  unalias -a`;

function table(ctx: CommandContext): Map<string, string> | null {
  return ctx.shellAliases ?? null;
}

export const cmd_alias = {
  name: 'alias',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const aliases = table(ctx);
    if (!aliases) return { output: 'alias: shell sin tabla de alias en este contexto.', isError: true };
    if (args.includes('-h') || args.includes('--help')) return { output: ALIAS_HELP };

    const defs = args.filter(a => !a.startsWith('-'));
    if (defs.length === 0) {
      if (aliases.size === 0) return { output: '' };
      return { output: [...aliases.entries()].map(([k, v]) => `alias ${k}='${v}'`).join('\n') };
    }

    const errs: string[] = [];
    let failed = false;
    for (const def of defs) {
      const eq = def.indexOf('=');
      if (eq === -1) {
        // `alias name` muestra la definición (como bash)
        const val = aliases.get(def);
        if (val === undefined) {
          errs.push(`alias: ${def}: not found`);
          failed = true;
        } else {
          errs.push(`alias ${def}='${val}'`);
        }
        continue;
      }
      const name = def.slice(0, eq);
      let val = def.slice(eq + 1);
      // splitArgs ya quitó las comillas externas; quitar resto si quedó
      if (val.length >= 2 && ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"')))) {
        val = val.slice(1, -1);
      }
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
        errs.push(`alias: \`${def}': invalid alias name`);
        failed = true;
        continue;
      }
      aliases.set(name, val);
    }
    if (errs.length > 0) {
      return { output: errs.join('\n'), isError: failed ? true : undefined };
    }
    return { output: '' };
  },
};

export const cmd_unalias = {
  name: 'unalias',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const aliases = table(ctx);
    if (!aliases) return { output: 'unalias: shell sin tabla de alias en este contexto.', isError: true };
    if (args.includes('-h') || args.includes('--help')) return { output: UNALIAS_HELP };
    if (args.includes('-a')) {
      aliases.clear();
      return { output: '' };
    }
    const names = args.filter(a => !a.startsWith('-'));
    if (names.length === 0) {
      return { output: 'unalias: usage: unalias [-a] name [name ...]', isError: true };
    }
    const missing = names.filter(n => !aliases.delete(n));
    if (missing.length > 0) {
      return { output: missing.map(n => `unalias: ${n}: not found`).join('\n'), isError: true };
    }
    return { output: '' };
  },
};

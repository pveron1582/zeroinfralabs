// ── commands/builtin/type.ts ──────────────────────────────────────
// Describe qué es un nombre: alias, comando o desconocido (Tier 1).

import type { CommandContext, CommandResponse } from '../../types';

export const TYPE_HELP = `Usage: type name [name ...]
Describe how each name would be interpreted.

Examples:
  type ls
  type ll nmap nosuchcmd`;

export const cmd_type = {
  name: 'type',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const names = args.filter(a => !a.startsWith('-'));
    if (args.includes('-h') || args.includes('--help')) return { output: TYPE_HELP };
    if (names.length === 0) {
      return { output: 'type: usage: type [-afptP] name [name ...]', isError: true };
    }
    const outputs: string[] = [];
    let failed = false;
    for (const name of names) {
      const aliased = ctx.shellAliases?.get(name);
      if (aliased !== undefined) {
        outputs.push(`${name} is aliased to \`${aliased}'`);
        continue;
      }
      if (ctx.hasCommand?.(name)) {
        outputs.push(`${name} is a command`);
        continue;
      }
      outputs.push(`type: ${name}: not found`);
      failed = true;
    }
    return { output: outputs.join('\n'), isError: failed ? true : undefined };
  },
};

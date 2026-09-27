// ── commands/builtin/man.ts ───────────────────────────────────────
// Páginas de manual (Tier 1): `man` muestra la ayuda del comando,
// `whatis` una línea y `apropos` busca por palabra clave.

import type { CommandContext, CommandResponse } from '../../types';
import { COMMAND_HELP } from '../help';
import { WHATIS } from '../help/whatis';

const MAN_HELP = `Usage: man <command>
Display the manual page of a command.

Examples:
  man ls
  man nmap`;

const WHATIS_HELP = `Usage: whatis <command>
Display a one-line description.

Examples:
  whatis ls
  whatis ssh`;

const APROPOS_HELP = `Usage: apropos <keyword>
Search manual descriptions by keyword.

Examples:
  apropos network
  apropos firewall`;

export const cmd_man = {
  name: 'man',
  execute: (args: string[], _ctx?: CommandContext): CommandResponse => {
    const target = args.filter(a => !a.startsWith('-'))[0];
    if (args.includes('-h') || args.includes('--help')) return { output: MAN_HELP };
    if (!target) {
      return { output: 'What manual page do you want?\nUsage: man <command>', isError: true };
    }
    const text = COMMAND_HELP[target.toLowerCase()];
    if (!text) {
      return { output: `No manual entry for ${target}`, isError: true };
    }
    const oneLiner = WHATIS[target.toLowerCase()];
    const header = oneLiner ? `${target.toUpperCase()}(1)  ${oneLiner}\n\n` : '';
    return { output: `${header}${text}` };
  },
};

export const cmd_whatis = {
  name: 'whatis',
  execute: (args: string[], _ctx?: CommandContext): CommandResponse => {
    const target = args.filter(a => !a.startsWith('-'))[0];
    if (args.includes('-h') || args.includes('--help')) return { output: WHATIS_HELP };
    if (!target) {
      return { output: 'Usage: whatis <command>', isError: true };
    }
    const desc = WHATIS[target.toLowerCase()];
    if (!desc) {
      return { output: `${target}: nothing appropriate.`, isError: true };
    }
    return { output: `${target.toLowerCase()} (1)  - ${desc}` };
  },
};

export const cmd_apropos = {
  name: 'apropos',
  execute: (args: string[], _ctx?: CommandContext): CommandResponse => {
    const keyword = args.filter(a => !a.startsWith('-')).join(' ').toLowerCase();
    if (args.includes('-h') || args.includes('--help')) return { output: APROPOS_HELP };
    if (!keyword) {
      return { output: 'Usage: apropos <keyword>', isError: true };
    }
    const hits = Object.entries(WHATIS).filter(
      ([name, desc]) => name.includes(keyword) || desc.toLowerCase().includes(keyword)
    );
    if (hits.length === 0) {
      return { output: `${args.join(' ')}: nothing appropriate.`, isError: true };
    }
    return { output: hits.map(([name, desc]) => `${name} (1)  - ${desc}`).join('\n') };
  },
};

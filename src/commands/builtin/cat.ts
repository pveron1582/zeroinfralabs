// ── commands/builtin/cat.ts ───────────────────────────────────────
// Muestra contenido de archivos

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_cat = {
  name: 'cat',
  execute: (args: string[], { machine }: CommandContext): CommandResponse => {
    if (!args[0]) return { output: 'uso: cat <archivo>', isError: true };
    // Normalize: strip leading ./ so both "./flag.txt" and "flag.txt" work
    const arg = args[0].replace(/^\.\//, '');
    const file = machine.files?.find(f =>
      f.path === arg ||
      f.path === args[0] ||
      f.path.endsWith('/' + arg) ||
      f.path.endsWith('/' + args[0])
    );
    if (!file) return { output: `cat: ${args[0]}: No such file or directory`, isError: true };
    return { output: file.content };
  }
};

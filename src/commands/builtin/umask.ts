// ── commands/builtin/umask.ts ───────────────────────────────────────
// Comando umask: Muestra o establece la máscara de permisos.
// El valor vive en el contexto del terminal (CommandContext.umask),
// no en un singleton module-level: ROADMAP 2.4 "Almacenar en contexto
// de terminal (no persistente)".

import type { CommandContext, CommandResponse } from '../../types';
import { DEFAULT_UMASK } from '../../utils/fs';

// Re-export: la regla vive en utils/fs (la usan 23 call sites de varias
// capas) y los imports históricos siguen funcionando.
export { applyUmask, DEFAULT_UMASK } from '../../utils/fs';

export const cmd_umask = {
  name: 'umask',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    const current = context.umask ?? DEFAULT_UMASK;

    if (args.length === 0) {
      // Mostrar máscara actual en formato octal
      return { output: current.toString(8).padStart(3, '0') };
    }

    if (args.length > 1) {
      return { output: 'usage: umask [-S] [mask]', isError: true };
    }

    const arg = args[0];
    if (arg === '-S') {
      // Modo simbólico — mostrar permisos permitidos (complemento de la máscara)
      const allowed = (mask: number) => {
        const bits = (~mask) & 7;
        const parts: string[] = [];
        if (bits & 4) parts.push('r');
        if (bits & 2) parts.push('w');
        if (bits & 1) parts.push('x');
        return parts.join('') || '';
      };
      const u = (current >> 6) & 7;
      const g = (current >> 3) & 7;
      const o = current & 7;
      return { output: `u=${allowed(u)},g=${allowed(g)},o=${allowed(o)}` };
    }

    // Intentar parsear como número octal
    const match = arg.match(/^0?(\d{1,4})$/);
    if (!match) {
      return { output: `umask: invalid mask: '${arg}'`, isError: true };
    }

    const newMask = parseInt(match[1], 8);
    if (isNaN(newMask) || newMask < 0 || newMask > 0o777) {
      return { output: `umask: invalid mask: '${arg}'`, isError: true };
    }

    context.setUmask?.(newMask);
    return { output: '' };
  }
};

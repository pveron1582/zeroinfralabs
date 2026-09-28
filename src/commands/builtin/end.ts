// ── commands/builtin/end.ts ──────────────────────────────────────
// Sale del laboratorio y vuelve al landing page

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_end = {
  name: 'end',
  execute: (_args: string[], _ctx: CommandContext): CommandResponse => {
    // `end` no imprime nada: la señal va en metadata (P0.4).
    return { output: '', exitToLanding: true };
  }
};
// ── commands/builtin/end.ts ──────────────────────────────────────
// Sale del laboratorio y vuelve al landing page

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_end = {
  name: 'end',
  execute: (_args: string[], _ctx: CommandContext): CommandResponse => {
    return { output: 'EXIT_TO_LANDING' };
  }
};
// ── commands/builtin/date.ts ────────────────────────────────────────
// Simulador de date (ROADMAP Fase 8.2). Muestra el reloj virtual
// gestionado por cronRunner (avanza con `sleep`).

import type { CommandContext, CommandResponse } from '../../types';
import { virtualTime, formatDate } from '../../frameworks/cron/cronRunner';

export const cmd_date = {
  name: 'date',
  execute: (_args: string[], ctx: CommandContext): CommandResponse => {
    return { output: formatDate(virtualTime(ctx.machine)), isError: false };
  }
};

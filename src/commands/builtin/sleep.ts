// ── commands/builtin/sleep.ts ───────────────────────────────────────
// Simulador de sleep (ROADMAP Fase 8.2). "Espera" N segundos: avanza el
// reloj virtual de cronRunner y ejecuta las tareas programadas que
// correspondan (disparador de cron por acción del usuario).

import type { CommandContext, CommandResponse } from '../../types';
import { runCron } from '../../frameworks/cron/cronRunner';

export const cmd_sleep = {
  name: 'sleep',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const secs = parseInt(args[0] ?? '0', 10);
    if (isNaN(secs) || secs < 0) {
      return { output: 'sleep: invalid time interval', isError: true };
    }
    const minutes = Math.max(1, Math.ceil(secs / 60));
    const res = runCron(ctx.machine, minutes);
    return {
      output: '',
      isError: false,
      ...(res.filesChanged ? { filesChanged: res.filesChanged } : {}),
    };
  }
};

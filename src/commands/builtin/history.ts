// ── commands/builtin/history.ts ───────────────────────────────────
// Historial de comandos del terminal (Tier 1). La lista la provee el
// hook vía ctx.cmdHistory (aislada por terminal, no persistente).

import type { CommandContext, CommandResponse } from '../../types';

export const HISTORY_HELP = `Usage: history [N]
Show command history of this terminal.

Examples:
  history
  history 10         # Last 10 commands

Description:
  Numbered list, oldest first. Per-terminal and not persisted
  across reloads. (-c/-d not supported in this simulator.)`;

export const cmd_history = {
  name: 'history',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) return { output: HISTORY_HELP };
    const positional = args.filter(a => !a.startsWith('-'));
    if (args.length > positional.length) {
      return { output: 'history: options -c/-d not supported in this simulator. Usage: history [N]', isError: true };
    }
    let count: number | null = null;
    if (positional.length > 0) {
      count = parseInt(positional[0], 10);
      if (isNaN(count) || count < 0) {
        return { output: `history: ${positional[0]}: numeric argument required`, isError: true };
      }
    }
    const all = ctx.cmdHistory ?? [];
    const slice = count === null ? all : all.slice(-count);
    const start = all.length - slice.length;
    return { output: slice.map((line, i) => `  ${start + i + 1}  ${line}`).join('\n') };
  },
};

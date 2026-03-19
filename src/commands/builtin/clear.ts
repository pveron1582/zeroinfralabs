// ── commands/builtin/clear.ts ─────────────────────────────────────
// Limpia la terminal

import type { CommandResponse } from '../../types';

export const cmd_clear = {
  name: 'clear',
  execute: (): CommandResponse => ({ output: 'CLEAR_TERMINAL' })
};

// ── commands/builtin/clear.ts ─────────────────────────────────────
// Limpia la terminal

import type { CommandResponse } from '../../types';

export const cmd_clear = {
  name: 'clear',
  // `cls` no imprime nada; la señal va en metadata (P0.4).
  execute: (): CommandResponse => ({ output: '', clearScreen: true })
};

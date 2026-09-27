// ── commands/builtin/vi.ts ────────────────────────────────────────
// vi/vim (Tier 1, editor): se emulan sobre el editor del simulador
// (el modal de nano) — misma apertura de archivo, permisos y metadata
// de lectura. Los modos de vi (insert/normal/visual, :wq) no se
// implementan; el editor muestra su propia guía de atajos.

import type { CommandContext, CommandResponse } from '../../types';
import { cmd_nano } from './nano';

function emulateNano(args: string[], ctx: CommandContext): CommandResponse {
  if (args.includes('-h') || args.includes('--help') || args.includes('--version')) {
    return { output: 'vim in this simulator: modal modes not implemented; opens the built-in editor (Ctrl+O save, Ctrl+X exit).' };
  }
  return cmd_nano.execute(args, ctx);
}

export const cmd_vi = {
  name: 'vi',
  description: 'File editor (vi emulation)',
  execute: (args: string[], ctx: CommandContext): CommandResponse => emulateNano(args, ctx),
};

export const cmd_vim = {
  name: 'vim',
  description: 'File editor (vim emulation)',
  execute: (args: string[], ctx: CommandContext): CommandResponse => emulateNano(args, ctx),
};

// ── commands/tools/xrdp.ts ────────────────────────────────────────
// Cliente RDP de Linux (equivalente de mstsc, que solo existe en
// cmd.exe/PowerShell). Mismo núcleo `runRdpClient`: valida host/3389,
// autentica one-shot con /u y /p o arranca la sesión interactiva
// RdpSession y emite desktopAction.connect.

import type { CommandContext, CommandResponse } from '../../types';
import { runRdpClient } from '../rdpClient';

export const cmd_xrdp = {
  name: 'xrdp',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (ctx.machine?.machine_info?.family === 'windows') {
      return { output: `Command not found: xrdp\nEscribe 'help' para ver los comandos disponibles.`, isError: true };
    }
    return runRdpClient('xrdp', args, ctx);
  },
};

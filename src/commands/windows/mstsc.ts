// ── commands/windows/mstsc.ts ─────────────────────────────────────
// Cliente RDP de Windows — SOLO existe en cmd.exe y PowerShell
// (registrado en WINDOWS_COMMANDS, fuera del registro POSIX COMMANDS).
// En Linux el equivalente es `xrdp` (src/commands/tools/xrdp.ts).

import type { CommandContext, CommandResponse } from '../../types';
import { runRdpClient } from '../rdpClient';

export const cmd_mstsc = {
  name: 'mstsc',
  execute: (args: string[], ctx: CommandContext): CommandResponse =>
    runRdpClient('mstsc', args, ctx),
};

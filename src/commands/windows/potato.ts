// ── commands/windows/potato.ts ──────────────────────────────────────
// Potato-style privilege escalation en Windows (PLAN_WINDOWS W4).
// Desacoplado de labs: solo emite privescCompleted si el usuario actual
// NO es ya admin. El LabValidator decide si eso completa la misión.

import type { CommandContext, CommandResponse } from '../../types';
import { winUser } from '../../utils/winCmd';

export const cmd_potato = {
  name: 'potato',
  execute: (_args: string[], ctx: CommandContext): CommandResponse => {
    if (ctx.machine.machine_info.family !== 'windows') {
      return { output: 'potato: este exploit solo funciona en Windows.', isError: true };
    }

    const user = winUser(ctx);
    if (user.uid === 0 || ctx.machine.privesc_completed) {
      return { output: '[*] Ya eres administrador. No hay nada que escalar.' };
    }

    const host = ctx.machine.win?.computerName || ctx.machine.machine_info.hostname;
    const lines = [
      'Potato — Windows Privilege Escalation',
      '',
      `[*] Objetivo: ${host} (${ctx.machine.machine_info.os})`,
      `[*] Usuario:  ${user.username} (uid=${user.uid})`,
      '[*] Buscando token de servicio privilegiado...',
      '[+] Token de servicio encontrado: NT AUTHORITY\\SYSTEM',
      '[+] Inyectando shell en proceso de servicio...',
      '[+] Shell elevada obtenida.',
      '',
      'C:\\> whoami',
      `${host.toLowerCase()}\\administrator`,
      '',
      '[+] Privilegios de administrador obtenidos.',
    ];

    return {
      output: lines.join('\n'),
      privescAttempted: true,
      privescTool: 'potato',
      privescCompleted: ctx.machine.id,
    };
  },
};

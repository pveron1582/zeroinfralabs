// ── commands/builtin/whoami.ts ────────────────────────────────────
// Muestra información del usuario actual

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_whoami = {
  name: 'whoami',
  execute: (_: string[], { machine }: CommandContext): CommandResponse => ({
    output: machine.id.includes('attacker')
      ? `root\nuid=0(root) gid=0(root)\nHostname: ${machine.machine_info.hostname}\nIP: ${machine.machine_info.ip}\nOS: ${machine.machine_info.os}`
      : `admin\nHostname: ${machine.machine_info.hostname}\nIP: ${machine.machine_info.ip}`
  })
};

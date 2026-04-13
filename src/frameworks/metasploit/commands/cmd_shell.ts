// ── frameworks/metasploit/commands/cmd_shell.ts ───────────────────
// Shell command - drop into system shell
// Available in: meterpreter

import type { MsfCommand, MsfCommandContext } from '../core/ContextRegistry';
import type { CommandResponse } from '../../../types';
import { withState } from '../../../commands/tools/msfHelpers';

export const cmd_shell: MsfCommand = {
  name: 'shell',
  description: 'Drop into a system command shell',
  execute: (args: string[], ctx: MsfCommandContext): CommandResponse => {
    const state = ctx.msfState;
    const newState = { ...state, shellMode: true };
    
    const out = '\n[*] Process 1234 created.\n[*] Channel 1 created.\n[*] Command shell session 1 opened (127.0.0.1:4444 -> 10.0.0.5:49152)\n\n';
    return withState(out, newState);
  }
};

// ── frameworks/metasploit/commands/cmd_clear.ts ───────────────────
// Clear command - clear terminal screen
// Available in: msfconsole, module, meterpreter

import type { MsfCommand, MsfCommandContext } from '../core/ContextRegistry';
import type { CommandResponse } from '../../../types';

export const cmd_clear: MsfCommand = {
  name: 'clear',
  description: 'Clear the terminal screen',
  execute: (args: string[], ctx: MsfCommandContext): CommandResponse => {
    return { output: 'CLEAR_TERMINAL' };
  }
};

// ── frameworks/metasploit/commands/cmd_getuid.ts ───────────────────
// Getuid command - get current user in meterpreter
// Available in: meterpreter

import type { MsfCommand, MsfCommandContext } from '../core/ContextRegistry';
import type { CommandResponse } from '../../../types';
import { withState } from '../core/msfHelpers';

export const cmd_getuid: MsfCommand = {
  name: 'getuid',
  description: 'Get the user that the server is running as',
  execute: (args: string[], ctx: MsfCommandContext): CommandResponse => {
    const state = ctx.msfState;
    const newState = { ...state, uidChecked: true };
    return withState('Server username: NT AUTHORITY\\SYSTEM\n', newState);
  }
};

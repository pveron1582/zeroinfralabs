// ── frameworks/metasploit/commands/cmd_set.ts ────────────────────
// Context-aware set command for MSF
// Available in: msfconsole, module, meterpreter

import type { MsfCommand, MsfCommandContext } from '../core/ContextRegistry';
import type { CommandResponse } from '../../../types';
import { withState } from '../core/msfHelpers';

export const cmd_set: MsfCommand = {
  name: 'set',
  description: 'Set a variable value',
  execute: (args: string[], ctx: MsfCommandContext): CommandResponse => {
    const state = ctx.msfState;

    if (args.length < 2) {
      return withState('[-] Usage: set <option> <value>\n', state);
    }

    const option = args[0].toUpperCase();
    const value = args.slice(1).join(' ');

    const newOptions = { ...state.options, [option]: value };
    const newState = { ...state, options: newOptions };

    return withState(`${option} => ${value}\n`, newState);
  }
};

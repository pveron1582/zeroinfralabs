// ── frameworks/metasploit/commands/cmd_back.ts ───────────────────
// Back command - return from module context to msfconsole
// Available in: module

import type { MsfCommand, MsfCommandContext } from '../core/ContextRegistry';
import type { CommandResponse } from '../../../types';
import { withState } from '../core/msfHelpers';

export const cmd_back: MsfCommand = {
  name: 'back',
  description: 'Move back from the current context',
  execute: (args: string[], ctx: MsfCommandContext): CommandResponse => {
    const state = ctx.msfState;
    
    const newState = {
      ...state,
      module: undefined,
      moduleType: undefined,
      moduleOptions: undefined,
    };
    
    return withState('', newState);
  }
};

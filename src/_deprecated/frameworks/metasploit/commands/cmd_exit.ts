// ── frameworks/metasploit/commands/cmd_exit.ts ───────────────────
// Exit command for MSF - context-aware behavior
// Available in: msfconsole, module, meterpreter

import type { MsfCommand, MsfCommandContext } from '../core/ContextRegistry';
import type { CommandResponse } from '../../../types';
import { withState } from '../core/msfHelpers';

export const cmd_exit: MsfCommand = {
  name: 'exit',
  description: 'Exit the console or session',
  aliases: ['quit'],
  execute: (args: string[], ctx: MsfCommandContext): CommandResponse => {
    const state = ctx.msfState;
    
    // In meterpreter: close session, return to module prompt
    if (state.sessionOpen) {
      const newState = { ...state, sessionOpen: false };
      return { 
        ...withState(`[*] Shutting down Meterpreter...\n`, newState), 
        newMachineId: 'attacker-01' 
      };
    }
    
    // In msfconsole/module: exit console entirely
    return {
      output: `MSF_STATE:${JSON.stringify({ ...state, active: false })}\n\n[*] Exiting Metasploit...`,
    };
  }
};

export const cmd_quit = cmd_exit; // Alias

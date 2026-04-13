// ── frameworks/metasploit/commands/cmd_hashdump.ts ───────────────────
// Hashdump command - dump password hashes
// Available in: meterpreter

import type { MsfCommand, MsfCommandContext } from '../core/ContextRegistry';
import type { CommandResponse } from '../../../types';
import { withState } from '../../../commands/tools/msfHelpers';

const HASHES = [
  'Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::',
  'Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::',
  'john:1000:aad3b435b51404eeaad3b435b51404ee:8846f7eaee8fb117ad06bdd830b7586c:::',
];

export const cmd_hashdump: MsfCommand = {
  name: 'hashdump',
  description: 'Dump password hashes from the target',
  execute: (args: string[], ctx: MsfCommandContext): CommandResponse => {
    const state = ctx.msfState;
    const newState = { ...state, hashdumpExecuted: true };
    
    const out = '\n[*] Dumping password hashes...\n\n' + HASHES.join('\n') + '\n\n';
    return withState(out, newState);
  }
};

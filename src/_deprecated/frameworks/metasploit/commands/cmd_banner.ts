// ── frameworks/metasploit/commands/cmd_banner.ts ───────────────────
// Banner command - display Metasploit banner
// Available in: msfconsole, module

import type { MsfCommand, MsfCommandContext } from '../core/ContextRegistry';
import type { CommandResponse } from '../../../types';
import { withState } from '../core/msfHelpers';

const BANNER = `
  Metasploit Framework 6.3.0-dev
  --=[ 2267 exploits - 1187 auxiliary - 399 post       ]
  --=[ 860 payloads - 45 encoders - 11 nops           ]
  --=[ 9 evasion                                       ]

       _                                                   _
      / \\  _ __   __ _ _ __ ___   __ _  ___ _ __ ___   ___| |
     / _ \\| '_ \\ / _\` | '_ \` _ \\ / _\` |/ _ \\ '_ \` _ \\ / _ \\ |
    / ___ \\| | | | (_| | | | | | | (_| |  __/ | | | | |  __/_|
   /_/   \\_\\_| |_|\\__,_|_| |_| |_|\\__, |\\___|_| |_| |_|\\___|
                                    |___/

  Easy phishing, set up in minutes!
  =================================

`;

export const cmd_banner: MsfCommand = {
  name: 'banner',
  description: 'Display an awesome metasploit banner',
  execute: (args: string[], ctx: MsfCommandContext): CommandResponse => {
    return withState(BANNER, ctx.msfState);
  }
};

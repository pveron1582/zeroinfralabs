// ── frameworks/metasploit/commands/cmd_info.ts ───────────────────
// Info command - display module information
// Available in: msfconsole, module

import type { MsfCommand, MsfCommandContext } from '../core/ContextRegistry';
import type { CommandResponse } from '../../../types';
import { MSF_MODULES } from '../../../commands/tools/msfModules';
import { withState } from '../../../commands/tools/msfHelpers';

export const cmd_info: MsfCommand = {
  name: 'info',
  description: 'Displays information about one or more modules',
  execute: (args: string[], ctx: MsfCommandContext): CommandResponse => {
    const state = ctx.msfState;
    const modulePath = args[0] || (typeof state.module === 'string' ? state.module : state.module?.path);
    
    if (!modulePath) {
      return withState('[-] Usage: info <module> or select a module first\n', state);
    }
    
    const mod = MSF_MODULES.find(m => m.path === modulePath || m.path.includes(modulePath));
    if (!mod) {
      return withState(`[-] No module found: ${modulePath}\n`, state);
    }
    
    let out = '\n';
    out += `       Name: ${mod.path}\n`;
    out += `     Module: ${mod.type}/${mod.path.split('/').pop()}\n`;
    out += `   Platform: Windows\n`;
    out += `       Arch: x64\n`;
    out += ` Privileged: Yes\n`;
    out += `    License: Metasploit Framework License (BSD)\n`;
    out += `       Rank: ${mod.rank}\n`;
    out += `  Disclosed: 2017-03-14\n\n`;
    out += `Provided by:\n`;
    const author = 'author' in mod ? mod.author : 'Unknown';
    out += `  ${author || 'Unknown'}\n\n`;
    out += `Available targets:\n`;
    out += `  Id  Name\n`;
    out += `  --  ----\n`;
    out += `  0   Automatic Target\n`;
    out += `  1   Windows 7\n`;
    out += `  2   Windows Server 2008 R2\n\n`;
    out += `Check supported:\n`;
    out += `  Yes\n\n`;
    out += `Description:\n`;
    out += `  ${mod.desc}\n\n`;
    
    return withState(out, state);
  }
};

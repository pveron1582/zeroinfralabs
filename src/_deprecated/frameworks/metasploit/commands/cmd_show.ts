// ── frameworks/metasploit/commands/cmd_show.ts ───────────────────
// Show command - display modules or options
// Available in: msfconsole, module

import type { MsfCommand, MsfCommandContext } from '../core/ContextRegistry';
import type { CommandResponse } from '../../../types';
import { MSF_MODULES } from '../core/msfModules';
import { withState } from '../core/msfHelpers';

export const cmd_show: MsfCommand = {
  name: 'show',
  description: 'Displays modules of a given type, or all modules',
  execute: (args: string[], ctx: MsfCommandContext): CommandResponse => {
    const state = ctx.msfState;
    const query = args[0]?.toLowerCase();
    
    // Show options when module selected
    if (query === 'options') {
      if (!state.module) {
        return withState('[-] No module selected. Use: show <type> or select a module first\n', state);
      }
      
      let out = 'Module options (\n\n';
      out += '   Name     Current Setting  Required  Description\n';
      out += '   ----     ---------------  --------  -----------\n';
      out += `   RHOSTS   ${(state.options.RHOSTS || '').padEnd(15)}  yes       The target host(s)\n`;
      out += `   RPORT    ${(state.options.RPORT || '445').padEnd(15)}  yes       The target port\n`;
      const modPath = typeof state.module === 'string' ? state.module : state.module.path;
      if (modPath.includes('exploit')) {
        out += `   LHOST    ${(state.options.LHOST || '').padEnd(15)}  yes       The listen address\n`;
        out += `   LPORT    ${(state.options.LPORT || '4444').padEnd(15)}  yes       The listen port\n`;
        out += `   PAYLOAD  ${(state.options.PAYLOAD || '').padEnd(15)}  yes       The payload to use\n`;
      }
      out += '\n';
      return withState(out, state);
    }
    
    // Show modules by type
    let filtered = MSF_MODULES;
    if (query && query !== 'all') {
      filtered = MSF_MODULES.filter(m => m.type === query || m.path.includes(query));
    }
    
    if (filtered.length === 0) {
      return withState(`[-] No modules found for type: ${query || 'all'}\n`, state);
    }
    
    let out = `\n${filtered.length} ${query || 'exploit'} modules found\n\n`;
    out += '   #  Name\n';
    out += '   -  ----\n';
    filtered.forEach((m, i) => {
      out += `   ${i.toString().padEnd(2)}  ${m.path}\n`;
    });
    out += '\n';
    
    return withState(out, state);
  }
};

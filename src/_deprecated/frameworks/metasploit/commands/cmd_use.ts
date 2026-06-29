// ── frameworks/metasploit/commands/cmd_use.ts ───────────────────
// Context-aware use command for MSF
// Available in: msfconsole

import type { MsfCommand, MsfCommandContext } from '../core/ContextRegistry';
import type { CommandResponse } from '../../../types';
import { MSF_MODULES, MODULE_DEFAULTS } from '../core/msfModules';
import { withState } from '../core/msfHelpers';

export const cmd_use: MsfCommand = {
  name: 'use',
  description: 'Select a module by name or number',
  execute: (args: string[], ctx: MsfCommandContext): CommandResponse => {
    const query = args.join(' ');
    const state = ctx.msfState;

    if (!query) {
      return withState('[-] Usage: use <module_name|number>\n', state);
    }

    // Select by number from last search results
    const num = parseInt(query, 10);
    if (!isNaN(num) && state.lastSearchResults && state.lastSearchResults.length > 0) {
      if (num >= 0 && num < state.lastSearchResults.length) {
        const selectedPath = state.lastSearchResults[num];
        const mod = MSF_MODULES.find(m => m.path === selectedPath);
        if (mod) {
          const defaults = MODULE_DEFAULTS[mod.path] || {};
          const newOptions: Record<string, string> = { ...defaults };
          if (state.options.LHOST) newOptions.LHOST = state.options.LHOST;
          if (state.options.RHOSTS) newOptions.RHOSTS = state.options.RHOSTS;
          const newState = {
            ...state,
            module: mod.path,
            moduleType: mod.type,
            options: newOptions,
            lastSearchResults: []
          };
          return withState(`[*] No payload configured, defaulting to ${newOptions.PAYLOAD || 'generic/shell_reverse_tcp'}\n`, newState);
        }
      }
      return withState(`[-] Invalid selection: ${num}. Use a number between 0 and ${state.lastSearchResults.length - 1}\n`, state);
    }

    const queryLower = query.toLowerCase();

    // Exact path match
    let mod = MSF_MODULES.find(m => m.path.toLowerCase() === queryLower);

    // Partial match on last segment
    if (!mod) {
      const lastPart = query.split('/').pop()!.toLowerCase();
      const matches = MSF_MODULES.filter(m =>
        m.path.toLowerCase().endsWith(lastPart) || m.path.toLowerCase().includes(lastPart)
      );
      if (matches.length === 1) {
        mod = matches[0];
      } else if (matches.length > 1) {
        const preferredType = query.includes('exploit') ? 'exploit'
          : query.includes('auxiliary') ? 'auxiliary'
            : 'exploit';
        mod = matches.find(m => m.type === preferredType) || matches[0];
      }
    }

    if (!mod) {
      return withState(`[-] No module found for: ${query}\n`, state);
    }

    const defaults = MODULE_DEFAULTS[mod.path] || {};
    const newOptions: Record<string, string> = { ...defaults };
    if (state.options.LHOST) newOptions.LHOST = state.options.LHOST;
    if (state.options.RHOSTS) newOptions.RHOSTS = state.options.RHOSTS;

    const newState = {
      ...state,
      module: mod.path,
      moduleType: mod.type,
      options: newOptions,
      lastSearchResults: []
    };

    return withState(`[*] No payload configured, defaulting to ${newOptions.PAYLOAD || 'generic/shell_reverse_tcp'}\n`, newState);
  }
};

// ── frameworks/metasploit/commands/cmd_search.ts ───────────────────
// Context-aware search command for MSF
// Available in: msfconsole, module

import type { MsfCommand, MsfCommandContext } from '../core/ContextRegistry';
import type { CommandResponse } from '../../../types';
import { MSF_MODULES } from '../core/msfModules';
import { withState } from '../core/msfHelpers';

export const cmd_search: MsfCommand = {
  name: 'search',
  description: 'Search for modules by name, description, or type',
  execute: (args: string[], ctx: MsfCommandContext): CommandResponse => {
    const query = args.join(' ').toLowerCase();
    const state = ctx.msfState;

    if (!query) {
      return withState('[*] You must provide a search term.\n', state);
    }

    const results = MSF_MODULES.filter(m =>
      m.path.toLowerCase().includes(query) ||
      m.desc.toLowerCase().includes(query) ||
      m.type.toLowerCase().includes(query)
    );

    if (!results.length) {
      return withState(`[-] No results found for: ${args.join(' ')}\n`, state);
    }

    const searchResultPaths = results.map(m => m.path);
    const newState = { ...state, lastSearchResults: searchResultPaths };

    let out = `\nMatching Modules\n================\n\n`;
    out += `   #  Name                                                     Disclosure Date  Rank     Check  Description\n`;
    out += `   -  ----                                                     ---------------  ----     -----  -----------\n`;
    results.forEach((m, i) => {
      const n    = String(i).padEnd(3);
      const name = m.path.padEnd(56);
      const date = (m.type === 'exploit' ? '2017-03-14' : '').padEnd(17);
      const rank = m.rank.padEnd(9);
      const chk  = (m.type === 'auxiliary' ? 'Yes' : 'No').padEnd(7);
      out += `   ${n}  ${name} ${date}  ${rank}  ${chk}  ${m.desc}\n`;
    });
    out += `\n[*] Use 'use <number>' to select a module (e.g., use 0, use 1)\n`;

    return withState(out, newState);
  }
};

// ── commands/tools/msfCommands/msfBase.ts ────────────────────────
// Generic MSF commands: help, search, use, back, info, show, set, unset, sessions

import type { CommandResponse, CommandContext } from '../../../types';
import type { MsfState } from '../msfTypes';
import { MSF_MODULES, MODULE_DEFAULTS } from '../msfModules';
import { withState, basePrompt } from '../msfHelpers';

/**
 * Handle generic MSF commands (non-module, non-session specific)
 */
export const executeBaseCommand = (
  cmd: string,
  args: string[],
  state: MsfState,
  ctx: CommandContext
): CommandResponse | null => {
  // ── exit / quit ──
  if (cmd === 'exit' || cmd === 'quit') {
    return {
      output: `MSF_STATE:${JSON.stringify({ ...state, active: false })}\n\n[*] Exiting Metasploit...`,
    };
  }

  // ── clear ──
  if (cmd === 'clear') {
    return { output: 'CLEAR_TERMINAL' };
  }

  // ── help / ? ──
  if (cmd === 'help' || cmd === '?') {
    return withState(`
Core Commands
=============

    Command       Description
    -------       -----------
    ?             Alias for help
    banner        Display an awesome metasploit banner
    exit          Exit the console
    help          Help menu
    quit          Alias for exit
    sessions      Dump session listings
    version       Show the framework and console library version numbers

Module Commands
===============

    Command       Description
    -------       -----------
    back          Move back from the current context
    info          Displays information about one or more modules
    options       Displays global options or for one or more modules
    search        Searches module names and descriptions
    show          Displays modules of a given type, or all modules
    use           Selects a module by name

Exploit Commands (when module selected)
========================================

    Command       Description
    -------       -----------
    check         Tests a target for vulnerability
    exploit       Launches an exploit attempt
    run           Alias for exploit
    set           Sets a variable (e.g. set RHOSTS 10.0.0.1)
    show          Show options / payloads / targets
    unset         Unsets one or more variables

Meterpreter Commands (when session open)
=========================================

    Command       Description
    -------       -----------
    background    Background the current session
    getuid        Get the user that the server is running as
    hashdump      Dump password hashes from the target
    shell         Drop into a system command shell
    sysinfo       Get information about the remote system
`, state);
  }

  // ── search ──
  if (cmd === 'search') {
    const query = args.join(' ').toLowerCase();
    if (!query) return withState(`[*] You must provide a search term.\n`, state);

    const results = MSF_MODULES.filter(m =>
      m.path.toLowerCase().includes(query) ||
      m.desc.toLowerCase().includes(query) ||
      m.type.toLowerCase().includes(query)
    );

    if (!results.length) return withState(`[-] No results found for: ${query}\n`, state);

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

  // ── use ──
  if (cmd === 'use') {
    const query = args.join(' ');

    // Select by number from last search results
    const num = parseInt(query, 10);
    if (!isNaN(num) && state.lastSearchResults && state.lastSearchResults.length > 0) {
      if (num >= 0 && num < state.lastSearchResults.length) {
        const selectedPath = state.lastSearchResults[num];
        const mod = MSF_MODULES.find(m => m.path === selectedPath);
        if (mod) {
          const defaults    = MODULE_DEFAULTS[mod.path] || {};
          const newOptions: Record<string, string> = { ...defaults };
          if (state.options.LHOST)  newOptions.LHOST  = state.options.LHOST;
          if (state.options.RHOSTS) newOptions.RHOSTS = state.options.RHOSTS;
          const newState: MsfState = { ...state, module: mod.path, moduleType: mod.type, options: newOptions, lastSearchResults: [] };
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
      const matches  = MSF_MODULES.filter(m =>
        m.path.toLowerCase().endsWith(lastPart) || m.path.toLowerCase().includes(lastPart)
      );
      if (matches.length === 1) {
        mod = matches[0];
      } else if (matches.length > 1) {
        const preferredType = query.includes('exploit') ? 'exploit'
                            : query.includes('auxiliary') || query.includes('scanner') ? 'auxiliary'
                            : null;
        mod = (preferredType ? matches.find(m => m.type === preferredType) : null)
           || matches.find(m => m.type === 'exploit')
           || matches[0];
      }
    }

    // Last resort: split on spaces and match each word individually
    if (!mod) {
      const words = queryLower.split(/\s+/).filter(w => w.length > 2);
      const preferredType = queryLower.includes('exploit') ? 'exploit'
                          : queryLower.includes('auxiliary') ? 'auxiliary' : null;
      const wordMatches = MSF_MODULES.filter(m =>
        words.every(w => m.path.toLowerCase().includes(w))
      );
      if (wordMatches.length === 1) {
        mod = wordMatches[0];
      } else if (wordMatches.length > 1) {
        mod = (preferredType ? wordMatches.find(m => m.type === preferredType) : null)
           || wordMatches[0];
      } else {
        mod = (preferredType ? MSF_MODULES.find(m => m.type === preferredType && words.some(w => m.path.toLowerCase().includes(w))) : null)
           || MSF_MODULES.find(m => words.some(w => m.path.toLowerCase().includes(w)));
      }
    }

    if (!mod) return withState(`[-] Failed to load module: ${args.join(' ')}\n`, state);

    const defaults    = MODULE_DEFAULTS[mod.path] || {};
    const newOptions: Record<string, string> = { ...defaults };
    if (state.options.LHOST)  newOptions.LHOST  = state.options.LHOST;
    if (state.options.RHOSTS) newOptions.RHOSTS = state.options.RHOSTS;

    const newState: MsfState = { ...state, module: mod.path, moduleType: mod.type, options: newOptions };
    return withState(`[*] No payload configured, defaulting to ${newOptions.PAYLOAD || 'generic/shell_reverse_tcp'}\n`, newState);
  }

  // ── back ──
  if (cmd === 'back') {
    const newState: MsfState = { ...state, module: undefined, moduleType: undefined, options: {} };
    return withState(``, newState);
  }

  // ── info ──
  if (cmd === 'info') {
    if (!state.module) return withState(`[-] No module selected. Use 'use <module>' first.\n`, state);
    const mod  = MSF_MODULES.find(m => m.path === state.module)!;
    const opts = { ...MODULE_DEFAULTS[state.module] || {}, ...state.options };
    let out = `\n       Name: ${mod.desc}\n     Module: ${mod.path}\n   Platform: Windows\n       Arch: x86, x64\nPrivileged: Yes\n    License: Metasploit Framework License (BSD)\n       Rank: ${mod.rank}\n  Disclosed: 2017-03-14\n\nProvided by:\n  Shadow Brokers\n  sleepya\n  EternalBlue authors\n\nModule options (${mod.path}):\n\n   Name            Current Setting  Required  Description\n   ----            ---------------  --------  -----------\n`;
    Object.entries(opts).forEach(([k, v]) => {
      const req = ['RHOSTS', 'LHOST'].includes(k) ? 'yes' : 'no';
      out += `   ${k.padEnd(15)} ${String(v).padEnd(17)} ${req.padEnd(10)} ...\n`;
    });
    return withState(out, state);
  }

  // ── show ──
  if (cmd === 'show') {
    const what = args[0]?.toLowerCase();

    if (what === 'options') {
      if (!state.module) return withState(`[-] No module selected.\n`, state);
      const opts = { ...MODULE_DEFAULTS[state.module] || {}, ...state.options };
      let out = `\nModule options (${state.module}):\n\n   Name            Current Setting              Required  Description\n   ----            ---------------              --------  -----------\n`;
      Object.entries(opts).forEach(([k, v]) => {
        const req = ['RHOSTS', 'LHOST'].includes(k) ? 'yes' : 'no';
        const cur = String(v || '').padEnd(29);
        out += `   ${k.padEnd(15)} ${cur}  ${req.padEnd(10)} ...\n`;
      });
      return withState(out, state);
    }

    if (what === 'payloads') {
      let out = `\nCompatible Payloads\n===================\n\n   #   Name                                         Disclosure Date  Rank    Check  Description\n   -   ----                                         ---------------  ----    -----  -----------\n`;
      MSF_MODULES.filter(m => m.type === 'payload').forEach((m, i) => {
        out += `   ${i}   ${m.path.padEnd(44)}                   normal  No     ${m.desc}\n`;
      });
      return withState(out, state);
    }

    if (what === 'exploits') {
      let out = `\nExploits\n========\n\n   #   Name                                               Rank     Description\n   -   ----                                               ----     -----------\n`;
      MSF_MODULES.filter(m => m.type === 'exploit').forEach((m, i) => {
        out += `   ${i}   ${m.path.padEnd(50)}   ${m.rank.padEnd(9)} ${m.desc}\n`;
      });
      return withState(out, state);
    }

    if (what === 'auxiliary') {
      let out = `\nAuxiliary\n=========\n\n   #   Name                                               Rank     Description\n   -   ----                                               ----     -----------\n`;
      MSF_MODULES.filter(m => m.type === 'auxiliary').forEach((m, i) => {
        out += `   ${i}   ${m.path.padEnd(50)}   ${m.rank.padEnd(9)} ${m.desc}\n`;
      });
      return withState(out, state);
    }

    return withState(`[*] Valid show options: exploits, auxiliary, payloads, options\n`, state);
  }

  // ── set ──
  if (cmd === 'set') {
    if (args.length < 2) return withState(`Usage: set <option> <value>\n`, state);
    const [key, ...rest] = args;
    const val = rest.join(' ');
    const newOptions = { ...state.options, [key.toUpperCase()]: val };
    return withState(`${key.toUpperCase()} => ${val}\n`, { ...state, options: newOptions });
  }

  // ── unset ──
  if (cmd === 'unset') {
    if (!args[0]) return withState(`Usage: unset <option>\n`, state);
    const newOptions = { ...state.options };
    delete newOptions[args[0].toUpperCase()];
    return withState(`Unsetting ${args[0].toUpperCase()}\n`, { ...state, options: newOptions });
  }

  // ── sessions ──
  if (cmd === 'sessions') {
    if (!state.sessionOpen) return withState(`\n[*] No active sessions.\n`, state);
    const victimIp = state.options.RHOSTS || '?';
    return withState(`\nActive sessions\n===============\n\n  Id  Name  Type                     Information                 Connection\n  --  ----  ----                     -----------                 ----------\n  1         meterpreter x64/windows  NT AUTHORITY\\SYSTEM @ WIN7  ${ctx.machine.machine_info.ip}:4444 -> ${victimIp}:49158\n`, state);
  }

  return null; // Command not handled by base
};

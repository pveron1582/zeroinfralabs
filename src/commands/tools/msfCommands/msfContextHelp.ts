// ── commands/tools/msfCommands/msfContextHelp.ts ──────────────────
// Context-aware help for MSF using ContextRegistry (Fase 3)
// Provides dynamic help based on current context: msfconsole > meterpreter > shell

import type { CommandResponse } from '../../../types';
import type { MsfState } from '../msfTypes';
import { withState } from '../msfHelpers';
import {
  contextRegistry,
  formatContextHelp,
  type MsfContextType,
} from '../../../frameworks/metasploit/core/ContextRegistry';

/**
 * Build help text based on current MSF context
 * Returns appropriate help for: msfconsole, module, meterpreter, or shell
 */
export const getContextAwareHelp = (state: MsfState): string => {
  // Determine context from state
  const context = detectMsfContext(state);

  // Build context-specific help
  switch (context) {
    case 'msfconsole':
      return `
Core Commands
=============

    Command       Description
    -------       -----------
    ?             Alias for help
    back          Move back from the current context
    banner        Display an awesome metasploit banner
    exit          Exit the console
    help          Help menu
    quit          Alias for exit
    search        Searches module names and descriptions
    sessions      Dump session listings
    use           Selects a module by name
    version       Show the framework version

Tip: Type 'use <module>' to select a module for exploitation.
Example: use exploit/windows/smb/ms17_010_eternalblue
`;

    case 'module':
      return `
Module Commands (${state.module})
=================================

    Command       Description
    -------       -----------
    back          Return to msfconsole (deselect module)
    check         Check if target is vulnerable
    exploit       Launch the exploit
    info          Display module information
    options       Show current module options
    run           Alias for exploit
    set           Set an option value
    show          Show options / payloads / targets
    unset         Clear an option value

Current Options:
${formatCurrentOptions(state)}
`;

    case 'meterpreter':
      return `
Meterpreter Commands
====================

Core Commands
-------------
    background    Backgrounds the current session
    exit          Terminate the session (returns to msf6)
    help          This help menu
    quit          Alias for exit

System Commands
---------------
    getuid        Get the user that the server is running as
    ps            List running processes
    sysinfo       Get system information
    shell         Drop into a system command shell
    hashdump      Dump password hashes (Windows)

Network Commands
----------------
    ifconfig      Display network interfaces
    ipconfig      Display network interfaces (Windows)
    portfwd       Forward a local port

File Commands
-------------
    cd            Change directory
    dir           List files (alias: ls)
    download      Download a file
    ls            List files
    pwd           Print working directory
    upload        Upload a file
`;

    case 'windows_shell':
      return `
Windows Command Shell (cmd.exe)
================================

    Command       Description
    -------       -----------
    cd            Change directory
    cls           Clear screen
    dir           List directory contents
    echo          Display messages
    exit          Return to meterpreter
    ipconfig      Display network configuration
    type          Display file contents (alias: cat)
    whoami        Display current user

Note: Type 'exit' to return to meterpreter >
`;

    default:
      return 'Type "help" for available commands.';
  }
};

/**
 * Format current module options for help display
 */
function formatCurrentOptions(state: MsfState): string {
  if (!state.options || Object.keys(state.options).length === 0) {
    return '  No options set. Use: set <option> <value>';
  }

  return Object.entries(state.options)
    .map(([key, val]) => `  ${key.padEnd(12)} ${val}`)
    .join('\n');
}

/**
 * Detect current MSF context from state
 * Maps legacy MsfState to new MsfContextType
 */
export function detectMsfContext(state: MsfState): MsfContextType {
  // Windows shell session takes priority
  if (state.shellMode) {
    return 'windows_shell';
  }

  // Active meterpreter session
  if (state.sessionOpen) {
    return 'meterpreter';
  }

  // Module selected but no session
  if (state.module) {
    return 'module';
  }

  // Base msfconsole
  return 'msfconsole';
}

/**
 * Get prompt string for current context
 * Maintains backward compatibility with existing prompt format
 */
export function getContextPrompt(state: MsfState): string {
  const context = detectMsfContext(state);

  switch (context) {
    case 'msfconsole':
      return 'msf6 > ';
    case 'module': {
      // Backward compatible format: use last 2 segments like old modulePrompt()
      const short = state.module?.split('/').slice(-2).join('/') || 'unknown';
      const type = state.module?.startsWith('auxiliary') ? 'auxiliary' : 'exploit';
      return `msf6 ${type}(${short}) > `;
    }
    case 'meterpreter':
      return 'meterpreter > ';
    case 'windows_shell':
      return 'C:\\Windows\\system32> ';
    default:
      return '> ';
  }
}

/**
 * Execute context-aware help
 * Returns CommandResponse with appropriate help text
 */
export const executeContextHelp = (
  cmd: string,
  args: string[],
  state: MsfState
): CommandResponse | null => {
  if (cmd !== 'help' && cmd !== '?') {
    return null; // Not a help command
  }

  const helpText = getContextAwareHelp(state);
  return withState(helpText, state);
};

// ── frameworks/metasploit/commands/commandRegistry.example.ts ─────
// EXAMPLE: How to register context-aware commands
// This file demonstrates the Fase 3 pattern for command registration
//
// To activate: Import this file in commands/index.ts during Fase 3 integration

import type { MsfCommand, MsfCommandContext } from '../core/ContextRegistry';
import { contextRegistry } from '../core/ContextRegistry';

// ── msfconsole commands ─────────────────────────────────────────────
const cmd_use: MsfCommand = {
  name: 'use',
  description: 'Select a module for use',
  execute: (args, ctx): { output: string; isError?: boolean } => {
    return { output: `[*] Module loaded: ${args[0] || 'none'}` };
  },
};

const cmd_search: MsfCommand = {
  name: 'search',
  description: 'Search for modules',
  execute: (args, ctx): { output: string; isError?: boolean } => {
    return { output: '[*] Searching...\n  found: 0 results' };
  },
};

const cmd_exploit: MsfCommand = {
  name: 'exploit',
  aliases: ['run'],
  description: 'Launch the exploit',
  execute: (args, ctx): { output: string; isError?: boolean } => {
    return { output: '[*] Exploit running...\n[+] Exploit completed successfully' };
  },
};

// ── meterpreter commands ────────────────────────────────────────────
const cmd_sysinfo: MsfCommand = {
  name: 'sysinfo',
  description: 'Get system information',
  execute: (args, ctx): { output: string; isError?: boolean } => {
    return {
      output: `Computer    : TARGET-PC
OS          : Windows 10
Architecture: x64`,
    };
  },
};

const cmd_getuid: MsfCommand = {
  name: 'getuid',
  description: 'Get current user',
  execute: (args, ctx): { output: string; isError?: boolean } => {
    return { output: 'Server username: NT AUTHORITY\\SYSTEM' };
  },
};

const cmd_ps: MsfCommand = {
  name: 'ps',
  description: 'List processes',
  execute: (args, ctx): { output: string; isError?: boolean } => {
    return { output: 'PID   Name\n---   ----\n  4   System\n 888   explorer.exe' };
  },
};

const cmd_shell: MsfCommand = {
  name: 'shell',
  description: 'Drop to system shell',
  execute: (args, ctx): { output: string; isError?: boolean } => {
    return {
      output:
        'Process 1 created.\nChannel 1 created.\n\nMicrosoft Windows [Version 10.0.19044]\n(c) Microsoft Corporation. All rights reserved.\n\nC:\\Windows\\system32>',
    };
  },
};

// ── Windows shell commands ──────────────────────────────────────────
const cmd_dir: MsfCommand = {
  name: 'dir',
  aliases: ['ls'],
  description: 'List directory',
  execute: (args, ctx): { output: string; isError?: boolean } => {
    return { output: 'Volume in drive C is Windows\n\n04/09/2024  02:30 PM    <DIR> .\n04/09/2024  02:30 PM    <DIR> ..' };
  },
};

const cmd_ipconfig: MsfCommand = {
  name: 'ipconfig',
  description: 'Show network config',
  execute: (args, ctx): { output: string; isError?: boolean } => {
    return { output: 'IPv4 Address: 10.0.0.20\nSubnet Mask: 255.255.255.0' };
  },
};

// ── Background command (available in meterpreter + shells) ───────────
const cmd_background: MsfCommand = {
  name: 'background',
  aliases: ['bg'],
  description: 'Background the current session',
  execute: (args, ctx): { output: string; isError?: boolean } => {
    return { output: '[*] Backgrounding session...' };
  },
};

// ── Help command (available in all contexts) ──────────────────────
const cmd_help: MsfCommand = {
  name: 'help',
  description: 'Show available commands',
  execute: (args, ctx): { output: string; isError?: boolean } => {
    // Get context-aware help
    const helpText = contextRegistry.formatHelp(ctx.currentContext, 'en');
    return { output: helpText };
  },
};

// ── Registration Function ─────────────────────────────────────────
/**
 * Register all context-aware commands in the registry
 * Call this once during application initialization
 */
export function registerAllCommands(): void {
  // msfconsole context
  contextRegistry.register(cmd_use, ['msfconsole']);
  contextRegistry.register(cmd_search, ['msfconsole']);
  contextRegistry.register(cmd_exploit, ['msfconsole', 'module']);
  contextRegistry.register(cmd_help, ['msfconsole', 'module', 'meterpreter', 'windows_shell', 'linux_shell']);

  // meterpreter context
  contextRegistry.register(cmd_sysinfo, ['meterpreter']);
  contextRegistry.register(cmd_getuid, ['meterpreter']);
  contextRegistry.register(cmd_ps, ['meterpreter']);
  contextRegistry.register(cmd_shell, ['meterpreter']);
  contextRegistry.register(cmd_background, ['meterpreter']);

  // Windows shell context
  contextRegistry.register(cmd_dir, ['windows_shell']);
  contextRegistry.register(cmd_ipconfig, ['windows_shell']);
  contextRegistry.register(cmd_background, ['windows_shell']);

  // Note: In Fase 3 integration, these registrations would be called
  // from the main commands/index.ts initialization
}

// ── Example Usage ───────────────────────────────────────────────────
/*
import { contextRegistry, getContextPrompt, type MsfContextType } from '../core/ContextRegistry';
import type { MsfState, MsfSession } from '../modules/types';

// 1. Register commands (once)
registerAllCommands();

// 2. Detect current context from state
const msfState: MsfState = { ... };
const currentSession: MsfSession | undefined = msfState.sessions?.[0];
const context: MsfContextType = contextRegistry.detectContext(msfState, currentSession);

// 3. Get appropriate prompt
const prompt = getContextPrompt(context, currentSession);
console.log(prompt); // "msf6 >" or "meterpreter >" or "C:\Windows\system32>"

// 4. Resolve command based on context
const command = contextRegistry.resolve('sysinfo', context);
if (command) {
  const result = command.execute([], msfCommandContext);
  console.log(result.output);
} else {
  console.log("Unknown command for this context");
}

// 5. Get context-aware help
console.log(contextRegistry.formatHelp(context, 'en'));
// Shows only commands available in current context
*/

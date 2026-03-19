// ── commands/tools/msfconsole.ts ──────────────────────────────────
// Simulates a Metasploit Framework msfconsole session.
// Main orchestrator that delegates to specialized command handlers.

import type { CommandContext, CommandResponse } from '../../types';
import type { MsfState } from './msfTypes';
import { INITIAL_STATE } from './msfTypes';
import { withState, basePrompt, modulePrompt } from './msfHelpers';
import { executeBaseCommand } from './msfCommands/msfBase';
import { executeMeterpreterCommand } from './msfCommands/msfMeterpreter';
import { executeShellCommand } from './msfCommands/msfShell';
import { executeExploitCommand } from './msfCommands/msfExploits';

// ── MSF sub-command handler (called when inside MSF session) ──────
// Orchestrates all command handlers in order of priority
export const executeMsfCommand = (
  line: string,
  state: MsfState,
  ctx: CommandContext
): CommandResponse => {
  const parts = line.trim().split(/\s+/);
  const cmd   = parts[0].toLowerCase();
  const args  = parts.slice(1);

  // ── WINDOWS SHELL SESSION ────────────────────────────────────────
  // When shellMode=true the user is inside a Windows cmd shell.
  const shellResult = executeShellCommand(cmd, args, state);
  if (shellResult) return shellResult;

  // ── METERPRETER SESSION ──────────────────────────────────────────
  // Check meterpreter context FIRST (BUG-A & BUG-B fix)
  const meterpreterResult = executeMeterpreterCommand(cmd, args, state, ctx);
  if (meterpreterResult) return meterpreterResult;

  // ── EXPLOIT/CHECK COMMANDS ───────────────────────────────────────
  const exploitResult = executeExploitCommand(cmd, args, state, ctx);
  if (exploitResult) return exploitResult;

  // ── GENERIC BASE COMMANDS ────────────────────────────────────────
  const baseResult = executeBaseCommand(cmd, args, state, ctx);
  if (baseResult) return baseResult;

  // ── Unknown command ──────────────────────────────────────────────
  return withState(`[-] Unknown command: ${line}. Type 'help' for usage.\n`, state);
};

// ── Main command handler (launches msfconsole) ────────────────────
export const cmd_msfconsole = {
  name: 'msfconsole',
  execute: (): CommandResponse => {
    const banner = `

       =[ metasploit v6.3.4-dev                          ]
+ -- --=[ 2294 exploits - 1201 auxiliary - 409 post       ]
+ -- --=[ 951 payloads - 45 encoders - 11 nops            ]
+ -- --=[ 9 evasion                                        ]

Metasploit tip: Use sessions -1 to interact with the last opened session
`;
    return withState(banner, { ...INITIAL_STATE });
  }
};

// Re-export types for convenience
export type { MsfState } from './msfTypes';

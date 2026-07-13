// ── commands/tools/msfconsole.ts ──────────────────────────────────
// Simulates a Metasploit Framework msfconsole session.
// Main orchestrator that delegates to specialized command handlers.
//
// Los módulos del framework (tipos, helpers, base de datos de módulos)
// viven en src/frameworks/metasploit/core/:
//   msfTypes.ts   — definiciones de MsfState e INITIAL_STATE
//   msfHelpers.ts — withState, basePrompt, modulePrompt
//   msfModules.ts — MSF_MODULES, MODULE_DEFAULTS, MsfModule
//
// Los sub-comandos (use, set, show, search, etc.) están en
// src/frameworks/metasploit/commands/.

import type { CommandContext, CommandResponse } from '../../types';
import type { MsfState } from '../../frameworks/metasploit/core/msfTypes';
import { INITIAL_STATE } from '../../frameworks/metasploit/core/msfTypes';
import { withState, basePrompt, modulePrompt } from '../../frameworks/metasploit/core/msfHelpers';
import { executeBaseCommand } from '../../frameworks/metasploit/orchestrators/msfBase';
import { executeMeterpreterCommand } from '../../frameworks/metasploit/orchestrators/msfMeterpreter';
import { executeShellCommand } from '../../frameworks/metasploit/orchestrators/msfShell';
import { executeExploitCommand } from '../../frameworks/metasploit/orchestrators/msfExploits';
import { executeContextHelp, getContextPrompt } from '../../frameworks/metasploit/orchestrators/msfContextHelp';

// ── MSF sub-command handler (called when inside MSF session) ──────
// Orchestrates all command handlers in order of priority
// Fase 3: Now uses ContextRegistry for context-aware help
export const executeMsfCommand = (
  line: string,
  state: MsfState,
  ctx: CommandContext
): CommandResponse => {
  const parts = line.trim().split(/\s+/);
  const cmd   = parts[0].toLowerCase();
  const args  = parts.slice(1);

  // ── CONTEXT-AWARE HELP (Fase 3) ─────────────────────────────────
  // Help now shows only commands available in current context
  const helpResult = executeContextHelp(cmd, args, state);
  if (helpResult) return helpResult;

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

const BANNERS = [
  `
       =[ metasploit v6.3.4-dev                          ]
+ -- --=[ 2294 exploits - 1201 auxiliary - 409 post       ]
+ -- --=[ 951 payloads - 45 encoders - 11 nops            ]
+ -- --=[ 9 evasion                                        ]

Metasploit tip: Use sessions -1 to interact with the last opened session
`,
  `
  ____________________________________________________________________________
   |                                                                           |
   |      3BEEF983F6E8C9F1A2B3C4D5E6F7A8B9C0D1E2F                             |
   |      F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5                             |
   |      A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8                               |
   |                                                                           |
   |                    =[ metasploit v6.4.1-dev ]                             |
   |  + -- --=[ 2351 exploits - 1218 auxiliary - 415 post       ]             |
   |  + -- --=[ 972 payloads - 46 encoders - 11 nops            ]             |
   |  + -- --=[ 10 evasion                                       ]             |
   |___________________________________________________________________________|

Metasploit tip: You can use resources to load commands from a file
`,
  `
                          .,,,,.         ,
                       .,,:;;;;,'''''';::,.
                     .;;,''            '';;.
                    .;'    █████████      ';.
                    .;    ██╔══██╗██╗      ';.
                     ';.  ██║  ██║╚██╗    ,;.
                      ';,  ██████╔╝ ╚██╗  ,;.
                       ';, ╚═════╝  ██╔╝ ,;.
                        ';.       ██╔╝  .;'
                          ';..   ██╔╝  .;'
                            ';;;;;;╚═╝  .;'
                               .......

       =[ metasploit v6.3.4-dev                          ]
+ -- --=[ 2294 exploits - 1201 auxiliary - 409 post       ]
+ -- --=[ 951 payloads - 45 encoders - 11 nops            ]
+ -- --=[ 9 evasion                                        ]

Metasploit tip: Use the 'check' command to verify a vulnerability before exploiting
`,
  `
          __________________
         /                 /|
        /________________/  |
        | ______________  |  |
        | |            |  |  |
        | |   METASPLOIT|  |  |
        | |            |  |  |
        | |____________|  |  |
        |________________|  |
         \_______________\|/

       =[ metasploit v6.3.5-dev                          ]
+ -- --=[ 2298 exploits - 1204 auxiliary - 410 post       ]
+ -- --=[ 955 payloads - 45 encoders - 11 nops            ]
+ -- --=[ 9 evasion                                        ]

Metasploit tip: Use 'show options' or just 'options' to view module configuration
`,
  `
                        (\`.         ,-,
                        \` .\`    ,;' /
                         \`.  ,'/ .'
                          \`. X /.'
                .-;--''--.._\` \` (
              .'            /   \`
              ,           \` '   Q '
              ,         ,   \`._    \\
              ,.|         '     \`-.;_'
              :  .        \`  ;    \`  \` --,.._;
               ' \`    ,   )   .'
                \`._ ,  '   /_
                   ; ,''-,;' \`\`-
                    \`\`-..__\`\`--\`

                              https://metasploit.com

        =[ metasploit v6.3.6-dev                          ]
+ -- --=[ 2301 exploits - 1207 auxiliary - 411 post       ]
+ -- --=[ 958 payloads - 46 encoders - 11 nops            ]
+ -- --=[ 10 evasion                                       ]

Metasploit tip: A rabbit never runs out of tricks — try 'use multi/handler'
`,
];

// ── Main command handler (launches msfconsole) ────────────────────
export const cmd_msfconsole = {
  name: 'msfconsole',
  execute: (): CommandResponse => {
    const banner = BANNERS[Math.floor(Math.random() * BANNERS.length)];
    return withState(banner, { ...INITIAL_STATE });
  }
};

// Re-export types for convenience (consumido por store/)
export type { MsfState } from '../../frameworks/metasploit/core/msfTypes';

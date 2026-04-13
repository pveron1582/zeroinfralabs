// ── frameworks/metasploit/core/ContextRegistry.ts ────────────────
// Hierarchical command registry for MSF contexts
// Different commands available based on shell context:
//   msf6 >          → use, search, show, exploit, sessions, set, run
//   meterpreter >   → sysinfo, getuid, ps, shell, background, exit
//   C:\Windows\...  → dir, cd, ipconfig, whoami, exit (background)

import type { CommandContext, CommandResponse } from '../../../types';
import type { MsfState, MsfSession } from '../modules/types';
import type { SessionManager } from './SessionManager';

// ── Context Types ───────────────────────────────────────────────────
export type MsfContextType = 
  | 'msfconsole'      // Base MSF console (no module loaded)
  | 'module'          // Module loaded, showing options
  | 'meterpreter'     // Active meterpreter session
  | 'windows_shell'   // Windows cmd.exe from meterpreter
  | 'linux_shell';    // Linux shell from meterpreter

export interface MsfCommand {
  name: string;
  description: string;
  aliases?: string[];
  execute: (args: string[], ctx: MsfCommandContext) => CommandResponse;
}

export interface MsfCommandContext extends CommandContext {
  msfState: MsfState;
  sessionManager: SessionManager;
  currentContext: MsfContextType;
}

// ── Command Registry ────────────────────────────────────────────────
class ContextRegistry {
  private commands = new Map<MsfContextType, Map<string, MsfCommand>>();

  constructor() {
    // Initialize command maps for each context
    this.commands.set('msfconsole', new Map());
    this.commands.set('module', new Map());
    this.commands.set('meterpreter', new Map());
    this.commands.set('windows_shell', new Map());
    this.commands.set('linux_shell', new Map());
  }

  /**
   * Register a command for specific context(s)
   */
  register(
    command: MsfCommand,
    contexts: MsfContextType[]
  ): void {
    for (const context of contexts) {
      const contextMap = this.commands.get(context);
      if (contextMap) {
        contextMap.set(command.name, command);
        
        // Register aliases if any
        if (command.aliases) {
          for (const alias of command.aliases) {
            contextMap.set(alias, command);
          }
        }
      }
    }
  }

  /**
   * Get command for current context
   */
  resolve(
    commandName: string,
    context: MsfContextType
  ): MsfCommand | undefined {
    const contextMap = this.commands.get(context);
    if (!contextMap) return undefined;

    // Try exact match first
    const exact = contextMap.get(commandName);
    if (exact) return exact;

    // Try case-insensitive match
    const lowerName = commandName.toLowerCase();
    for (const [name, cmd] of contextMap) {
      if (name.toLowerCase() === lowerName) {
        return cmd;
      }
    }

    return undefined;
  }

  /**
   * Get all available commands for a context
   */
  getAvailableCommands(context: MsfContextType): MsfCommand[] {
    const contextMap = this.commands.get(context);
    if (!contextMap) return [];

    // Filter duplicates (commands registered with aliases)
    const seen = new Set<string>();
    const result: MsfCommand[] = [];

    for (const [name, cmd] of contextMap) {
      if (!seen.has(cmd.name)) {
        seen.add(cmd.name);
        result.push(cmd);
      }
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Determine current context from MSF state
   */
  detectContext(state: MsfState, session?: MsfSession): MsfContextType {
    // Check if we have an active session
    if (state.sessionOpen && session) {
      if (session.type === 'meterpreter') {
        return 'meterpreter';
      } else if (session.type === 'shell') {
        // Determine OS from target info
        const os = session.targetInfo?.os?.toLowerCase() || '';
        if (os.includes('windows')) {
          return 'windows_shell';
        }
        return 'linux_shell';
      }
    }

    // Check if module is loaded
    if (state.module) {
      return 'module';
    }

    // Default: base msfconsole
    return 'msfconsole';
  }

  /**
   * Format help text for current context
   */
  formatHelp(context: MsfContextType, language: 'en' | 'es' = 'en'): string {
    const commands = this.getAvailableCommands(context);
    
    const header = language === 'es'
      ? `Comandos disponibles en ${context}:\n`
      : `Available commands in ${context}:\n`;

    const rows = commands.map(cmd => {
      const aliases = cmd.aliases ? ` (${cmd.aliases.join(', ')})` : '';
      return `  ${cmd.name.padEnd(15)} ${cmd.description}${aliases}`;
    });

    return header + '\n' + rows.join('\n');
  }
}

// ── Singleton Instance ─────────────────────────────────────────────
export const contextRegistry = new ContextRegistry();

// ── Helper Functions ───────────────────────────────────────────────
export function getContextPrompt(
  context: MsfContextType,
  session?: MsfSession
): string {
  switch (context) {
    case 'msfconsole':
      return 'msf6 > ';
    case 'module':
      return 'msf6 exploit(...) > ';
    case 'meterpreter':
      return 'meterpreter > ';
    case 'windows_shell':
      return 'C:\\Windows\\system32> ';
    case 'linux_shell':
      return 'root@target:~# ';
    default:
      return '> ';
  }
}

export function formatContextHelp(
  state: MsfState,
  registry: ContextRegistry,
  language: 'en' | 'es' = 'en'
): string {
  const context = registry.detectContext(state, state.sessions?.find(
    s => s.id === state.currentSessionId
  ));
  
  return registry.formatHelp(context, language);
}

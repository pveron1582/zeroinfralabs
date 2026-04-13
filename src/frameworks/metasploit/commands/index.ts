// ── frameworks/metasploit/commands/index.ts ────────────────────────
// Command registry for Metasploit Framework
// Phase 5a: Context-aware command registration

// Session commands (Phase 2)
export {
  executeSessionsCommand,
  executeBackgroundCommand,
  executeExitSessionCommand,
  cmd_sessions,
  cmd_background,
} from './sessions';

// Context Registry (Phase 3) — Foundation for context-aware commands
// The ContextRegistry provides hierarchical command resolution:
//   msf6 >          → use, search, show, exploit, sessions
//   meterpreter >   → sysinfo, getuid, ps, shell, background
//   C:\Windows\...  → dir, ipconfig, whoami, exit
export {
  contextRegistry,
  getContextPrompt,
  formatContextHelp,
} from '../core/ContextRegistry';

export type {
  MsfCommand,
  MsfCommandContext,
  MsfContextType,
} from '../core/ContextRegistry';

// Phase 5a/b: Native Context-aware commands (new system)
// These commands use the new MsfCommand interface
export { cmd_search } from './cmd_search';
export { cmd_use } from './cmd_use';
export { cmd_set } from './cmd_set';
export { cmd_back } from './cmd_back';
export { cmd_show } from './cmd_show';
export { cmd_info } from './cmd_info';
export { cmd_unset } from './cmd_unset';
export { cmd_clear } from './cmd_clear';
export { cmd_exit, cmd_quit } from './cmd_exit';
export { cmd_banner } from './cmd_banner';

// Phase 5b: Meterpreter commands
export { cmd_getuid } from './cmd_getuid';
export { cmd_sysinfo } from './cmd_sysinfo';
export { cmd_ps } from './cmd_ps';
export { cmd_hashdump } from './cmd_hashdump';
export { cmd_shell } from './cmd_shell';

// Phase 5a/b: Command registration helper
export { registerNativeCommands } from './registerCommands';

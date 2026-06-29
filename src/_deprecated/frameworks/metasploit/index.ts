// ── frameworks/metasploit/index.ts ─────────────────────────────────
// Main entry point for Metasploit Framework

// Core exports
export {
  moduleRegistry,
  loadModule,
  initializeModuleLoader,
  getModuleStats,
  shortModuleName,
  moduleTypeDisplay,
  validateModuleOptions,
} from './core';

// Module exports
export {
  ALL_MODULES,
  INITIAL_STATE,
} from './modules';

export type {
  MsfModule,
  ModuleType,
  MsfState,
  MsfSession,
  CommandContext,
} from './modules';

// Individual module exports (for direct access)
export {
  ms17_010_eternalblue,
  smb_ms17_010,
  meterpreter_reverse_tcp_x64,
  meterpreter_reverse_tcp_x86,
} from './modules/data';

// Commands
export {
  executeSessionsCommand,
  executeBackgroundCommand,
  executeExitSessionCommand,
  cmd_sessions,
  cmd_background,
} from './commands';

// Note: Shells (FTP, SSH, Netcat) are in ../shells/
// and will be integrated via SessionManager in Phase 2

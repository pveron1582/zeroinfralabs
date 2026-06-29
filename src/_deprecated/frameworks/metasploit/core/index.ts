// ── frameworks/metasploit/core/index.ts ────────────────────────────
// Core exports for Metasploit Framework

export {
  moduleRegistry,
  loadModule,
  initializeModuleLoader,
  getModuleStats,
  shortModuleName,
  moduleTypeDisplay,
  validateModuleOptions,
} from './ModuleLoader';

export type { MsfModule, ModuleType } from './ModuleLoader';

export {
  SessionManager,
  createSessionManager,
  formatSessionsList,
  type MsfSessionType,
  type MsfSessionContext,
} from './SessionManager';

export {
  contextRegistry,
  getContextPrompt,
  formatContextHelp,
  type MsfCommand,
  type MsfCommandContext,
  type MsfContextType,
} from './ContextRegistry';

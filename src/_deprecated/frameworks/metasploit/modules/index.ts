// ── frameworks/metasploit/modules/index.ts ─────────────────────────
// Module exports for Metasploit Framework

export type {
  // Module types
  ModuleType,
  ModuleRank,
  ModuleOption,
  ModuleOptions,
  BaseModule,
  AuxiliaryModule,
  ExploitModule,
  PayloadModule,
  PostModule,
  MsfModule,
  
  // Results
  AuxiliaryResult,
  ExploitResult,
  CheckResult,
  PostResult,
  
  // State
  MsfState,
  MsfSession,
  CommandContext,
} from './types';

export { INITIAL_STATE } from './types';

// Export module data
export { ALL_MODULES } from './data';

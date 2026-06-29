// ── frameworks/metasploit/modules/types.ts ─────────────────────────
// Type definitions for MSF modules with support for dynamic loading

// ── Common Module Types ───────────────────────────────────────────
export type ModuleType = 'auxiliary' | 'exploit' | 'post' | 'payload' | 'encoder' | 'nop';
export type ModuleRank = 'normal' | 'average' | 'great' | 'excellent' | 'manual';

// ── Module Options ───────────────────────────────────────────────
export interface ModuleOption {
  name: string;
  description: string;
  type?: 'string' | 'integer' | 'boolean' | 'enum';
  default?: string;
  required?: boolean;
  enumValues?: string[];  // For enum type
}

export type ModuleOptions = Record<string, ModuleOption>;

// ── Base Module Interface ─────────────────────────────────────────
export interface BaseModule {
  path: string;              // Full path: auxiliary/scanner/smb/smb_ms17_010
  type: ModuleType;
  name: string;              // Human-readable name
  description: string;
  rank: ModuleRank;
  authors?: string[];
  references?: string[];     // CVE, MSB, etc.
  license?: string;
  
  // Options configurable via 'set' command
  options: ModuleOptions;
  
  // Default option values
  defaultOptions?: Record<string, string>;
}

// ── Auxiliary Module ───────────────────────────────────────────────
export interface AuxiliaryModule extends BaseModule {
  type: 'auxiliary';
  
  // What this auxiliary module does
  action?: string;           // scan, dos, gather, etc.
  
  // Execution logic
  execute: (state: MsfState, ctx: CommandContext, options: Record<string, string>) => AuxiliaryResult;
  
  // Check if target is vulnerable (if applicable)
  check?: (state: MsfState, ctx: CommandContext, options: Record<string, string>) => CheckResult;
}

// ── Exploit Module ─────────────────────────────────────────────────
export interface ExploitModule extends BaseModule {
  type: 'exploit';
  
  // Target compatibility
  platform: string;          // windows, linux, multi, etc.
  arch?: string;            // x86, x64, arm, etc.
  
  // Compatible payloads
  compatiblePayloads: string[];  // Paths like 'payload/windows/x64/meterpreter/reverse_tcp'
  
  // Default payload when selected
  defaultPayload?: string;
  
  // Execution logic - returns a session if successful
  execute: (state: MsfState, ctx: CommandContext, options: Record<string, string>, payload: string) => ExploitResult;
  
  // Check if target is vulnerable
  check?: (state: MsfState, ctx: CommandContext, options: Record<string, string>) => CheckResult;
}

// ── Payload Module ─────────────────────────────────────────────────
export interface PayloadModule extends BaseModule {
  type: 'payload';
  
  platform: string;
  arch: string;
  
  // Connection type
  connectionType: 'reverse' | 'bind' | 'inline';
  
  // Required options for this payload
  requiredOptions: string[];  // e.g., ['LHOST', 'LPORT']
  
  // Generate payload description
  generateDescription: (options: Record<string, string>) => string;
}

// ── Post Module ────────────────────────────────────────────────────
export interface PostModule extends BaseModule {
  type: 'post';
  
  platform: string;
  
  // Requires an existing session
  requiresSession: boolean;
  
  // Execution logic
  execute: (state: MsfState, ctx: CommandContext, options: Record<string, string>, sessionId?: string) => PostResult;
}

// ── Union Type for All Modules ─────────────────────────────────────
export type MsfModule = AuxiliaryModule | ExploitModule | PayloadModule | PostModule;

// ── Execution Results ─────────────────────────────────────────────
export interface AuxiliaryResult {
  success: boolean;
  output: string;
  // For scanners - what was discovered
  discoveredHosts?: string[];
  discoveredVulnerabilities?: string[];
  // For gather modules - what was collected
  collectedData?: Record<string, unknown>;
}

export interface ExploitResult {
  success: boolean;
  output: string;
  // If exploit succeeded, a session was created
  sessionCreated?: boolean;
  sessionType?: 'meterpreter' | 'shell';
  sessionId?: number;
  targetInfo?: {
    ip: string;
    os?: string;
    arch?: string;
  };
}

export interface CheckResult {
  vulnerable: boolean;
  output: string;
  details?: string;
}

export interface PostResult {
  success: boolean;
  output: string;
  // Post modules might collect credentials, hashes, etc.
  credentials?: { user: string; hash?: string; password?: string }[];
  files?: string[];
}

// ── Module Index ───────────────────────────────────────────────────
export interface ModuleIndex {
  modules: Map<string, MsfModule>;  // path -> module
  byType: Record<ModuleType, string[]>;  // type -> array of paths
  byPlatform: Record<string, string[]>;  // platform -> array of paths
}

// ── Legacy Support: MsfState ──────────────────────────────────────
// Extended for Context Registry support
export interface MsfState {
  active: boolean;          // Inside msfconsole session
  module?: string | MsfModule;  // Currently selected module (path or full object)
  moduleType?: ModuleType;  // Type of selected module
  options: Record<string, string>;  // Legacy option values
  moduleOptions?: Record<string, string>;  // New: module-specific options
  
  // Session state
  sessionOpen: boolean;     // Active meterpreter/shell session
  shellMode: boolean;       // In Windows cmd shell from meterpreter
  
  // Progress tracking (for labs)
  auxChecked: boolean;      // Auxiliary check was run
  uidChecked: boolean;      // getuid executed in meterpreter
  hashdumpExecuted?: boolean;
  
  // Search results
  lastSearchResults?: string[];
  
  // Session management (new)
  sessions?: MsfSession[];
  currentSessionId?: number;
}

export interface MsfSession {
  id: number;
  type: 'meterpreter' | 'shell';
  targetIp: string;
  targetInfo?: {
    computer?: string;
    os?: string;
    arch?: string;
    username?: string;
    isSystem?: boolean;
  };
  // For background sessions
  isBackgrounded?: boolean;
}

export const INITIAL_STATE: MsfState = {
  active: true,
  options: {},
  sessionOpen: false,
  shellMode: false,
  auxChecked: false,
  uidChecked: false,
  sessions: [],
};

// ── Command Context (from existing types) ──────────────────────────
// Re-declaring minimal version here to avoid circular dependencies during migration
export interface CommandContext {
  machine: unknown;
  allMachines: unknown[];
  currentMissionId: number;
  currentDir: string;
  setCurrentDir?: (dir: string) => void;
  ftpSession?: unknown;
  language?: 'en' | 'es';
}

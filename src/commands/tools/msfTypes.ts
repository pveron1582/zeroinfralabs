// ── commands/tools/msfTypes.ts ────────────────────────────────────
// Type definitions for MSF state and responses
// Phase 5a: Updated for ContextRegistry compatibility

export interface MsfState {
  active: boolean;          // inside msfconsole session
  module?: string | unknown; // currently selected module path (or MsfModule object)
  moduleType?: string;      // auxiliary | exploit | post
  options: Record<string, string>; // RHOSTS, RPORT, LHOST, PAYLOAD…
  moduleOptions?: Record<string, string>; // module-specific options (Phase 5a)
  sessionOpen: boolean;     // meterpreter/shell session established
  shellMode: boolean;       // dropped into Windows cmd shell via 'shell' cmd
  auxChecked: boolean;      // auxiliary smb_ms17_010 ran successfully
  uidChecked: boolean;      // getuid executed in meterpreter
  hashdumpExecuted?: boolean; // hashdump was executed
  lastSearchResults?: string[]; // paths from last search command
  // Session management (Phase 2)
  sessions?: unknown[];    // MsfSession[]
  currentSessionId?: number;
}

export const INITIAL_STATE: MsfState = {
  active: true,
  options: {},
  sessionOpen: false,
  shellMode: false,
  auxChecked: false,
  uidChecked: false,
};

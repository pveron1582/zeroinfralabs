// ── commands/tools/msfTypes.ts ────────────────────────────────────
// Type definitions for MSF state and responses

export interface MsfState {
  active: boolean;          // inside msfconsole session
  module?: string;          // currently selected module path
  moduleType?: string;      // auxiliary | exploit | post
  options: Record<string, string>; // RHOSTS, RPORT, LHOST, PAYLOAD…
  sessionOpen: boolean;     // meterpreter/shell session established
  shellMode: boolean;       // dropped into Windows cmd shell via 'shell' cmd
  auxChecked: boolean;      // auxiliary smb_ms17_010 ran successfully
  uidChecked: boolean;      // getuid executed in meterpreter
  lastSearchResults?: string[]; // paths from last search command
}

export const INITIAL_STATE: MsfState = {
  active: true,
  options: {},
  sessionOpen: false,
  shellMode: false,
  auxChecked: false,
  uidChecked: false,
};

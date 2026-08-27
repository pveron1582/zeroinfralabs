// ── types/msf.ts ──────────────────────────────────────────────────
// Estado de Metasploit compartido: única fuente de verdad para el store
// (slices), el executor, los hooks y frameworks/metasploit.
// Antes vivía duplicado en frameworks/metasploit/core/msfTypes.ts y se
// importaba desde commands/tools/msfconsole (ver mejoras_glm.md P1-11).

export interface MsfSession {
  id: number;
  type: 'meterpreter' | 'shell';
  targetInfo?: { os?: string };
}

export interface MsfState {
  active: boolean;
  module?: string;
  moduleType?: string;
  options: Record<string, string>;
  moduleOptions?: Record<string, string>;
  sessionOpen: boolean;
  shellMode: boolean;
  auxChecked: boolean;
  uidChecked: boolean;
  hashdumpExecuted?: boolean;
  lastSearchResults?: string[];
  sessions?: MsfSession[];
  currentSessionId?: number;
}
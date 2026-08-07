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

export const INITIAL_STATE: MsfState = {
  active: true,
  options: {},
  sessionOpen: false,
  shellMode: false,
  auxChecked: false,
  uidChecked: false,
};

export interface MsfState {
  active: boolean;
  module?: string | unknown;
  moduleType?: string;
  options: Record<string, string>;
  moduleOptions?: Record<string, string>;
  sessionOpen: boolean;
  shellMode: boolean;
  auxChecked: boolean;
  uidChecked: boolean;
  hashdumpExecuted?: boolean;
  lastSearchResults?: string[];
  sessions?: unknown[];
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

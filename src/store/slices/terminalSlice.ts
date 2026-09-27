import type { StateCreator } from 'zustand';
import type { ScenarioState, FtpSessionState, SshSessionState, RdpSessionState } from '../types';
import type { BlockingCommand, MsfState, PsState } from '../../types';

export interface ActiveTerminal {
  id: string;
  termNumber: number;
  machineId: string;
}

export interface TerminalSlice {
  listeningPort: number | null;
  blockingCommand: BlockingCommand | null;
  currentDir: string;
  msfState: MsfState | null;
  psState: PsState | null;
  ftpSession: FtpSessionState | null;
  sshSession: SshSessionState | null;
  rdpSession: RdpSessionState | null;
  activeTerminals: Record<string, ActiveTerminal>;
  hasHadTerminals: boolean;
  // Marca del último reset global de managers compartidos (shells, red,
  // procesos, cron, mounts, identidad). Evita que el montaje de una segunda
  // terminal (o la llegada de una máquina nueva) reinicie el laboratorio:
  // el reset solo corre UNA vez por escenario. No se persiste.
  globalResetDoneForScenario: string | null;

  setMsfState: (state: MsfState | null) => void;
  setPsState: (state: PsState | null) => void;
  setFtpSession: (session: FtpSessionState | null) => void;
  setSshSession: (session: SshSessionState | null) => void;
  setRdpSession: (session: RdpSessionState | null) => void;
  setListeningPort: (port: number | null) => void;
  setBlockingCommand: (command: BlockingCommand | null) => void;
  setCurrentDir: (dir: string) => void;
  markGlobalResetDone: (scenarioId: string) => void;
  registerTerminal: (id: string, termNumber: number, machineId: string) => void;
  unregisterTerminal: (id: string) => void;
  setTerminalMachine: (id: string, machineId: string) => void;
  resetTerminalState: () => Pick<TerminalSlice, 'listeningPort' | 'blockingCommand' | 'msfState' | 'psState' | 'ftpSession' | 'sshSession' | 'rdpSession' | 'activeTerminals' | 'hasHadTerminals' | 'globalResetDoneForScenario'>;
}

export const createTerminalSlice: StateCreator<ScenarioState, [], [], TerminalSlice> = (set) => ({
  listeningPort: null,
  blockingCommand: null,
  currentDir: '/root',
  msfState: null,
  psState: null,
  ftpSession: null,
  sshSession: null,
  rdpSession: null,
  activeTerminals: {},
  hasHadTerminals: false,
  globalResetDoneForScenario: null,

  setMsfState: (state) => set({ msfState: state }),
  setPsState: (state) => set({ psState: state }),
  setFtpSession: (session) => set({ ftpSession: session }),
  setSshSession: (session) => set({ sshSession: session }),
  setRdpSession: (session) => set({ rdpSession: session }),
  setListeningPort: (port) => set({ listeningPort: port }),
  setBlockingCommand: (command) => set({ blockingCommand: command }),
  setCurrentDir: (dir) => set({ currentDir: dir }),
  markGlobalResetDone: (scenarioId) => set({ globalResetDoneForScenario: scenarioId }),

  registerTerminal: (id, termNumber, machineId) => set(state => ({
    hasHadTerminals: true,
    activeTerminals: {
      ...state.activeTerminals,
      [id]: { id, termNumber, machineId },
    },
  })),

  unregisterTerminal: (id) => set(state => {
    const next = { ...state.activeTerminals };
    delete next[id];
    return { activeTerminals: next };
  }),

  setTerminalMachine: (id, machineId) => set(state => {
    const current = state.activeTerminals[id];
    if (!current) return state;
    return {
      activeTerminals: {
        ...state.activeTerminals,
        [id]: { ...current, machineId },
      },
    };
  }),

  resetTerminalState: () => ({
    listeningPort: null,
    blockingCommand: null,
    msfState: null,
    psState: null,
    ftpSession: null,
    sshSession: null,
    rdpSession: null,
    activeTerminals: {},
    hasHadTerminals: false,
    globalResetDoneForScenario: null,
  }),
});

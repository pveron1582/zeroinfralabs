import type { StateCreator } from 'zustand';
import type { ScenarioState, FtpSessionState, SshSessionState } from '../types';
import type { BlockingCommand } from '../../types';
import type { MsfState } from '../../commands/tools/msfconsole';

export interface TerminalSlice {
  listeningPort: number | null;
  blockingCommand: BlockingCommand | null;
  currentDir: string;
  msfState: MsfState | null;
  ftpSession: FtpSessionState | null;
  sshSession: SshSessionState | null;

  setMsfState: (state: MsfState | null) => void;
  setFtpSession: (session: FtpSessionState | null) => void;
  setSshSession: (session: SshSessionState | null) => void;
  setListeningPort: (port: number | null) => void;
  setBlockingCommand: (command: BlockingCommand | null) => void;
  setCurrentDir: (dir: string) => void;
}

export const createTerminalSlice: StateCreator<ScenarioState, [], [], TerminalSlice> = (set) => ({
  listeningPort: null,
  blockingCommand: null,
  currentDir: '/root',
  msfState: null,
  ftpSession: null,
  sshSession: null,

  setMsfState: (state) => set({ msfState: state }),
  setFtpSession: (session) => set({ ftpSession: session }),
  setSshSession: (session) => set({ sshSession: session }),
  setListeningPort: (port) => set({ listeningPort: port }),
  setBlockingCommand: (command) => set({ blockingCommand: command }),
  setCurrentDir: (dir) => set({ currentDir: dir }),
});

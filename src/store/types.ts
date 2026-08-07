// ── store/types.ts ─────────────────────────────────────────────────
// Type definitions for the scenario store

import type { Machine, Scenario, Mission, FileEntry, BlockingCommand, FtpSessionData, SshSessionData } from '../types';
import type { MsfState } from '../commands/tools/msfconsole';
import type { EnumerationSnapshot } from '../utils/networkAlert';
import type { IdentitySlice } from './slices/identitySlice';

export interface Notification {
  text: string;
  id: number;
}

export type FtpSessionState = FtpSessionData;
export type SshSessionState = SshSessionData;

export type AppView = 'landing' | 'workspace' | 'blog';

export interface ScenarioState extends IdentitySlice {
  view: AppView;
  setView: (view: AppView) => void;

  currentScenario: Scenario;
  machines: Machine[];
  missions: Mission[];
  currentMissionId: number;
  activeMachineId: string;

  activeApp: 'terminal' | 'browser';
  browserKey: number;
  showNetworkMap: boolean;
  hasNewNetworkInfo: boolean;
  notification: Notification | null;
  termColor: string;
  showMachineLoader: boolean;
  loadingMachine: Machine | null;

  browserCurrentUrl: string;
  browserIsLoggedIn: boolean;
  browserNavHistory: string[];
  browserNavIdx: number;

  listeningPort: number | null;
  blockingCommand: BlockingCommand | null;

  currentDir: string;

  msfState: MsfState | null;

  ftpSession: FtpSessionState | null;

  sshSession: SshSessionState | null;

  _prevMachinesSnapshot: EnumerationSnapshot[];

  language: 'en' | 'es';
  setLanguage: (lang: 'en' | 'es') => void;

  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  uiMode: 'classic' | 'desktop';
  toggleUiMode: () => void;
  setUiMode: (mode: 'classic' | 'desktop') => void;

  showSurvey: boolean;
  pendingSurveyScenario: Scenario | null;
  triggerSurvey: (scenario: Scenario) => void;
  closeSurvey: () => void;

  showCompletionOverlay: boolean;
  setShowCompletionOverlay: (show: boolean) => void;

  foxyTourOpen: boolean;
  openFoxyTour: () => void;
  closeFoxyTour: () => void;

  selectScenario: (id: string) => void;
  completeMission: (id: number) => void;
  revealNextHint: (missionId: number) => void;
  findCredentials: (machineId: string, user: string, pass: string, file?: string, service?: string) => void;
  verifyCredentials: (machineId: string, service?: string) => void;
  setPossibleUsers: (machineId: string, users: string[]) => void;
  addFailedUser: (machineId: string, user: string) => void;
  setSudoPrivileges: (machineId: string, user: string, commands: string[], canSudo: boolean) => void;
  setPrivescCompleted: (machineId: string) => void;
  resetPrivescCompleted: (machineId: string) => void;
  setSuUser: (machineId: string, suUser?: string) => void;
  addFileToMachine: (machineId: string, file: FileEntry) => void;
  setMachineFiles: (machineId: string, files: FileEntry[]) => void;
  addExploredDirectory: (machineId: string, path: string) => void;
  confirmRCE: (machineId: string, user: string, method: string) => void;
  changeMachine: (machineId: string) => void;
  setActiveApp: (app: 'terminal' | 'browser') => void;
  refreshBrowser: () => void;
  toggleNetworkMap: (show?: boolean) => void;
  setTermColor: (color: string) => void;
  showNotification: (text: string) => void;
  clearNotification: () => void;
  goHome: () => void;
  resetWorkspace: () => void;
  getActiveMachine: () => Machine;
  getScenarioMachines: () => Machine[];
  setBrowserUrl: (url: string) => void;
  setBrowserLoggedIn: (loggedIn: boolean) => void;
  setBrowserNavHistory: (history: string[], idx: number) => void;
  setListeningPort: (port: number | null) => void;
  setBlockingCommand: (command: BlockingCommand | null) => void;
  setCurrentDir: (dir: string) => void;
  setMsfState: (state: MsfState | null) => void;
  setFtpSession: (session: FtpSessionState | null) => void;
  setSshSession: (session: SshSessionState | null) => void;
  reportVulnerability: (machineId: string, vulnId: string, status: 'detected' | 'confirmed') => void;
}

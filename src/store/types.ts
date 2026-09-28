// ── store/types.ts ─────────────────────────────────────────────────
// Type definitions for the scenario store

import type { Machine, Scenario, Mission, FileEntry, FtpSessionData, SshSessionData, RdpSessionData } from '../types';
import type { EnumerationSnapshot } from '../utils/networkAlert';
import type { IdentitySlice } from './slices/identitySlice';
import type { AcademySlice } from './slices/academySlice';
import type { UISlice } from './slices/uiSlice';
import type { TerminalSlice } from './slices/terminalSlice';
import type { ScenarioSlice } from './slices/scenarioSlice';

export interface Notification {
  text: string;
  id: number;
}

export type FtpSessionState = FtpSessionData;
export type SshSessionState = SshSessionData;
export type RdpSessionState = RdpSessionData;

export type AppView = 'landing' | 'workspace' | 'blog';

export interface ScenarioState extends IdentitySlice, AcademySlice, TerminalSlice {
  view: AppView;
  setView: (view: AppView) => void;

  currentScenario: Scenario;
  machines: Machine[];
  missions: Mission[];
  currentMissionId: number;
  activeMachineId: string;

  activeApp: 'terminal' | 'browser' | 'burpsuite';
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

  // Note: listeningPort, blockingCommand, currentDir, msfState, psState,
  // ftpSession, sshSession, rdpSession, globalResetDoneForScenario,
  // activeTerminals, hasHadTerminals and their setters/actions are all
  // inherited from TerminalSlice above.

  _prevMachinesSnapshot: EnumerationSnapshot[];

  language: 'en' | 'es';
  setLanguage: (lang: 'en' | 'es') => void;

  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  uiMode: 'classic' | 'desktop' | 'windows-desktop';
  _prevUiMode: 'classic' | 'desktop' | null;
  rdpMachineId: string | null;
  toggleUiMode: () => void;
  setUiMode: (mode: 'classic' | 'desktop' | 'windows-desktop') => void;
  openWindowsDesktop: (machineId: string) => void;
  closeWindowsDesktop: () => void;

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
  setActiveApp: (app: 'terminal' | 'browser' | 'burpsuite') => void;
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
  // setListeningPort, setBlockingCommand, setCurrentDir, setMsfState, setPsState,
  // setFtpSession, setSshSession, setRdpSession, markGlobalResetDone,
  // registerTerminal, unregisterTerminal, setTerminalMachine
  // → all inherited from TerminalSlice
  reportVulnerability: (machineId: string, vulnId: string, status: 'detected' | 'confirmed') => void;

  resetUiState: () => Pick<UISlice, 'view' | 'showNetworkMap' | 'hasNewNetworkInfo' | 'notification' | 'browserCurrentUrl' | 'browserIsLoggedIn' | 'browserNavHistory' | 'browserNavIdx' | 'showSurvey' | 'pendingSurveyScenario' | 'showCompletionOverlay' | 'rdpMachineId' | 'showMachineLoader' | 'loadingMachine'> & Partial<Pick<UISlice, 'uiMode' | '_prevUiMode'>>;
  resetTerminalState: () => Pick<TerminalSlice, 'listeningPort' | 'blockingCommand' | 'msfState' | 'psState' | 'ftpSession' | 'sshSession' | 'rdpSession' | 'activeTerminals' | 'hasHadTerminals' | 'globalResetDoneForScenario'>;
  resetScenarioWorkspaceState: () => Pick<ScenarioSlice, '_prevMachinesSnapshot'>;
}

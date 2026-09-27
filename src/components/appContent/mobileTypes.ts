// ── components/appContent/mobileTypes.ts ──────────────────────────
// Tipos compartidos por MobileWorkspace y sus sub-componentes.

import type { Machine, Mission, Scenario } from '../../types';

export interface MobileWorkspaceProps {
  scenarioId: string;
  scenarioName: string;
  scenarioCategory: string;
  networkRange: string;
  machines: Machine[];
  missions: Mission[];
  activeMachineId: string;
  currentMissionId: number;
  activeApp: string;
  termColor: string;
  scenario: Scenario;
  currentScenario: Scenario;
  msfState: unknown;
  ftpSession: unknown;
  onMissionComplete: (...args: any[]) => void;
  onCredentialsFound: (...args: any[]) => void;
  onVerifyCredentials: (...args: any[]) => void;
  onChangeMachine: (...args: any[]) => void;
  onFailedUser: (...args: any[]) => void;
  onSudoPrivileges: (...args: any[]) => void;
  onSetActiveApp: (app: 'terminal' | 'browser' | 'burpsuite') => void;
  onRefreshBrowser: () => void;
  onGoHome: () => void;
  onToggleNetworkMap: (open: boolean) => void;
  onExit: () => void;
}

export type MobileWindow = {
  id: string;
  type: 'terminal' | 'browser' | 'burpsuite' | 'network' | 'enumeration';
  title: string;
  machineId?: string;
  termNumber?: number;
};

// ── components/appContent/WorkspaceBody.tsx ──────────────────────
// Cuerpo del workspace desktop: rama según uiMode (classic / desktop
// / windows-desktop). Extraído de AppContent para mantenerlo <300.

import type { Machine, Scenario, CommandResponse } from '../../types';
import { Terminal } from '../Terminal';
import { DesktopTerminal } from '../DesktopTerminal';
import { WindowsDesktop } from '../WindowsDesktop';
import { FakeBrowser } from '../FakeBrowser';
import { BurpSuite } from '../burpsuite';
import { MachineLoader } from '../MachineLoader';
import { DEFAULT_WALLPAPER } from '../desktopWallpapers';

interface Props {
  uiMode: string;
  rdpMachine: Machine | null;
  activeMachine: Machine;
  machines: Machine[];
  currentScenario: Scenario;
  currentMissionId: number;
  activeApp: string;
  browserKey: number;
  showMachineLoader: boolean;
  loadingMachine: Machine | null;
  language: 'en' | 'es';
  termColor: string;
  completeMission: (id: number) => void;
  findCredentials: (
    machineId: string, user: string, pass: string, file?: string, service?: string,
  ) => void;
  verifyCredentials?: (machineId: string, service?: string) => void;
  changeMachine: (id: string) => void;
  addFailedUser?: (machineId: string, user: string) => void;
  setSudoPrivileges?: (
    machineId: string, user: string, commands: string[], canSudo: boolean,
  ) => void;
  setPossibleUsers: (machineId: string, users: string[]) => void;
  reportVulnerability: (machineId: string, vulnId: string, status: 'detected' | 'confirmed') => void;
  setActiveApp: (app: 'terminal' | 'browser' | 'burpsuite') => void;
  closeWindowsDesktop: () => void;
  onRequestExit: () => void;
  openFoxyTour: () => void;
  checkMissionCompletion: (result: CommandResponse) => void;
}

export function WorkspaceBody(p: Props) {
  const termProps = {
    scenarioId: p.currentScenario.id,
    allMachines: p.machines,
    currentMissionId: p.currentMissionId,
    // Classic: una sola terminal — id fijo para aislar sesiones igual que desktop.
    terminalId: 'classic-terminal',
    onMissionComplete: p.completeMission,
    onCredentialsFound: p.findCredentials,
    onVerifyCredentials: p.verifyCredentials,
    onChangeMachine: p.changeMachine,
    onFailedUser: p.addFailedUser,
    onSudoPrivileges: p.setSudoPrivileges,
    termColor: p.termColor,
  };

  if (p.uiMode === 'windows-desktop' && p.rdpMachine) {
    return (
      <div className="flex-1 overflow-hidden relative">
        <WindowsDesktop
          {...termProps}
          machine={p.rdpMachine}
          desktopMachine={p.rdpMachine}
          onDisconnect={p.closeWindowsDesktop}
        />
      </div>
    );
  }

  if (p.uiMode === 'classic') {
    return (
      <>
        <div className={`flex-1 overflow-hidden ${p.activeApp !== 'terminal' ? 'hidden' : ''}`}>
          {p.showMachineLoader && p.loadingMachine ? (
            <div className="h-full w-full" style={DEFAULT_WALLPAPER.style}>
              <MachineLoader
                machineName={p.loadingMachine.machine_info.hostname}
                machineIp={p.loadingMachine.machine_info.ip}
                machineOs={p.loadingMachine.machine_info.os}
                onComplete={() => {}}
                language={p.language}
              />
            </div>
          ) : (
            <Terminal {...termProps} machine={p.activeMachine} />
          )}
        </div>

        {p.currentScenario.category === 'Web' && (
          <div className={`flex-1 overflow-hidden ${p.activeApp !== 'browser' ? 'hidden' : ''}`}>
            <FakeBrowser
              key={p.browserKey}
              allMachines={p.machines}
              onClose={() => p.setActiveApp('terminal')}
              onMissionComplete={p.completeMission}
              onCredentialsFound={p.findCredentials}
              onVerifyCredentials={p.verifyCredentials ?? (() => {})}
              scenarioHasWeb
              onSetPossibleUsers={p.setPossibleUsers}
              onReportVulnerability={p.reportVulnerability}
              checkMissionCompletion={p.checkMissionCompletion}
            />
          </div>
        )}

        {p.currentScenario.category === 'Web' && (
          <div className={`flex-1 overflow-hidden ${p.activeApp !== 'burpsuite' ? 'hidden' : ''}`}>
            <BurpSuite
              allMachines={p.machines}
              onClose={() => p.setActiveApp('terminal')}
              onReportVulnerability={p.reportVulnerability}
              onCredentialsFound={p.findCredentials}
              checkMissionCompletion={p.checkMissionCompletion}
            />
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex-1 overflow-hidden relative">
      <DesktopTerminal
        {...termProps}
        machine={p.activeMachine}
        onRequestExit={p.onRequestExit}
        onOpenTour={p.openFoxyTour}
      />
    </div>
  );
}

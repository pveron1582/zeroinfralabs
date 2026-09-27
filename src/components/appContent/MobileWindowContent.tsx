// ── components/appContent/MobileWindowContent.tsx ─────────────────
// Renderiza el cuerpo de una ventana del workspace móvil según su tipo
// (terminal / navegador / topología / enumeración / Burp).

import { Terminal } from '../Terminal';
import { FakeBrowser } from '../FakeBrowser';
import { BurpSuite } from '../burpsuite';
import { NetworkMap } from '../NetworkMap';
import { EnumerationPanel } from '../EnumerationPanel';
import { useScenarioStore } from '../../store/scenarioStore';
import type { CommandResponse, Machine, Scenario } from '../../types';
import type { MobileWindow, MobileWorkspaceProps } from './mobileTypes';

interface MobileWindowContentProps {
  win: MobileWindow;
  active: boolean;
  ws: MobileWorkspaceProps;
  initialMachineId: string;
  keyInsert: string | null;
  checkMissionCompletion: (result: CommandResponse) => void;
  closeWindow: (id: string) => void;
  onChangeWindowMachine: (windowId: string, newMachineId: string) => void;
}

export function MobileWindowContent({ win, active, ws, initialMachineId, keyInsert, checkMissionCompletion, closeWindow, onChangeWindowMachine }: MobileWindowContentProps) {
  return (
    <div className={`flex-1 min-h-0 flex flex-col overflow-hidden ${active ? '' : 'hidden'}`}>
      {win.type === 'terminal' ? (
        <Terminal
          scenarioId={ws.scenarioId}
          machine={(win.machineId && ws.machines.find(m => m.id === win.machineId)) || ws.machines.find(m => m.id === initialMachineId) || ws.machines[0]}
          allMachines={ws.machines}
          currentMissionId={ws.currentMissionId}
          onMissionComplete={ws.onMissionComplete as (id: number) => void}
          onCredentialsFound={ws.onCredentialsFound as (a: string, b: string, c: string) => void}
          onVerifyCredentials={ws.onVerifyCredentials as (a: string, b?: string) => void}
          onChangeMachine={(newMid) => onChangeWindowMachine(win.id, newMid)}
          onFailedUser={ws.onFailedUser as (a: string, b: string) => void}
          onSudoPrivileges={ws.onSudoPrivileges as (a: string, b: string, c: string[], d: boolean) => void}
          termColor={ws.termColor}
          terminalId={win.id}
          fontSize={13}
          compactHeader
          isMobileKey={active ? keyInsert : null}
        />
      ) : win.type === 'browser' ? (
        <FakeBrowser
          key={win.id}
          compact
          allMachines={ws.machines}
          onClose={() => closeWindow(win.id)}
          onMissionComplete={ws.onMissionComplete as (id: number) => void}
          onCredentialsFound={ws.onCredentialsFound as any}
          onVerifyCredentials={(ws.onVerifyCredentials as any) ?? (() => {})}
          scenarioHasWeb={true}
          onSetPossibleUsers={useScenarioStore.getState().setPossibleUsers}
          onReportVulnerability={useScenarioStore.getState().reportVulnerability}
          checkMissionCompletion={checkMissionCompletion}
        />
      ) : win.type === 'network' ? (
        <div className="flex-1 min-h-0 relative bg-gray-950 overflow-hidden">
          <NetworkMap
            compact
            scenario={{ ...ws.scenario, machines: ws.machines } as Scenario & { machines: Machine[] }}
            activeMachineId={ws.activeMachineId}
            msfState={ws.msfState as any}
            ftpSession={ws.ftpSession as any}
            onClose={() => closeWindow(win.id)}
          />
        </div>
      ) : win.type === 'enumeration' ? (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-gray-900">
          {(() => {
            const target = ws.machines.find(m => !m.id.includes('attacker')) || ws.machines[0];
            return (
              <>
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900 flex-shrink-0">
                  <span className="text-sm font-bold text-white truncate">{target.machine_info.hostname}</span>
                  <button type="button" onClick={() => closeWindow(win.id)} className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 flex items-center justify-center shrink-0 ml-2">×</button>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto">
                  <EnumerationPanel
                    inline
                    hideHeader
                    machine={target}
                    msfState={ws.msfState as any}
                    onClose={() => closeWindow(win.id)}
                  />
                </div>
              </>
            );
          })()}
        </div>
      ) : (
        <BurpSuite
          key={win.id}
          allMachines={ws.machines}
          onClose={() => closeWindow(win.id)}
          onReportVulnerability={useScenarioStore.getState().reportVulnerability}
          onCredentialsFound={ws.onCredentialsFound as any}
          checkMissionCompletion={checkMissionCompletion}
        />
      )}
    </div>
  );
}

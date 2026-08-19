// ── components/academy/LabMiniTerminal.tsx ─────────────────────────
// Terminal funcional de un lab, embebida inline en una lección.
// Sin overlay: vive en el flujo del contenido, bajo el "practical exercise".
// Chrome estilo ventana oscura, como los demos del landing.

import { useEffect, useRef } from 'react';
import { useScenarioStore } from '../../store/scenarioStore';
import { Terminal } from '../Terminal';
import { SCENARIOS } from '../../laboratorios/laboratorios';
import { FONT_MONO, FONT_SANS } from '../landing/constants';

interface LabMiniTerminalProps {
  labId: string;
  isEs: boolean;
}

export function LabMiniTerminal({ labId, isEs }: LabMiniTerminalProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const scenario = SCENARIOS.find(s => s.id === labId);
    if (!scenario) {
      console.warn(`[Academy] Lab "${labId}" no existe en SCENARIOS`);
      return;
    }

    useScenarioStore.setState({
      currentScenario: scenario,
      machines: scenario.machines.map(m => ({ ...m, discovery_level: 0 })),
      missions: scenario.missions.map(m => ({ ...m, status: 'pending' as const })),
      currentMissionId: 0,
      activeMachineId: scenario.initialMachineId,
      activeApp: 'terminal',
      showNetworkMap: false,
      hasNewNetworkInfo: false,
      msfState: null,
      ftpSession: null,
      sshSession: null,
      currentDir: '/root/',
      _prevMachinesSnapshot: [],
      showCompletionOverlay: false,
      showSurvey: false,
      pendingSurveyScenario: null,
    });

    return () => {
      initialized.current = false;
    };
  }, [labId]);

  const machines = useScenarioStore(s => s.machines);
  const activeMachineId = useScenarioStore(s => s.activeMachineId);
  const activeMachine = machines.find(m => m.id === activeMachineId) || machines[0];

  const {
    findCredentials,
    verifyCredentials,
    changeMachine,
    addFailedUser,
    setSudoPrivileges,
  } = useScenarioStore.getState();

  if (!activeMachine) return null;

  return (
    <div
      className="rounded-xl overflow-hidden border shadow-2xl"
      style={{ borderColor: '#1e293b', fontFamily: FONT_SANS }}
    >
      {/* Barra título estilo ventana */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/95 border-b border-slate-800/80">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        <span className="ml-2 text-[11px] text-slate-300" style={{ fontFamily: FONT_MONO }}>
          root@kali — {isEs ? 'modo práctica' : 'practice mode'}
        </span>
        <span className="ml-auto text-[10px] text-slate-500" style={{ fontFamily: FONT_MONO }}>
          {activeMachine.machine_info.hostname} ({activeMachine.machine_info.ip})
        </span>
      </div>

      {/* Terminal inline */}
      <div style={{ height: '320px' }}>
        <Terminal
          scenarioId={labId}
          machine={activeMachine}
          allMachines={machines}
          currentMissionId={0}
          onMissionComplete={() => {}}
          onCredentialsFound={findCredentials}
          onVerifyCredentials={verifyCredentials}
          onChangeMachine={changeMachine}
          onFailedUser={addFailedUser}
          onSudoPrivileges={setSudoPrivileges}
          isWindowed={true}
          fontSize={12}
          opacity={0.98}
          termColor="green"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 text-[10px] bg-slate-900/95 border-t border-slate-800/80" style={{ color: '#64748b', fontFamily: FONT_MONO }}>
        <span>{isEs ? 'Terminal real del lab — los comandos funcionan' : 'Real lab terminal — commands work'}</span>
      </div>
    </div>
  );
}

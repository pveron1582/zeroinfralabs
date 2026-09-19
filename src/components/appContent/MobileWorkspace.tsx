// ── components/appContent/MobileWorkspace.tsx ────────────────────
// Layout móvil para el simulador: branch de AppContent en <768px.
// Reusa Terminal + MissionPanel en drawer + KeyRow, sin duplicar lógica.

import { useState } from 'react';
import { Terminal } from '../Terminal';
import { MissionPanel } from '../MissionPanel';
import type { Machine, Mission } from '../../types';
import { useLanguage } from '../../i18n/translations';

interface MobileWorkspaceProps {
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

function MobileKeyRow({ onInsert }: { onInsert: (text: string) => void }) {
  const keys = [
    { label: 'Tab', insert: '\t' },
    { label: '|', insert: ' | ' },
    { label: '-', insert: '-' },
    { label: '/', insert: '/' },
    { label: '--', insert: '--' },
    { label: 'Ctrl+C', insert: '__CTRL_C__' },
    { label: '↑', insert: '__ARROW_UP__' },
    { label: 'clear', insert: 'clear' },
  ];
  return (
    <div className="flex items-center gap-1.5 px-2 py-2 border-t border-gray-800 bg-gray-900 overflow-x-auto scrollbar-thin flex-shrink-0">
      {keys.map(k => (
        <button
          key={k.label}
          type="button"
          onClick={() => onInsert(k.insert)}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs font-mono text-gray-300 active:bg-gray-700 active:scale-95 transition-all"
        >
          {k.label}
        </button>
      ))}
    </div>
  );
}

function MobileMissionBar({ networkRange, missions, onToggle }: { networkRange: string; missions: Mission[]; onToggle: () => void }) {
  const completed = missions.filter(m => m.status === 'completed').length;
  const total = missions.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const language = useLanguage();
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-3 px-3 py-2 border-b border-gray-800 bg-gray-900/80 backdrop-blur flex-shrink-0 w-full text-left"
    >
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <span className="text-xs font-mono text-emerald-300 font-semibold">{networkRange}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: '#10b981' }} />
        </div>
        <div className="text-[11px] text-gray-500 mt-0.5">{completed}/{total} · {pct}% · {language === 'es' ? 'Misiones' : 'Missions'}</div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
  );
}

export function MobileWorkspace(props: MobileWorkspaceProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [keyInsert, setKeyInsert] = useState<string | null>(null);

  const activeMachine = props.machines.find(m => m.id === props.activeMachineId) || props.machines[0];

  const handleKeyInsert = (text: string) => {
    setKeyInsert(text);
    // reset after one tick so Terminal can consume it
    setTimeout(() => setKeyInsert(null), 50);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-950">
      {/* Banner honesto */}
      <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[11px] leading-relaxed text-amber-200 flex-shrink-0">
        <span className="font-semibold">Experiencia óptima en desktop.</span> En móvil podés explorar misiones y usar el terminal básico. Para labs completos (Burp, NetworkMap) recomendamos desktop.
      </div>

      <MobileMissionBar networkRange={props.networkRange} missions={props.missions} onToggle={() => setDrawerOpen(v => !v)} />

      {drawerOpen && (
        <div className="border-b border-gray-800 max-h-[45vh] overflow-y-auto flex-shrink-0 bg-gray-900">
          <MissionPanel
            missions={props.missions}
            allMachines={props.machines}
            networkRange={props.networkRange}
            onOpenBrowser={() => { setDrawerOpen(false); props.onSetActiveApp('browser'); }}
            onOpenNetworkMap={() => props.onToggleNetworkMap(true)}
            onExit={props.onExit}
          />
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col">
        <Terminal
          scenarioId={props.scenarioId}
          machine={activeMachine}
          allMachines={props.machines}
          currentMissionId={props.currentMissionId}
          onMissionComplete={props.onMissionComplete}
          onCredentialsFound={props.onCredentialsFound}
          onVerifyCredentials={props.onVerifyCredentials}
          onChangeMachine={props.onChangeMachine}
          onFailedUser={props.onFailedUser}
          onSudoPrivileges={props.onSudoPrivileges}
          termColor={props.termColor}
          fontSize={13}
          isMobileKey={keyInsert}
        />
      </div>

      <MobileKeyRow onInsert={handleKeyInsert} />

      {/* Tabs inferiores minimalistas para browser/burpsuite si es lab Web */}
      {props.scenarioCategory === 'Web' && (
        <div className="flex items-center gap-1 px-2 py-1.5 border-t border-gray-800 bg-gray-950 flex-shrink-0">
          <button
            onClick={() => props.onSetActiveApp('terminal')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium ${props.activeApp === 'terminal' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
          >
            Terminal
          </button>
          <button
            onClick={() => props.onSetActiveApp('browser')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium ${props.activeApp === 'browser' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
          >
            Browser
          </button>
          <button
            onClick={() => props.onSetActiveApp('burpsuite')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium ${props.activeApp === 'burpsuite' ? 'bg-orange-900 text-orange-200' : 'text-gray-500'}`}
          >
            Burp
          </button>
        </div>
      )}
    </div>
  );
}

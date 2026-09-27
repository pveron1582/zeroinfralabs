// ── components/appContent/MobileWorkspace.tsx ────────────────────
// Layout móvil: top bar con tabs de ventanas (hasta 5 terminales / 2 browsers)
// + botón + para agregar, y botón lateral para MissionPanel (ayuda).
// Cada ventana conserva estado (Terminal con terminalId aislado, Browser/Burp con key).

import { useState } from 'react';
import { useScenarioStore } from '../../store/scenarioStore';
import { useMissionCompletion } from '../../hooks/useMissionCompletion';
import { useMobileWindows } from '../../hooks/useMobileWindows';
import { MobileKeyRow } from './MobileKeyRow';
import { MobileAddMenu } from './MobileAddMenu';
import { MobileExperiencePopup } from './MobileExperiencePopup';
import { MobileHelpDrawer, type MobileHelpWindowType } from './MobileHelpDrawer';
import { MobileWindowContent } from './MobileWindowContent';
import type { MobileWorkspaceProps } from './mobileTypes';

export function MobileWorkspace(props: MobileWorkspaceProps) {
  const language = useScenarioStore(s => s.language);
  const isEs = language === 'es';
  const { checkMissionCompletion } = useMissionCompletion(props.onMissionComplete as (id: number) => void);

  const initialMachineId = props.currentScenario.initialMachineId || 'attacker-01';
  const {
    windows, activeId, setActiveId, activeWindow, termCount, browserCount,
    addTerminal, addBrowser, addNetwork, addEnumeration,
    closeWindow, selectWindow, handleTerminalChangeMachine,
  } = useMobileWindows({ initialMachineId, onChangeMachine: props.onChangeMachine });

  const [helpOpen, setHelpOpen] = useState(false);
  const [keyInsert, setKeyInsert] = useState<string | null>(null);

  const openFromHelp = (type: MobileHelpWindowType) => {
    setHelpOpen(false);
    const existing = windows.find(x => x.type === type);
    if (existing) {
      setActiveId(existing.id);
    } else if (type === 'browser') {
      addBrowser();
    } else if (type === 'network') {
      addNetwork();
    } else {
      addEnumeration();
    }
  };

  const handleKeyInsert = (text: string) => {
    setKeyInsert(text);
    setTimeout(() => setKeyInsert(null), 50);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-950 relative overflow-hidden">
      {/* Top bar scrollable con tabs — barra 2 de 3, fija */}
      <div className="flex items-center gap-1.5 px-2 py-2 border-b border-gray-800 bg-gray-900 flex-shrink-0 overflow-x-auto scrollbar-thin">
        <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto scrollbar-thin">
          {windows.map(w => (
            <button
              key={w.id}
              type="button"
              onClick={() => selectWindow(w.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${activeId === w.id ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`}
            >
              {w.type === 'terminal' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
              ) : w.type === 'browser' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
              ) : w.type === 'network' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="2" width="6" height="6"/><rect x="2" y="16" width="6" height="6"/><rect x="16" y="16" width="6" height="6"/></svg>
              ) : w.type === 'enumeration' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
              )}
              <span className="max-w-[90px] truncate">{w.title}</span>
              {windows.length > 1 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={e => { e.stopPropagation(); closeWindow(w.id); }}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); closeWindow(w.id); } }}
                  className="ml-1 w-4 h-4 rounded flex items-center justify-center hover:bg-black/20 text-gray-400 hover:text-white"
                  aria-label="Cerrar"
                >
                  ×
                </span>
              )}
            </button>
          ))}
        </div>
        <MobileAddMenu
          onAddTerminal={addTerminal}
          onAddBrowser={addBrowser}
          showBrowser={props.scenarioCategory === 'Web'}
          canAddTerm={termCount < 5}
          canAddBrowser={browserCount < 2}
        />
      </div>

      {/* Popup de experiencia al cargar lab: se cierra y no vuelve en la sesión */}
      <MobileExperiencePopup scenarioId={props.scenarioId} isEs={isEs} />

      {/* Ventanas: todas montadas, solo activa visible para preservar estado — ventana negra con alto fijo */}
      <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
        {windows.map(w => (
          <MobileWindowContent
            key={w.id}
            win={w}
            active={activeWindow?.id === w.id}
            ws={props}
            initialMachineId={initialMachineId}
            keyInsert={keyInsert}
            checkMissionCompletion={checkMissionCompletion}
            closeWindow={closeWindow}
            onChangeWindowMachine={handleTerminalChangeMachine}
          />
        ))}

        {/* Botón lateral AYUDA — oculto en Topología y Enumeración */}
        {activeWindow?.type !== 'network' && activeWindow?.type !== 'enumeration' && (
          <button
            type="button"
            onClick={() => setHelpOpen(v => !v)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-7 h-16 rounded-l-xl bg-gray-800/90 backdrop-blur border border-r-0 border-gray-700 flex flex-col items-center justify-center gap-1 shadow-lg active:scale-95 transition-transform"
            aria-label={isEs ? 'Abrir ayuda' : 'Open help'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span className="text-[9px] font-bold text-gray-300" style={{ writingMode: 'vertical-rl' }}>{isEs ? 'AYUDA' : 'HELP'}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><polyline points={helpOpen ? "9 18 15 12 9 6" : "15 18 9 12 15 6"}/></svg>
          </button>
        )}
      </div>

      {activeWindow?.type === 'terminal' && <MobileKeyRow onInsert={handleKeyInsert} />}

      {/* Drawer de ayuda: ocupa todo el ancho con animación de desplazamiento */}
      <MobileHelpDrawer
        open={helpOpen}
        isEs={isEs}
        missions={props.missions}
        allMachines={props.machines}
        networkRange={props.networkRange}
        onExit={props.onExit}
        onClose={() => setHelpOpen(false)}
        onOpenWindow={openFromHelp}
      />
    </div>
  );
}

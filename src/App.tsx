// ── App.tsx ───────────────────────────────────────────────────────
// Componente raíz que usa Zustand para el estado global

import { useEffect } from 'react';
import { useScenarioStore } from './store/scenarioStore';
import { SCENARIOS } from './laboratorios/laboratorios';
import { resetMsfState, restoreMsfState, getMsfState } from './commands';
import { LandingPage }  from './components/LandingPage';
import { Terminal }     from './components/Terminal';
import { FakeBrowser }  from './components/FakeBrowser';
import { MissionPanel } from './components/MissionPanel';
import { NetworkMap }   from './components/NetworkMap';
import { MachineLoader } from './components/MachineLoader';

// ── Constantes de UI ───────────────────────────────────────────────
const TERM_COLORS = [
  { label: 'Verde',   value: '#10b981' },
  { label: 'Blanco',  value: '#e5e7eb' },
  { label: 'Naranja', value: '#f97316' },
  { label: 'Azul',    value: '#60a5fa' },
];

export default function App() {
  // ── Selectores del Store ────────────────────────────────────────
  const view = useScenarioStore(state => state.view);
  const currentScenario = useScenarioStore(state => state.currentScenario);
  const machines = useScenarioStore(state => state.machines);
  const missions = useScenarioStore(state => state.missions);
  const activeMachineId = useScenarioStore(state => state.activeMachineId);
  const activeApp = useScenarioStore(state => state.activeApp);
  const browserKey = useScenarioStore(state => state.browserKey);
  const showNetworkMap = useScenarioStore(state => state.showNetworkMap);
  const notification = useScenarioStore(state => state.notification);
  const termColor = useScenarioStore(state => state.termColor);
  const showMachineLoader = useScenarioStore(state => state.showMachineLoader);
  const loadingMachine = useScenarioStore(state => state.loadingMachine);
  const msfState = useScenarioStore(state => state.msfState);
  const ftpSession = useScenarioStore(state => state.ftpSession);

  // ── Actions del Store ───────────────────────────────────────────
  const setActiveApp = useScenarioStore(state => state.setActiveApp);
  const refreshBrowser = useScenarioStore(state => state.refreshBrowser);
  const toggleNetworkMap = useScenarioStore(state => state.toggleNetworkMap);
  const setTermColor = useScenarioStore(state => state.setTermColor);
  const goHome = useScenarioStore(state => state.goHome);
  const selectScenario = useScenarioStore(state => state.selectScenario);
  const completeMission = useScenarioStore(state => state.completeMission);
  const findCredentials = useScenarioStore(state => state.findCredentials);
  const verifyCredentials = useScenarioStore(state => state.verifyCredentials);
  const changeMachine = useScenarioStore(state => state.changeMachine);
  const setView = useScenarioStore(state => state.setView);
  const setPossibleUsers = useScenarioStore(state => state.setPossibleUsers);
  const addFailedUser = useScenarioStore(state => state.addFailedUser);

  const currentMissionId = useScenarioStore(state => state.currentMissionId);

  const activeMachine = machines.find(m => m.id === activeMachineId) || machines[0];

  // ── Inicializar desde historial ────────────────────────────────
  useEffect(() => {
    if (window.history.state?.view === 'workspace' && window.history.state.scenarioId) {
      const scenario = SCENARIOS.find(s => s.id === window.history.state.scenarioId);
      if (scenario) {
        setView('workspace');
      }
    }
  }, [setView]);

  // ── Escuchar botón Atrás/Adelante del navegador ─────────────────
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (e.state?.view === 'workspace' && e.state.scenarioId) {
        // Usuario presionó Adelante para volver al workspace
        const scenario = SCENARIOS.find(s => s.id === e.state.scenarioId);
        if (scenario) {
          setView('workspace');
        }
      } else {
        // Usuario presionó Atrás para ir al landing
        goHome();
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [goHome, setView]);

  // ── Reset MSF state al cambiar de escenario ─────────────────────
  useEffect(() => {
    resetMsfState();
  }, [currentScenario.id]);

  // ── Restore MSF state from store on mount ───────────────────────
  useEffect(() => {
    restoreMsfState(msfState);
  }, [msfState]);

  // ── Derived props para FakeBrowser ─────────────────────────────
  const wpMachine = machines.find(m => m.web_enumeration?.cms?.toLowerCase().includes('wordpress'));
  const wpDiscoveryLevel = wpMachine?.discovery_level ?? 0;
  const mission3Already = missions.some(m => m.id === 3 && m.status === 'completed');

  // ── Landing ─────────────────────────────────────────────────────
  if (view === 'landing') {
    return (
      <>
        <LandingPage
          scenarios={SCENARIOS}
          onSelect={(id) => {
            resetMsfState();
            selectScenario(id);
          }}
        />
        {showMachineLoader && loadingMachine && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <MachineLoader
              machineName={loadingMachine.machine_info.hostname}
              machineIp={loadingMachine.machine_info.ip}
              machineOs={loadingMachine.machine_info.os}
              onComplete={() => {}}
            />
          </div>
        )}
      </>
    );
  }

  // ── Workspace ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 md:p-6"
      style={{ fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace" }}>

      {/* ── Top bar ── */}
      <div className="w-full max-w-6xl mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={goHome}
            className="flex items-center gap-2 px-2 py-1 rounded-lg transition-colors hover:bg-gray-800 group"
            title="Volver al menú">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center group-hover:bg-emerald-400 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <polyline points="8 10 12 14 8 18"/><rect x="2" y="3" width="20" height="18" rx="2"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-200 tracking-tight group-hover:text-white transition-colors">ZI Labs</span>
            <span className="text-xs text-gray-600">v4.5</span>
          </button>

          <div className="h-4 w-px bg-gray-700" />

          <div className="flex items-center gap-2">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span className="text-xs text-gray-400 font-mono">{currentScenario.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="font-mono">{currentScenario.network_range}</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Online</span>
          </div>
          <button onClick={goHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-gray-800 hover:text-gray-200 hover:border-gray-600"
            style={{ borderColor: '#374151', color: '#6b7280' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Menú
          </button>
        </div>
      </div>

      {/* ── Workspace window ── */}
      <div className="w-full max-w-6xl flex flex-col bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 relative"
        style={{ height: 'calc(100vh - 8rem)', minHeight: '520px' }}>

        {/* ── Kali Linux taskbar ── */}
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-gray-800 flex-shrink-0 select-none"
          style={{ background: '#0d1117' }}>
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: '#1a73e8' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-400" style={{ fontFamily: 'sans-serif' }}>Kali</span>
          </div>
          <div className="w-px h-4 bg-gray-800 mx-1" />

          {/* Terminal button */}
          <button onClick={() => setActiveApp('terminal')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${activeApp === 'terminal' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
            </svg>
            <span style={{ fontFamily: 'sans-serif' }}>Terminal</span>
            {activeApp === 'terminal' && <div className="w-1 h-1 rounded-full bg-emerald-400 ml-0.5" />}
          </button>

          {/* Firefox button — solo en escenarios Web */}
          {currentScenario.category === 'Web' && (
          <button onClick={() => { refreshBrowser(); setActiveApp('browser'); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${activeApp === 'browser' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
            <span style={{ fontFamily: 'sans-serif' }}>Firefox ESR</span>
            {activeApp === 'browser' && <div className="w-1 h-1 rounded-full bg-emerald-400 ml-0.5" />}
          </button>
          )}

          {/* Color picker */}
          <div className="ml-auto flex items-center gap-1.5">
            {TERM_COLORS.map(c => (
              <button key={c.value} title={c.label}
                onClick={() => setTermColor(c.value)}
                className="w-4 h-4 rounded-full border transition-all"
                style={{
                  background: c.value,
                  borderColor: termColor === c.value ? '#fff' : 'transparent',
                  boxShadow: termColor === c.value ? `0 0 0 1px ${c.value}` : 'none',
                  transform: termColor === c.value ? 'scale(1.25)' : 'scale(1)',
                }} />
            ))}
          </div>
          <div className="ml-3 text-xs text-gray-600 font-mono" style={{ fontFamily: 'sans-serif' }}>
            {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* ── Main content area ── */}
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 flex flex-col relative overflow-hidden min-w-0">

            {/* Terminal */}
            <div className={`flex-1 overflow-hidden ${activeApp !== 'terminal' ? 'hidden' : ''}`}>
              {showMachineLoader && loadingMachine ? (
                <MachineLoader
                  machineName={loadingMachine.machine_info.hostname}
                  machineIp={loadingMachine.machine_info.ip}
                  machineOs={loadingMachine.machine_info.os}
                  onComplete={() => {}}
                />
              ) : (
                <Terminal
                  scenarioId={currentScenario.id}
                  machine={activeMachine}
                  allMachines={machines}
                  currentMissionId={currentMissionId}
                  onMissionComplete={completeMission}
                  onCredentialsFound={findCredentials}
                  onVerifyCredentials={verifyCredentials}
                  onChangeMachine={changeMachine}
                  onFailedUser={addFailedUser}
                  termColor={termColor}
                />
              )}
            </div>

            {/* Browser — solo para escenarios Web */}
            {currentScenario.category === 'Web' && (
            <div className={`flex-1 overflow-hidden ${activeApp !== 'browser' ? 'hidden' : ''}`}>
              <FakeBrowser
                key={browserKey}
                allMachines={machines}
                onClose={() => setActiveApp('terminal')}
                onMissionComplete={completeMission}
                onCredentialsFound={findCredentials}
                onVerifyCredentials={verifyCredentials}
                scenarioHasWeb={true}
                wpDiscoveryLevel={wpDiscoveryLevel}
                mission3Already={mission3Already}
                onSetPossibleUsers={setPossibleUsers}
              />
            </div>
            )}
          </div>

          <MissionPanel
            missions={missions}
            allMachines={machines}
            networkRange={currentScenario.network_range}
            onOpenBrowser={() => setActiveApp('browser')}
            onOpenNetworkMap={() => toggleNetworkMap(true)}
          />
        </div>

        {showNetworkMap && (
          <NetworkMap
            scenario={{ ...currentScenario, machines }}
            activeMachineId={activeMachineId}
            msfState={getMsfState()}
            ftpSession={ftpSession}
            onClose={() => toggleNetworkMap(false)}
          />
        )}
      </div>

      {/* ── Toast ── */}
      {notification && (
        <div key={notification.id}
          className="fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 bg-emerald-900 border border-emerald-500/50 rounded-xl shadow-2xl text-emerald-300 text-sm font-medium z-50"
          style={{ animation: 'slideUpNotif 0.3s ease-out' }}>
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          {notification.text}
        </div>
      )}

      <style>{`
        @keyframes slideUpNotif { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
        * { box-sizing: border-box }
        ::-webkit-scrollbar { width: 4px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px }
      `}</style>
    </div>
  );
}

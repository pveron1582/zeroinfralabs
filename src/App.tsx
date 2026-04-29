// ── App.tsx ───────────────────────────────────────────────────────
// Componente raíz que usa Zustand para el estado global

import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useScenarioStore } from './store/scenarioStore';
import { SCENARIOS, TEST_SCENARIO } from './laboratorios/laboratorios';
import { resetMsfState, restoreMsfState, getMsfState } from './commands';
import { LandingPage }  from './components/LandingPage';
import { LabGrid }      from './components/LabGrid';
import { Terminal }     from './components/Terminal';
import { FakeBrowser }  from './components/FakeBrowser';
import { MissionPanel } from './components/MissionPanel';
import { NetworkMap }   from './components/NetworkMap';
import { MachineLoader } from './components/MachineLoader';
import { SurveyModal }  from './components/SurveyModal';
import { LabCompletionOverlay } from './components/LabCompletionOverlay';
import { BlogListPage } from './components/BlogListPage';
import { BlogArticlePage } from './components/BlogArticlePage';
import { trackEvent, recordLabStart }   from './utils/analytics';

// ── Test Lab Component ───────────────────────────────────────────
function TestLab() {
  const { selectScenario, setView } = useScenarioStore();

  useEffect(() => {
    // Force clear any persisted state before loading test scenario
    localStorage.clear();
    console.log('Loading TEST_SCENARIO:', TEST_SCENARIO);
    console.log('TEST_SCENARIO category:', TEST_SCENARIO.category);
    setTimeout(() => {
      console.log('Selecting scenario:', TEST_SCENARIO.id);
      selectScenario(TEST_SCENARIO.id);
      setView('workspace');
    }, 100);
  }, [selectScenario, setView]);

  return <AppContent />;
}

// ── Wrapper to force remount on every navigation ─────────────────
function ScenarioLauncherWrapper() {
  const location = useLocation();
  // Use location.key (unique per navigation) instead of pathname
  // so that re-selecting the same lab forces a fresh mount
  return <ScenarioLauncher key={location.key} />;
}

// ── Scenario Launcher (from /:lang/scenario/:id route) ────────────
function ScenarioLauncher() {
  const { lang, id } = useParams<{ lang: string; id: string }>();
  const navigate = useNavigate();
  const setLanguage = useScenarioStore(state => state.setLanguage);
  const showMachineLoader = useScenarioStore(state => state.showMachineLoader);
  const loadingMachine = useScenarioStore(state => state.loadingMachine);
  const view = useScenarioStore(state => state.view);
  const selectScenario = useScenarioStore(state => state.selectScenario);
  const machines = useScenarioStore(state => state.machines);
  const missions = useScenarioStore(state => state.missions);
  const activeMachineId = useScenarioStore(state => state.activeMachineId);
  const currentScenarioId = useScenarioStore(state => state.currentScenario?.id);

  // Set language SYNCHRONOUSLY before first render to avoid showing wrong language
  const langRef = useRef<string | null>(null);
  const validLang = (lang === 'es' ? 'es' : 'en') as 'en' | 'es';
  if (langRef.current !== validLang) {
    langRef.current = validLang;
    setLanguage(validLang);
  }

  useEffect(() => {
    if (!validLang || !id) return;

    const scenario = SCENARIOS.find(s => s.id === id);
    if (!scenario) {
      navigate(`/${validLang}/labs`, { replace: true });
      return;
    }

    // If scenario is already loaded and workspace is active, nothing to do
    if (currentScenarioId === id && view === 'workspace') {
      return;
    }

    console.log(`[ScenarioLauncher] Loading scenario: ${id}, lang: ${validLang}`);
    resetMsfState();
    selectScenario(scenario.id);
  }, [validLang, id]);

  console.log(`[ScenarioLauncher] Render: view=${view}, showMachineLoader=${showMachineLoader}, currentScenarioId=${currentScenarioId}, requestedId=${id}`);

  // Phase 1: Machine loader (6.5s animation)
  if (showMachineLoader && loadingMachine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950"
        style={{ fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace" }}>
        <MachineLoader
          machineName={loadingMachine.machine_info.hostname}
          machineIp={loadingMachine.machine_info.ip}
          machineOs={loadingMachine.machine_info.os}
          onComplete={() => {}}
          language={validLang}
        />
      </div>
    );
  }

  // Phase 2: Workspace loaded
  if (view === 'workspace' && activeMachineId && machines.length > 0 && missions.length > 0) {
    return <AppContent />;
  }

  // Phase 3: User exited lab (end command or menu button) → navigate to LabGrid
  if (view === 'landing') {
    // Navigate to the lab grid so the URL matches what the user sees
    // Use replace to avoid adding extra history entries
    const validNavLang = (lang === 'es' ? 'es' : 'en') as 'en' | 'es';
    navigate(`/${validNavLang}/labs`, { replace: true });
    // Show LabGrid while navigation happens (prevents flash of loading state)
    return <LabGrid />;
  }

  // Fallback: initial loading state (selectScenario was called but loader hasn't started yet)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950"
      style={{ fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace" }}>
      <div className="text-emerald-400 font-mono text-sm animate-pulse">Loading lab...</div>
    </div>
  );
}

// ── Constantes de UI ───────────────────────────────────────────────
const TERM_COLORS = [
  { label: 'Verde',   value: '#10b981' },
  { label: 'Blanco',  value: '#e5e7eb' },
  { label: 'Naranja', value: '#f97316' },
  { label: 'Azul',    value: '#60a5fa' },
];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/:lang" element={<LandingPage />} />
        <Route path="/:lang/labs" element={<LabGrid />} />
        <Route path="/:lang/scenario/:id" element={<ScenarioLauncherWrapper />} />
        <Route path="/:lang/blog" element={<BlogListPage />} />
        <Route path="/:lang/blog/:slug" element={<BlogArticlePage />} />
        <Route path="/test" element={<TestLab />} />
        <Route path="*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}

// ── Root Redirect — detects browser language or uses stored preference ──
function RootRedirect() {
  const storedLanguage = useScenarioStore(state => state.language);

  // Detect browser language on first visit
  const detectedLang = (() => {
    // If user has a stored preference that's not the default, use it
    if (storedLanguage && storedLanguage !== 'en') {
      return storedLanguage;
    }
    // Otherwise detect from browser
    const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
    // Spanish variants: es, es-ES, es-MX, es-AR, etc.
    if (browserLang.toLowerCase().startsWith('es')) {
      return 'es';
    }
    return 'en';
  })();

  return <Navigate to={`/${detectedLang}`} replace />;
}

export function AppContent() {
  // ── Router hooks ────────────────────────────────────────────────
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();

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
  const showSurvey = useScenarioStore(state => state.showSurvey);
  const pendingSurveyScenario = useScenarioStore(state => state.pendingSurveyScenario);
  const showCompletionOverlay = useScenarioStore(state => state.showCompletionOverlay);
  const setShowCompletionOverlay = useScenarioStore(state => state.setShowCompletionOverlay);
  const language = useScenarioStore(state => state.language);

  // ── Actions del Store ───────────────────────────────────────────
  const setActiveApp = useScenarioStore(state => state.setActiveApp);
  const refreshBrowser = useScenarioStore(state => state.refreshBrowser);
  const toggleNetworkMap = useScenarioStore(state => state.toggleNetworkMap);
  const setTermColor = useScenarioStore(state => state.setTermColor);
  const selectScenario = useScenarioStore(state => state.selectScenario);
  const completeMission = useScenarioStore(state => state.completeMission);
  const findCredentials = useScenarioStore(state => state.findCredentials);
  const verifyCredentials = useScenarioStore(state => state.verifyCredentials);
  const changeMachine = useScenarioStore(state => state.changeMachine);
  const setView = useScenarioStore(state => state.setView);
  const setPossibleUsers = useScenarioStore(state => state.setPossibleUsers);
  const addFailedUser = useScenarioStore(state => state.addFailedUser);
  const setSudoPrivileges = useScenarioStore(state => state.setSudoPrivileges);
  const reportVulnerability = useScenarioStore(state => state.reportVulnerability);

  const currentMissionId = useScenarioStore(state => state.currentMissionId);

  const activeMachine = machines.find(m => m.id === activeMachineId) || machines[0];

  // ── Handle goHome — reset state, ScenarioLauncher shows LabGrid ─
  const handleGoHome = () => {
    const completedCount = missions.filter(m => m.status === 'completed').length;
    const totalMissions = missions.length;
    const allComplete = totalMissions > 0 && completedCount === totalMissions;
    if (allComplete) {
      useScenarioStore.getState().triggerSurvey(currentScenario);
    } else {
      // Reset state directly WITHOUT calling goHome() (which triggers history.back())
      // ScenarioLauncher will detect view === 'landing' and show LabGrid
      useScenarioStore.setState({
        view: 'landing',
        showNetworkMap: false,
        hasNewNetworkInfo: false,
        notification: null,
        browserCurrentUrl: 'https://www.google.com',
        browserIsLoggedIn: false,
        browserNavHistory: ['https://www.google.com'],
        browserNavIdx: 0,
        listeningPort: null,
        msfState: null,
        showSurvey: false,
        pendingSurveyScenario: null,
        showCompletionOverlay: false,
        _prevMachinesSnapshot: [],
      });
    }
  };

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
        const scenario = SCENARIOS.find(s => s.id === e.state.scenarioId);
        if (scenario) {
          setView('workspace');
        }
      } else {
        // User navigated away from workspace — clean up and go to labs grid
        // Don't use goHome() because it calls history.back() which can cause loops
        useScenarioStore.setState({
          view: 'landing',
          showNetworkMap: false,
          hasNewNetworkInfo: false,
          notification: null,
          browserCurrentUrl: 'https://www.google.com',
          browserIsLoggedIn: false,
          browserNavHistory: ['https://www.google.com'],
          browserNavIdx: 0,
          listeningPort: null,
          msfState: null,
          showSurvey: false,
          pendingSurveyScenario: null,
          showCompletionOverlay: false,
          _prevMachinesSnapshot: [],
        });
        const validNavLang = (lang === 'es' ? 'es' : 'en') as 'en' | 'es';
        navigate(`/${validNavLang}/labs`, { replace: true });
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [navigate, lang, setView]);

  // ── Reset MSF state al cambiar de escenario ─────────────────────
  useEffect(() => {
    resetMsfState();
  }, [currentScenario.id]);

  // ── Restore MSF state from store on mount ───────────────────────
  useEffect(() => {
    restoreMsfState(msfState);
  }, [msfState]);

  // ── Track lab started ───────────────────────────────────────────
  useEffect(() => {
    if (view === 'workspace') {
      recordLabStart();
      trackEvent({
        eventType: 'lab_started',
        scenarioId: currentScenario.id,
        scenarioName: currentScenario.name,
        details: { missionCount: currentScenario.missions.length },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScenario.id]);

  // ── Track mission completions ────────────────────────────────────
  useEffect(() => {
    const completedCount = missions.filter(m => m.status === 'completed').length;
    if (completedCount > 0 && view === 'workspace') {
      const lastCompleted = missions.filter(m => m.status === 'completed').pop();
      if (lastCompleted) {
        trackEvent({
          eventType: 'mission_complete',
          scenarioId: currentScenario.id,
          scenarioName: currentScenario.name,
          details: { missionId: lastCompleted.id, missionTitle: lastCompleted.title },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missions.map(m => m.status).join(',')]);

  // ── Track lab abandonment / completion when going home ───────────
  const prevViewRef = useRef(view);
  useEffect(() => {
    if (prevViewRef.current === 'workspace' && view === 'landing') {
      const completedCount = missions.filter(m => m.status === 'completed').length;
      const totalMissions = missions.length;
      const allComplete = totalMissions > 0 && completedCount === totalMissions;

      if (allComplete) {
        trackEvent({
          eventType: 'lab_completed',
          scenarioId: currentScenario.id,
          scenarioName: currentScenario.name,
          details: { totalMissions },
        });
      } else if (completedCount > 0) {
        trackEvent({
          eventType: 'lab_abandoned',
          scenarioId: currentScenario.id,
          scenarioName: currentScenario.name,
          details: { completedCount, totalMissions },
        });
      } else {
        trackEvent({
          eventType: 'lab_changed',
          scenarioId: currentScenario.id,
          scenarioName: currentScenario.name,
          details: { completedCount, totalMissions },
        });
      }
    }
    prevViewRef.current = view;
  }, [view]);

  // ── Derived props para FakeBrowser ─────────────────────────────
  const wpMachine = machines.find(m => m.web_enumeration?.cms?.toLowerCase().includes('wordpress'));
  const wpDiscoveryLevel = wpMachine?.discovery_level ?? 0;
  const mission3Already = missions.some(m => m.id === 3 && m.status === 'completed');

  // ── Landing (fallback — normal routing goes through /:lang route) ───
  if (view === 'landing') {
    // Don't redirect if the machine loader is showing
    if (showMachineLoader && loadingMachine) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950"
          style={{ fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace" }}>
          <MachineLoader
            machineName={loadingMachine.machine_info.hostname}
            machineIp={loadingMachine.machine_info.ip}
            machineOs={loadingMachine.machine_info.os}
            onComplete={() => {}}
            language={language}
          />
        </div>
      );
    }
    // Redirect to lab grid instead of landing for faster navigation
    useEffect(() => {
      window.location.href = `/${language}/labs`;
    }, [language]);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-emerald-400 font-mono text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  // ── Workspace ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 md:p-6"
      style={{ fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace" }}>

      {/* ── Top bar ── */}
      <div className="w-full max-w-6xl mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={handleGoHome}
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
          <button onClick={handleGoHome}
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
          {(() => {
            console.log('Current scenario category:', currentScenario.category);
            return currentScenario.category === 'Web';
          })() && (
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
                  language={language}
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
                  onSudoPrivileges={setSudoPrivileges}
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
                onReportVulnerability={reportVulnerability}
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

      {/* ── Lab Completion Overlay ── */}
      {showCompletionOverlay && (
        <LabCompletionOverlay
          scenario={currentScenario}
          totalMissions={missions.length}
          completedCount={missions.filter(m => m.status === 'completed').length}
          onClose={() => setShowCompletionOverlay(false)}
          language={language}
        />
      )}

      {/* ── Survey Modal ── */}
      {showSurvey && pendingSurveyScenario && (
        <SurveyModal
          scenario={pendingSurveyScenario}
          onSubmit={() => {
            // Clean up all survey and workspace state
            useScenarioStore.setState({
              view: 'landing',
              showSurvey: false,
              pendingSurveyScenario: null,
              showCompletionOverlay: false,
              showNetworkMap: false,
              hasNewNetworkInfo: false,
              notification: null,
              browserCurrentUrl: 'https://www.google.com',
              browserIsLoggedIn: false,
              browserNavHistory: ['https://www.google.com'],
              browserNavIdx: 0,
              listeningPort: null,
              msfState: null,
              _prevMachinesSnapshot: [],
            });
            // Navigate directly to lab grid (avoid history.back() which can reload the same lab)
            const validLang = (lang === 'es' ? 'es' : 'en') as 'en' | 'es';
            navigate(`/${validLang}/labs`, { replace: true });
          }}
        />
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

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useScenarioStore } from '../store/scenarioStore';
import { SCENARIOS } from '../laboratorios/laboratorios';
import { DesktopTerminal } from './DesktopTerminal';
import { MissionPanel } from './MissionPanel';
import { NetworkMap } from './NetworkMap';
import { LabBuilder } from './admin/LabBuilder';
import { LessonBuilder } from './admin/LessonBuilder';
import { LoginScreen } from './admin/LoginScreen';
import { AdminHome } from './admin/AdminHome';
import { DebugPanel, type DebugTab } from './admin/DebugPanel';
import { MONO_FONT, ShieldIcon, LoadingView } from './admin/shared';

type AdminSection = 'home' | 'sandbox' | 'builder' | 'lessons';

export function AdminPanel() {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const validLang = (lang === 'es' ? 'es' : 'en') as 'en' | 'es';
  const isEs = validLang === 'es';

  const { setLanguage } = useScenarioStore(useShallow(s => ({
    setLanguage: s.setLanguage,
  })));

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [section, setSection] = useState<AdminSection>('home');

  const [selectedScenarioId, setSelectedScenarioId] = useState(SCENARIOS[0]?.id || '');
  const [scenarioLoaded, setScenarioLoaded] = useState(false);
  const [showDebug, setShowDebug] = useState(true);
  const [debugTab, setDebugTab] = useState<DebugTab>('store');

  const {
    currentScenario,
    machines,
    missions,
    activeMachineId,
    showNetworkMap,
    termColor,
    msfState,
    ftpSession,
    currentDir,
    currentMissionId,
  } = useScenarioStore(useShallow(s => ({
    currentScenario: s.currentScenario,
    machines: s.machines,
    missions: s.missions,
    activeMachineId: s.activeMachineId,
    showNetworkMap: s.showNetworkMap,
    termColor: s.termColor,
    msfState: s.msfState,
    ftpSession: s.ftpSession,
    currentDir: s.currentDir,
    currentMissionId: s.currentMissionId,
  })));

  const {
    completeMission,
    findCredentials,
    verifyCredentials,
    changeMachine,
    toggleNetworkMap,
    addFailedUser,
    setSudoPrivileges,
  } = useScenarioStore(useShallow(s => ({
    completeMission: s.completeMission,
    findCredentials: s.findCredentials,
    verifyCredentials: s.verifyCredentials,
    changeMachine: s.changeMachine,
    toggleNetworkMap: s.toggleNetworkMap,
    addFailedUser: s.addFailedUser,
    setSudoPrivileges: s.setSudoPrivileges,
  })));

  const activeMachine = machines.find(m => m.id === activeMachineId) || machines[0];

  useEffect(() => {
    if (validLang) setLanguage(validLang);
  }, [validLang, setLanguage]);

  const loadScenario = useCallback((scenarioId: string) => {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;

    useScenarioStore.setState({
      currentScenario: scenario,
      machines: scenario.machines.map(m => ({ ...m, discovery_level: 0 })),
      missions: scenario.missions.map((m, i) => ({
        ...m,
        status: i === 0 ? 'active' as const : 'pending' as const
      })),
      currentMissionId: 1,
      activeMachineId: scenario.initialMachineId,
      activeApp: 'terminal',
      showNetworkMap: false,
      hasNewNetworkInfo: false,
      view: 'workspace',
      showMachineLoader: false,
      loadingMachine: null,
      browserCurrentUrl: 'https://www.google.com',
      browserIsLoggedIn: false,
      browserNavHistory: ['https://www.google.com'],
      browserNavIdx: 0,
      listeningPort: null,
      blockingCommand: null,
      msfState: null,
      ftpSession: null,
      sshSession: null,
      currentDir: '/root/',
      _prevMachinesSnapshot: [],
      showCompletionOverlay: false,
    });

    setScenarioLoaded(true);
  }, []);

  useEffect(() => {
    if (section === 'sandbox' && !scenarioLoaded) {
      loadScenario(selectedScenarioId);
    }
  }, [section, scenarioLoaded, loadScenario, selectedScenarioId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === 'admin' && pass === 'admin') {
      setLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError(isEs ? 'Credenciales incorrectas' : 'Invalid credentials');
    }
  };

  const handleScenarioChange = (newId: string) => {
    setSelectedScenarioId(newId);
    setScenarioLoaded(false);
  };

  const getStoreSnapshot = () => {
    const s = useScenarioStore.getState();
    return {
      view: s.view,
      language: s.language,
      activeMachineId: s.activeMachineId,
      activeApp: s.activeApp,
      currentMissionId: s.currentMissionId,
      currentDir: s.currentDir,
      termColor: s.termColor,
      listeningPort: s.listeningPort,
      showNetworkMap: s.showNetworkMap,
      uiMode: s.uiMode,
      msfActive: s.msfState?.active || false,
      ftpActive: s.ftpSession?.active || false,
      sshActive: s.sshSession?.active || false,
    };
  };

  // ── LOGIN ──
  if (!loggedIn) {
    return (
      <LoginScreen
        isEs={isEs}
        user={user}
        pass={pass}
        loginError={loginError}
        setUser={setUser}
        setPass={setPass}
        onSubmit={handleLogin}
        onBackHome={() => navigate(`/${validLang}`)}
      />
    );
  }

  // ── HOME: hub de bienvenida ──
  if (section === 'home') {
    return (
      <AdminHome
        isEs={isEs}
        scenariosCount={SCENARIOS.length}
        onEnterSandbox={() => setSection('sandbox')}
        onEnterBuilder={() => setSection('builder')}
        onEnterLessons={() => setSection('lessons')}
        onExit={() => navigate(`/${validLang}`)}
      />
    );
  }

  // ── BUILDER: constructor de labs ──
  if (section === 'builder') {
    return <LabBuilder isEs={isEs} onBack={() => setSection('home')} />;
  }

  // ── LESSONS: constructor de lecciones ──
  if (section === 'lessons') {
    return <LessonBuilder isEs={isEs} onBack={() => setSection('home')} />;
  }

  // ── SANDBOX: workspace + debug ──
  if (!scenarioLoaded) {
    return <LoadingView text={isEs ? 'Cargando escenario...' : 'Loading scenario...'} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col" style={{ fontFamily: MONO_FONT }}>
      {/* Admin toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0 select-none" style={{ background: '#0d1117', borderBottom: '1px solid #1c2a2a' }}>
        <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: '#f59e0b' }}>
          <ShieldIcon size={10} />
        </div>
        <span className="text-xs font-bold text-amber-400">DEBUG</span>
        <select value={selectedScenarioId} onChange={e => handleScenarioChange(e.target.value)}
          className="ml-3 px-2 py-0.5 rounded text-[11px] bg-gray-900 text-gray-300 border outline-none"
          style={{ borderColor: '#1c2a2a' }}>
          {SCENARIOS.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <span className="text-[10px] text-gray-500 ml-2">{activeMachine?.machine_info?.hostname} ({activeMachine?.machine_info?.ip})</span>
        <span className="text-[10px] text-gray-600">dir: {currentDir}</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setSection('home')}
            className="text-[10px] px-2 py-1 rounded text-gray-400 hover:text-gray-200 transition-all"
            style={{ border: '1px solid #1c2a2a' }}>
            ← {isEs ? 'Panel' : 'Home'}
          </button>
          <button onClick={() => setShowDebug(!showDebug)}
            className="text-[10px] px-2 py-1 rounded transition-all"
            style={{ background: showDebug ? '#10b98120' : 'transparent', color: showDebug ? '#10b981' : '#6b7280', border: '1px solid #1c2a2a' }}>
            Debug {showDebug ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => navigate(`/${validLang}`)}
            className="text-[10px] px-2 py-1 rounded text-gray-500 hover:text-gray-300"
            style={{ border: '1px solid #1c2a2a' }}>
            Exit
          </button>
        </div>
      </div>

      {/* Main area: escritorio Linux completo + MissionPanel */}
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0 relative">
          <DesktopTerminal
            scenarioId={currentScenario?.id || ''}
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
        </div>
        <MissionPanel
          missions={missions}
          allMachines={machines}
          networkRange={currentScenario?.network_range || ''}
          onOpenBrowser={() => {}}
          onOpenNetworkMap={() => toggleNetworkMap(true)}
          onExit={() => useScenarioStore.getState().goHome()}
        />
      </div>

      {showNetworkMap && (
        <NetworkMap
          scenario={{ ...currentScenario, machines }}
          activeMachineId={activeMachineId}
          msfState={msfState}
          ftpSession={ftpSession}
          onClose={() => toggleNetworkMap(false)}
        />
      )}

      {/* ── Debug panel ── */}
      {showDebug && (
        <DebugPanel
          debugTab={debugTab}
          setDebugTab={setDebugTab}
          machines={machines}
          missions={missions}
          activeMachineId={activeMachineId}
          getStoreSnapshot={getStoreSnapshot}
        />
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useScenarioStore } from '../store/scenarioStore';
import { SCENARIOS } from '../laboratorios/laboratorios';
import { DesktopTerminal } from './DesktopTerminal';
import { MissionPanel } from './MissionPanel';
import { NetworkMap } from './NetworkMap';

type DebugTab = 'store' | 'machines' | 'missions';

export function AdminPanel() {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const validLang = (lang === 'es' ? 'es' : 'en') as 'en' | 'es';
  const language = useScenarioStore(s => s.language);
  const setLanguage = useScenarioStore(s => s.setLanguage);

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loginError, setLoginError] = useState('');

  const [selectedScenarioId, setSelectedScenarioId] = useState(SCENARIOS[0]?.id || '');
  const [scenarioLoaded, setScenarioLoaded] = useState(false);
  const [showDebug, setShowDebug] = useState(true);
  const [debugTab, setDebugTab] = useState<DebugTab>('store');

  const currentScenario = useScenarioStore(s => s.currentScenario);
  const machines = useScenarioStore(s => s.machines);
  const missions = useScenarioStore(s => s.missions);
  const activeMachineId = useScenarioStore(s => s.activeMachineId);
  const showNetworkMap = useScenarioStore(s => s.showNetworkMap);
  const termColor = useScenarioStore(s => s.termColor);
  const msfState = useScenarioStore(s => s.msfState);
  const ftpSession = useScenarioStore(s => s.ftpSession);
  const currentDir = useScenarioStore(s => s.currentDir);

  const completeMission = useScenarioStore(s => s.completeMission);
  const findCredentials = useScenarioStore(s => s.findCredentials);
  const verifyCredentials = useScenarioStore(s => s.verifyCredentials);
  const changeMachine = useScenarioStore(s => s.changeMachine);
  const toggleNetworkMap = useScenarioStore(s => s.toggleNetworkMap);
  const addFailedUser = useScenarioStore(s => s.addFailedUser);
  const setSudoPrivileges = useScenarioStore(s => s.setSudoPrivileges);

  const activeMachine = machines.find(m => m.id === activeMachineId) || machines[0];
  const currentMissionId = useScenarioStore(s => s.currentMissionId);

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
    if (loggedIn && !scenarioLoaded) {
      loadScenario(selectedScenarioId);
    }
  }, [loggedIn, scenarioLoaded, loadScenario, selectedScenarioId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === 'admin' && pass === 'admin') {
      setLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError(language === 'es' ? 'Credenciales incorrectas' : 'Invalid credentials');
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b1015', fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace" }}>
        <form onSubmit={handleLogin} className="p-8 rounded-2xl w-full max-w-sm" style={{ background: '#0d1117', border: '1px solid #1c2a2a' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#10b981', boxShadow: '0 0 14px #10b98138' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-200">Admin Panel</span>
          </div>
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1 block">Usuario</label>
            <input type="text" value={user} onChange={e => setUser(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm bg-gray-900 text-gray-200 border outline-none"
              style={{ borderColor: '#1c2a2a' }} placeholder="admin" />
          </div>
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1 block">Contraseña</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm bg-gray-900 text-gray-200 border outline-none"
              style={{ borderColor: '#1c2a2a' }} placeholder="admin" />
          </div>
          {loginError && <p className="text-red-400 text-xs mb-4">{loginError}</p>}
          <button type="submit"
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: '#10b981', color: '#fff' }}>
            {language === 'es' ? 'Ingresar' : 'Login'}
          </button>
          <button type="button" onClick={() => navigate(`/${validLang}`)}
            className="w-full mt-2 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 transition-all">
            ← {language === 'es' ? 'Volver al inicio' : 'Back to home'}
          </button>
        </form>
      </div>
    );
  }

  if (!scenarioLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b1015' }}>
        <div className="text-emerald-400 font-mono text-sm animate-pulse">
          {language === 'es' ? 'Cargando escenario...' : 'Loading scenario...'}
        </div>
      </div>
    );
  }

  // ── WORKSPACE + DEBUG ──
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col" style={{ fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace" }}>
      {/* Admin toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0 select-none" style={{ background: '#0d1117', borderBottom: '1px solid #1c2a2a' }}>
        <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: '#f59e0b' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
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

      {/* Main area: escitorio Linux completo + MissionPanel */}
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
        <div className="fixed bottom-4 left-4 z-50 flex flex-col shadow-2xl"
          style={{ width: '440px', maxHeight: '60vh', background: '#0d1117', border: '1px solid #f59e0b40', borderRadius: '12px', overflow: 'hidden' }}>
          
          <div className="flex items-center justify-between px-3 py-2" style={{ background: '#1c2a2a', borderBottom: '1px solid #f59e0b20' }}>
            <span className="text-xs font-bold text-amber-400">🐞 DEBUG</span>
            <div className="flex items-center gap-1">
              {(['store', 'machines', 'missions'] as DebugTab[]).map(t => (
                <button key={t} onClick={() => setDebugTab(t)}
                  className={`text-[10px] px-2 py-0.5 rounded ${debugTab === t ? 'bg-amber-500/20 text-amber-300' : 'text-gray-500 hover:text-gray-400'}`}>
                  {t === 'store' ? 'Store' : t === 'machines' ? 'Machines' : 'Missions'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-3 text-[10px]" style={{ maxHeight: 'calc(60vh - 36px)' }}>
            {debugTab === 'store' && (
              <pre style={{ color: '#10b981', whiteSpace: 'pre-wrap' }}>{JSON.stringify(getStoreSnapshot(), null, 2)}</pre>
            )}

            {debugTab === 'machines' && (
              <div style={{ color: '#e5e7eb' }}>
                {machines.map(m => (
                  <div key={m.id} className="mb-3 p-2 rounded" style={{ background: '#000' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-cyan-400">{m.machine_info.hostname}</span>
                      <span className="text-gray-500">({m.machine_info.ip})</span>
                      <span className={`px-1 rounded text-[9px] ${m.id === activeMachineId ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                        {m.id === activeMachineId ? 'ACTIVE' : 'inactive'}
                      </span>
                    </div>
                    <div className="text-gray-400">
                      OS: {m.machine_info.os} | MAC: {m.machine_info.mac} | Type: {m.machine_info.type}
                    </div>
                    <div className="text-gray-400">
                      discovery_level: {m.discovery_level} | status: {m.machine_info.status}
                    </div>
                    {m.scan_results?.ports && m.scan_results.ports.length > 0 && (
                      <div className="mt-1 text-gray-500">
                        Ports: {m.scan_results.ports.map(p => `${p.port}/${p.protocol}(${p.state})`).join(', ')}
                      </div>
                    )}
                    {m.found_credentials && m.found_credentials.length > 0 && (
                      <div className="mt-1 text-amber-500/80">
                        Creds: {m.found_credentials.map(c => `${c.user}:${c.pass} [${c.service}]`).join(', ')}
                      </div>
                    )}
                    {m.possible_ssh_users && m.possible_ssh_users.length > 0 && (
                      <div className="mt-1 text-orange-400/80">
                        SSH users: {m.possible_ssh_users.join(', ')}
                      </div>
                    )}
                    {m.sudo_privileges && (
                      <div className="mt-1 text-red-400/80">
                        Sudo: {m.sudo_privileges.user} can run: {m.sudo_privileges.commands.join(', ')}
                      </div>
                    )}
                    {m.files && m.files.length > 0 && (
                      <div className="mt-1 text-blue-400/60">
                        Files: {m.files.map(f => f.path).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {debugTab === 'missions' && (
              <div style={{ color: '#e5e7eb' }}>
                {missions.map(m => (
                  <div key={m.id} className="mb-2 p-2 rounded" style={{ background: '#000' }}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: m.status === 'completed' ? '#10b981' : m.status === 'active' ? '#f59e0b' : '#4b5563' }}>
                        #{m.id}
                      </span>
                      <span className="text-gray-300">{m.title}</span>
                      <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded ${
                        m.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        m.status === 'active' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-gray-800 text-gray-600'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                    <div className="text-[9px] text-gray-500 mt-0.5">
                      target: {m.targetMachineId} | level: {m.discoveryLevel}
                      {m.validationCriteria && ` | validate: ${m.validationCriteria.type}${m.validationCriteria.port ? ' port=' + m.validationCriteria.port : ''}${m.validationCriteria.targetIp ? ' ip=' + m.validationCriteria.targetIp : ''}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

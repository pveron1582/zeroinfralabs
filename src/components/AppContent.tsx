// ── components/AppContent.tsx ───────────────────────────────────────
// Main workspace content: terminal, browser, mission panel, etc.

import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useScenarioStore } from '../store/scenarioStore';
import { SCENARIOS } from '../laboratorios/laboratorios';
import { Terminal } from './Terminal';
import { DesktopTerminal } from './DesktopTerminal';
import { FakeBrowser } from './FakeBrowser';
import { MissionPanel } from './MissionPanel';
import { NetworkMap } from './NetworkMap';
import { MachineLoader } from './MachineLoader';
import { SurveyModal } from './SurveyModal';
import { LabCompletionOverlay } from './LabCompletionOverlay';
import { ExitConfirm } from './ExitConfirm';
import { FoxyTour } from './tour/FoxyTour';
import { DEFAULT_WALLPAPER } from './desktopWallpapers';
import { trackEvent, recordLabStart } from '../utils/analytics';

function ThemeSync() {
  const theme = useScenarioStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return null;
}

function RootRedirect() {
  const storedLanguage = useScenarioStore(state => state.language);

  const detectedLang = (() => {
    if (storedLanguage && storedLanguage !== 'en') {
      return storedLanguage;
    }
    const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
    if (browserLang.toLowerCase().startsWith('es')) {
      return 'es';
    }
    return 'en';
  })();

  return <Navigate to={`/${detectedLang}`} replace />;
}

export function AppContent() {
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();

  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const workspaceRef = useRef<HTMLDivElement>(null);

  const {
    view,
    currentScenario,
    machines,
    missions,
    activeMachineId,
    activeApp,
  } = useScenarioStore(useShallow(s => ({
    view: s.view,
    currentScenario: s.currentScenario,
    machines: s.machines,
    missions: s.missions,
    activeMachineId: s.activeMachineId,
    activeApp: s.activeApp,
  })));

  const {
    browserKey,
    showNetworkMap,
    notification,
    termColor,
    showMachineLoader,
    loadingMachine,
    msfState,
    ftpSession,
  } = useScenarioStore(useShallow(s => ({
    browserKey: s.browserKey,
    showNetworkMap: s.showNetworkMap,
    notification: s.notification,
    termColor: s.termColor,
    showMachineLoader: s.showMachineLoader,
    loadingMachine: s.loadingMachine,
    msfState: s.msfState,
    ftpSession: s.ftpSession,
  })));

  const {
    showSurvey,
    pendingSurveyScenario,
    showCompletionOverlay,
    language,
    uiMode,
    currentMissionId,
    foxyTourOpen,
  } = useScenarioStore(useShallow(s => ({
    showSurvey: s.showSurvey,
    pendingSurveyScenario: s.pendingSurveyScenario,
    showCompletionOverlay: s.showCompletionOverlay,
    language: s.language,
    uiMode: s.uiMode,
    currentMissionId: s.currentMissionId,
    foxyTourOpen: s.foxyTourOpen,
  })));

  const {
    setActiveApp,
    refreshBrowser,
    toggleNetworkMap,
    completeMission,
    findCredentials,
    verifyCredentials,
    changeMachine,
    setView,
    setPossibleUsers,
    addFailedUser,
    setSudoPrivileges,
    reportVulnerability,
    setShowCompletionOverlay,
    openFoxyTour,
    closeFoxyTour,
  } = useScenarioStore(useShallow(s => ({
    setActiveApp: s.setActiveApp,
    refreshBrowser: s.refreshBrowser,
    toggleNetworkMap: s.toggleNetworkMap,
    completeMission: s.completeMission,
    findCredentials: s.findCredentials,
    verifyCredentials: s.verifyCredentials,
    changeMachine: s.changeMachine,
    setView: s.setView,
    setPossibleUsers: s.setPossibleUsers,
    addFailedUser: s.addFailedUser,
    setSudoPrivileges: s.setSudoPrivileges,
    reportVulnerability: s.reportVulnerability,
    setShowCompletionOverlay: s.setShowCompletionOverlay,
    openFoxyTour: s.openFoxyTour,
    closeFoxyTour: s.closeFoxyTour,
  })));

  const activeMachine = machines.find(m => m.id === activeMachineId) || machines[0];

  const handleGoHome = () => {
    const completedCount = missions.filter(m => m.status === 'completed').length;
    const totalMissions = missions.length;
    const allComplete = totalMissions > 0 && completedCount === totalMissions;
    if (allComplete) {
      useScenarioStore.getState().triggerSurvey(currentScenario);
    } else {
      useScenarioStore.getState().resetWorkspace();
    }
  };

  useEffect(() => {
    if (window.history.state?.view === 'workspace' && window.history.state.scenarioId) {
      const scenario = SCENARIOS.find(s => s.id === window.history.state.scenarioId);
      if (scenario) {
        setView('workspace');
      }
    }
  }, [setView]);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (e.state?.view === 'workspace' && e.state.scenarioId) {
        const scenario = SCENARIOS.find(s => s.id === e.state.scenarioId);
        if (scenario) {
          setView('workspace');
        }
      } else {
        useScenarioStore.getState().resetWorkspace();
        const validNavLang = (lang === 'es' ? 'es' : 'en') as 'en' | 'es';
        navigate(`/${validNavLang}/labs`, { replace: true });
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [navigate, lang, setView]);

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
  }, [currentScenario.id]);

  const tourShownRef = useRef(false);
  useEffect(() => {
    if (view === 'workspace' && !foxyTourOpen && !tourShownRef.current) {
      tourShownRef.current = true;
      openFoxyTour();
    }
  }, [view, foxyTourOpen, openFoxyTour]);

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
  }, [missions.map(m => m.status).join(',')]);

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

  const wpMachine = machines.find(m => m.web_enumeration?.cms?.toLowerCase().includes('wordpress'));
  const wpDiscoveryLevel = wpMachine?.discovery_level ?? 0;
  const mission3Already = missions.some(m => m.id === 3 && m.status === 'completed');

  if (view === 'landing') {
    if (showMachineLoader && loadingMachine) {
      return (
        <div className="min-h-screen flex items-center justify-center"
          style={{ ...DEFAULT_WALLPAPER.style, fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace" }}>
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
    useEffect(() => {
      window.location.href = `/${language}/labs`;
    }, [language]);
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ ...DEFAULT_WALLPAPER.style, fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace" }}>
      <div className="text-emerald-400 font-mono text-sm animate-pulse">Loading...</div>
    </div>
  );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center"
      style={{ fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace" }}>

      <div className="flex flex-col bg-gray-900 overflow-hidden shadow-2xl border border-gray-800 relative"
        ref={workspaceRef}
        style={{ height: 'calc(100vh - 2rem)', width: 'calc(100vw - 2rem)', borderRadius: '1rem', margin: '1rem', maxWidth: 'calc(100vw - 2rem)' }}>

        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-gray-800 flex-shrink-0 select-none"
          style={{ background: '#0d1117' }}>

          <button onClick={handleGoHome} className="flex items-center gap-1.5 mr-2 group">
            <div className="w-5 h-5 rounded flex items-center justify-center bg-emerald-500 group-hover:bg-emerald-400 transition-colors">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <polyline points="8 10 12 14 8 18"/><rect x="2" y="3" width="20" height="18" rx="2"/>
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">ZI Labs</span>
            <span className="text-[10px] text-gray-600">v4.5</span>
          </button>
          <div className="w-px h-4 bg-gray-800 mx-1" />
          <div className="flex items-center gap-1.5 mr-3">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span className="text-xs text-gray-400 font-mono">{currentScenario.name}</span>
          </div>

          {uiMode === 'classic' && (
          <button onClick={() => setActiveApp('terminal')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${activeApp === 'terminal' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
            </svg>
            <span style={{ fontFamily: 'sans-serif' }}>Terminal</span>
            {activeApp === 'terminal' && <div className="w-1 h-1 rounded-full bg-emerald-400 ml-0.5" />}
          </button>
          )}

          {uiMode === 'classic' && currentScenario.category === 'Web' && (
          <button onClick={() => { refreshBrowser(); setActiveApp('browser'); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${activeApp === 'browser' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
            <span style={{ fontFamily: 'sans-serif' }}>Chrome</span>
            {activeApp === 'browser' && <div className="w-1 h-1 rounded-full bg-emerald-400 ml-0.5" />}
          </button>
          )}

        </div>

        <div className="flex flex-1 min-h-0">
          <div className="flex-1 flex flex-col relative overflow-hidden min-w-0">

            {uiMode === 'classic' ? (
              <>
              <div className={`flex-1 overflow-hidden ${activeApp !== 'terminal' ? 'hidden' : ''}`}>
                {showMachineLoader && loadingMachine ? (
                  <div className="h-full w-full" style={DEFAULT_WALLPAPER.style}>
                    <MachineLoader
                      machineName={loadingMachine.machine_info.hostname}
                      machineIp={loadingMachine.machine_info.ip}
                      machineOs={loadingMachine.machine_info.os}
                      onComplete={() => {}}
                      language={language}
                    />
                  </div>
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
              </>
            ) : (
              <div className="flex-1 overflow-hidden relative">
                <DesktopTerminal
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
                  onRequestExit={() => setShowExitConfirm(true)}
                  onOpenTour={openFoxyTour}
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
            onExit={() => setShowExitConfirm(true)}
          />
        </div>

        <ExitConfirm
          open={showExitConfirm}
          onCancel={() => setShowExitConfirm(false)}
          onConfirm={() => {
            setShowExitConfirm(false);
            handleGoHome();
          }}
        />

        {showNetworkMap && (
          <NetworkMap
            scenario={{ ...currentScenario, machines }}
            activeMachineId={activeMachineId}
            msfState={msfState}
            ftpSession={ftpSession}
            onClose={() => toggleNetworkMap(false)}
          />
        )}

        {uiMode === 'desktop' && (
          <FoxyTour
            open={foxyTourOpen}
            isEs={language === 'es'}
            onClose={closeFoxyTour}
          />
        )}
      </div>

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

      {showCompletionOverlay && (
        <LabCompletionOverlay
          scenario={currentScenario}
          totalMissions={missions.length}
          completedCount={missions.filter(m => m.status === 'completed').length}
          onClose={() => setShowCompletionOverlay(false)}
          language={language}
        />
      )}

      {showSurvey && pendingSurveyScenario && (
        <SurveyModal
          scenario={pendingSurveyScenario}
          onSubmit={() => {
            useScenarioStore.getState().resetWorkspace();
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

export { ThemeSync, RootRedirect };
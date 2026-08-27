// ── components/AppContent.tsx ───────────────────────────────────────
// Main workspace content: terminal, browser, mission panel, etc.

import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScenarioStore } from '../store/scenarioStore';
import { Terminal } from './Terminal';
import { DesktopTerminal } from './DesktopTerminal';
import { FakeBrowser } from './FakeBrowser';
import { BurpSuite } from './burpsuite';
import { MissionPanel } from './MissionPanel';
import { NetworkMap } from './NetworkMap';
import { MachineLoader } from './MachineLoader';
import { ExitConfirm } from './ExitConfirm';
import { FoxyTour } from './tour/FoxyTour';
import { DEFAULT_WALLPAPER } from './desktopWallpapers';
import { useHistorySync, useAnalyticsEffects } from './appContent/useAppContentEffects';
import { WorkspaceTopBar } from './appContent/WorkspaceTopBar';
import { WorkspaceOverlays } from './appContent/WorkspaceOverlays';
import { LandingView } from './appContent/LandingView';
import { useAppContentState, useAppContentActions } from './appContent/useAppContentStore';
import { useMissionCompletion } from '../hooks/useMissionCompletion';

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
    browserKey,
    showNetworkMap,
    notification,
    termColor,
    showMachineLoader,
    loadingMachine,
    msfState,
    ftpSession,
    showSurvey,
    pendingSurveyScenario,
    showCompletionOverlay,
    language,
    uiMode,
    currentMissionId,
    foxyTourOpen,
  } = useAppContentState();

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
  } = useAppContentActions();

  const activeMachine = machines.find(m => m.id === activeMachineId) || machines[0];

  useHistorySync(navigate, lang, setView);
  useAnalyticsEffects(view, currentScenario, missions, openFoxyTour, foxyTourOpen);

  const { checkMissionCompletion } = useMissionCompletion(completeMission);

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

  // Redirect cuando view === 'landing' (hook incondicional, regla rules-of-hooks)
  useEffect(() => {
    if (view === 'landing' && !showMachineLoader) {
      window.location.href = `/${language}/labs`;
    }
  }, [view, showMachineLoader, language]);

  if (view === 'landing') {
    return (
      <LandingView
        showMachineLoader={showMachineLoader}
        loadingMachine={loadingMachine}
        language={language}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center"
      style={{ fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace" }}>

      <div className="flex flex-col bg-gray-900 overflow-hidden shadow-2xl border border-gray-800 relative"
        ref={workspaceRef}
        style={{ height: 'calc(100vh - 2rem)', width: 'calc(100vw - 2rem)', borderRadius: '1rem', margin: '1rem', maxWidth: 'calc(100vw - 2rem)' }}>

        <WorkspaceTopBar
          scenarioName={currentScenario.name}
          uiMode={uiMode}
          scenarioCategory={currentScenario.category}
          activeApp={activeApp}
          onGoHome={handleGoHome}
          onSetActiveApp={setActiveApp}
          onRefreshBrowser={refreshBrowser}
        />

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
                  onSetPossibleUsers={setPossibleUsers}
                  onReportVulnerability={reportVulnerability}
                  checkMissionCompletion={checkMissionCompletion}
                />
              </div>
              )}

              {currentScenario.category === 'Web' && (
              <div className={`flex-1 overflow-hidden ${activeApp !== 'burpsuite' ? 'hidden' : ''}`}>
                <BurpSuite
                  allMachines={machines}
                  onClose={() => setActiveApp('terminal')}
                  onReportVulnerability={reportVulnerability}
                  onCredentialsFound={findCredentials}
                  checkMissionCompletion={checkMissionCompletion}
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

      <WorkspaceOverlays
        notification={notification}
        showCompletionOverlay={showCompletionOverlay}
        showSurvey={showSurvey}
        pendingSurveyScenario={pendingSurveyScenario}
        currentScenario={currentScenario}
        totalMissions={missions.length}
        completedCount={missions.filter(m => m.status === 'completed').length}
        language={language}
        onCloseCompletion={() => setShowCompletionOverlay(false)}
        onSurveySubmit={() => {
          useScenarioStore.getState().resetWorkspace();
          const validLang = (lang === 'es' ? 'es' : 'en') as 'en' | 'es';
          navigate(`/${validLang}/labs`, { replace: true });
        }}
      />
    </div>
  );
}
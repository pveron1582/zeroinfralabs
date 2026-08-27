// ── components/appContent/useAppContentStore.ts ──────────────────
// Selectores del store para AppContent. Extraídos del componente para
// mantenerlo <300 líneas y separar la lectura de estado del render.

import { useShallow } from 'zustand/react/shallow';
import { useScenarioStore } from '../../store/scenarioStore';

export function useAppContentState() {
  return useScenarioStore(useShallow(s => ({
    view: s.view,
    currentScenario: s.currentScenario,
    machines: s.machines,
    missions: s.missions,
    activeMachineId: s.activeMachineId,
    activeApp: s.activeApp,
    browserKey: s.browserKey,
    showNetworkMap: s.showNetworkMap,
    notification: s.notification,
    termColor: s.termColor,
    showMachineLoader: s.showMachineLoader,
    loadingMachine: s.loadingMachine,
    msfState: s.msfState,
    ftpSession: s.ftpSession,
    showSurvey: s.showSurvey,
    pendingSurveyScenario: s.pendingSurveyScenario,
    showCompletionOverlay: s.showCompletionOverlay,
    language: s.language,
    uiMode: s.uiMode,
    currentMissionId: s.currentMissionId,
    foxyTourOpen: s.foxyTourOpen,
  })));
}

export function useAppContentActions() {
  return useScenarioStore(useShallow(s => ({
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
}

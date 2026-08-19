// ── components/appContent/useAppContentEffects.ts ─────────────────
// Efectos del workspace: sincronización de history/popstate y tracking de analytics

import { useEffect, useRef } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { SCENARIOS } from '../../laboratorios/laboratorios';
import { useScenarioStore } from '../../store/scenarioStore';
import type { AppView } from '../../store/types';
import { trackEvent, recordLabStart } from '../../utils/analytics';
import type { Mission, Scenario } from '../../types';

const FOXY_TOUR_FLAG = 'foxy-tour-shown';

export function useHistorySync(navigate: NavigateFunction, lang: string | undefined, setView: (v: AppView) => void) {
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
}

export function useAnalyticsEffects(
  view: AppView,
  currentScenario: Scenario,
  missions: Mission[],
  openFoxyTour: () => void,
  foxyTourOpen: boolean,
) {
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

  // Auto-apertura del tour al entrar al workspace. El flag vive en
  // sessionStorage (claveada por escenario) y NO en un ref: AppContent puede
  // remontarse (p. ej. el pushState de selectScenario cambia la location key
  // y ScenarioLauncher usa key={location.key}), y un useRef reseteado hacía
  // que Foxy se reabriera al cerrar el tour.
  useEffect(() => {
    if (view !== 'workspace' || foxyTourOpen) return;
    if (typeof sessionStorage === 'undefined') return;
    if (sessionStorage.getItem(FOXY_TOUR_FLAG) !== currentScenario.id) {
      sessionStorage.setItem(FOXY_TOUR_FLAG, currentScenario.id);
      openFoxyTour();
    }
  }, [view, foxyTourOpen, openFoxyTour, currentScenario.id]);

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
}

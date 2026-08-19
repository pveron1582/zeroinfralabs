import type { StateCreator } from 'zustand';
import type { ScenarioState, AppView, Notification } from '../types';

export interface UISlice {
  language: 'en' | 'es';
  theme: 'light' | 'dark';
  showSurvey: boolean;
  pendingSurveyScenario: ScenarioState['pendingSurveyScenario'];
  view: AppView;
  uiMode: 'classic' | 'desktop';
  activeApp: 'terminal' | 'browser' | 'burpsuite';
  browserKey: number;
  showNetworkMap: boolean;
  hasNewNetworkInfo: boolean;
  notification: Notification | null;
  termColor: string;
  showMachineLoader: boolean;
  loadingMachine: ScenarioState['loadingMachine'];
  browserCurrentUrl: string;
  browserIsLoggedIn: boolean;
  browserNavHistory: string[];
  browserNavIdx: number;
  showCompletionOverlay: boolean;
  foxyTourOpen: boolean;

  setLanguage: (lang: 'en' | 'es') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setView: (view: AppView) => void;
  toggleUiMode: () => void;
  setUiMode: (mode: 'classic' | 'desktop') => void;
  triggerSurvey: (scenario: ScenarioState['pendingSurveyScenario']) => void;
  closeSurvey: () => void;
  setShowCompletionOverlay: (show: boolean) => void;
  openFoxyTour: () => void;
  closeFoxyTour: () => void;
  setActiveApp: (app: 'terminal' | 'browser' | 'burpsuite') => void;
  refreshBrowser: () => void;
  toggleNetworkMap: (show?: boolean) => void;
  setTermColor: (color: string) => void;
  showNotification: (text: string) => void;
  clearNotification: () => void;
  setBrowserUrl: (url: string) => void;
  setBrowserLoggedIn: (loggedIn: boolean) => void;
  setBrowserNavHistory: (history: string[], idx: number) => void;
}

export const createUISlice: StateCreator<ScenarioState, [], [], UISlice> = (set, get) => ({
  language: 'en',
  theme: 'light',
  showSurvey: false,
  pendingSurveyScenario: null,
  view: 'landing',
  uiMode: 'desktop',
  activeApp: 'terminal',
  browserKey: 0,
  showNetworkMap: false,
  hasNewNetworkInfo: false,
  notification: null,
  termColor: '#10b981',
  showMachineLoader: false,
  loadingMachine: null,
  browserCurrentUrl: 'https://www.google.com',
  browserIsLoggedIn: false,
  browserNavHistory: ['https://www.google.com'],
  browserNavIdx: 0,
  showCompletionOverlay: false,
  foxyTourOpen: false,

  setLanguage: (lang) => set({ language: lang }),
  setTheme: (theme) => set({ theme }),
  setView: (view) => set({ view }),
  toggleUiMode: () => set(state => ({ uiMode: state.uiMode === 'classic' ? 'desktop' : 'classic' })),
  setUiMode: (mode) => set({ uiMode: mode }),
  triggerSurvey: (scenario) => set({ showSurvey: true, pendingSurveyScenario: scenario }),
  closeSurvey: () => set({ showSurvey: false, pendingSurveyScenario: null }),
  setShowCompletionOverlay: (show) => set({ showCompletionOverlay: show }),
  openFoxyTour: () => set({ foxyTourOpen: true }),
  closeFoxyTour: () => set({ foxyTourOpen: false }),
  setActiveApp: (app) => set({ activeApp: app }),
  refreshBrowser: () => set(state => ({ browserKey: state.browserKey + 1 })),
  toggleNetworkMap: (show) => {
    const nextState = show !== undefined ? show : !get().showNetworkMap;
    set({
      showNetworkMap: nextState,
      ...(nextState ? { hasNewNetworkInfo: false } : {})
    });
  },
  setTermColor: (color) => set({ termColor: color }),
  showNotification: (text) => {
    set({ notification: { text, id: Date.now() } });
    setTimeout(() => set({ notification: null }), 3500);
  },
  clearNotification: () => set({ notification: null }),
  setBrowserUrl: (url) => set({ browserCurrentUrl: url }),
  setBrowserLoggedIn: (loggedIn) => set({ browserIsLoggedIn: loggedIn }),
  setBrowserNavHistory: (history, idx) => set({ browserNavHistory: history, browserNavIdx: idx }),
});

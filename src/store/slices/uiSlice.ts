import type { StateCreator } from 'zustand';
import type { ScenarioState, AppView, Notification } from '../types';

export type UiMode = 'classic' | 'desktop' | 'windows-desktop';

export interface UISlice {
  language: 'en' | 'es';
  theme: 'light' | 'dark';
  showSurvey: boolean;
  pendingSurveyScenario: ScenarioState['pendingSurveyScenario'];
  view: AppView;
  uiMode: UiMode;
  /** uiMode anterior al abrir el escritorio RDP (para restaurar al cerrar). */
  _prevUiMode: 'classic' | 'desktop' | null;
  /** Máquina objetivo de la conexión RDP activa (W3). */
  rdpMachineId: string | null;
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
  setUiMode: (mode: UiMode) => void;
  openWindowsDesktop: (machineId: string) => void;
  closeWindowsDesktop: () => void;
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
  resetUiState: () => Pick<UISlice, 'view' | 'showNetworkMap' | 'hasNewNetworkInfo' | 'notification' | 'browserCurrentUrl' | 'browserIsLoggedIn' | 'browserNavHistory' | 'browserNavIdx' | 'showSurvey' | 'pendingSurveyScenario' | 'showCompletionOverlay' | 'rdpMachineId' | 'showMachineLoader' | 'loadingMachine'> & Partial<Pick<UISlice, 'uiMode' | '_prevUiMode'>>;
}

// Timer de auto-borrado de la notificación. Uno solo para toda la app:
// antes cada `setTimeout` era independiente y con dos misiones seguidas la
// primera apagaba la segunda antes de tiempo (P0.5, misma clase que el
// loader: timers viejos que pisan estado nuevo).
let notificationTimer: ReturnType<typeof setTimeout> | null = null;

/** Programa (o reprograma) el auto-borrado de la notificación. */
export function scheduleNotificationClear(set: (patch: Partial<ScenarioState>) => void): void {
  if (notificationTimer !== null) clearTimeout(notificationTimer);
  notificationTimer = setTimeout(() => {
    notificationTimer = null;
    set({ notification: null });
  }, 3500);
}

export const createUISlice: StateCreator<ScenarioState, [], [], UISlice> = (set, get) => ({
  language: 'en',
  theme: 'light',
  showSurvey: false,
  pendingSurveyScenario: null,
  view: 'landing',
  uiMode: 'desktop',
  _prevUiMode: null,
  rdpMachineId: null,
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
  toggleUiMode: () => set(state => {
    // Con RDP activo (ventana o full-screen) el toggle lo cierra.
    if (state.uiMode === 'windows-desktop') {
      return { uiMode: state._prevUiMode ?? 'desktop', rdpMachineId: null, _prevUiMode: null };
    }
    if (state.rdpMachineId) {
      return { uiMode: state.uiMode === 'classic' ? 'desktop' : 'classic', rdpMachineId: null };
    }
    return { uiMode: state.uiMode === 'classic' ? 'desktop' : 'classic' };
  }),
  setUiMode: (mode) => set({ uiMode: mode }),
  openWindowsDesktop: (machineId) => set(state => {
    // classic no tiene escritorio Kali que aloje la ventana → full-screen.
    if (state.uiMode === 'classic') {
      return { uiMode: 'windows-desktop' as const, rdpMachineId: machineId, _prevUiMode: 'classic' as const };
    }
    // desktop: Kali sigue montado; rdpMachineId abre una ventana movable.
    if (state.uiMode === 'windows-desktop') {
      return { rdpMachineId: machineId };
    }
    return { rdpMachineId: machineId };
  }),
  closeWindowsDesktop: () => set(state => ({
    ...(state.uiMode === 'windows-desktop'
      ? { uiMode: state._prevUiMode ?? ('desktop' as const), _prevUiMode: null }
      : {}),
    rdpMachineId: null,
  })),
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
    scheduleNotificationClear(set);
  },
  clearNotification: () => set({ notification: null }),
  setBrowserUrl: (url) => set({ browserCurrentUrl: url }),
  setBrowserLoggedIn: (loggedIn) => set({ browserIsLoggedIn: loggedIn }),
  setBrowserNavHistory: (history, idx) => set({ browserNavHistory: history, browserNavIdx: idx }),

  resetUiState: () => {
    // Si el workspace se cierra con un RDP abierto, salir de él y
    // restaurar el modo anterior (classic/desktop); si no, no tocar uiMode
    // (está persistido a propósito entre labs).
    const { uiMode, _prevUiMode } = get();
    return {
      view: 'landing' as AppView,
      showNetworkMap: false,
      hasNewNetworkInfo: false,
      notification: null,
      browserCurrentUrl: 'https://www.google.com',
      browserIsLoggedIn: false,
      browserNavHistory: ['https://www.google.com'],
      browserNavIdx: 0,
      showSurvey: false,
      pendingSurveyScenario: null,
      showCompletionOverlay: false,
      rdpMachineId: null,
      // El loader de máquina se cancela junto con la carga pendiente: si se
      // queda en true sin su timer, la terminal queda showing the loader
      // para siempre (P0.5).
      showMachineLoader: false,
      loadingMachine: null,
      ...(uiMode === 'windows-desktop'
        ? { uiMode: _prevUiMode ?? ('desktop' as const), _prevUiMode: null }
        : {}),
    };
  },
});

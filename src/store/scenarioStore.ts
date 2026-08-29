// ── store/scenarioStore.ts ─────────────────────────────────────────
// Zustand global state store — orchestrates slices and persistence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ScenarioState } from './types';
import { createUISlice } from './slices/uiSlice';
import { createTerminalSlice } from './slices/terminalSlice';
import { createScenarioSlice } from './slices/scenarioSlice';
import { createIdentitySlice } from './slices/identitySlice';
import { createAcademySlice } from './slices/academySlice';
import { shellManager } from '../frameworks/shells/ShellManager';

export const useScenarioStore = create<ScenarioState>()(
  persist(
    (set, get, store) => {
      const resetWorkspace = () => {
        shellManager.reset();
        set({
          view: 'landing',
          showNetworkMap: false,
          hasNewNetworkInfo: false,
          notification: null,
          browserCurrentUrl: 'https://www.google.com',
          browserIsLoggedIn: false,
          browserNavHistory: ['https://www.google.com'],
          browserNavIdx: 0,
          listeningPort: null,
          blockingCommand: null,
          msfState: null,
          ftpSession: null,
          sshSession: null,
          showSurvey: false,
          pendingSurveyScenario: null,
          showCompletionOverlay: false,
          _prevMachinesSnapshot: [],
          // Fuerza un reset global de managers al volver a entrar a un
          // escenario (incluso si es el mismo que estaba activo antes).
          globalResetDoneForScenario: null,
        });
      };

      return {
        ...createUISlice(set, get, store),
        ...createTerminalSlice(set, get, store),
        ...createScenarioSlice(set, get, store),
        ...createIdentitySlice(set, get, store),
        ...createAcademySlice(set, get, store),

        goHome: resetWorkspace,
        resetWorkspace,
      };
    },
    {
      name: 'cyberops-store',
      version: 2,
      partialize: (state) => ({
        // M3: NO se persiste `view` — la vista se deriva de la ruta al recargar.
        // Persistir 'workspace' sin escenario genera una vista huérfana.
        language: state.language,
        theme: state.theme,
        uiMode: state.uiMode,
        activeApp: state.activeApp,
        termColor: state.termColor,
        completedLessons: state.completedLessons,
        quizResults: state.quizResults,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ScenarioState>;
        return {
          ...current,
          language: p.language ?? current.language,
          theme: p.theme ?? current.theme,
          uiMode: p.uiMode ?? current.uiMode,
          activeApp: p.activeApp ?? current.activeApp,
          termColor: p.termColor ?? current.termColor,
          completedLessons: p.completedLessons ?? current.completedLessons,
          quizResults: p.quizResults ?? current.quizResults,
        };
      },
    }
  )
);

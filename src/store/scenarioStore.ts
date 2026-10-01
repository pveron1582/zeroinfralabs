// ── store/scenarioStore.ts ─────────────────────────────────────────
// Zustand global state store — orchestrates slices and persistence

import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import type { ScenarioState } from './types';
import { createUISlice } from './slices/uiSlice';
import { createTerminalSlice } from './slices/terminalSlice';
import { createScenarioSlice, cancelPendingScenarioLoad } from './slices/scenarioSlice';
import { createIdentitySlice } from './slices/identitySlice';
import { createAcademySlice } from './slices/academySlice';
import { PERSIST_VERSION, migratePersistedState } from './persistMigrate';
import { shellManager } from '../frameworks/shells/ShellManager';

// Storage no-op para entornos sin DOM (tests con `@vitest-environment node`).
// Sin esto, zustand avisa «storage is currently unavailable» en cada archivo de test
// que importe el store, y el store no se puede usar fuera del navegador.
const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

// Snapshot que sobrevive a la recarga: sólo preferencias de UI + progreso
// de Academy. Las claves también están en PERSIST_KEYS (persistMigrate.ts);
// el test de persistMigrate falla si las dos listas se desincronican.
export const persistPartialize = (state: ScenarioState) => ({
  // M3: NO se persiste `view` — la vista se deriva de la ruta al recargar.
  // Persistir 'workspace' sin escenario genera una vista huérfana.
  language: state.language,
  theme: state.theme,
  uiMode: state.uiMode,
  activeApp: state.activeApp,
  termColor: state.termColor,
  completedLessons: state.completedLessons,
  quizResults: state.quizResults,
});

export const useScenarioStore = create<ScenarioState>()(
  persist(
    (set, get, store) => {
      const resetWorkspace = () => {
        // Salir del lab cancela la carga pendiente del loader: si no, el
        // timer de 6.5 s de un selectScenario anterior vuelve a meter al
        // alumno en el lab del que acaba de salir (P0.5).
        cancelPendingScenarioLoad();
        shellManager.reset();
        set({
          ...get().resetUiState(),
          ...get().resetTerminalState(),
          ...get().resetScenarioWorkspaceState(),
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
      version: PERSIST_VERSION,
      // Rehidratación: sin `migrate`, zustand descarta el snapshot guardado
      // cuando la versión no coincide (ver store/persistMigrate.ts).
      migrate: migratePersistedState,
      // En el navegador persiste en localStorage; fuera del DOM (tests en node,
      // SSR) usa un storage no-op para no romper ni ensuciar la consola.
      storage: createJSONStorage(() => (typeof window === 'undefined' ? noopStorage : window.localStorage)),
      partialize: persistPartialize,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ScenarioState>;
        return {
          ...current,
          language: p.language ?? current.language,
          theme: p.theme ?? current.theme,
          // No rehidratar un RDP huérfano: windows-desktop es solo de sesión.
          uiMode: p.uiMode === 'windows-desktop' ? 'desktop' : (p.uiMode ?? current.uiMode),
          activeApp: p.activeApp ?? current.activeApp,
          termColor: p.termColor ?? current.termColor,
          completedLessons: p.completedLessons ?? current.completedLessons,
          quizResults: p.quizResults ?? current.quizResults,
        };
      },
    }
  )
);

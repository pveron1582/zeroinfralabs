// ── store/scenarioStore.ts ─────────────────────────────────────────
// Estado global de la aplicación usando Zustand
// Gestiona: escenario actual, máquinas, misiones, notificaciones, UI state, msfconsole

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Machine, Mission, Scenario } from '../types';
import { SCENARIOS } from '../exercises/scenarios';
import type { MsfState } from '../commands/tools/msfconsole';

// ── Tipos del Store ────────────────────────────────────────────────
interface Notification {
  text: string;
  id: number;
}

type AppView = 'landing' | 'workspace';

interface ScenarioState {
  // View state
  view: AppView;
  setView: (view: AppView) => void;

  // Scenario data
  currentScenario: Scenario;
  machines: Machine[];
  missions: Mission[];
  currentMissionId: number;
  activeMachineId: string;

  // UI State
  activeApp: 'terminal' | 'browser';
  browserKey: number;
  showNetworkMap: boolean;
  notification: Notification | null;
  termColor: string;
  showMachineLoader: boolean;
  loadingMachine: Machine | null;

  // Browser state persistence
  browserCurrentUrl: string;
  browserIsLoggedIn: boolean;
  browserNavHistory: string[];
  browserNavIdx: number;

  // NC Listener state (para validación de payload)
  listeningPort: number | null;

  // Current directory for terminal navigation
  currentDir: string;

  // MSF Console state (persisted)
  msfState: MsfState | null;

  // Actions
  selectScenario: (id: string) => void;
  completeMission: (id: number) => void;
  findCredentials: (machineId: string, user: string, pass: string, file?: string) => void;
  verifyCredentials: (machineId: string) => void;
  changeMachine: (machineId: string) => void;
  setActiveApp: (app: 'terminal' | 'browser') => void;
  refreshBrowser: () => void;
  toggleNetworkMap: (show?: boolean) => void;
  setTermColor: (color: string) => void;
  showNotification: (text: string) => void;
  clearNotification: () => void;
  goHome: () => void;
  getActiveMachine: () => Machine;
  getScenarioMachines: () => Machine[];
  setBrowserUrl: (url: string) => void;
  setBrowserLoggedIn: (loggedIn: boolean) => void;
  setBrowserNavHistory: (history: string[], idx: number) => void;
  setListeningPort: (port: number | null) => void;
  setCurrentDir: (dir: string) => void;
  setMsfState: (state: MsfState | null) => void;
}

// ── Constantes ─────────────────────────────────────────────────────
const DEFAULT_TERM_COLOR = '#10b981';

// ── Store ──────────────────────────────────────────────────────────
export const useScenarioStore = create<ScenarioState>()(
  persist(
    (set, get) => ({
      // Estado inicial - reiniciar discovery_level para empezar limpio
      view: 'landing',
      currentScenario: SCENARIOS[0],
      machines: SCENARIOS[0].machines.map(m => ({ ...m, discovery_level: 0 })),
      missions: SCENARIOS[0].missions,
      currentMissionId: 1,
      activeMachineId: SCENARIOS[0].initialMachineId,
      activeApp: 'terminal',
      browserKey: 0,
      showNetworkMap: false,
      notification: null,
      termColor: DEFAULT_TERM_COLOR,
      showMachineLoader: false,
      loadingMachine: null,
      browserCurrentUrl: 'https://www.google.com',
      browserIsLoggedIn: false,
      browserNavHistory: ['https://www.google.com'],
      browserNavIdx: 0,
      listeningPort: null,
      currentDir: '/',
      msfState: null,

      // ── Actions ───────────────────────────────────────────────────────

      setView: (view) => set({ view }),

      setMsfState: (state) => set({ msfState: state }),

      selectScenario: (id) => {
        const scenario = SCENARIOS.find(s => s.id === id);
        if (!scenario) return;

        // Mostrar animación de carga
        set({
          loadingMachine: scenario.machines[0],
          showMachineLoader: true,
        });

        // Después de la animación, cargar el escenario
        setTimeout(() => {
          set({
            currentScenario: scenario,
            // Reiniciar machines con discovery_level: 0 para empezar limpio
            machines: scenario.machines.map(m => ({ ...m, discovery_level: 0 })),
            missions: scenario.missions.map((m, i) => ({
              ...m,
              status: i === 0 ? 'active' : 'pending'
            })),
            currentMissionId: 1,
            activeMachineId: scenario.initialMachineId,
            activeApp: 'terminal',
            showNetworkMap: false,
            view: 'workspace',
            showMachineLoader: false,
            loadingMachine: null,
            browserCurrentUrl: 'https://www.google.com',
            browserIsLoggedIn: false,
            browserNavHistory: ['https://www.google.com'],
            browserNavIdx: 0,
            listeningPort: null,
            msfState: null,
          });
          window.history.pushState({ view: 'workspace', scenarioId: id }, '');
        }, 4500);
      },

      completeMission: (id) => {
        const { missions, machines, currentMissionId } = get();

        // Actualizar misiones
        const updatedMissions = missions.map(m => {
          if (m.id === id) return { ...m, status: 'completed' as const };
          if (m.id === id + 1 && m.status === 'pending') return { ...m, status: 'active' as const };
          return m;
        });

        // Actualizar discovery level de máquinas
        const mission = missions.find(m => m.id === id);
        const updatedMachines = mission?.targetMachineId
          ? machines.map(m =>
              m.id === mission.targetMachineId
                ? { ...m, discovery_level: Math.max(m.discovery_level || 0, mission.discoveryLevel || 0) }
                : m
            )
          : machines;

        set({
          missions: updatedMissions,
          machines: updatedMachines,
          currentMissionId: id === currentMissionId ? currentMissionId + 1 : currentMissionId,
        });

        // Mostrar notificación
        const title = missions.find(m => m.id === id)?.title;
        if (title) {
          set({
            notification: { text: `✓ Misión completada: ${title}`, id: Date.now() }
          });
          setTimeout(() => set({ notification: null }), 3500);
        }
      },

      findCredentials: (machineId, user, pass, file) => {
        const { machines } = get();
        set({
          machines: machines.map(m =>
            m.id === machineId
              ? { ...m, found_credentials: { file: file || '/uploads/config.bak', user, pass, verified: false } }
              : m
          )
        });
      },

      verifyCredentials: (machineId) => {
        const { machines } = get();
        set({
          machines: machines.map(m =>
            m.id === machineId && m.found_credentials
              ? { ...m, found_credentials: { ...m.found_credentials, verified: true } }
              : m
          )
        });
      },

      changeMachine: (machineId) => {
        set({ activeMachineId: machineId });
      },

      setActiveApp: (app) => set({ activeApp: app }),

      refreshBrowser: () => set(state => ({ browserKey: state.browserKey + 1 })),

      toggleNetworkMap: (show) => set(state => ({
        showNetworkMap: show !== undefined ? show : !state.showNetworkMap
      })),

      setTermColor: (color) => set({ termColor: color }),

      showNotification: (text) => {
        set({ notification: { text, id: Date.now() } });
        setTimeout(() => set({ notification: null }), 3500);
      },

      clearNotification: () => set({ notification: null }),

      goHome: () => {
        set({ 
          view: 'landing', 
          showNetworkMap: false, 
          notification: null,
          browserCurrentUrl: 'https://www.google.com',
          browserIsLoggedIn: false,
          browserNavHistory: ['https://www.google.com'],
          browserNavIdx: 0,
          listeningPort: null,
          msfState: null,
        });
        if (window.history.state?.view === 'workspace') {
          window.history.back();
        }
      },

      setBrowserUrl: (url) => set({ browserCurrentUrl: url }),

      setBrowserLoggedIn: (loggedIn) => set({ browserIsLoggedIn: loggedIn }),

      setBrowserNavHistory: (history, idx) => set({ browserNavHistory: history, browserNavIdx: idx }),
      setListeningPort: (port) => set({ listeningPort: port }),
      setCurrentDir: (dir) => set({ currentDir: dir }),

      getActiveMachine: () => {
        const { machines, activeMachineId } = get();
        return machines.find(m => m.id === activeMachineId) || machines[0];
      },

      getScenarioMachines: () => {
        const { machines, currentScenario } = get();
        return machines.filter(m =>
          currentScenario.machines.some(sm => sm.id === m.id)
        );
      },
    }),
    {
      name: 'cyberops-store',
      partialize: (state) => ({
        // View state
        view: state.view,
        
        // Scenario persistence
        currentScenario: state.currentScenario,
        machines: state.machines,
        missions: state.missions,
        currentMissionId: state.currentMissionId,
        activeMachineId: state.activeMachineId,
        activeApp: state.activeApp,
        
        // UI preferences
        termColor: state.termColor,
        showNetworkMap: state.showNetworkMap,
        
        // Browser state persistence
        browserCurrentUrl: state.browserCurrentUrl,
        browserIsLoggedIn: state.browserIsLoggedIn,
        browserNavHistory: state.browserNavHistory,
        browserNavIdx: state.browserNavIdx,
        
        // MSF state persistence - only persist if active
        msfState: state.msfState?.active ? state.msfState : null,
      }),
    }
  )
);

// ── Selectores memoizados (para uso con useShallow) ───────────────
export const selectScenario = (state: ScenarioState) => state.currentScenario;
export const selectMachines = (state: ScenarioState) => state.machines;
export const selectMissions = (state: ScenarioState) => state.missions;
export const selectActiveMachine = (state: ScenarioState) => state.getActiveMachine();
export const selectIsWebScenario = (state: ScenarioState) => state.currentScenario.category === 'Web';

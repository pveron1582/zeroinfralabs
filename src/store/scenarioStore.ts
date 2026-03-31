// ── store/scenarioStore.ts ─────────────────────────────────────────
// Estado global de la aplicación usando Zustand
// Gestiona: escenario actual, máquinas, misiones, notificaciones, UI state, msfconsole

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { assignDHCP } from '../utils/network';
import type { Machine, Scenario, MachineInfo, Port, LearningStep, Mission, FileEntry, BlockingCommand } from '../types';
import { SCENARIOS } from '../laboratorios/laboratorios';
import type { MsfState } from '../commands/tools/msfconsole';

// ── Tipos del Store ────────────────────────────────────────────────
interface Notification {
  text: string;
  id: number;
}

// Estado de sesión FTP
export interface FtpSessionState {
  active: boolean;
  targetIp?: string;
  targetId?: string;
  username?: string;
  loggedIn?: boolean;
  currentDir?: string;
  step: 'connecting' | 'username' | 'password' | 'connected';
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
  hasNewNetworkInfo: boolean; // New state variable
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
  blockingCommand: BlockingCommand | null; // New state variable

  // Current directory for terminal navigation
  currentDir: string;

  // MSF Console state (persisted)
  msfState: MsfState | null;

  // FTP Session state
  ftpSession: FtpSessionState | null;

  // Language state
  language: 'en' | 'es';
  setLanguage: (lang: 'en' | 'es') => void;
  selectScenario: (id: string) => void;
  completeMission: (id: number) => void;
  findCredentials: (machineId: string, user: string, pass: string, file?: string, service?: string) => void;
  verifyCredentials: (machineId: string, service?: string) => void;
  setPossibleUsers: (machineId: string, users: string[]) => void;
  addFailedUser: (machineId: string, user: string) => void;
  addFileToMachine: (machineId: string, file: FileEntry) => void;
  addExploredDirectory: (machineId: string, path: string) => void;
  confirmRCE: (machineId: string, user: string, method: string) => void;
  changeMachine: (machineId: string) => void;
  setActiveApp: (app: 'terminal' | 'browser') => void;
  refreshBrowser: () => void;
  toggleNetworkMap: (show?: boolean) => void;
  setHasNewNetworkInfo: (val: boolean) => void; // New action
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
  setBlockingCommand: (command: BlockingCommand | null) => void; // New action
  setCurrentDir: (dir: string) => void;
  setMsfState: (state: MsfState | null) => void;
  setFtpSession: (session: FtpSessionState | null) => void;
  reportVulnerability: (machineId: string, vulnId: string, status: 'detected' | 'confirmed') => void;
}

// ── Constantes ─────────────────────────────────────────────────────
const DEFAULT_TERM_COLOR = '#10b981';

// ── Store ──────────────────────────────────────────────────────────
export const useScenarioStore = create<ScenarioState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      view: 'landing',
      currentScenario: SCENARIOS[0],
      machines: SCENARIOS[0].machines.map(m => ({ ...m, discovery_level: 0 })),
      missions: SCENARIOS[0].missions,
      currentMissionId: 1,
      activeMachineId: SCENARIOS[0].initialMachineId,
      activeApp: 'terminal',
      browserKey: 0,
      showNetworkMap: false,
      hasNewNetworkInfo: false,
      notification: null,
      termColor: DEFAULT_TERM_COLOR,
      showMachineLoader: false,
      loadingMachine: null,
      browserCurrentUrl: 'https://www.google.com',
      browserIsLoggedIn: false,
      browserNavHistory: ['https://www.google.com'],
      browserNavIdx: 0,
      listeningPort: null,
      blockingCommand: null, // Initialize new state variable
      currentDir: '/',
      msfState: null,
      ftpSession: null,

      // ── Actions ───────────────────────────────────────────────────────

      setView: (view) => set({ view }),

      setMsfState: (state) => set({ msfState: state }),
      setFtpSession: (session) => set({ ftpSession: session }),

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
            hasNewNetworkInfo: false,
            view: 'workspace',
            showMachineLoader: false,
            loadingMachine: null,
            browserCurrentUrl: 'https://www.google.com',
            browserIsLoggedIn: false,
            browserNavHistory: ['https://www.google.com'],
            browserNavIdx: 0,
            listeningPort: null,
            blockingCommand: null, // Reset new state variable
            msfState: null,
            ftpSession: null, // Reset ftpSession
            currentDir: '/root/',
          });
          window.history.pushState({ view: 'workspace', scenarioId: id }, '');
        }, 4500);
      },

      completeMission: (id) => {
        const { missions, machines, currentMissionId } = get();
        
        // Prevent re-triggering completion logic if already completed
        const mission = missions.find(m => m.id === id);
        if (mission?.status === 'completed') return;

        // Actualizar misiones
        const updatedMissions = missions.map(m => {
          if (m.id === id) return { ...m, status: 'completed' as const };
          if (m.id === id + 1 && m.status === 'pending') return { ...m, status: 'active' as const };
          return m;
        });

        // Actualizar discovery level de máquinas
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
          // Parpadear botón de red cuando hay nueva info de red (discoveryLevel > 0)
          hasNewNetworkInfo: (mission?.discoveryLevel || 0) > 0 ? true : get().hasNewNetworkInfo
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

      findCredentials: (machineId, user, pass, file, service = 'unknown') => {
        const { machines } = get();
        set({
          machines: machines.map(m => {
            if (m.id !== machineId) return m;
            const existing = m.found_credentials || [];
            // Verificar si ya existe una credencial para este servicio
            const existingCred = existing.find(c => c.service === service);
            const filtered = existing.filter(c => c.service !== service);
            return {
              ...m,
              // Aumentar discovery_level si encontramos credenciales (mínimo 3 para SSH)
              discovery_level: Math.max(m.discovery_level || 0, 3),
              found_credentials: [...filtered, { 
                file: file || '/etc/passwd', 
                user, 
                pass, 
                // Mark as verified when found (hydra already validated the credential)
                verified: true, 
                service 
              }]
            };
          }),
          hasNewNetworkInfo: true
        });
      },

      verifyCredentials: (machineId, service) => {
        const { machines } = get();
        set({
          machines: machines.map(m => {
            if (m.id !== machineId || !m.found_credentials) return m;
            return {
              ...m,
              found_credentials: m.found_credentials.map(c =>
                (!service || c.service === service) ? { ...c, verified: true } : c
              )
            };
          })
        });
      },

      setPossibleUsers: (machineId, users) => {
        const { machines } = get();
        set({
          machines: machines.map(m => 
            m.id === machineId ? { ...m, possible_ssh_users: users } : m
          )
        });
      },

      addFailedUser: (machineId, user) => {
        const { machines } = get();
        set({
          machines: machines.map(m => {
            if (m.id !== machineId) return m;
            const failed = m.failed_ssh_users || [];
            return { ...m, failed_ssh_users: [...failed, user] };
          })
        });
      },

      setSudoPrivileges: (machineId, user, commands, canSudo) => {
        const { machines } = get();
        set({
          machines: machines.map(m => 
            m.id === machineId ? { 
              ...m, 
              sudo_privileges: { user, commands, canSudo }
            } : m
          )
        });
      },

      addFileToMachine: (machineId: string, file: FileEntry) => {
        const { machines } = get();
        set({
          machines: machines.map(m => {
            if (m.id !== machineId) return m;
            // Evitar duplicados (con el mismo path)
            const filtered = (m.files || []).filter(f => f.path !== file.path);
            return {
              ...m,
              files: [...filtered, file]
            };
          })
        });
      },

      addExploredDirectory: (machineId: string, path: string) => {
        const { machines } = get();
        set({
          machines: machines.map(m => {
            if (m.id !== machineId) return m;
            const dirs = m.web_enumeration?.directories || [];
            if (dirs.some(d => d.path === path)) return m;
            return {
              ...m,
              web_enumeration: {
                ...m.web_enumeration!,
                directories: [...dirs, { path, status: 200, description: 'Navegación' }]
              }
            };
          }),
          hasNewNetworkInfo: true
        });
      },

      confirmRCE: (machineId: string, user: string, method: string) => {
        const { machines, hasNewNetworkInfo } = get();
        // Verificar si ya existe una credencial reverse-shell para esta máquina
        const targetMachine = machines.find(m => m.id === machineId);
        const alreadyHasRCE = targetMachine?.found_credentials?.some(c => c.service === 'reverse-shell');
        
        set({
          machines: machines.map(m => {
            if (m.id !== machineId) return m;
            const creds = m.found_credentials || [];
            if (creds.some(c => c.user === user && c.service === 'reverse-shell')) return m;
            return {
              ...m,
              found_credentials: [
                ...creds, 
                { user, pass: 'vía shell', file: method, verified: true, service: 'reverse-shell' }
              ]
            };
          }),
          // Solo activar el parpadeo si no había RCE antes
          hasNewNetworkInfo: alreadyHasRCE ? hasNewNetworkInfo : true
        });
      },

      changeMachine: (machineId) => {
        set({ activeMachineId: machineId });
      },

      setActiveApp: (app) => set({ activeApp: app }),

      refreshBrowser: () => set(state => ({ browserKey: state.browserKey + 1 })),

      toggleNetworkMap: (show) => {
        const nextState = show !== undefined ? show : !get().showNetworkMap;
        set({
          showNetworkMap: nextState,
          ...(nextState ? { hasNewNetworkInfo: false } : {})
        });
      },

      setHasNewNetworkInfo: (val) => set({ hasNewNetworkInfo: val }),

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
          hasNewNetworkInfo: false,
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
      setBlockingCommand: (command) => set({ blockingCommand: command }),
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

      reportVulnerability: (machineId, vulnId, status) => {
        const { machines } = get();
        set({
          machines: machines.map(m => {
            if (m.id !== machineId) return m;
            const vulnerabilities = m.vulnerabilities || [];
            const existingIdx = vulnerabilities.findIndex(v => v.id === vulnId);
            
            if (existingIdx >= 0) {
              const updated = [...vulnerabilities];
              updated[existingIdx] = { ...updated[existingIdx], status };
              return { ...m, vulnerabilities: updated };
            }
            
            return { 
              ...m, 
              vulnerabilities: [...vulnerabilities, { id: vulnId, name: vulnId, status }] 
            };
          }),
          hasNewNetworkInfo: true
        });
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

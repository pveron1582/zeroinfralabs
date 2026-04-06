// ── store/scenarioStore.ts ─────────────────────────────────────────
// Zustand global state store — orchestrates slices and persistence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { assignDHCP } from '../utils/network';
import { createEnumerationSnapshot, hasEnumerationChanged } from '../utils/networkAlert';
import type { Machine, FileEntry, BlockingCommand } from '../types';
import { SCENARIOS } from '../laboratorios/laboratorios';
import type { MsfState } from '../commands/tools/msfconsole';
import type { ScenarioState, Notification, FtpSessionState, AppView } from './types';
import type { EnumerationSnapshot } from '../utils/networkAlert';

// ── Constants ────────────────────────────────────────────────────────
const DEFAULT_TERM_COLOR = '#10b981';

// ── Initial state ────────────────────────────────────────────────────
const initialState = {
  language: 'en' as const,
  showSurvey: false,
  pendingSurveyScenario: null as ScenarioState['pendingSurveyScenario'],
  view: 'landing' as AppView,
  currentScenario: SCENARIOS[0],
  machines: SCENARIOS[0].machines.map(m => ({ ...m, discovery_level: 0 })),
  missions: SCENARIOS[0].missions,
  currentMissionId: 1,
  activeMachineId: SCENARIOS[0].initialMachineId,
  activeApp: 'terminal' as const,
  browserKey: 0,
  showNetworkMap: false,
  hasNewNetworkInfo: false,
  notification: null as Notification | null,
  termColor: DEFAULT_TERM_COLOR,
  showMachineLoader: false,
  loadingMachine: null as Machine | null,
  browserCurrentUrl: 'https://www.google.com',
  browserIsLoggedIn: false,
  browserNavHistory: ['https://www.google.com'],
  browserNavIdx: 0,
  listeningPort: null as number | null,
  blockingCommand: null as BlockingCommand | null,
  currentDir: '/',
  msfState: null as MsfState | null,
  ftpSession: null as FtpSessionState | null,
  sshSession: null as SshSessionState | null,
  _prevMachinesSnapshot: [] as EnumerationSnapshot[],
  showCompletionOverlay: false,
};

// ── Network change detection ─────────────────────────────────────────
const _detectNetworkChanges = () => {
  const state = useScenarioStore.getState();
  const prevSnapshot = state._prevMachinesSnapshot || [];
  const newSnapshot = createEnumerationSnapshot(state.machines);

  if (hasEnumerationChanged(prevSnapshot, newSnapshot)) {
    useScenarioStore.setState({ hasNewNetworkInfo: true, _prevMachinesSnapshot: newSnapshot });
  } else {
    useScenarioStore.setState({ _prevMachinesSnapshot: newSnapshot });
  }
};

// ── Store ────────────────────────────────────────────────────────────
export const useScenarioStore = create<ScenarioState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ── View & Language ───────────────────────────────────────────────
      setLanguage: (lang) => set({ language: lang }),
      setView: (view) => set({ view }),

      // ── Survey ────────────────────────────────────────────────────────
      triggerSurvey: (scenario) => set({ showSurvey: true, pendingSurveyScenario: scenario }),
      closeSurvey: () => set({ showSurvey: false, pendingSurveyScenario: null }),

      // ── Completion Overlay ────────────────────────────────────────────
      setShowCompletionOverlay: (show) => set({ showCompletionOverlay: show }),

      // ── Session ───────────────────────────────────────────────────────
      setMsfState: (state) => set({ msfState: state }),
      setFtpSession: (session) => set({ ftpSession: session }),
      setSshSession: (session) => set({ sshSession: session }),

      // ── Scenario selection ────────────────────────────────────────────
      selectScenario: (id) => {
        const scenario = SCENARIOS.find(s => s.id === id);
        if (!scenario) return;

        set({
          loadingMachine: scenario.machines[0],
          showMachineLoader: true,
        });

        setTimeout(() => {
          const { language } = get();
          const newMachines = scenario.machines.map(m => {
            const filteredFiles = (m.files || []).filter(f => {
              if (f.path === '/srv/ftp/nota.txt') return language === 'es';
              if (f.path === '/srv/ftp/note.txt') return language === 'en';
              return true;
            });
            return { ...m, discovery_level: 0, files: filteredFiles };
          });
          set({
            currentScenario: scenario,
            machines: newMachines,
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
            blockingCommand: null,
            msfState: null,
            ftpSession: null,
            sshSession: null,
            currentDir: '/root/',
            _prevMachinesSnapshot: createEnumerationSnapshot(newMachines),
            showCompletionOverlay: false,
          });
          window.history.pushState({ view: 'workspace', scenarioId: id }, '');
        }, 6500);
      },

      // ── Missions ──────────────────────────────────────────────────────
      completeMission: (id) => {
        const { missions, machines, currentMissionId } = get();
        
        const mission = missions.find(m => m.id === id);
        if (mission?.status === 'completed') return;

        const updatedMissions = missions.map(m => {
          if (m.id === id) return { ...m, status: 'completed' as const };
          if (m.id === id + 1 && m.status === 'pending') return { ...m, status: 'active' as const };
          return m;
        });

        const updatedMachines = mission?.targetMachineId
          ? machines.map(m => {
              if (m.id !== mission.targetMachineId) return m;
              const prevLevel = m.discovery_level || 0;
              const newLevel = Math.max(prevLevel, mission.discoveryLevel || 0);
              return { ...m, discovery_level: newLevel };
            })
          : machines;

        set({
          missions: updatedMissions,
          machines: updatedMachines,
          currentMissionId: id === currentMissionId ? currentMissionId + 1 : currentMissionId,
        });

        _detectNetworkChanges();

        // Check if all missions are completed
        const allComplete = updatedMissions.every(m => m.status === 'completed');
        if (allComplete) {
          set({ showCompletionOverlay: true });
        }

        const title = missions.find(m => m.id === id)?.title;
        if (title) {
          set({
            notification: { text: `✓ Misión completada: ${title}`, id: Date.now() }
          });
          setTimeout(() => set({ notification: null }), 3500);
        }
      },

      revealNextHint: (missionId) => {
        const { missions } = get();
        const mission = missions.find(m => m.id === missionId);
        if (!mission || !mission.hints) return;
        
        const maxHints = 2;
        if (mission.hintLevel >= maxHints) return;
        
        const updatedMissions = missions.map(m => {
          if (m.id !== missionId) return m;
          return { ...m, hintLevel: m.hintLevel + 1 };
        });
        
        set({ missions: updatedMissions });
      },

      // ── Machine data ──────────────────────────────────────────────────
      findCredentials: (machineId, user, pass, file, service = 'unknown') => {
        const { machines } = get();
        set({
          machines: machines.map(m => {
            if (m.id !== machineId) return m;
            const existing = m.found_credentials || [];
            const existingCred = existing.find(c => c.service === service);
            const filtered = existing.filter(c => c.service !== service);
            return {
              ...m,
              discovery_level: Math.max(m.discovery_level || 0, 3),
              found_credentials: [...filtered, { 
                file: file || '/etc/passwd', 
                user, 
                pass, 
                verified: false, 
                service 
              }]
            };
          }),
        });
        _detectNetworkChanges();
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
        _detectNetworkChanges();
      },

      setPossibleUsers: (machineId, users) => {
        const { machines } = get();
        set({
          machines: machines.map(m => 
            m.id === machineId ? { ...m, possible_ssh_users: users } : m
          )
        });
        _detectNetworkChanges();
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
        _detectNetworkChanges();
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
        _detectNetworkChanges();
      },

      addFileToMachine: (machineId: string, file: FileEntry) => {
        const { machines } = get();
        set({
          machines: machines.map(m => {
            if (m.id !== machineId) return m;
            const filtered = (m.files || []).filter(f => f.path !== file.path);
            return {
              ...m,
              files: [...filtered, file]
            };
          })
        });
        _detectNetworkChanges();
      },

      setPrivescCompleted: (machineId: string) => {
        const { machines } = get();
        set({
          machines: machines.map(m =>
            m.id === machineId ? { ...m, privesc_completed: true, discovery_level: Math.max(m.discovery_level || 0, 4) } : m
          )
        });
        _detectNetworkChanges();
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
        });
        _detectNetworkChanges();
      },

      confirmRCE: (machineId: string, user: string, method: string) => {
        const { machines } = get();
        const targetMachine = machines.find(m => m.id === machineId);
        const alreadyHasRCE = targetMachine?.found_credentials?.some(c => c.service === 'reverse-shell');
        
        if (alreadyHasRCE) return;
        
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
        });
        _detectNetworkChanges();
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
        });
        _detectNetworkChanges();
      },

      // ── Navigation & UI ───────────────────────────────────────────────
      changeMachine: (machineId) => set({ activeMachineId: machineId }),
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
          showSurvey: false,
          pendingSurveyScenario: null,
          showCompletionOverlay: false,
          _prevMachinesSnapshot: [],
        });
        if (window.history.state?.view === 'workspace') {
          window.history.back();
        }
      },

      // ── Browser ───────────────────────────────────────────────────────
      setBrowserUrl: (url) => set({ browserCurrentUrl: url }),
      setBrowserLoggedIn: (loggedIn) => set({ browserIsLoggedIn: loggedIn }),
      setBrowserNavHistory: (history, idx) => set({ browserNavHistory: history, browserNavIdx: idx }),

      // ── Session controls ──────────────────────────────────────────────
      setListeningPort: (port) => set({ listeningPort: port }),
      setBlockingCommand: (command) => set({ blockingCommand: command }),
      setCurrentDir: (dir) => set({ currentDir: dir }),

      // ── Getters ───────────────────────────────────────────────────────
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
        view: state.view,
        language: state.language,
        currentScenario: state.currentScenario,
        machines: state.machines,
        missions: state.missions,
        currentMissionId: state.currentMissionId,
        activeMachineId: state.activeMachineId,
        activeApp: state.activeApp,
        termColor: state.termColor,
        showNetworkMap: state.showNetworkMap,
        browserCurrentUrl: state.browserCurrentUrl,
        browserIsLoggedIn: state.browserIsLoggedIn,
        browserNavHistory: state.browserNavHistory,
        browserNavIdx: state.browserNavIdx,
        msfState: state.msfState?.active ? state.msfState : null,
      }),
    }
  )
);

import type { StateCreator } from 'zustand';
import type { ScenarioState } from '../types';
import type { Machine, Scenario, Mission, FileEntry } from '../../types';
import { SCENARIOS, TEST_SCENARIO } from '../../laboratorios/laboratorios';
import { createEnumerationSnapshot, hasEnumerationChanged, type EnumerationSnapshot } from '../../utils/networkAlert';
import { shellManager } from '../../frameworks/shells/ShellManager';

export interface ScenarioSlice {
  currentScenario: Scenario;
  machines: Machine[];
  missions: Mission[];
  currentMissionId: number;
  activeMachineId: string;
  _prevMachinesSnapshot: EnumerationSnapshot[];

  selectScenario: (id: string) => void;
  completeMission: (id: number) => void;
  revealNextHint: (missionId: number) => void;
  findCredentials: (machineId: string, user: string, pass: string, file?: string, service?: string) => void;
  verifyCredentials: (machineId: string, service?: string) => void;
  setPossibleUsers: (machineId: string, users: string[]) => void;
  addFailedUser: (machineId: string, user: string) => void;
  setSudoPrivileges: (machineId: string, user: string, commands: string[], canSudo: boolean) => void;
  setPrivescCompleted: (machineId: string) => void;
  resetPrivescCompleted: (machineId: string) => void;
  setSuUser: (machineId: string, suUser?: string) => void;
  addFileToMachine: (machineId: string, file: FileEntry) => void;
  setMachineFiles: (machineId: string, files: FileEntry[]) => void;
  addExploredDirectory: (machineId: string, path: string) => void;
  confirmRCE: (machineId: string, user: string, method: string) => void;
  reportVulnerability: (machineId: string, vulnId: string, status: 'detected' | 'confirmed') => void;
  changeMachine: (machineId: string) => void;
  getActiveMachine: () => Machine;
  getScenarioMachines: () => Machine[];
}

export const createScenarioSlice: StateCreator<ScenarioState, [], [], ScenarioSlice> = (set, get) => ({
  currentScenario: SCENARIOS[0],
  machines: SCENARIOS[0].machines.map(m => ({ ...m, discovery_level: 0 })),
  missions: SCENARIOS[0].missions,
  currentMissionId: 1,
  activeMachineId: SCENARIOS[0].initialMachineId,
  _prevMachinesSnapshot: [],

  selectScenario: (id: string) => {
    const scenario = id === TEST_SCENARIO.id ? TEST_SCENARIO : SCENARIOS.find(s => s.id === id);
    if (!scenario) return;

    shellManager.reset();
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

      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState({ view: 'workspace', scenarioId: id }, '');
      }
    }, 6500);
  },

  completeMission: (id: number) => {
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

    // Detect network changes
    const state = get();
    const prevSnapshot = state._prevMachinesSnapshot || [];
    const newSnapshot = createEnumerationSnapshot(state.machines);
    if (hasEnumerationChanged(prevSnapshot, newSnapshot)) {
      set({ hasNewNetworkInfo: true, _prevMachinesSnapshot: newSnapshot });
    } else {
      set({ _prevMachinesSnapshot: newSnapshot });
    }

    // Check completion
    const allComplete = updatedMissions.every(m => m.status === 'completed');
    if (allComplete) {
      set({ showCompletionOverlay: true });
    }

    const title = missions.find(m => m.id === id)?.title;
    if (title) {
      set({ notification: { text: `✓ Misión completada: ${title}`, id: Date.now() } });
      setTimeout(() => set({ notification: null }), 3500);
    }
  },

  revealNextHint: (missionId: number) => {
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

  findCredentials: (machineId, user, pass, file, service = 'unknown') => {
    const { machines } = get();
    set({
      machines: machines.map(m => {
        if (m.id !== machineId) return m;
        const existing = m.found_credentials || [];
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
        const filtered = (m.files || []).filter(f => f.path !== file.path);
        return {
          ...m,
          files: [...filtered, file]
        };
      })
    });
  },

  setMachineFiles: (machineId: string, files: FileEntry[]) => {
    const { machines } = get();
    set({
      machines: machines.map(m =>
        m.id === machineId ? { ...m, files } : m
      )
    });
  },

  setPrivescCompleted: (machineId: string) => {
    const { machines } = get();
    set({
      machines: machines.map(m =>
        m.id === machineId ? { ...m, privesc_completed: true, discovery_level: Math.max(m.discovery_level || 0, 4) } : m
      )
    });
  },

  // Cambia el usuario actual de una máquina (su). Recrea la máquina para que
  // el Terminal re-renderice y el prompt refleje el nuevo usuario (su_user).
  setSuUser: (machineId: string, suUser?: string) => {
    const { machines } = get();
    set({
      machines: machines.map(m =>
        m.id === machineId ? { ...m, su_user: suUser } : m
      ),
    });
  },

  // Quita la escalada de root de una máquina. Se usa al salir de una shell
  // root (exit): vuelves a tu usuario anterior y no quedas "root fantasma".
  resetPrivescCompleted: (machineId: string) => {
    const { machines } = get();
    set({
      machines: machines.map(m =>
        m.id === machineId ? { ...m, privesc_completed: false } : m
      ),
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
    });
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
  },

  changeMachine: (machineId) => set({ activeMachineId: machineId }),

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
});

import type { StateCreator } from 'zustand';
import type { ScenarioState } from '../types';
import type { Machine, Scenario, Mission, FileEntry } from '../../types';
import { SCENARIOS, TEST_SCENARIO } from '../../laboratorios/laboratorios';
import { createEnumerationSnapshot, hasEnumerationChanged, type EnumerationSnapshot } from '../../utils/networkAlert';
import { shellManager } from '../../frameworks/shells/ShellManager';
import {
  updateMachine, bumpDiscoveryLevel, addFoundCredential, verifyCredentials,
  setPossibleUsers, addFailedUser, setSudoPrivileges,
  addFileToMachine, setMachineFiles, setPrivescCompleted, resetPrivescCompleted,
  setSuUser, addExploredDirectory, confirmRCE, reportVulnerability,
} from './machineMutations';

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
      ? updateMachine(machines, mission.targetMachineId, m =>
          bumpDiscoveryLevel(m, mission.discoveryLevel || 0)
        )
      : machines;

    set({
      missions: updatedMissions,
      machines: updatedMachines,
      currentMissionId: id === currentMissionId ? currentMissionId + 1 : currentMissionId,
    });

    const state = get();
    const prevSnapshot = state._prevMachinesSnapshot || [];
    const newSnapshot = createEnumerationSnapshot(state.machines);
    if (hasEnumerationChanged(prevSnapshot, newSnapshot)) {
      set({ hasNewNetworkInfo: true, _prevMachinesSnapshot: newSnapshot });
    } else {
      set({ _prevMachinesSnapshot: newSnapshot });
    }

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

    set({
      missions: missions.map(m =>
        m.id !== missionId ? m : { ...m, hintLevel: m.hintLevel + 1 }
      ),
    });
  },

  findCredentials: (machineId, user, pass, file, service = 'unknown') => {
    set({ machines: addFoundCredential(get().machines, machineId, { file, user, pass, verified: false, service }) });
  },

  verifyCredentials: (machineId, service) => {
    set({ machines: verifyCredentials(get().machines, machineId, service) });
  },

  setPossibleUsers: (machineId, users) => {
    set({ machines: setPossibleUsers(get().machines, machineId, users) });
  },

  addFailedUser: (machineId, user) => {
    set({ machines: addFailedUser(get().machines, machineId, user) });
  },

  setSudoPrivileges: (machineId, user, commands, canSudo) => {
    set({ machines: setSudoPrivileges(get().machines, machineId, user, commands, canSudo) });
  },

  addFileToMachine: (machineId, file) => {
    set({ machines: addFileToMachine(get().machines, machineId, file) });
  },

  setMachineFiles: (machineId, files) => {
    set({ machines: setMachineFiles(get().machines, machineId, files) });
  },

  setPrivescCompleted: (machineId) => {
    set({ machines: setPrivescCompleted(get().machines, machineId) });
  },

  resetPrivescCompleted: (machineId) => {
    set({ machines: resetPrivescCompleted(get().machines, machineId) });
  },

  setSuUser: (machineId, suUser) => {
    set({ machines: setSuUser(get().machines, machineId, suUser) });
  },

  addExploredDirectory: (machineId, path) => {
    set({ machines: addExploredDirectory(get().machines, machineId, path) });
  },

  confirmRCE: (machineId, user, method) => {
    set({ machines: confirmRCE(get().machines, machineId, user, method) });
  },

  reportVulnerability: (machineId, vulnId, status) => {
    set({ machines: reportVulnerability(get().machines, machineId, vulnId, status) });
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
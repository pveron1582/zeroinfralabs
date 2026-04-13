// ── store/__tests__/selectors.test.ts ──────────────────────────────────
// Tests for store selectors

import { describe, it, expect } from 'vitest';
import {
  selectScenario,
  selectMachines,
  selectMissions,
  selectActiveMachine,
  selectIsWebScenario,
} from '../selectors';
import type { ScenarioState } from '../types';

const createMockState = (overrides: Partial<ScenarioState> = {}): ScenarioState => ({
  currentScenario: {
    id: 'test-scenario',
    name: 'Test Scenario',
    category: 'Web',
    difficulty: 'Easy',
    description: 'Test',
    descriptionEs: 'Test ES',
    tagline: 'Test tagline',
    taglineEs: 'Test tagline ES',
    tools: ['nmap'],
    networkRange: '192.168.1.0/24',
    targetMachine: {
      id: 'target-01',
      machine_info: {
        hostname: 'target',
        ip: '192.168.1.10',
        mac: '00:11:22:33:44:55',
        os: 'Linux',
        status: 'up',
        type: 'server',
      },
      discovery_level: 0,
      scan_results: { ports: [] },
      learning_steps: [],
      files: [],
      ports: [],
      web_enumeration: { web_server: 'apache', cms: 'wordpress', directories: [] },
    },
    attackerMachine: {
      id: 'attacker-01',
      machine_info: {
        hostname: 'kali',
        ip: '192.168.1.5',
        mac: '00:11:22:33:44:66',
        os: 'Kali Linux',
        status: 'up',
        type: 'workstation',
      },
      discovery_level: 4,
      scan_results: { ports: [] },
      learning_steps: [],
      files: [],
    },
    learningSteps: [],
  },
  machines: [],
  missions: [],
  view: 'landing',
  selectedScenarioId: null,
  currentDir: '/',
  history: [],
  historyIndex: -1,
  browserCurrentUrl: 'https://www.google.com',
  browserNavHistory: ['https://www.google.com'],
  browserNavIdx: 0,
  browserIsLoggedIn: false,
  language: 'en',
  showSurvey: false,
  surveyCompleted: false,
  msfState: null,
  credentialsFound: [],
  surveyResponses: [],
  userActivity: {
    commandsExecuted: [],
    timeInScenario: 0,
    startTime: Date.now(),
    hintsRevealed: [],
  },
  lastSyncedAt: null,
  analyticsOptOut: false,
  blockingCommand: null,
  listeningPort: null,
  ftpSession: null,
  sshSession: null,
  donationShown: false,
  goHome: () => {},
  goToScenario: () => {},
  setCurrentScenario: () => {},
  setLanguage: () => {},
  setView: () => {},
  setCurrentMachine: () => {},
  setCurrentDir: () => {},
  completeMission: () => {},
  addToHistory: () => {},
  navigateHistory: () => {},
  resetHistory: () => {},
  goBack: () => {},
  goForward: () => {},
  browserNavigateTo: () => {},
  browserGoBack: () => {},
  browserGoForward: () => {},
  browserLogin: () => {},
  browserLogout: () => {},
  showHint: () => {},
  completeSurvey: () => {},
  setMsfState: () => {},
  updateMsfState: () => {},
  onCredentialsFound: () => {},
  onVerifyCredentials: () => {},
  resetScenario: () => {},
  recordCommand: () => {},
  updateActivityTime: () => {},
  revealHint: () => {},
  clearUserActivity: () => {},
  setAnalyticsOptOut: () => {},
  setBlockingCommand: () => {},
  clearBlockingCommand: () => {},
  setListeningPort: () => {},
  reportVulnerability: () => {},
  setFtpSession: () => {},
  clearFtpSession: () => {},
  setSshSession: () => {},
  clearSshSession: () => {},
  checkAndShowDonation: () => false,
  markDonationShown: () => {},
  resetDonationState: () => {},
  getActiveMachine: () => undefined,
  ...overrides,
} as ScenarioState);

describe('selectors', () => {
  describe('selectScenario', () => {
    it('debe retornar el escenario actual', () => {
      const state = createMockState();
      expect(selectScenario(state)).toEqual(state.currentScenario);
    });
  });

  describe('selectMachines', () => {
    it('debe retornar el array de máquinas', () => {
      const machines = [
        {
          id: 'machine-1',
          machine_info: {
            hostname: 'test',
            ip: '192.168.1.1',
            mac: '00:11:22:33:44:55',
            os: 'Linux',
            status: 'up' as const,
            type: 'server' as const,
          },
          discovery_level: 0,
          scan_results: { ports: [] },
          learning_steps: [],
          files: [],
          web_enumeration: { web_server: 'apache', cms: 'none', directories: [] },
        },
      ];
      const state = createMockState({ machines });
      expect(selectMachines(state)).toEqual(machines);
    });

    it('debe retornar array vacío si no hay máquinas', () => {
      const state = createMockState({ machines: [] });
      expect(selectMachines(state)).toEqual([]);
    });
  });

  describe('selectMissions', () => {
    it('debe retornar el array de misiones', () => {
      const missions = [
        {
          id: 1,
          title: 'Test Mission',
          description: 'Test description',
          targetMachineId: 'target-01',
          discoveryLevel: 2,
          status: 'active' as const,
          hints: { hint1: { en: 'hint', es: 'pista' }, hint2: { en: 'hint2', es: 'pista2' } },
          hintLevel: 0,
        },
      ];
      const state = createMockState({ missions });
      expect(selectMissions(state)).toEqual(missions);
    });
  });

  describe('selectActiveMachine', () => {
    it('debe retornar la máquina activa', () => {
      const attackerMachine = {
        id: 'attacker-01',
        machine_info: {
          hostname: 'kali',
          ip: '192.168.1.5',
          mac: '00:11:22:33:44:66',
          os: 'Kali Linux',
          status: 'up' as const,
          type: 'workstation' as const,
        },
        discovery_level: 4,
        scan_results: { ports: [] },
        learning_steps: [],
        files: [],
        web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
      };
      const state = createMockState({
        machines: [attackerMachine],
      });
      // Mock getActiveMachine to return first machine
      state.getActiveMachine = () => attackerMachine;
      expect(selectActiveMachine(state)).toEqual(attackerMachine);
    });
  });

  describe('selectIsWebScenario', () => {
    it('debe retornar true para escenario Web', () => {
      const state = createMockState();
      expect(selectIsWebScenario(state)).toBe(true);
    });

    it('debe retornar false para escenario Network', () => {
      const state = createMockState({
        currentScenario: {
          ...createMockState().currentScenario,
          category: 'Network',
        },
      });
      expect(selectIsWebScenario(state)).toBe(false);
    });
  });
});

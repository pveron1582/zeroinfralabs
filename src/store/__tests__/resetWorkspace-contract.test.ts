import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useScenarioStore } from '../scenarioStore';
import { shellManager } from '../../frameworks/shells/ShellManager';
import { makeTestScenario } from '../../test/fixtures';

vi.mock('zustand/middleware', () => ({
  persist: (config: any) => (set: any, get: any, api: any) => config(set, get, api),
}));

describe('resetWorkspace — contrato por slices', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Desde P1 3.3 el store arranca con un workspace vacío (no importa los
    // labs): el test siembra su escenario para poder afirmar sobre el reset.
    const scenario = makeTestScenario();
    useScenarioStore.setState({
      currentScenario: scenario,
      machines: scenario.machines,
      missions: scenario.missions,
      activeMachineId: scenario.initialMachineId,
    });
    useScenarioStore.setState({
      view: 'workspace',
      showNetworkMap: true,
      hasNewNetworkInfo: true,
      notification: { text: 'test', id: 1 },
      browserCurrentUrl: 'https://evil.com',
      browserIsLoggedIn: true,
      browserNavHistory: ['https://evil.com'],
      browserNavIdx: 1,
      listeningPort: 4444,
      blockingCommand: { message: 'nc' },
      msfState: { active: true, module: 'x', options: {}, sessionOpen: false, shellMode: false, auxChecked: false, uidChecked: false },
      ftpSession: { active: true, targetIp: '10.0.0.1', targetId: 'm1', username: 'ftp' },
      sshSession: { active: true, targetIp: '10.0.0.2', targetId: 'm2', username: 'ssh' },
      showSurvey: true,
      pendingSurveyScenario: useScenarioStore.getState().currentScenario,
      showCompletionOverlay: true,
      _prevMachinesSnapshot: [{ discoveryLevel: 0, credentialsCount: 0, verifiedCredentialsCount: 0, directoriesCount: 0, vulnerabilitiesCount: 0, privescCompleted: false, possibleUsersCount: 0 }],
      globalResetDoneForScenario: 'lab1',
    });
  });

  it('resetWorkspace produce exactamente la unión de resetUiState + resetTerminalState + resetScenarioWorkspaceState', () => {
    const store = useScenarioStore.getState();

    const uiPatch = store.resetUiState();
    const terminalPatch = store.resetTerminalState();
    const scenarioPatch = store.resetScenarioWorkspaceState();
    const expected = { ...uiPatch, ...terminalPatch, ...scenarioPatch };

    store.resetWorkspace();
    const actual = useScenarioStore.getState();

    for (const key of Object.keys(expected) as Array<keyof typeof expected>) {
      expect(actual[key]).toEqual(expected[key]);
    }
  });

  it('llama shellManager.reset()', () => {
    const spy = vi.spyOn(shellManager, 'reset');
    useScenarioStore.getState().resetWorkspace();
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });

  it('resetea TODOS los campos que resetWorkspace promete tocar', () => {
    useScenarioStore.getState().resetWorkspace();
    const s = useScenarioStore.getState();

    expect(s.view).toBe('landing');
    expect(s.showNetworkMap).toBe(false);
    expect(s.hasNewNetworkInfo).toBe(false);
    expect(s.notification).toBeNull();
    expect(s.browserCurrentUrl).toBe('https://www.google.com');
    expect(s.browserIsLoggedIn).toBe(false);
    expect(s.browserNavHistory).toEqual(['https://www.google.com']);
    expect(s.browserNavIdx).toBe(0);
    expect(s.listeningPort).toBeNull();
    expect(s.blockingCommand).toBeNull();
    expect(s.msfState).toBeNull();
    expect(s.ftpSession).toBeNull();
    expect(s.sshSession).toBeNull();
    expect(s.showSurvey).toBe(false);
    expect(s.pendingSurveyScenario).toBeNull();
    expect(s.showCompletionOverlay).toBe(false);
    expect(s._prevMachinesSnapshot).toEqual([]);
    expect(s.globalResetDoneForScenario).toBeNull();
  });

  it('no toca campos que NO debe resetear (persistidos o de máquina)', () => {
    const lang = useScenarioStore.getState().language;
    useScenarioStore.getState().resetWorkspace();
    const s = useScenarioStore.getState();

    expect(s.language).toBe(lang);
    expect(s.currentScenario).toBeDefined();
    expect(s.machines.length).toBeGreaterThan(0);
    expect(s.missions.length).toBeGreaterThan(0);
    expect(s.identityStack).toEqual([]);
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useScenarioStore } from '../scenarioStore';
import { shellManager } from '../../frameworks/shells/ShellManager';

vi.mock('zustand/middleware', () => ({
  persist: (config: any) => (set: any, get: any, api: any) => config(set, get, api),
}));

describe('resetWorkspace — contrato por slices', () => {
  beforeEach(() => {
    vi.useFakeTimers();
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
      blockingCommand: { command: 'nc', args: [] },
      msfState: { prompt: 'msf6>', exploit: 'x', payload: 'y', handlerRunning: false, sessionCount: 0 },
      ftpSession: { user: 'ftp', machineId: 'm1' },
      sshSession: { user: 'ssh', machineId: 'm2' },
      showSurvey: true,
      pendingSurveyScenario: 'lab1',
      showCompletionOverlay: true,
      _prevMachinesSnapshot: [{ ip: '1.1.1.1', ports: [] }],
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

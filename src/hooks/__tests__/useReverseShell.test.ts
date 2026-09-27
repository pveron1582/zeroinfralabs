// ── hooks/__tests__/useReverseShell.test.ts ─────────────────────────
// Cubre las ramas de useReverseShell (35% branch antes de este test):
// early-return sin conexión/busy, conexión vía blockingCommand y vía
// store, máquina víctima lfi vs normal, y onVerifyCredentials opcional.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReverseShell } from '../useReverseShell';

const storeRef = vi.hoisted(() => ({
  current: {
    blockingCommand: null as any,
    setBlockingCommand: vi.fn(),
    setListeningPort: vi.fn(),
    setSuUser: vi.fn(),
  },
}));

vi.mock('../../store/scenarioStore', () => ({
  useScenarioStore: Object.assign(
    vi.fn((selector: any) => selector(storeRef.current)),
    { getState: vi.fn(() => storeRef.current), setState: vi.fn() }
  ),
}));

function makeVictim(id: string) {
  return {
    id,
    machine_info: { hostname: 'victim', ip: '10.10.10.20', mac: '', os: '', status: 'active', type: 'server' },
  };
}

function makeOpts(overrides: any = {}) {
  return {
    blockingCommand: null as any,
    busy: false,
    allMachines: [makeVictim('target-01')],
    attackerMachineId: 'attacker-01',
    listeningPort: 4444,
    setBlockingCommand: vi.fn(),
    setBusy: vi.fn(),
    setListeningPort: vi.fn(),
    setCurrentDir: vi.fn(),
    pushIdentity: vi.fn(),
    onChangeMachine: vi.fn(),
    onMissionComplete: vi.fn(),
    onVerifyCredentials: vi.fn(),
    appendOutput: vi.fn(),
    ...overrides,
  };
}

describe('useReverseShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeRef.current = {
      blockingCommand: null, setBlockingCommand: vi.fn(),
      setListeningPort: vi.fn(), setSuUser: vi.fn(),
    };
  });

  it('no hace nada si no hay conexión o no está busy', () => {
    const opts = makeOpts();
    renderHook(() => useReverseShell(opts));
    expect(opts.appendOutput).not.toHaveBeenCalled();
  });

  it('procesa la conexión entrante (máquina normal) y apila identidad', () => {
    const opts = makeOpts({ busy: true, blockingCommand: { connected: true, message: 'x' } });
    renderHook(() => useReverseShell(opts));
    expect(opts.appendOutput).toHaveBeenCalledOnce();
    expect(opts.onChangeMachine).toHaveBeenCalledWith('target-01');
    expect(opts.setCurrentDir).toHaveBeenCalledWith('/var/www/html/');
    expect(opts.pushIdentity).toHaveBeenCalledWith(expect.objectContaining({ suUser: 'admin' }));
    expect(opts.onMissionComplete).toHaveBeenCalledWith(6);
    expect(opts.onVerifyCredentials).toHaveBeenCalled();
    expect(opts.setBlockingCommand).toHaveBeenCalledWith(null);
    expect(opts.setBusy).toHaveBeenCalledWith(false);
  });

  it('usa www-data cuando la víctima es lfi', () => {
    const opts = makeOpts({ busy: true, blockingCommand: { connected: true }, allMachines: [makeVictim('lab-lfi-01')] });
    renderHook(() => useReverseShell(opts));
    expect(opts.pushIdentity).toHaveBeenCalledWith(expect.objectContaining({ suUser: 'www-data' }));
  });

  it('lee la conexión desde el store si blockingCommand no la trae', () => {
    storeRef.current.blockingCommand = { connected: true };
    const opts = makeOpts({ busy: true });
    renderHook(() => useReverseShell(opts));
    expect(opts.appendOutput).toHaveBeenCalledOnce();
    expect(opts.onChangeMachine).toHaveBeenCalledWith('target-01');
  });

  it('funciona sin onVerifyCredentials', () => {
    const opts = makeOpts({ busy: true, blockingCommand: { connected: true }, onVerifyCredentials: undefined });
    renderHook(() => useReverseShell(opts));
    expect(opts.appendOutput).toHaveBeenCalledOnce();
  });
});

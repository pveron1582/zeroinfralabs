// ── hooks/__tests__/useIdentityStack.test.ts ──────────────────────
// Aislamiento de identidad por terminal (HIGH #2): en modo terminalId los
// pushes/pops viven en el stack LOCAL y nunca escriben el store compartido
// (applyIdentity escribía suUser/cwd/privesc y borraba el su de las
// demás terminales).
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIdentityStack } from '../useIdentityStack';
import type { Machine } from '../../types';

const storeRef = vi.hoisted(() => ({
  current: {
    identityStack: [] as Array<{ machineId: string; suUser?: string; cwd: string }>,
    pushIdentity: vi.fn(),
    popIdentity: vi.fn((): { machineId: string; suUser?: string; cwd: string } | null => null),
    resetIdentity: vi.fn(),
    applyIdentity: vi.fn(),
  },
}));

vi.mock('../../store/scenarioStore', () => ({
  useScenarioStore: Object.assign(
    vi.fn((selector: (s: typeof storeRef.current) => unknown) => selector(storeRef.current)),
    { getState: vi.fn(() => storeRef.current) },
  ),
}));

function makeMachine(id = 'victim-01'): Machine {
  return {
    id,
    machine_info: {
      hostname: 'host', ip: '10.0.0.5', mac: '00:11:22:33:44:55',
      os: 'Ubuntu', status: 'up', type: 'server',
    },
    discovery_level: 0,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  } as Machine;
}

beforeEach(() => {
  vi.clearAllMocks();
  storeRef.current.identityStack = [];
});

describe('modo terminalId (stack local)', () => {
  it('push/pop no debe tocar el store', () => {
    const machine = makeMachine('victim-01');
    const onChangeMachine = vi.fn();
    const setCurrentDir = vi.fn();
    const { result } = renderHook(() => useIdentityStack({
      initialMachine: machine, onChangeMachine, setCurrentDir, terminalId: 't-A',
    }));

    act(() => result.current.pushIdentity({ machineId: 'victim-01', suUser: 'root', cwd: '/root' }));
    expect(result.current.identityStack).toHaveLength(2);
    expect(storeRef.current.pushIdentity).not.toHaveBeenCalled();

    let popped = false;
    act(() => { popped = result.current.popIdentity(); });
    expect(popped).toBe(true);
    expect(storeRef.current.popIdentity).not.toHaveBeenCalled();
    expect(storeRef.current.applyIdentity).not.toHaveBeenCalled();
    expect(onChangeMachine).toHaveBeenCalledWith('victim-01');
    expect(setCurrentDir).toHaveBeenCalledWith('/root');
    expect(result.current.identityStack).toHaveLength(1);
  });

  it('topSuUser expone el su del frame superior cuando pertenece a la máquina activa', () => {
    const machine = makeMachine('victim-01');
    const { result } = renderHook(() => useIdentityStack({
      initialMachine: machine, onChangeMachine: vi.fn(), terminalId: 't-A',
    }));

    expect(result.current.topSuUser).toBeUndefined();
    act(() => result.current.pushIdentity({ machineId: 'victim-01', suUser: 'developer', cwd: '/home/developer' }));
    expect(result.current.topSuUser).toBe('developer');
    act(() => result.current.popIdentity());
    expect(result.current.topSuUser).toBeUndefined();
  });

  it('pop con un solo frame devuelve false sin tocar nada', () => {
    const machine = makeMachine();
    const onChangeMachine = vi.fn();
    const { result } = renderHook(() => useIdentityStack({
      initialMachine: machine, onChangeMachine, terminalId: 't-A',
    }));

    let popped = true;
    act(() => { popped = result.current.popIdentity(); });
    expect(popped).toBe(false);
    expect(onChangeMachine).not.toHaveBeenCalled();
    expect(storeRef.current.applyIdentity).not.toHaveBeenCalled();
  });

  it('conectar a otra máquina no resetea el stack (pivoting: exit vuelve)', () => {
    const attacker = makeMachine('attacker-01');
    const victim = makeMachine('victim-01');
    const onChangeMachine = vi.fn();
    const { result, rerender } = renderHook(
      ({ m }) => useIdentityStack({
        initialMachine: m, onChangeMachine, setCurrentDir: vi.fn(), terminalId: 't-A',
      }),
      { initialProps: { m: attacker } },
    );

    // SSH: primero apila el frame remoto…
    act(() => result.current.pushIdentity({ machineId: 'victim-01', suUser: 'root', cwd: '/root' }));
    expect(result.current.identityStack).toHaveLength(2);
    // …y la ventana refleja la conexión (la prop machine pasa a la víctima).
    rerender({ m: victim });
    // El stack ES la memoria de a dónde está conectada la terminal: no se borra.
    expect(result.current.identityStack).toHaveLength(2);

    let popped = false;
    act(() => { popped = result.current.popIdentity(); });
    expect(popped).toBe(true);
    expect(onChangeMachine).toHaveBeenCalledWith('attacker-01');
    expect(result.current.identityStack).toHaveLength(1);
  });

  it('una máquina que no está en el stack (cambio de escenario) sí resetea', () => {
    const attacker = makeMachine('attacker-01');
    const other = makeMachine('otra-01');
    const { result, rerender } = renderHook(
      ({ m }) => useIdentityStack({
        initialMachine: m, onChangeMachine: vi.fn(), terminalId: 't-A',
      }),
      { initialProps: { m: attacker } },
    );

    act(() => result.current.pushIdentity({ machineId: 'victim-01', suUser: 'root', cwd: '/root' }));
    rerender({ m: other });

    expect(result.current.identityStack).toHaveLength(1);
    expect(result.current.identityStack[0].machineId).toBe('otra-01');
  });
});

describe('modo legacy (sin terminalId)', () => {
  it('pop usa el store (popIdentity + applyIdentity)', () => {
    storeRef.current.identityStack = [
      { machineId: 'attacker-01', cwd: '/root' },
      { machineId: 'victim-01', suUser: 'root', cwd: '/root' },
    ];
    storeRef.current.popIdentity = vi.fn(() => ({ machineId: 'attacker-01', cwd: '/root' }));
    const machine = makeMachine('victim-01');
    const onChangeMachine = vi.fn();
    const { result } = renderHook(() => useIdentityStack({
      initialMachine: machine, onChangeMachine,
    }));

    let popped = false;
    act(() => { popped = result.current.popIdentity(); });
    expect(popped).toBe(true);
    expect(storeRef.current.popIdentity).toHaveBeenCalledTimes(1);
    expect(storeRef.current.applyIdentity).toHaveBeenCalledWith({ machineId: 'attacker-01', cwd: '/root' });
    expect(onChangeMachine).toHaveBeenCalledWith('attacker-01');
  });
});

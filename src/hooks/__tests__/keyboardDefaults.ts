// ── __tests__/keyboardDefaults.ts ─────────────────────────────────
// Fixture compartido por los tests de `useKeyboardShortcuts`: opciones por
// defecto, historial simulado (el mock EJECUTA el updater, si no el cuerpo
// de `setHistory(prev => [...])` nunca se cubre) y helper de eventos.

import { vi } from 'vitest';
import type { HistoryEntry } from '../processCommandResult';
import type { Machine } from '../../types';
import type { MsfState } from '../../types/msf';

/** Estado del "store" de historial que ven los tests. */
export const hist: { current: HistoryEntry[] } = { current: [] };

export const resetHist = (): void => {
  hist.current = [];
};

/** Evento de teclado compacto. */
export const key = (k: string, mods: Record<string, unknown> = {}) =>
  ({ key: k, preventDefault: vi.fn(), ...mods }) as unknown as React.KeyboardEvent;

export const createDefaults = () => {
  const machine: Machine = {
    id: 'attacker-01',
    machine_info: { hostname: 'kali', ip: '192.168.1.10', mac: '00:00:00:00:00:00', os: 'Kali Linux', status: 'up', type: 'workstation' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  };

  return {
    input: '',
    setInput: vi.fn(),
    machine,
    currentDir: '/',
    msfState: null as MsfState | null,
    cmdHistory: [] as string[],
    setCmdHistory: vi.fn(),
    histIdx: -1,
    setHistIdx: vi.fn(),
    busy: false,
    setBusy: vi.fn(),
    blockingCommand: null as { message: string; cancelKey?: string; listeningPort?: number } | null,
    setBlockingCommand: vi.fn(),
    setListeningPort: vi.fn(),
    setHistory: vi.fn((arg: HistoryEntry[] | ((prev: HistoryEntry[]) => HistoryEntry[])) => {
      hist.current = typeof arg === 'function' ? arg(hist.current) : arg;
    }),
    prompt: 'root@kali:/#',
    runCommand: vi.fn(),
    makeWelcome: vi.fn((): HistoryEntry => ({ command: null, streaming: false, output: '', timestamp: Date.now() })),
    allMachines: [machine],
    goHome: vi.fn(),
    setMsfState: vi.fn(),
    // opcional en las options: `null` ⇒ sin python3 esperando input()
    pendingPythonCancel: null as (() => void) | null,
  };
};

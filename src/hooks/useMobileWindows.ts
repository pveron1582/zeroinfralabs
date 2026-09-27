// ── hooks/useMobileWindows.ts ─────────────────────────────────────
// Estado y operaciones de las ventanas del workspace móvil (terminal,
// navegador, topología, enumeración). Espejo móvil de useDesktopWindows.

import { useEffect, useState } from 'react';
import { useScenarioStore } from '../store/scenarioStore';
import { shellManager } from '../frameworks/shells/ShellManager';
import type { MobileWindow } from '../components/appContent/mobileTypes';

interface UseMobileWindowsOptions {
  initialMachineId: string;
  onChangeMachine: (machineId: string) => void;
}

export function useMobileWindows({ initialMachineId, onChangeMachine }: UseMobileWindowsOptions) {
  const showNotification = useScenarioStore(s => s.showNotification);
  const isEs = useScenarioStore(s => s.language) === 'es';

  const [windows, setWindows] = useState<MobileWindow[]>(() => [
    { id: `term-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type: 'terminal', title: 'Terminal 1', machineId: initialMachineId, termNumber: 1 },
  ]);
  const [activeId, setActiveId] = useState<string>(() => windows[0]?.id ?? '');

  // El registro de la terminal inicial es un side-effect: va en un effect
  // de mount, no en el initializer de useState (StrictMode invoca el
  // initializer dos veces y el id registrado podía diferir del real).
  useEffect(() => {
    const firstId = windows[0]?.id;
    if (firstId) useScenarioStore.getState().registerTerminal(firstId, 1, initialMachineId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureActive = (next: MobileWindow[], fallbackActive: string) => {
    if (!next.find(w => w.id === fallbackActive) && next.length) {
      setActiveId(next[0].id);
    }
  };

  const termCount = windows.filter(w => w.type === 'terminal').length;
  const browserCount = windows.filter(w => w.type === 'browser').length;

  const addTerminal = () => {
    if (termCount >= 5) {
      showNotification(isEs ? 'Límite de 5 terminales alcanzado.' : 'Limit of 5 terminals reached.');
      return;
    }
    const n = termCount + 1;
    // find max number to avoid duplicate title after closes
    const maxNum = windows.reduce((m, w) => {
      if (w.type !== 'terminal') return m;
      const v = parseInt(w.title.replace('Terminal ', ''), 10) || 0;
      return Math.max(m, v);
    }, 0);
    const termNum = maxNum + 1 || n;
    const id = `term-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const title = `Terminal ${termNum}`;
    useScenarioStore.getState().registerTerminal(id, termNum, initialMachineId);
    const next = [...windows, { id, type: 'terminal' as const, title, machineId: initialMachineId, termNumber: termNum }];
    setWindows(next);
    setActiveId(id);
  };

  const addBrowser = () => {
    if (browserCount >= 2) {
      showNotification(isEs ? 'Límite de 2 navegadores alcanzado.' : 'Limit of 2 browsers reached.');
      return;
    }
    const maxNum = windows.reduce((m, w) => {
      if (w.type !== 'browser') return m;
      const v = parseInt(w.title.replace('Chrome ', ''), 10) || 0;
      return Math.max(m, v);
    }, 0);
    const id = `browser-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const title = `Chrome ${maxNum + 1 || browserCount + 1}`;
    const next = [...windows, { id, type: 'browser' as const, title }];
    setWindows(next);
    setActiveId(id);
  };

  const addSingleton = (type: 'network' | 'enumeration', title: string, prefix: string) => {
    const existing = windows.find(w => w.type === type);
    if (existing) {
      setActiveId(existing.id);
      return;
    }
    const id = `${prefix}-${Date.now()}`;
    const next = [...windows, { id, type, title }];
    setWindows(next);
    setActiveId(id);
  };

  const closeWindow = (id: string) => {
    if (windows.length === 1) {
      showNotification(isEs ? 'Debe quedar al menos una ventana.' : 'At least one window must remain.');
      return;
    }
    const win = windows.find(w => w.id === id);
    if (win?.type === 'terminal') {
      shellManager.destroyOwner(id);
    }
    useScenarioStore.getState().unregisterTerminal(id);
    const next = windows.filter(w => w.id !== id);
    setWindows(next);
    ensureActive(next, activeId);
  };

  const selectWindow = (id: string) => {
    setActiveId(id);
    const win = windows.find(w => w.id === id);
    if (win?.type === 'terminal' && win.machineId) {
      onChangeMachine(win.machineId);
    }
  };

  const handleTerminalChangeMachine = (windowId: string, newMachineId: string) => {
    setWindows(prev => prev.map(win => {
      if (win.id !== windowId) return win;
      return { ...win, machineId: newMachineId };
    }));
    useScenarioStore.getState().setTerminalMachine(windowId, newMachineId);
    onChangeMachine(newMachineId);
  };

  const activeWindow = windows.find(w => w.id === activeId) || windows[0];

  return {
    windows, activeId, setActiveId, activeWindow,
    termCount, browserCount,
    addTerminal, addBrowser, closeWindow, selectWindow,
    handleTerminalChangeMachine,
    addNetwork: () => addSingleton('network', 'Topología', 'network'),
    addEnumeration: () => addSingleton('enumeration', 'Enumeración', 'enum'),
  };
}

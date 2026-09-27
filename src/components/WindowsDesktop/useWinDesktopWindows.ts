// ── components/WindowsDesktop/useWinDesktopWindows.ts ────────────
// Ventanas del escritorio Windows (W3). Paralelo ligero a
// useDesktopWindows de Kali: solo tipos de apps Windows.

import { useState, useRef, useCallback } from 'react';
import type React from 'react';
import { useScenarioStore } from '../../store/scenarioStore';

export type WinAppType = 'explorer' | 'winterm' | 'security' | 'systemprops';

/** Máximo de terminales PowerShell abiertos a la vez en el escritorio. */
export const MAX_WINTERM = 5;

export interface WinWindow {
  id: string;
  type: WinAppType;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  minimized?: boolean;
  maximized?: boolean;
  prevBounds?: { x: number; y: number; w: number; h: number };
  /** Máquina a la que está conectada ESTA terminal (aislada por ventana). */
  machineId?: string;
}

const APP_DEFAULTS: Record<WinAppType, { title: string; w: number; h: number }> = {
  explorer: { title: 'Explorador de archivos', w: 760, h: 480 },
  winterm: { title: 'Símbolo del sistema', w: 780, h: 460 },
  security: { title: 'Seguridad de Windows', w: 560, h: 420 },
  systemprops: { title: 'Propiedades del sistema', w: 520, h: 400 },
};

function nextZ(windows: Pick<WinWindow, 'zIndex'>[]): number {
  return Math.max(0, ...windows.map(w => w.zIndex)) + 1;
}

/** Título de la ventana: la primera sin número, las demás numeradas. */
export function terminalTitle(index: number): string {
  return index <= 1 ? 'Windows PowerShell' : `Windows PowerShell (${index})`;
}

export function useWinDesktopWindows() {
  // `?.` porque los mocks parciales del store en tests no traen la acción.
  const showNotification = useScenarioStore(s => s.showNotification);
  const isEs = useScenarioStore.getState().language === 'es';
  const [windows, setWindows] = useState<WinWindow[]>([]);
  const [closingIds, setClosingIds] = useState<string[]>([]);
  const [showStart, setShowStart] = useState(false);
  const desktopRef = useRef<HTMLDivElement>(null);

  const bringToFront = useCallback((id: string) => {
    setWindows(prev => {
      const maxZ = Math.max(0, ...prev.map(w => w.zIndex));
      const win = prev.find(w => w.id === id);
      if (!win || (win.zIndex === maxZ && prev.length > 1)) return prev;
      return prev.map(w => (w.id === id ? { ...w, zIndex: maxZ + 1, minimized: false } : w));
    });
  }, []);

  /**
   * Abre una app. `winterm` es multi-instancia (hasta MAX_WINTERM): cada clic
   * crea una terminal NUEVA, con su propio `id` → terminalId aislado (historial,
   * sesión PowerShell, cwd, identidad y máquina conectada propios). El resto de
   * las apps son singletons: si ya están abiertas solo se enfoca la ventana.
   */
  const openApp = useCallback((type: WinAppType, opts?: { newInstance?: boolean }) => {
    const multiInstance = opts?.newInstance ?? type === 'winterm';
    const existing = windows.find(w => w.type === type);
    if (existing && !multiInstance) {
      bringToFront(existing.id);
      setShowStart(false);
      return;
    }
    const terminals = windows.filter(w => w.type === 'winterm');
    if (type === 'winterm' && terminals.length >= MAX_WINTERM) {
      showNotification?.(isEs
        ? `Límite de ${MAX_WINTERM} terminales alcanzado.`
        : `Limit of ${MAX_WINTERM} terminals reached.`);
      setShowStart(false);
      return;
    }
    const d = APP_DEFAULTS[type];
    const offset = (windows.length % 6) * 28;
    // Los side-effectos van fuera del updater de setWindows (StrictMode los
    // duplicaría) — por eso el id se genera antes de agregar la ventana.
    const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const title = type === 'winterm'
      ? (terminalTitle(terminals.length + 1))
      : d.title;
    setWindows(prev => [
      ...prev,
      {
        id,
        type,
        title,
        x: 110 + offset,
        y: 64 + offset,
        w: d.w,
        h: d.h,
        zIndex: nextZ(prev),
        minimized: false,
      },
    ]);
    setShowStart(false);
  }, [windows, bringToFront, showNotification, isEs]);

  const closeWindow = useCallback((id: string) => {
    // Baja la terminal del store (NetworkMap); `?.` por mocks parciales en tests.
    useScenarioStore.getState().unregisterTerminal?.(id);
    setClosingIds(prev => [...prev, id]);
    setTimeout(() => {
      setWindows(prev => prev.filter(w => w.id !== id));
      setClosingIds(prev => prev.filter(c => c !== id));
    }, 200);
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => (w.id === id ? { ...w, minimized: true } : w)));
  }, []);

  const toggleMaximize = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => {
        if (w.id !== id) return w;
        if (w.maximized) {
          return {
            ...w,
            maximized: false,
            minimized: false,
            x: w.prevBounds?.x ?? w.x,
            y: w.prevBounds?.y ?? w.y,
            w: w.prevBounds?.w ?? w.w,
            h: w.prevBounds?.h ?? w.h,
            prevBounds: undefined,
          };
        }
        const cw = desktopRef.current?.clientWidth ?? 1024;
        const ch = desktopRef.current?.clientHeight ?? 640;
        return {
          ...w,
          maximized: true,
          minimized: false,
          prevBounds: { x: w.x, y: w.y, w: w.w, h: w.h },
          x: 4,
          y: 4,
          w: cw - 8,
          h: ch - 8,
        };
      }),
    );
  }, []);

  const startDrag = useCallback(
    (id: string, e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('input')) return;
      e.preventDefault();
      bringToFront(id);
      let lastX = e.clientX;
      let lastY = e.clientY;
      const onMove = (me: PointerEvent) => {
        const dx = me.clientX - lastX;
        const dy = me.clientY - lastY;
        lastX = me.clientX;
        lastY = me.clientY;
        setWindows(prev =>
          prev.map(w =>
            w.id === id ? { ...w, x: w.x + dx, y: Math.max(0, w.y + dy) } : w,
          ),
        );
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [bringToFront],
  );

  const startResize = useCallback(
    (id: string, e: React.PointerEvent, corner: 'nw' | 'ne' | 'sw' | 'se') => {
      e.preventDefault();
      e.stopPropagation();
      bringToFront(id);
      const startMX = e.clientX;
      const startMY = e.clientY;
      let startW = 0;
      let startH = 0;
      let startX = 0;
      let startY = 0;
      setWindows(prev => {
        const w = prev.find(x => x.id === id);
        if (w) {
          startW = w.w;
          startH = w.h;
          startX = w.x;
          startY = w.y;
        }
        return prev;
      });
      const onMove = (me: PointerEvent) => {
        const dx = me.clientX - startMX;
        const dy = me.clientY - startMY;
        setWindows(prev =>
          prev.map(w => {
            if (w.id !== id) return w;
            let nw = startW;
            let nh = startH;
            let nx = startX;
            let ny = startY;
            if (corner.includes('e')) nw = Math.max(360, startW + dx);
            if (corner.includes('s')) nh = Math.max(220, startH + dy);
            if (corner.includes('w')) {
              nw = Math.max(360, startW - dx);
              nx = startX + startW - nw;
            }
            if (corner.includes('n')) {
              nh = Math.max(220, startH - dy);
              ny = startY + startH - nh;
            }
            return { ...w, x: nx, y: Math.max(0, ny), w: nw, h: nh };
          }),
        );
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [bringToFront],
  );

  return {
    windows,
    setWindows,
    closingIds,
    showStart,
    setShowStart,
    desktopRef,
    openApp,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    bringToFront,
    startDrag,
    startResize,
  };
}

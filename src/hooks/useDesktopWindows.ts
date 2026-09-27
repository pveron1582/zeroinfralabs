import { useState, useEffect, useRef, useCallback } from 'react';
import { useScenarioStore } from '../store/scenarioStore';
import { shellManager } from '../frameworks/shells/ShellManager';
import { WALLPAPERS, DEFAULT_WALLPAPER_ID, type Wallpaper } from '../components/desktopWallpapers';
import {
  toggleMaximizeWindow, startWindowDrag, startWindowResize,
  type ResizeCorner,
} from './desktopWindowGeometry';

export interface DesktopWindow {
  id: string;
  type: 'terminal' | 'wallpaper' | 'browser' | 'guide' | 'burpsuite' | 'rdp';
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  opacity: number;
  fontSize: number;
  zIndex: number;
  minimized?: boolean;
  maximized?: boolean;
  prevBounds?: { x: number; y: number; w: number; h: number };
  /** Máquina Windows objetivo (solo type === 'rdp') o máquina activa para type === 'terminal'. */
  machineId?: string;
  termNumber?: number;
}

export function useDesktopWindows() {
  const showNotification = useScenarioStore(state => state.showNotification);
  const currentScenario = useScenarioStore(state => state.currentScenario);
  const missions = useScenarioStore(state => state.missions);

  const isEs = useScenarioStore.getState().language === 'es';

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [activeWallpaper, setActiveWallpaper] = useState<string>(() => {
    return localStorage.getItem('cyberops-desktop-wallpaper') || DEFAULT_WALLPAPER_ID;
  });

  useEffect(() => {
    localStorage.setItem('cyberops-desktop-wallpaper', activeWallpaper);
  }, [activeWallpaper]);

  const selectedWallpaper: Wallpaper = WALLPAPERS.find(wp => wp.id === activeWallpaper) || WALLPAPERS[0];

  const [windows, setWindows] = useState<DesktopWindow[]>([]);

  const [activeSettingsId, setActiveSettingsId] = useState<string | null>(null);
  const [showAppMenu, setShowAppMenu] = useState(false);
  const [showSysMenu, setShowSysMenu] = useState(false);
  const [closingWindowIds, setClosingWindowIds] = useState<string[]>([]);

  const getNextBrowserNum = () => {
    let maxNum = 0;
    for (const w of windows) {
      if (w.type === 'browser') {
        const m = w.title.match(/Chrome (\d+)/);
        if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
      }
    }
    return maxNum + 1;
  };

  // Cascada prolija: cada ventana nueva se desplaza en diagonal desde una base
  // común, y al llegar a CASCADE_MAX pasos vuelve a la posición inicial.
  const CASCADE_STEP = 30;
  const CASCADE_MAX = 6;
  const cascadeOffset = (count: number) => (count % CASCADE_MAX) * CASCADE_STEP;

  // Los side-effects (showNotification/registerTerminal/restore) van FUERA
  // de los updaters de setWindows: StrictMode doble-invoca updaters y
  // duplicaba toasts/registros (MEDIUM de bugs_terminales.md).
  const addTerminal = () => {
    const termWindows = windows.filter(w => w.type === 'terminal');
    if (termWindows.length >= 5) {
      showNotification(isEs ? 'Límite de 5 terminales alcanzado.' : 'Limit of 5 terminals reached.');
      return;
    }
    let maxNum = 0;
    for (const w of windows) {
      if (w.type === 'terminal') {
        const m = w.title.match(/Terminal (\d+)/);
        if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
      }
    }
    const termNumber = maxNum + 1;
    const initialMachineId = currentScenario?.initialMachineId || 'attacker-01';
    const id = `term-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    useScenarioStore.getState().registerTerminal(id, termNumber, initialMachineId);
    const offset = cascadeOffset(windows.length);
    setWindows(prev => [...prev, {
      id,
      type: 'terminal' as const,
      termNumber,
      machineId: initialMachineId,
      title: `Terminal ${termNumber} - root@kali`,
      x: 90 + offset, y: 60 + offset, w: 820, h: 520,
      opacity: 0.92, fontSize: 15,
      zIndex: Math.max(0, ...windows.map(w => w.zIndex)) + 1,
      minimized: false
    }]);
  };

  const addBrowser = () => {
    const browserWindows = windows.filter(w => w.type === 'browser');
    if (browserWindows.length >= 3) {
      showNotification(isEs ? 'Límite de 3 ventanas de Chrome alcanzado.' : 'Limit of 3 Chrome windows reached.');
      return;
    }
    const id = `browser-${Date.now()}`;
    const nextNum = getNextBrowserNum();
    const offset = cascadeOffset(windows.length);
    setWindows(prev => [...prev, { id, type: 'browser' as const, title: `Chrome ${nextNum}`, x: 240 + offset, y: 60 + offset, w: 800, h: 520, opacity: 1, fontSize: 13, zIndex: Math.max(0, ...windows.map(w => w.zIndex)) + 1, minimized: false }]);
  };

  const openWallpaperPicker = () => {
    if (windows.some(w => w.type === 'wallpaper')) {
      showNotification(isEs ? 'El selector de fondos ya está abierto.' : 'Wallpaper picker is already open.');
      return;
    }
    const id = `wallpaper-${Date.now()}`;
    const offset = cascadeOffset(windows.length);
    setWindows(prev => [...prev, { id, type: 'wallpaper' as const, title: isEs ? 'Configuración de Fondo' : 'Wallpaper Settings', x: 150 + offset, y: 90 + offset, w: 660, h: 540, opacity: 1, fontSize: 13, zIndex: Math.max(0, ...windows.map(w => w.zIndex)) + 1, minimized: false }]);
  };

  const addBurp = () => {
    const existing = windows.find(w => w.type === 'burpsuite');
    if (existing) {
      if (existing.minimized) restoreWindow(existing.id);
      bringToFront(existing.id);
      return;
    }
    const id = `burp-${Date.now()}`;
    const offset = cascadeOffset(windows.length);
    setWindows(prev => [...prev, { id, type: 'burpsuite' as const, title: 'Burp Suite', x: 200 + offset, y: 80 + offset, w: 900, h: 560, opacity: 1, fontSize: 13, zIndex: Math.max(0, ...windows.map(w => w.zIndex)) + 1, minimized: false }]);
  };

  const addGuide = () => {
    const existing = windows.find(w => w.type === 'guide');
    if (existing) {
      if (existing.minimized) restoreWindow(existing.id);
      return;
    }
    const id = `guide-${Date.now()}`;
    const offset = cascadeOffset(windows.length);
    setWindows(prev => [...prev, { id, type: 'guide' as const, title: isEs ? 'Manual de uso - manual.pdf' : 'User Manual - manual-en.pdf', x: 390 + offset, y: 60 + offset, w: 640, h: 520, opacity: 1, fontSize: 13, zIndex: Math.max(0, ...windows.map(w => w.zIndex)) + 1, minimized: false }]);
  };

  /** Abre (o enfoca) la ventana RDP para una máquina Windows. Singleton por machineId. */
  const openRdp = useCallback((machineId: string, title: string) => {
    setWindows(prev => {
      const existing = prev.find(w => w.type === 'rdp' && w.machineId === machineId);
      if (existing) {
        const maxZ = Math.max(0, ...prev.map(w => w.zIndex));
        return prev.map(w => w.id === existing.id ? { ...w, minimized: false, zIndex: maxZ + 1 } : w);
      }
      const id = `rdp-${machineId}`;
      const offset = cascadeOffset(prev.filter(w => w.type === 'rdp').length);
      return [...prev, {
        id, type: 'rdp' as const, title, machineId,
        x: 120 + offset, y: 48 + offset, w: 960, h: 600,
        opacity: 1, fontSize: 13,
        zIndex: Math.max(0, ...prev.map(w => w.zIndex)) + 1, minimized: false,
      }];
    });
  }, []);

  /** Cierra todas las ventanas RDP (o la de una máquina puntual). */
  const closeRdp = useCallback((machineId?: string) => {
    setWindows(prev => prev.filter(w => !(w.type === 'rdp' && (!machineId || w.machineId === machineId))));
  }, []);

  const closeWindow = (id: string) => {
    const win = windows.find(w => w.id === id);
    if (win?.type === 'terminal') {
      // Destruir el stack de shells de ESA terminal (SSH/FTP/NC) — no el global.
      shellManager.destroyOwner(id);
    }
    useScenarioStore.getState().unregisterTerminal(id);
    setClosingWindowIds(prev => [...prev, id]);
    setTimeout(() => {
      setWindows(prev => prev.filter(w => w.id !== id));
      setClosingWindowIds(prev => prev.filter(cid => cid !== id));
    }, 300);
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w));
  };

  const restoreWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: false } : w));
  };

  const bringToFront = (id: string) => {
    setWindows(prev => {
      const maxZ = Math.max(0, ...prev.map(w => w.zIndex));
      const win = prev.find(w => w.id === id);
      if (win && win.zIndex === maxZ && prev.length > 1) return prev;
      return prev.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w);
    });
  };

  const desktopRef = useRef<HTMLDivElement>(null);

  const toggleMaximize = (id: string) => {
    toggleMaximizeWindow(id, setWindows, desktopRef.current);
  };

  const changeFontSize = (id: string, delta: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, fontSize: Math.max(10, Math.min(20, w.fontSize + delta)) } : w));
  };

  const startDrag = (id: string, e: React.PointerEvent) => {
    startWindowDrag(id, e, windows, setWindows, desktopRef.current, bringToFront);
  };

  const startResize = (id: string, e: React.PointerEvent, corner: ResizeCorner = 'se') => {
    startWindowResize(id, e, corner, windows, setWindows, desktopRef.current, bringToFront);
  };

  const termWindows = windows.filter(w => w.type === 'terminal');
  const browserWindows = windows.filter(w => w.type === 'browser');
  const wallpaperWindows = windows.filter(w => w.type === 'wallpaper');
  const guideWindows = windows.filter(w => w.type === 'guide');
  const burpWindows = windows.filter(w => w.type === 'burpsuite');
  const rdpWindows = windows.filter(w => w.type === 'rdp');
  const topWindow = windows.reduce<DesktopWindow | null>((best, w) =>
    !w.minimized && (!best || w.zIndex > best.zIndex) ? w : best, null);
  const topWindowId = topWindow?.id;

  return {
    time, windows, setWindows, closingWindowIds, activeWallpaper, setActiveWallpaper,
    selectedWallpaper, activeSettingsId, setActiveSettingsId, showAppMenu, setShowAppMenu,
    showSysMenu, setShowSysMenu, termWindows, browserWindows, wallpaperWindows, guideWindows, burpWindows, rdpWindows,
    topWindowId, addTerminal, addBrowser, addGuide, addBurp, openWallpaperPicker, openRdp, closeRdp, closeWindow,
    minimizeWindow, restoreWindow, toggleMaximize, bringToFront, changeFontSize,
    startDrag, startResize, desktopRef, isEs, currentScenario, missions, showNotification,
  };
}

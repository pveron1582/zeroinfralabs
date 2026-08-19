import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { useScenarioStore } from '../store/scenarioStore';
import { WALLPAPERS, DEFAULT_WALLPAPER_ID, type Wallpaper } from '../components/desktopWallpapers';

export interface DesktopWindow {
  id: string;
  type: 'terminal' | 'wallpaper' | 'browser' | 'guide' | 'burpsuite';
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

  const addTerminal = () => {
    setWindows(prev => {
      const termWindows = prev.filter(w => w.type === 'terminal');
      if (termWindows.length >= 5) {
        showNotification(isEs ? 'Límite de 5 terminales alcanzado.' : 'Limit of 5 terminals reached.');
        return prev;
      }
      let maxNum = 0;
      for (const w of prev) {
        if (w.type === 'terminal') {
          const m = w.title.match(/Terminal (\d+)/);
          if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
        }
      }
      const id = `term-${Date.now()}`;
      const offset = cascadeOffset(prev.length);
      return [...prev, { id, type: 'terminal' as const, title: `Terminal ${maxNum + 1} - root@kali`, x: 90 + offset, y: 60 + offset, w: 820, h: 520, opacity: 0.5, fontSize: 13, zIndex: Math.max(0, ...prev.map(w => w.zIndex)) + 1, minimized: false }];
    });
  };

  const addBrowser = () => {
    setWindows(prev => {
      const browserWindows = prev.filter(w => w.type === 'browser');
      if (browserWindows.length >= 3) {
        showNotification(isEs ? 'Límite de 3 ventanas de Chrome alcanzado.' : 'Limit of 3 Chrome windows reached.');
        return prev;
      }
      const id = `browser-${Date.now()}`;
      const nextNum = getNextBrowserNum();
      const offset = cascadeOffset(prev.length);
      return [...prev, { id, type: 'browser' as const, title: `Chrome ${nextNum}`, x: 240 + offset, y: 60 + offset, w: 800, h: 520, opacity: 1, fontSize: 13, zIndex: Math.max(0, ...prev.map(w => w.zIndex)) + 1, minimized: false }];
    });
  };

  const openWallpaperPicker = () => {
    setWindows(prev => {
      if (prev.some(w => w.type === 'wallpaper')) {
        showNotification(isEs ? 'El selector de fondos ya está abierto.' : 'Wallpaper picker is already open.');
        return prev;
      }
      const id = `wallpaper-${Date.now()}`;
      const offset = cascadeOffset(prev.length);
      return [...prev, { id, type: 'wallpaper' as const, title: isEs ? 'Configuración de Fondo' : 'Wallpaper Settings', x: 150 + offset, y: 90 + offset, w: 660, h: 540, opacity: 1, fontSize: 13, zIndex: Math.max(0, ...prev.map(w => w.zIndex)) + 1, minimized: false }];
    });
  };

  const addBurp = () => {
    setWindows(prev => {
      if (prev.some(w => w.type === 'burpsuite')) {
        const win = prev.find(w => w.type === 'burpsuite');
        if (win?.minimized) restoreWindow(win.id);
        bringToFront(win!.id);
        return prev;
      }
      const id = `burp-${Date.now()}`;
      const offset = cascadeOffset(prev.length);
      return [...prev, { id, type: 'burpsuite' as const, title: 'Burp Suite', x: 200 + offset, y: 80 + offset, w: 900, h: 560, opacity: 1, fontSize: 13, zIndex: Math.max(0, ...prev.map(w => w.zIndex)) + 1, minimized: false }];
    });
  };

  const addGuide = () => {
    setWindows(prev => {
      if (prev.some(w => w.type === 'guide')) {
        const win = prev.find(w => w.type === 'guide');
        if (win?.minimized) restoreWindow(win.id);
        return prev;
      }
      const id = `guide-${Date.now()}`;
      const offset = cascadeOffset(prev.length);
      return [...prev, { id, type: 'guide' as const, title: isEs ? 'Manual de uso - manual.pdf' : 'User Manual - manual-en.pdf', x: 390 + offset, y: 60 + offset, w: 640, h: 520, opacity: 1, fontSize: 13, zIndex: Math.max(0, ...prev.map(w => w.zIndex)) + 1, minimized: false }];
    });
  };

  const closeWindow = (id: string) => {
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

  // Mantiene las ventanas dentro del área del escritorio: nunca pueden subir
  // por encima de la barra de tareas (y = 0) y siempre queda visible una parte
  // de la ventana para poder volver a agarrarla si se arrastra hacia los bordes.
  const clampToDesktop = (w: DesktopWindow): DesktopWindow => {
    const container = desktopRef.current;
    const cw = container?.clientWidth ?? window.innerWidth;
    const ch = container?.clientHeight ?? window.innerHeight;
    const MIN_VISIBLE = 80;
    return {
      ...w,
      x: Math.min(Math.max(w.x, -w.w + MIN_VISIBLE), cw - MIN_VISIBLE),
      y: Math.min(Math.max(w.y, 0), ch - MIN_VISIBLE),
    };
  };

  const toggleMaximize = (id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      if (w.maximized) {
        return { ...w, maximized: false, x: w.prevBounds?.x ?? w.x, y: w.prevBounds?.y ?? w.y, w: w.prevBounds?.w ?? w.w, h: w.prevBounds?.h ?? w.h, prevBounds: undefined };
      }
      const container = desktopRef.current;
      const cw = container?.clientWidth ?? window.innerWidth;
      const ch = container?.clientHeight ?? window.innerHeight;
      return { ...w, maximized: true, prevBounds: { x: w.x, y: w.y, w: w.w, h: w.h }, x: 8, y: 8, w: cw - 16, h: ch - 16, minimized: false };
    }));
  };

  const changeFontSize = (id: string, delta: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, fontSize: Math.max(10, Math.min(20, w.fontSize + delta)) } : w));
  };

  const startDrag = (id: string, e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;
    e.preventDefault();
    bringToFront(id);
    const win = windows.find(w => w.id === id);
    if (!win) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = win.x;
    const initialY = win.y;
    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      setWindows(prev => prev.map(w => w.id === id
        ? clampToDesktop({ ...w, x: initialX + deltaX, y: initialY + deltaY })
        : w));
    };
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const startResize = (id: string, e: React.PointerEvent, corner: 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se' = 'se') => {
    e.preventDefault();
    e.stopPropagation();
    bringToFront(id);
    const win = windows.find(w => w.id === id);
    if (!win) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = win.x;
    const initialY = win.y;
    const initialW = win.w;
    const initialH = win.h;
    const minW = win.type === 'wallpaper' ? 400 : 320;
    const minH = win.type === 'wallpaper' ? 240 : 200;
    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      setWindows(prev => prev.map(w => {
        if (w.id !== id) return w;
        let newX = w.x, newY = w.y, newW = w.w, newH = w.h;
        if (corner.includes('e')) newW = Math.max(minW, initialW + deltaX);
        if (corner.includes('w')) { const potentialW = Math.max(minW, initialW - deltaX); newX = initialX + initialW - potentialW; newW = potentialW; }
        if (corner.includes('s')) newH = Math.max(minH, initialH + deltaY);
        if (corner.includes('n')) { const potentialH = Math.max(minH, initialH - deltaY); newY = initialY + initialH - potentialH; newH = potentialH; }
        return clampToDesktop({ ...w, x: newX, y: newY, w: newW, h: newH });
      }));
    };
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const termWindows = windows.filter(w => w.type === 'terminal');
  const browserWindows = windows.filter(w => w.type === 'browser');
  const wallpaperWindows = windows.filter(w => w.type === 'wallpaper');
  const guideWindows = windows.filter(w => w.type === 'guide');
  const burpWindows = windows.filter(w => w.type === 'burpsuite');
  const topWindow = windows.reduce<DesktopWindow | null>((best, w) =>
    !w.minimized && (!best || w.zIndex > best.zIndex) ? w : best, null);
  const topWindowId = topWindow?.id;

  return {
    time, windows, setWindows, closingWindowIds, activeWallpaper, setActiveWallpaper,
    selectedWallpaper, activeSettingsId, setActiveSettingsId, showAppMenu, setShowAppMenu,
    showSysMenu, setShowSysMenu, termWindows, browserWindows, wallpaperWindows, guideWindows, burpWindows,
    topWindowId, addTerminal, addBrowser, addGuide, addBurp, openWallpaperPicker, closeWindow,
    minimizeWindow, restoreWindow, toggleMaximize, bringToFront, changeFontSize,
    startDrag, startResize, desktopRef, isEs, currentScenario, missions, showNotification,
  };
}

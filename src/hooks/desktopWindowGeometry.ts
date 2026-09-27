// ── hooks/desktopWindowGeometry.ts ───────────────────────────────
// Drag / resize / clamp / maximize para las ventanas del escritorio Kali.
// Separado de useDesktopWindows para mantener ambos archivos <300 líneas.

import type React from 'react';
import type { DesktopWindow } from './useDesktopWindows';

type SetWindows = React.Dispatch<React.SetStateAction<DesktopWindow[]>>;

export function clampToDesktop(
  w: DesktopWindow,
  container: HTMLDivElement | null,
): DesktopWindow {
  const cw = container?.clientWidth ?? window.innerWidth;
  const ch = container?.clientHeight ?? window.innerHeight;
  const MIN_VISIBLE = 80;
  return {
    ...w,
    x: Math.min(Math.max(w.x, -w.w + MIN_VISIBLE), cw - MIN_VISIBLE),
    y: Math.min(Math.max(w.y, 0), ch - MIN_VISIBLE),
  };
}

export function toggleMaximizeWindow(
  id: string,
  setWindows: SetWindows,
  container: HTMLDivElement | null,
): void {
  setWindows(prev => prev.map(w => {
    if (w.id !== id) return w;
    if (w.maximized) {
      return {
        ...w, maximized: false,
        x: w.prevBounds?.x ?? w.x, y: w.prevBounds?.y ?? w.y,
        w: w.prevBounds?.w ?? w.w, h: w.prevBounds?.h ?? w.h,
        prevBounds: undefined,
      };
    }
    const cw = container?.clientWidth ?? window.innerWidth;
    const ch = container?.clientHeight ?? window.innerHeight;
    return {
      ...w, maximized: true,
      prevBounds: { x: w.x, y: w.y, w: w.w, h: w.h },
      x: 8, y: 8, w: cw - 16, h: ch - 16, minimized: false,
    };
  }));
}

export function startWindowDrag(
  id: string,
  e: React.PointerEvent,
  windows: DesktopWindow[],
  setWindows: SetWindows,
  container: HTMLDivElement | null,
  bringToFront: (id: string) => void,
): void {
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
      ? clampToDesktop({ ...w, x: initialX + deltaX, y: initialY + deltaY }, container)
      : w));
  };
  const handlePointerUp = () => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
}

export type ResizeCorner = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se';

export function startWindowResize(
  id: string,
  e: React.PointerEvent,
  corner: ResizeCorner,
  windows: DesktopWindow[],
  setWindows: SetWindows,
  container: HTMLDivElement | null,
  bringToFront: (id: string) => void,
): void {
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
      if (corner.includes('w')) {
        const potentialW = Math.max(minW, initialW - deltaX);
        newX = initialX + initialW - potentialW;
        newW = potentialW;
      }
      if (corner.includes('s')) newH = Math.max(minH, initialH + deltaY);
      if (corner.includes('n')) {
        const potentialH = Math.max(minH, initialH - deltaY);
        newY = initialY + initialH - potentialH;
        newH = potentialH;
      }
      return clampToDesktop({ ...w, x: newX, y: newY, w: newW, h: newH }, container);
    }));
  };
  const handlePointerUp = () => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
}

import React from 'react';
import type { DesktopWindow } from '../hooks/useDesktopWindows';

interface DesktopTopBarProps {
  windows: DesktopWindow[];
  termWindows: DesktopWindow[];
  browserWindows: DesktopWindow[];
  wallpaperWindows: DesktopWindow[];
  topWindowId: string | undefined;
  showAppMenu: boolean;
  showSysMenu: boolean;
  time: Date;
  isEs: boolean;
  currentScenarioCategory: string;
  onToggleAppMenu: () => void;
  onToggleSysMenu: () => void;
  onCloseAppMenu: () => void;
  onCloseSysMenu: () => void;
  onAddTerminal: () => void;
  onAddBrowser: () => void;
  onOpenWallpaperPicker: () => void;
  onMinimizeWindow: (id: string) => void;
  onRestoreWindow: (id: string) => void;
  onBringToFront: (id: string) => void;
  onGoHome: () => void;
  onShowAbout: () => void;
}

export function DesktopTopBar({
  windows, termWindows, browserWindows, wallpaperWindows, topWindowId,
  showAppMenu, showSysMenu, time, isEs, currentScenarioCategory,
  onToggleAppMenu, onToggleSysMenu, onCloseAppMenu, onCloseSysMenu,
  onAddTerminal, onAddBrowser, onOpenWallpaperPicker,
  onMinimizeWindow, onRestoreWindow, onBringToFront,
  onGoHome, onShowAbout,
}: DesktopTopBarProps) {
  return (
    <div className="relative z-40 w-full h-8 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between px-3 text-xs text-slate-300 font-sans backdrop-blur-md">
      <div className="flex items-center gap-1.5 relative">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleAppMenu(); }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors duration-150 ${showAppMenu ? 'bg-emerald-600 text-slate-950 font-semibold' : 'hover:bg-slate-800 text-emerald-400 font-medium'}`}
        >
          <span className="w-3.5 h-3.5 rounded flex items-center justify-center bg-emerald-500 text-slate-950 font-bold text-[9px] shadow-sm shadow-emerald-500/20">K</span>
          <span>{isEs ? 'Aplicaciones' : 'Applications'}</span>
        </button>

        {showAppMenu && (
          <div className="absolute top-7 left-0 w-52 bg-slate-900/95 border border-slate-700/60 rounded-lg shadow-2xl py-1 text-slate-300 backdrop-blur-md animate-fadeIn">
            <button onClick={() => { onAddTerminal(); onCloseAppMenu(); }}
              className="w-full text-left px-3 py-2 hover:bg-emerald-500/10 hover:text-emerald-400 flex items-center gap-2 border-b border-slate-800/40">
              <span className="text-emerald-400 font-mono text-sm font-bold">&gt;_</span>
              <span>{isEs ? 'Abrir Terminal' : 'Open Terminal'}</span>
            </button>
            <button onClick={() => { onOpenWallpaperPicker(); onCloseAppMenu(); }}
              className="w-full text-left px-3 py-2 hover:bg-emerald-500/10 hover:text-emerald-400 flex items-center gap-2 border-b border-slate-800/40">
              <span>🖼️</span>
              <span>{isEs ? 'Cambiar Fondo' : 'Change Wallpaper'}</span>
            </button>
            {currentScenarioCategory === 'Web' && (
              <button onClick={() => { onAddBrowser(); onCloseAppMenu(); }}
                className="w-full text-left px-3 py-2 hover:bg-emerald-500/10 hover:text-emerald-400 flex items-center gap-2 border-b border-slate-800/40">
                <svg className="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/><line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
                </svg>
                <span>Chrome</span>
              </button>
            )}
            <div className="px-3 py-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {isEs ? 'Sistema' : 'System'}
            </div>
            <button onClick={() => { onShowAbout(); onCloseAppMenu(); }}
              className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2 text-xs">
              <span>ℹ️</span>
              <span>{isEs ? 'Acerca de Kali' : 'About Kali'}</span>
            </button>
          </div>
        )}

        <button onClick={onAddTerminal}
          title={isEs ? 'Nueva Terminal' : 'New Terminal'}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-400 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>

        {termWindows.map((tw) => {
          const termNum = tw.title.match(/Terminal (\d+)/)?.[1] || '';
          const isActive = !tw.minimized && tw.id === topWindowId;
          return (
            <button key={tw.id}
              onClick={() => { if (tw.minimized) { onRestoreWindow(tw.id); onBringToFront(tw.id); } else { onMinimizeWindow(tw.id); } }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${isActive ? 'bg-emerald-600 text-slate-950 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-emerald-400'}`}>
              <span className="text-emerald-400 font-mono font-bold text-sm">&gt;_</span>
              <span>Terminal {termNum}</span>
            </button>
          );
        })}

        {browserWindows.map((bw) => {
          const isActive = !bw.minimized && bw.id === topWindowId;
          return (
            <button key={bw.id}
              onClick={() => { if (bw.minimized) { onRestoreWindow(bw.id); onBringToFront(bw.id); } else { onMinimizeWindow(bw.id); } }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${isActive ? 'bg-orange-600 text-slate-950 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-orange-400'}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/><line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
              </svg>
              <span>{bw.title}</span>
            </button>
          );
        })}

        {wallpaperWindows.map((ww) => {
          const isActive = !ww.minimized && ww.id === topWindowId;
          return (
            <button key={ww.id}
              onClick={() => { if (ww.minimized) { onRestoreWindow(ww.id); onBringToFront(ww.id); } else { onMinimizeWindow(ww.id); } }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${isActive ? 'bg-rose-600 text-slate-950 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-rose-400'}`}>
              <span>🖼️</span>
              <span>{ww.title}</span>
            </button>
          );
        })}
      </div>

      <div className="font-medium text-slate-400 tracking-wide select-none">
        {time.toLocaleTimeString(isEs ? 'es-AR' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
      </div>

      <div className="flex items-center gap-3 relative">
        <div className="flex items-center gap-1 text-emerald-500" title={isEs ? 'Red Conectada' : 'Network Connected'}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>
          </svg>
        </div>

        <div className="text-slate-400 hover:text-slate-200 cursor-pointer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          </svg>
        </div>

        <div className="text-slate-400 flex items-center gap-0.5">
          <span className="text-[10px]">100%</span>
          <svg width="14" height="10" viewBox="0 0 24 16" fill="currentColor" className="rotate-0 text-emerald-500">
            <rect x="1" y="2" width="18" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2"/>
            <rect x="3" y="4" width="14" height="8" rx="0.5"/>
            <rect x="20" y="5" width="2" height="6" rx="0.5"/>
          </svg>
        </div>

        <div className="w-px h-4 bg-slate-800 mx-0.5" />

        <button onClick={(e) => { e.stopPropagation(); onToggleSysMenu(); }}
          className={`p-1.5 rounded transition-colors duration-150 ${showSysMenu ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/>
          </svg>
        </button>

        {showSysMenu && (
          <div className="absolute top-7 right-0 w-48 bg-slate-900/95 border border-slate-700/60 rounded-lg shadow-2xl py-1 text-slate-300 backdrop-blur-md animate-fadeIn z-50">
            <div className="px-3 py-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {isEs ? 'Salir' : 'Exit'}
            </div>
            <button onClick={() => { onGoHome(); onCloseSysMenu(); }}
              className="w-full text-left px-3 py-2 hover:bg-red-500/10 hover:text-red-400 flex items-center gap-2 text-red-400">
              <span>🚪</span>
              <span>{isEs ? 'Salir del Lab' : 'Exit Laboratory'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

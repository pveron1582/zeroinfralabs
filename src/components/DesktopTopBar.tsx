import type { DesktopWindow } from '../hooks/useDesktopWindows';
import { FONT_DESKTOP } from './landing/constants';
import {
  TerminalAppIcon, ChromeAppIcon, BurpAppIcon,
  ManualAppIcon, WallpaperAppIcon, FoxyAppIcon, InfoIcon,
  WifiIcon, VolumeIcon, BatteryIcon, PowerIcon,
} from './desktop/icons';

interface DesktopTopBarProps {
  windows: DesktopWindow[];
  termWindows: DesktopWindow[];
  browserWindows: DesktopWindow[];
  wallpaperWindows: DesktopWindow[];
  guideWindows: DesktopWindow[];
  burpWindows: DesktopWindow[];
  topWindowId: string | undefined;
  showAppMenu: boolean;
  time: Date;
  isEs: boolean;
  currentScenarioCategory: string;
  onToggleAppMenu: () => void;
  onCloseAppMenu: () => void;
  onAddTerminal: () => void;
  onAddBrowser: () => void;
  onOpenGuide: () => void;
  onOpenWallpaperPicker: () => void;
  onAddBurp: () => void;
  onMinimizeWindow: (id: string) => void;
  onRestoreWindow: (id: string) => void;
  onBringToFront: (id: string) => void;
  onRequestExit?: () => void;
  onOpenTour?: () => void;
  onShowAbout: () => void;
}

export function DesktopTopBar({
  termWindows, browserWindows, wallpaperWindows, guideWindows, burpWindows, topWindowId,
  showAppMenu, time, isEs, currentScenarioCategory,
  onToggleAppMenu, onCloseAppMenu,
  onAddTerminal, onAddBrowser, onOpenGuide, onOpenWallpaperPicker, onAddBurp,
  onMinimizeWindow, onRestoreWindow, onBringToFront,
  onRequestExit, onOpenTour, onShowAbout,
}: DesktopTopBarProps) {
  return (
    <div data-desktop-topbar style={{ fontFamily: FONT_DESKTOP }} className="relative z-40 w-full h-8 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between px-3 text-xs text-slate-300 font-sans backdrop-blur-md">      <div className="flex items-center gap-1.5 relative">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleAppMenu(); }}
          data-tour="apps-btn"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors duration-150 ${showAppMenu ? 'bg-emerald-600 text-slate-950 font-semibold' : 'hover:bg-slate-800 text-emerald-400 font-medium'}`}
        >
          <span className="w-3.5 h-3.5 rounded flex items-center justify-center bg-emerald-500 text-slate-950 font-bold text-[9px] shadow-sm shadow-emerald-500/20">K</span>
          <span>{isEs ? 'Aplicaciones' : 'Applications'}</span>
        </button>

        {showAppMenu && (
          <div className="absolute top-7 left-0 w-52 bg-slate-900/95 border border-slate-700/60 rounded-lg shadow-2xl py-1 text-slate-300 backdrop-blur-md animate-fadeIn">
            <button onClick={() => { onAddTerminal(); onCloseAppMenu(); }}
              className="w-full text-left px-3 py-2 hover:bg-emerald-500/10 hover:text-emerald-400 flex items-center gap-2 border-b border-slate-800/40">
              <TerminalAppIcon size={15} />
              <span>{isEs ? 'Abrir Terminal' : 'Open Terminal'}</span>
            </button>
            <button onClick={() => { onOpenWallpaperPicker(); onCloseAppMenu(); }}
              className="w-full text-left px-3 py-2 hover:bg-emerald-500/10 hover:text-emerald-400 flex items-center gap-2 border-b border-slate-800/40">
              <WallpaperAppIcon size={15} />
              <span>{isEs ? 'Cambiar Fondo' : 'Change Wallpaper'}</span>
            </button>
            <button onClick={() => { onOpenGuide(); onCloseAppMenu(); }}
              className="w-full text-left px-3 py-2 hover:bg-emerald-500/10 hover:text-emerald-400 flex items-center gap-2 border-b border-slate-800/40">
              <ManualAppIcon size={15} />
              <span>{isEs ? 'Ver Manual de uso' : 'View User Manual'}</span>
            </button>
            <button onClick={() => { onOpenTour?.(); onCloseAppMenu(); }}
              className="w-full text-left px-3 py-2 hover:bg-emerald-500/10 hover:text-emerald-400 flex items-center gap-2 border-b border-slate-800/40">
              <FoxyAppIcon size={15} />
              <span>{isEs ? 'Guía con Foxy' : 'Guide with Foxy'}</span>
            </button>
            {currentScenarioCategory === 'Web' && (
              <button onClick={() => { onAddBrowser(); onCloseAppMenu(); }}
                className="w-full text-left px-3 py-2 hover:bg-emerald-500/10 hover:text-emerald-400 flex items-center gap-2 border-b border-slate-800/40">
                <ChromeAppIcon size={15} />
                <span>Chrome</span>
              </button>
            )}
            {currentScenarioCategory === 'Web' && (
              <button onClick={() => { onAddBurp(); onCloseAppMenu(); }}
                className="w-full text-left px-3 py-2 hover:bg-orange-500/10 hover:text-orange-400 flex items-center gap-2 border-b border-slate-800/40">
                <BurpAppIcon size={15} />
                <span>Burp Suite</span>
              </button>
            )}
            <div className="px-3 py-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {isEs ? 'Sistema' : 'System'}
            </div>
            <button onClick={() => { onShowAbout(); onCloseAppMenu(); }}
              className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2 text-xs">
              <InfoIcon size={14} />
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
              onClick={() => { if (tw.minimized) { onRestoreWindow(tw.id); onBringToFront(tw.id); } else if (tw.id !== topWindowId) { onBringToFront(tw.id); } else { onMinimizeWindow(tw.id); } }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${isActive ? 'bg-emerald-600 text-slate-950 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-emerald-400'}`}>
              <TerminalAppIcon size={14} />
              <span>Terminal {termNum}</span>
            </button>
          );
        })}

        {browserWindows.map((bw) => {
          const isActive = !bw.minimized && bw.id === topWindowId;
          return (
            <button key={bw.id}
              onClick={() => { if (bw.minimized) { onRestoreWindow(bw.id); onBringToFront(bw.id); } else if (bw.id !== topWindowId) { onBringToFront(bw.id); } else { onMinimizeWindow(bw.id); } }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${isActive ? 'bg-orange-600 text-slate-950 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-orange-400'}`}>
              <ChromeAppIcon size={14} />
              <span>{bw.title}</span>
            </button>
          );
        })}

        {wallpaperWindows.map((ww) => {
          const isActive = !ww.minimized && ww.id === topWindowId;
          return (
            <button key={ww.id}
              onClick={() => { if (ww.minimized) { onRestoreWindow(ww.id); onBringToFront(ww.id); } else if (ww.id !== topWindowId) { onBringToFront(ww.id); } else { onMinimizeWindow(ww.id); } }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${isActive ? 'bg-rose-600 text-slate-950 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-rose-400'}`}>
              <WallpaperAppIcon size={14} />
              <span>{ww.title}</span>
            </button>
          );
        })}

        {guideWindows.map((gw) => {
          const isActive = !gw.minimized && gw.id === topWindowId;
          return (
            <button key={gw.id}
              onClick={() => { if (gw.minimized) { onRestoreWindow(gw.id); onBringToFront(gw.id); } else if (gw.id !== topWindowId) { onBringToFront(gw.id); } else { onMinimizeWindow(gw.id); } }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${isActive ? 'bg-red-600 text-slate-950 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-red-400'}`}>
              <ManualAppIcon size={14} />
              <span>Manual</span>
            </button>
          );
        })}

        {burpWindows.map((bw) => {
          const isActive = !bw.minimized && bw.id === topWindowId;
          return (
            <button key={bw.id}
              onClick={() => { if (bw.minimized) { onRestoreWindow(bw.id); onBringToFront(bw.id); } else if (bw.id !== topWindowId) { onBringToFront(bw.id); } else { onMinimizeWindow(bw.id); } }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${isActive ? 'bg-orange-600 text-slate-950 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-orange-400'}`}>
              <BurpAppIcon size={14} />
              <span>{bw.title}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 relative">
        <div className="flex items-center text-emerald-400" title={isEs ? 'Red Conectada' : 'Network Connected'}>
          <WifiIcon size={14} />
        </div>

        <div className="text-slate-400 hover:text-slate-200 cursor-pointer">
          <VolumeIcon size={14} />
        </div>

        <div className="text-slate-400 flex items-center gap-1.5">
          <span className="text-[10px] tabular-nums">100%</span>
          <BatteryIcon size={19} />
        </div>

        <div className="w-px h-4 bg-slate-800 mx-0.5" />

        <div className="font-medium text-slate-300 tracking-wide select-none pointer-events-none tabular-nums">
          {time.toLocaleTimeString(isEs ? 'es-AR' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onRequestExit?.(); }}
          title={isEs ? 'Apagar' : 'Power off'}
          className="p-1.5 rounded-full transition-colors duration-150 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
        >
          <PowerIcon size={13} />
        </button>
      </div>
    </div>
  );
}

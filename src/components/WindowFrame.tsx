import { useEffect, useRef } from 'react';
import type { DesktopWindow } from '../hooks/useDesktopWindows';
import { TERM_COLORS } from './termColors';
import { FONT_DESKTOP } from './landing/constants';
import {
  TerminalAppIcon, ChromeAppIcon, BurpAppIcon,
  ManualAppIcon, WallpaperAppIcon,
} from './desktop/icons';

/** Ícono mini de la app en la titlebar, según el tipo de ventana */
function TitleBarAppIcon({ type }: { type: DesktopWindow['type'] }) {
  const size = 14;
  switch (type) {
    case 'terminal': return <TerminalAppIcon size={size} />;
    case 'browser': return <ChromeAppIcon size={size} />;
    case 'burpsuite': return <BurpAppIcon size={size} />;
    case 'guide': return <ManualAppIcon size={size} />;
    default: return <WallpaperAppIcon size={size} />;
  }
}

interface WindowFrameProps {
  window: DesktopWindow;
  isClosing?: boolean;
  activeSettingsId: string | null;
  isEs: boolean;
  termColor: string;
  children: React.ReactNode;
  onBringToFront: (id: string) => void;
  onStartDrag: (id: string, e: React.PointerEvent) => void;
  onStartResize: (id: string, e: React.PointerEvent, corner: 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se') => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onClose: (id: string) => void;
  onToggleSettings: (id: string | null) => void;
  onChangeOpacity: (id: string, value: number) => void;
  onChangeFontSize: (id: string, value: number) => void;
  onChangeTermColor: (color: string) => void;
}

export function WindowFrame({
  window: w, isClosing, activeSettingsId, isEs, termColor, children,
  onBringToFront, onStartDrag, onStartResize,
  onMinimize, onMaximize, onClose,
  onToggleSettings, onChangeOpacity, onChangeFontSize, onChangeTermColor,
}: WindowFrameProps) {
  const settingsRef = useRef<HTMLDivElement>(null);

  // Cerrar el panel de ajustes al hacer click fuera de él
  useEffect(() => {
    if (activeSettingsId !== w.id) return;
    const handler = (e: PointerEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        onToggleSettings(null);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [activeSettingsId, w.id, onToggleSettings]);

  return (
    <div
      onClick={() => onBringToFront(w.id)}
      style={{
        position: 'absolute',
        left: `${w.x}px`,
        top: `${w.y}px`,
        width: `${w.w}px`,
        height: `${w.h}px`,
        zIndex: w.zIndex,
        backdropFilter: 'blur(0px)',
        WebkitBackdropFilter: 'blur(0px)',
        display: w.minimized ? 'none' : 'flex',
      }}
      className={`flex flex-col border border-slate-700/70 rounded-lg shadow-2xl overflow-hidden min-w-[320px] min-h-[200px] transition-all duration-300 ${isClosing ? 'opacity-0 scale-90 pointer-events-none' : ''}`}
      data-tour={w.type === 'terminal' ? 'terminal-window' : w.type === 'guide' ? 'guide-window' : w.type === 'wallpaper' ? 'wallpaper-window' : w.type === 'browser' ? 'browser-window' : w.type === 'burpsuite' ? 'burp-window' : undefined}
    >
      <div
        onPointerDown={(e) => onStartDrag(w.id, e)}
        style={{ fontFamily: FONT_DESKTOP }}
        className="h-8 bg-slate-950 border-b border-slate-800 px-3 flex items-center justify-between cursor-move select-none flex-shrink-0"
      >
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <TitleBarAppIcon type={w.type} />
          <span>{w.title}</span>
        </div>

        <div className="flex items-center gap-2.5">
          {w.type === 'terminal' && (
            <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onToggleSettings(activeSettingsId === w.id ? null : w.id); }}
              title={isEs ? 'Configuración de terminal' : 'Terminal settings'}
              data-tour="settings-btn"
              className={`p-1 rounded transition-colors ${activeSettingsId === w.id ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          )}

          <button onClick={() => onMinimize(w.id)}
            title={isEs ? 'Minimizar' : 'Minimize'}
            className="w-4 h-4 rounded-full bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white flex items-center justify-center text-[10px] transition-colors font-bold">−</button>

          <button onClick={() => onMaximize(w.id)}
            title={w.maximized ? (isEs ? 'Restaurar' : 'Restore') : (isEs ? 'Maximizar' : 'Maximize')}
            className="w-4 h-4 rounded-full bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-white flex items-center justify-center text-[8px] transition-colors">
            {w.maximized ? '⧉' : '□'}
          </button>

          <button onClick={() => onClose(w.id)}
            title={isEs ? 'Cerrar' : 'Close'}
            className="w-4 h-4 rounded-full bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center text-[10px] transition-colors font-bold">×</button>
        </div>
      </div>

      {activeSettingsId === w.id && w.type === 'terminal' && (
        <div ref={settingsRef} className="absolute top-9 right-2 z-50 w-56 bg-slate-900/95 border border-slate-700 rounded-lg shadow-2xl p-3 text-slate-300 animate-fadeIn"
          data-tour="settings-panel"
          onClick={(e) => e.stopPropagation()}>
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            {isEs ? 'Tamaño de fuente' : 'Font size'}
          </label>
          <div className="flex items-center gap-2 mt-1.5 mb-3">
            <input type="range" min="10" max="20"
              value={w.fontSize}
              onChange={(e) => onChangeFontSize(w.id, parseInt(e.target.value, 10))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              style={{ outline: 'none' }} />
            <span className="text-[10px] font-mono text-slate-300 min-w-[30px] text-right">{w.fontSize}px</span>
          </div>

          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            {isEs ? 'Opacidad' : 'Opacity'}
          </label>
          <div className="flex items-center gap-2 mt-1.5 mb-3">
            <input type="range" min="0" max="100"
              value={Math.round(w.opacity * 100)}
              onChange={(e) => onChangeOpacity(w.id, parseInt(e.target.value, 10))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              style={{ outline: 'none' }} />
            <span className="text-[10px] font-mono text-slate-300 min-w-[30px] text-right">{Math.round(w.opacity * 100)}%</span>
          </div>

          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            {isEs ? 'Color del texto' : 'Text color'}
          </label>
          <div className="flex items-center gap-2 mt-2">
            {TERM_COLORS.map(c => (
              <button key={c.value} title={c.label}
                onClick={() => onChangeTermColor(c.value)}
                className="w-5 h-5 rounded-full border transition-all"
                style={{
                  background: c.value,
                  borderColor: termColor === c.value ? '#fff' : 'transparent',
                  boxShadow: termColor === c.value ? `0 0 0 1px ${c.value}` : 'none',
                  transform: termColor === c.value ? 'scale(1.2)' : 'scale(1)',
                }} />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 relative" style={{ background: `rgba(15, 23, 42, ${w.opacity})` }}>
        {children}
      </div>

      <div onPointerDown={(e) => onStartResize(w.id, e, 'nw')} className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50" />
      <div onPointerDown={(e) => onStartResize(w.id, e, 'ne')} className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-50" />
      <div onPointerDown={(e) => onStartResize(w.id, e, 'sw')} className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50" />
      <div onPointerDown={(e) => onStartResize(w.id, e, 'se')} className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 z-50 group">
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" className="text-slate-600 group-hover:text-emerald-500 transition-colors">
          <line x1="1" y1="9" x2="9" y2="1" strokeWidth="1.5" />
          <line x1="4" y1="9" x2="9" y2="4" strokeWidth="1.5" />
          <line x1="7" y1="9" x2="9" y2="7" strokeWidth="1.5" />
        </svg>
      </div>

      <div onPointerDown={(e) => onStartResize(w.id, e, 'n')} className="absolute top-0 left-4 right-4 h-1.5 cursor-n-resize z-40" />
      <div onPointerDown={(e) => onStartResize(w.id, e, 's')} className="absolute bottom-0 left-4 right-4 h-1.5 cursor-s-resize z-40" />
      <div onPointerDown={(e) => onStartResize(w.id, e, 'w')} className="absolute left-0 top-4 bottom-4 w-1.5 cursor-w-resize z-40" />
      <div onPointerDown={(e) => onStartResize(w.id, e, 'e')} className="absolute right-0 top-4 bottom-4 w-1.5 cursor-e-resize z-40" />
    </div>
  );
}

import React from 'react';
import type { DesktopWindow } from '../hooks/useDesktopWindows';

interface WindowFrameProps {
  window: DesktopWindow;
  isClosing?: boolean;
  activeOpacitySliderId: string | null;
  activeFontSliderId: string | null;
  isEs: boolean;
  children: React.ReactNode;
  onBringToFront: (id: string) => void;
  onStartDrag: (id: string, e: React.PointerEvent) => void;
  onStartResize: (id: string, e: React.PointerEvent, corner: 'nw' | 'ne' | 'sw' | 'se') => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onClose: (id: string) => void;
  onSetOpacitySlider: (id: string | null) => void;
  onSetFontSlider: (id: string | null) => void;
  onChangeOpacity: (id: string, value: number) => void;
  onChangeFontSize: (id: string, value: number) => void;
}

export function WindowFrame({
  window: w, isClosing, activeOpacitySliderId, activeFontSliderId, isEs, children,
  onBringToFront, onStartDrag, onStartResize,
  onMinimize, onMaximize, onClose,
  onSetOpacitySlider, onSetFontSlider, onChangeOpacity, onChangeFontSize,
}: WindowFrameProps) {
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
    >
      <div
        onPointerDown={(e) => onStartDrag(w.id, e)}
        className="h-8 bg-slate-950 border-b border-slate-800 px-3 flex items-center justify-between cursor-move select-none flex-shrink-0"
      >
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span className="text-emerald-500 font-mono">{w.type === 'terminal' ? '>' : w.type === 'browser' ? '🌐' : '⚙'}</span>
          <span>{w.title}</span>
        </div>

        <div className="flex items-center gap-2.5">
          {w.type === 'terminal' && (
            <>
              {activeOpacitySliderId === w.id ? (
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded animate-fadeIn z-50"
                  onMouseLeave={() => onSetOpacitySlider(null)}>
                  <input type="range" min="0" max="100"
                    value={Math.round(w.opacity * 100)}
                    onChange={(e) => { e.stopPropagation(); onChangeOpacity(w.id, parseInt(e.target.value, 10)); }}
                    className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    style={{ outline: 'none' }} />
                  <span className="text-[9px] font-mono text-slate-300 min-w-[24px] text-right">{Math.round(w.opacity * 100)}%</span>
                  <button onClick={(e) => { e.stopPropagation(); onSetOpacitySlider(null); }}
                    className="text-[9px] text-emerald-400 hover:text-emerald-300 font-bold ml-1">✓</button>
                </div>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); onSetOpacitySlider(w.id); }}
                  title={isEs ? 'Ajustar transparencia' : 'Adjust transparency'}
                  className="p-0.5 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors text-[10px] px-1 font-mono border border-slate-800">
                  {Math.round(w.opacity * 100)}%
                </button>
              )}

              {activeFontSliderId === w.id ? (
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded animate-fadeIn z-50"
                  onMouseLeave={() => onSetFontSlider(null)}>
                  <input type="range" min="10" max="20"
                    value={w.fontSize}
                    onChange={(e) => { e.stopPropagation(); onChangeFontSize(w.id, parseInt(e.target.value, 10)); }}
                    className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    style={{ outline: 'none' }} />
                  <span className="text-[9px] font-mono text-slate-300 min-w-[24px] text-right">{w.fontSize}px</span>
                  <button onClick={(e) => { e.stopPropagation(); onSetFontSlider(null); }}
                    className="text-[9px] text-emerald-400 hover:text-emerald-300 font-bold ml-1">✓</button>
                </div>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); onSetFontSlider(w.id); }}
                  title={isEs ? 'Ajustar tamaño de fuente' : 'Adjust font size'}
                  className="p-0.5 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors text-[10px] px-1 font-mono border border-slate-800">
                  {w.fontSize}px
                </button>
              )}
            </>
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
    </div>
  );
}

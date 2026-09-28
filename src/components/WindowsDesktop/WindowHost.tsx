// ── components/WindowsDesktop/WindowHost.tsx ─────────────────────
// Host de ventanas del escritorio Windows (chrome propio, no WindowFrame
// de Kali — estética Win10: barra azul, botones rectos).

import type { WinWindow } from './useWinDesktopWindows';

interface Props {
  window: WinWindow;
  isClosing: boolean;
  onBringToFront: (id: string) => void;
  onStartDrag: (id: string, e: React.PointerEvent) => void;
  onStartResize: (id: string, e: React.PointerEvent, corner: 'nw' | 'ne' | 'sw' | 'se') => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onClose: (id: string) => void;
  children: React.ReactNode;
}

export function WindowHost({
  window: w, isClosing, onBringToFront, onStartDrag, onStartResize,
  onMinimize, onMaximize, onClose, children,
}: Props) {
  return (
    <div
      onClick={() => onBringToFront(w.id)}
      style={{
        position: 'absolute',
        left: w.x,
        top: w.y,
        width: w.w,
        height: w.h,
        zIndex: w.zIndex,
        display: w.minimized ? 'none' : 'flex',
      }}
      className={`flex-col border border-slate-700/80 shadow-[0_8px_28px_rgba(0,0,0,0.45)] overflow-hidden min-w-[340px] min-h-[200px] bg-white ${
        isClosing ? 'opacity-0 scale-95 pointer-events-none transition-all duration-200' : ''
      }`}
      data-testid={`win-window-${w.type}`}
      data-tour={`${w.type}-window`}
    >
      <div
        onPointerDown={e => onStartDrag(w.id, e)}
        className="h-8 bg-gradient-to-b from-[#0078d4] to-[#0067b8] px-2 flex items-center justify-between cursor-move select-none shrink-0 border-b border-[#005a9e]/60"
      >
        <span className="text-xs text-white font-medium truncate drop-shadow-sm">{w.title}</span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={e => { e.stopPropagation(); onMinimize(w.id); }}
            className="w-7 h-6 hover:bg-white/20 text-white text-xs"
            aria-label="Minimizar"
          >
            ─
          </button>
          <button
            onClick={e => { e.stopPropagation(); onMaximize(w.id); }}
            className="w-7 h-6 hover:bg-white/20 text-white text-[10px]"
            aria-label="Maximizar"
          >
            ☐
          </button>
          <button
            onClick={e => { e.stopPropagation(); onClose(w.id); }}
            className="w-7 h-6 hover:bg-[#e81123] text-white text-xs"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      </div>
      {/* Cuerpo: flex column para que los hijos con `flex-1` (la terminal)
          ocupen TODO el alto. Con `relative` solo, la terminal quedaba del
          tamaño del contenido y se veía el bg-white debajo. */}
      <div className="flex-1 min-h-0 relative bg-white overflow-hidden flex flex-col">{children}</div>
      <div
        onPointerDown={e => onStartResize(w.id, e, 'nw')}
        className="absolute top-0 left-0 w-2 h-2 cursor-nw-resize z-50"
      />
      <div
        onPointerDown={e => onStartResize(w.id, e, 'ne')}
        className="absolute top-0 right-0 w-2 h-2 cursor-ne-resize z-50"
      />
      <div
        onPointerDown={e => onStartResize(w.id, e, 'sw')}
        className="absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize z-50"
      />
      <div
        onPointerDown={e => onStartResize(w.id, e, 'se')}
        className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-50"
      />
    </div>
  );
}

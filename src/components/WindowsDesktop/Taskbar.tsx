// ── components/WindowsDesktop/Taskbar.tsx ────────────────────────
// Taskbar Windows: menú inicio, apps abiertas, reloj y desconexión RDP.

import type { WinAppType, WinWindow } from './useWinDesktopWindows';

interface Props {
  windows: WinWindow[];
  isEs: boolean;
  showStart: boolean;
  onToggleStart: () => void;
  onFocusWindow: (id: string) => void;
  onDisconnect: () => void;
}

const START_ITEMS: Array<{ type: WinAppType; labelEs: string; labelEn: string }> = [
  { type: 'explorer', labelEs: 'Explorador de archivos', labelEn: 'File Explorer' },
  { type: 'winterm', labelEs: 'Símbolo del sistema', labelEn: 'Command Prompt' },
  { type: 'security', labelEs: 'Seguridad de Windows', labelEn: 'Windows Security' },
  { type: 'systemprops', labelEs: 'Propiedades del sistema', labelEn: 'System Properties' },
];

function Clock() {
  const now = new Date();
  const time = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return (
    <div className="text-right leading-tight text-[11px] text-slate-200 px-2" data-testid="win-clock">
      <div>{time}</div>
      <div className="text-slate-400 text-[10px]">{date}</div>
    </div>
  );
}

export function Taskbar({
  windows, isEs, showStart, onToggleStart, onFocusWindow, onDisconnect,
}: Props) {
  return (
    <div className="relative h-10 bg-slate-900/95 border-t border-slate-700 flex items-center gap-1 px-1 z-40 shrink-0">
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onToggleStart(); }}
        aria-label={isEs ? 'Inicio' : 'Start'}
        data-testid="start-button"
        className={`h-8 px-3 rounded flex items-center gap-1.5 text-xs font-semibold transition-colors ${
          showStart ? 'bg-blue-600 text-white' : 'bg-blue-700/90 hover:bg-blue-600 text-white'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <rect x="1" y="1" width="6" height="6" rx="0.5" />
          <rect x="9" y="1" width="6" height="6" rx="0.5" />
          <rect x="1" y="9" width="6" height="6" rx="0.5" />
          <rect x="9" y="9" width="6" height="6" rx="0.5" />
        </svg>
        {isEs ? 'Inicio' : 'Start'}
      </button>

      <div className="flex-1 flex items-center gap-1 overflow-x-auto min-w-0">
        {windows.map(w => (
          <button
            key={w.id}
            type="button"
            onClick={e => { e.stopPropagation(); onFocusWindow(w.id); }}
            className={`h-8 max-w-[160px] px-2 rounded text-xs truncate transition-colors ${
              w.minimized
                ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                : 'bg-slate-700 text-white border-b-2 border-blue-500'
            }`}
            data-testid={`taskbar-${w.type}`}
          >
            {w.title}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={e => { e.stopPropagation(); onDisconnect(); }}
        data-testid="rdp-disconnect"
        className="h-8 px-2.5 rounded text-xs bg-slate-800 hover:bg-red-600/80 text-slate-300 hover:text-white transition-colors"
        title={isEs ? 'Desconectar escritorio remoto' : 'Disconnect remote desktop'}
      >
        ⏻ {isEs ? 'Cerrar' : 'Disconnect'}
      </button>
      <Clock />
    </div>
  );
}

export { START_ITEMS };

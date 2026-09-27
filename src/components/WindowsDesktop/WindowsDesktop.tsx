// ── components/WindowsDesktop/WindowsDesktop.tsx ─────────────────
// Escritorio Windows simulado vía RDP (PLAN_WINDOWS W3).
// Taskbar + menú inicio + apps en ventanas sobre el FS/identidad W0–W1.

import { useEffect } from 'react';
import { Terminal } from '../Terminal';
import type { CommandRunnerProps } from '../../hooks/useCommandRunner';
import type { Machine } from '../../types';
import { useScenarioStore } from '../../store/scenarioStore';
import { getCurrentUser } from '../../utils/users';
import { useWinDesktopWindows, type WinAppType, type WinWindow } from './useWinDesktopWindows';
import { Taskbar, START_ITEMS } from './Taskbar';
import { WindowHost } from './WindowHost';
import { Explorer } from './apps/Explorer';
import { SystemProps } from './apps/SystemProps';
import { SecurityPanel } from './apps/SecurityPanel';

interface Props extends CommandRunnerProps {
  /** Máquina Windows objetivo de la sesión RDP. */
  desktopMachine: Machine;
  onDisconnect: () => void;
}

const APP_ICONS: Record<WinAppType, string> = {
  explorer: '📁',
  winterm: '⬛',
  security: '🛡',
  systemprops: '🖥',
};

export function WindowsDesktop({ desktopMachine, onDisconnect, ...termProps }: Props) {
  const language = useScenarioStore(s => s.language);
  const isEs = language === 'es';
  const {
    windows, closingIds, showStart, setShowStart, desktopRef,
    openApp, setWindows, closeWindow, minimizeWindow, toggleMaximize, bringToFront,
    startDrag, startResize,
  } = useWinDesktopWindows();

  const allMachines = termProps.allMachines ?? [];

  /**
   * Pivoting: cada terminal recuerda LA SUYA. Conectar una terminal a otra
   * máquina solo cambia el `machineId` de esa ventana — las demás siguen
   * donde estaban (el `machine` de los props globales ya no manda acá).
   */
  const handleTermChangeMachine = (windowId: string, newMachineId: string) => {
    const target = allMachines.find(m => m.id === newMachineId);
    const host = target?.machine_info?.hostname || newMachineId;
    const user = target ? getCurrentUser(target).username : 'Administrator';
    setWindows(prev => prev.map(win => {
      if (win.id !== windowId) return win;
      return { ...win, machineId: newMachineId, title: `${win.title.split(' - ')[0]} - ${user}@${host}` };
    }));
    useScenarioStore.getState().setTerminalMachine?.(windowId, newMachineId);
  };

  const renderApp = (w: WinWindow) => {
    switch (w.type) {
      case 'explorer':
        return <Explorer machine={desktopMachine} />;
      case 'systemprops':
        return <SystemProps machine={desktopMachine} />;
      case 'security':
        return <SecurityPanel machine={desktopMachine} />;
      case 'winterm': {
        const machine = allMachines.find(m => m.id === w.machineId) ?? desktopMachine;
        return (
          <Terminal
            {...termProps}
            machine={machine}
            terminalId={w.id}
            isWindowed
            compactHeader
            onChangeMachine={(newMachineId) => handleTermChangeMachine(w.id, newMachineId)}
          />
        );
      }
      default:
        return null;
    }
  };

  const label = (type: WinAppType) => {
    const item = START_ITEMS.find(i => i.type === type);
    if (!item) return type;
    return isEs ? item.labelEs : item.labelEn;
  };

  // Registro en el store (mismo contrato que el escritorio Kali): el
  // NetworkMap y el resto de la app ven en qué máquina está cada terminal.
  // La firma solo cambia al abrir/cerrar/conectar — no al arrastrar ventanas.
  const termSignature = windows
    .filter(w => w.type === 'winterm')
    .map(w => `${w.id}:${w.machineId ?? desktopMachine.id}`)
    .join('|');
  useEffect(() => {
    const store = useScenarioStore.getState();
    let n = 0;
    for (const w of windows) {
      if (w.type !== 'winterm') continue;
      n += 1;
      const machineId = w.machineId ?? desktopMachine.id;
      store.registerTerminal?.(w.id, n, machineId);
      store.setTerminalMachine?.(w.id, machineId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termSignature, desktopMachine.id]);

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden select-none"
      onClick={() => setShowStart(false)}
      data-testid="windows-desktop"
    >
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-[#0078d4] via-[#1b6ec2] to-[#0c3a6e]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_40%,white_0%,transparent_50%)]" />
      </div>

      <div ref={desktopRef} className="relative flex-1 z-10 min-h-0 overflow-hidden">
        <div className="absolute top-4 left-4 flex flex-col gap-3 z-0">
          {START_ITEMS.map(item => (
            <button
              key={item.type}
              type="button"
              onClick={e => { e.stopPropagation(); openApp(item.type); }}
              className="flex flex-col items-center w-16 rounded hover:bg-white/15 border border-transparent hover:border-white/20 p-1 transition-colors"
              data-testid={`desktop-icon-${item.type}`}
              aria-label={label(item.type)}
            >
              <span className="text-2xl leading-none" aria-hidden>
                {APP_ICONS[item.type]}
              </span>
              <span className="text-[10px] text-white mt-1 text-center leading-tight drop-shadow">
                {label(item.type)}
              </span>
            </button>
          ))}
        </div>

        {windows.map(w => (
          <WindowHost
            key={w.id}
            window={w}
            isClosing={closingIds.includes(w.id)}
            onBringToFront={bringToFront}
            onStartDrag={startDrag}
            onStartResize={startResize}
            onMinimize={minimizeWindow}
            onMaximize={toggleMaximize}
            onClose={closeWindow}
          >
            {renderApp(w)}
          </WindowHost>
        ))}

        {showStart && (
          <div
            className="absolute bottom-2 left-2 w-64 bg-slate-900 border border-slate-700 rounded-t shadow-2xl z-50 overflow-hidden"
            onClick={e => e.stopPropagation()}
            data-testid="start-menu"
          >
            <div className="px-3 py-2 bg-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wide">
              {isEs ? 'Todas las apps' : 'All apps'}
            </div>
            {START_ITEMS.map(item => (
              <button
                key={item.type}
                type="button"
                onClick={() => openApp(item.type)}
                className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-blue-600 flex items-center gap-2"
              >
                <span aria-hidden>{APP_ICONS[item.type]}</span>
                {label(item.type)}
              </button>
            ))}
          </div>
        )}
      </div>

      <Taskbar
        windows={windows}
        isEs={isEs}
        showStart={showStart}
        onToggleStart={() => setShowStart(!showStart)}
        onFocusWindow={bringToFront}
        onDisconnect={onDisconnect}
      />
    </div>
  );
}

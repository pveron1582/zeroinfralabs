import React from 'react';
import { Terminal } from './Terminal';
import { FakeBrowser } from './FakeBrowser';
import { DesktopTopBar } from './DesktopTopBar';
import { WindowFrame } from './WindowFrame';
import { WallpaperPicker } from './WallpaperPicker';
import { useScenarioStore } from '../store/scenarioStore';
import { useDesktopWindows } from '../hooks/useDesktopWindows';
import { type CommandRunnerProps } from '../hooks/useCommandRunner';

export function DesktopTerminal(props: CommandRunnerProps) {
  const setPossibleUsers = useScenarioStore(state => state.setPossibleUsers);
  const reportVulnerability = useScenarioStore(state => state.reportVulnerability);
  const goHome = useScenarioStore(state => state.goHome);

  const {
    time, windows, setWindows, closingWindowIds, activeWallpaper, setActiveWallpaper,
    selectedWallpaper, activeOpacitySliderId, setActiveOpacitySliderId,
    activeFontSliderId, setActiveFontSliderId, showAppMenu, setShowAppMenu,
    showSysMenu, setShowSysMenu, termWindows, browserWindows, wallpaperWindows,
    topWindowId, addTerminal, addBrowser, openWallpaperPicker, closeWindow,
    minimizeWindow, restoreWindow, toggleMaximize, bringToFront,
    startDrag, startResize, desktopRef, isEs, currentScenario, missions, showNotification,
  } = useDesktopWindows();

  const wpMachine = props.allMachines.find(m =>
    m.scan_results?.ports?.some((p: { port: number }) => p.port === 80 || p.port === 443)
  );
  const wpDiscoveryLevel = wpMachine?.discovery_level ?? 0;
  const mission3Already = missions.some(m => m.id === 3 && m.status === 'completed');

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-950 select-none"
      onClick={() => { setShowAppMenu(false); setShowSysMenu(false); }}
    >
      <div className="absolute inset-0 z-0 transition-all duration-700 pointer-events-none"
        style={selectedWallpaper.style}>
        <div className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundImage: `radial-gradient(circle, ${selectedWallpaper.gridColor} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            opacity: selectedWallpaper.gridOpacity,
          }} />
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
          <svg className="w-96 h-96" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        </div>
      </div>

      <DesktopTopBar
        windows={windows} termWindows={termWindows} browserWindows={browserWindows}
        wallpaperWindows={wallpaperWindows} topWindowId={topWindowId}
        showAppMenu={showAppMenu} showSysMenu={showSysMenu} time={time}
        isEs={isEs} currentScenarioCategory={currentScenario?.category || ''}
        onToggleAppMenu={() => { setShowAppMenu(!showAppMenu); setShowSysMenu(false); }}
        onToggleSysMenu={() => { setShowSysMenu(!showSysMenu); setShowAppMenu(false); }}
        onCloseAppMenu={() => setShowAppMenu(false)}
        onCloseSysMenu={() => setShowSysMenu(false)}
        onAddTerminal={addTerminal} onAddBrowser={addBrowser}
        onOpenWallpaperPicker={openWallpaperPicker}
        onMinimizeWindow={minimizeWindow} onRestoreWindow={restoreWindow}
        onBringToFront={bringToFront}
        onGoHome={goHome}
        onShowAbout={() => showNotification(
          isEs ? "ZeroInfra Kali Desktop v1.1. Desarrollado para simulación." : "ZeroInfra Kali Desktop v1.1. Built for simulation purposes."
        )}
      />

      <div ref={desktopRef} className="relative flex-1 z-10 w-full h-full overflow-hidden">
        <div className="absolute top-6 left-6 flex flex-col gap-6 select-none z-10">
          <div onDoubleClick={addTerminal} onClick={addTerminal}
            className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-emerald-400/10 border border-transparent hover:border-emerald-500/10 cursor-pointer group transition-all duration-200">
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm shadow-md group-hover:scale-105 transition-transform duration-200">&gt;_</div>
            <span className="text-[10px] text-slate-300 mt-1 font-sans text-center truncate max-w-full drop-shadow">{isEs ? 'Terminal' : 'Terminal'}</span>
          </div>
          <div onDoubleClick={openWallpaperPicker} onClick={openWallpaperPicker}
            className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-emerald-400/10 border border-transparent hover:border-emerald-500/10 cursor-pointer group transition-all duration-200">
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400 text-sm shadow-md group-hover:scale-105 transition-transform duration-200">🖼️</div>
            <span className="text-[10px] text-slate-300 mt-1 font-sans text-center truncate max-w-full drop-shadow">{isEs ? 'Fondos' : 'Wallpapers'}</span>
          </div>
          {currentScenario?.category === 'Web' && (
            <div onDoubleClick={addBrowser} onClick={addBrowser}
              className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-orange-400/10 border border-transparent hover:border-orange-500/10 cursor-pointer group transition-all duration-200">
              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-orange-400 shadow-md group-hover:scale-105 transition-transform duration-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/><line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
                </svg>
              </div>
              <span className="text-[10px] text-slate-300 mt-1 font-sans text-center truncate max-w-full drop-shadow">Chrome</span>
            </div>
          )}
        </div>

        {windows.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-35 select-none pointer-events-none">
            <span className="text-3xl text-emerald-400 font-bold mb-2">&gt;_</span>
            <p className="text-xs text-slate-400 font-mono max-w-xs leading-relaxed">
              {isEs ? "Haz doble clic en el icono de la Terminal o ve a Aplicaciones para abrir una nueva consola." : "Double-click the Terminal icon or open Applications to launch a new console."}
            </p>
          </div>
        )}

        {windows.map((w) => {
          return (
            <div key={w.id}>
              <WindowFrame
                window={w}
                isClosing={closingWindowIds.includes(w.id)}
                activeOpacitySliderId={activeOpacitySliderId}
                activeFontSliderId={activeFontSliderId}
                isEs={isEs}
                onBringToFront={bringToFront}
                onStartDrag={startDrag}
                onStartResize={startResize}
                onMinimize={minimizeWindow}
                onMaximize={toggleMaximize}
                onClose={closeWindow}
                onSetOpacitySlider={setActiveOpacitySliderId}
                onSetFontSlider={setActiveFontSliderId}
                onChangeOpacity={(id, val) => {
                  setWindows(prev => prev.map(win => win.id === id ? { ...win, opacity: val / 100 } : win));
                }}
                onChangeFontSize={(id, val) => {
                  setWindows(prev => prev.map(win => win.id === id ? { ...win, fontSize: val } : win));
                }}
              >
                {w.type === 'terminal' ? (
                  <Terminal {...props} opacity={w.opacity} fontSize={w.fontSize} isWindowed={true} />
                ) : w.type === 'browser' ? (
                  <FakeBrowser key={w.id} allMachines={props.allMachines}
                    onClose={() => closeWindow(w.id)}
                    onMinimize={() => minimizeWindow(w.id)}
                    onMaximizeToggle={() => toggleMaximize(w.id)}
                    onMissionComplete={props.onMissionComplete}
                    onCredentialsFound={props.onCredentialsFound}
                    onVerifyCredentials={props.onVerifyCredentials}
                    scenarioHasWeb={currentScenario?.category === 'Web'}
                    wpDiscoveryLevel={wpDiscoveryLevel}
                    mission3Already={mission3Already}
                    onSetPossibleUsers={setPossibleUsers}
                    onReportVulnerability={reportVulnerability}
                  />
                ) : (
                  <WallpaperPicker activeWallpaper={activeWallpaper} isEs={isEs} onSelectWallpaper={setActiveWallpaper} />
                )}
              </WindowFrame>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.15s ease-out forwards; }
      `}</style>
    </div>
  );
}

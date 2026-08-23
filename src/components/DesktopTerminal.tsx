import { Terminal } from './Terminal';
import { FakeBrowser } from './FakeBrowser';
import { BurpSuite } from './burpsuite';
import { DesktopTopBar } from './DesktopTopBar';
import { WindowFrame } from './WindowFrame';
import { WallpaperPicker } from './WallpaperPicker';
import { PdfReader } from './PdfReader';
import { useScenarioStore } from '../store/scenarioStore';
import { useDesktopWindows } from '../hooks/useDesktopWindows';
import { useMissionCompletion } from '../hooks/useMissionCompletion';
import { type CommandRunnerProps } from '../hooks/useCommandRunner';
import { FONT_DESKTOP } from './landing/constants';
import {
  TerminalAppIcon, ChromeAppIcon,
  ManualAppIcon, WallpaperAppIcon, FoxyAppIcon,
} from './desktop/icons';

export function DesktopTerminal(props: CommandRunnerProps) {
  const setPossibleUsers = useScenarioStore(state => state.setPossibleUsers);
  const reportVulnerability = useScenarioStore(state => state.reportVulnerability);
  const setTermColor = useScenarioStore(state => state.setTermColor);
  const { checkMissionCompletion } = useMissionCompletion(props.onMissionComplete);

  const {
    time, windows, setWindows, closingWindowIds, activeWallpaper, setActiveWallpaper,
    selectedWallpaper, activeSettingsId, setActiveSettingsId, showAppMenu, setShowAppMenu,
    termWindows, browserWindows, wallpaperWindows, guideWindows, burpWindows,
    topWindowId, addTerminal, addBrowser, addGuide, addBurp, openWallpaperPicker, closeWindow,
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
      onClick={() => { setShowAppMenu(false); }}
    >
      <div className="absolute inset-0 z-0 transition-opacity duration-700 pointer-events-none"
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
        wallpaperWindows={wallpaperWindows} guideWindows={guideWindows} burpWindows={burpWindows} topWindowId={topWindowId}
        showAppMenu={showAppMenu} time={time}
        isEs={isEs} currentScenarioCategory={currentScenario?.category || ''}
        onToggleAppMenu={() => { setShowAppMenu(!showAppMenu); }}
        onCloseAppMenu={() => setShowAppMenu(false)}
        onAddTerminal={addTerminal} onAddBrowser={addBrowser} onOpenGuide={addGuide}
        onOpenWallpaperPicker={openWallpaperPicker} onAddBurp={addBurp}
        onMinimizeWindow={minimizeWindow} onRestoreWindow={restoreWindow}
        onBringToFront={bringToFront}
        onRequestExit={props.onRequestExit}
        onOpenTour={props.onOpenTour}
        onShowAbout={() => showNotification(
          isEs ? "ZeroInfra Kali Desktop v1.1. Desarrollado para simulación." : "ZeroInfra Kali Desktop v1.1. Built for simulation purposes."
        )}
      />

      <div ref={desktopRef} className="relative flex-1 z-10 w-full h-full overflow-hidden">
        <div style={{ fontFamily: FONT_DESKTOP }} className="absolute top-6 left-6 flex flex-col gap-6 select-none z-0" data-tour="desktop-icons">
          <div onDoubleClick={addTerminal} onClick={addTerminal}
            data-tour="desktop-icon-terminal"
            className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-emerald-400/10 border border-transparent hover:border-emerald-500/10 cursor-pointer group transition-all duration-200">
            <div className="w-11 h-11 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-200 drop-shadow-lg"><TerminalAppIcon size={44} /></div>
            <span className="text-[10px] text-slate-300 mt-1 font-sans text-center truncate max-w-full drop-shadow">{isEs ? 'Terminal' : 'Terminal'}</span>
          </div>
          <div onDoubleClick={openWallpaperPicker} onClick={openWallpaperPicker}
            data-tour="desktop-icon-wallpaper"
            className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-emerald-400/10 border border-transparent hover:border-emerald-500/10 cursor-pointer group transition-all duration-200">
            <div className="w-11 h-11 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-200 drop-shadow-lg"><WallpaperAppIcon size={44} /></div>
            <span className="text-[10px] text-slate-300 mt-1 font-sans text-center truncate max-w-full drop-shadow">{isEs ? 'Fondos' : 'Wallpapers'}</span>
          </div>
          {currentScenario?.category === 'Web' && (
            <div onDoubleClick={addBrowser} onClick={addBrowser}
              data-tour="desktop-icon-browser"
              className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-orange-400/10 border border-transparent hover:border-orange-500/10 cursor-pointer group transition-all duration-200">
              <div className="w-11 h-11 rounded-xl group-hover:scale-105 transition-transform duration-200 drop-shadow-lg"><ChromeAppIcon size={44} /></div>
              <span className="text-[10px] text-slate-300 mt-1 font-sans text-center truncate max-w-full drop-shadow">Chrome</span>
            </div>
          )}
          <div onDoubleClick={addGuide} onClick={addGuide}
            data-tour="desktop-icon-guide"
            className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-red-400/10 border border-transparent hover:border-red-500/10 cursor-pointer group transition-all duration-200">
            <div className="w-11 h-11 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-200 drop-shadow-lg"><ManualAppIcon size={44} /></div>
            <span className="text-[10px] text-slate-300 mt-1 font-sans text-center truncate max-w-full drop-shadow">{isEs ? 'Manual' : 'Manual'}</span>
          </div>
          <div onClick={props.onOpenTour}
            data-tour="desktop-icon-foxy"
            className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-amber-400/10 border border-transparent hover:border-amber-500/10 cursor-pointer group transition-all duration-200">
            <div className="w-11 h-11 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-200 drop-shadow-lg"><FoxyAppIcon size={44} /></div>
            <span className="text-[10px] text-slate-300 mt-1 font-sans text-center truncate max-w-full drop-shadow">{isEs ? 'Guía' : 'Guide'}</span>
          </div>
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
                activeSettingsId={activeSettingsId}
                isEs={isEs}
                termColor={props.termColor ?? '#10b981'}
                onBringToFront={bringToFront}
                onStartDrag={startDrag}
                onStartResize={startResize}
                onMinimize={minimizeWindow}
                onMaximize={toggleMaximize}
                onClose={closeWindow}
                onToggleSettings={setActiveSettingsId}
                onChangeOpacity={(id, val) => {
                  setWindows(prev => prev.map(win => win.id === id ? { ...win, opacity: val / 100 } : win));
                }}
                onChangeFontSize={(id, val) => {
                  setWindows(prev => prev.map(win => win.id === id ? { ...win, fontSize: val } : win));
                }}
                onChangeTermColor={setTermColor}
              >
                {w.type === 'terminal' ? (
                  <Terminal {...props} opacity={w.opacity} fontSize={w.fontSize} isWindowed={true}
                    onExitTerminal={() => closeWindow(w.id)} />
                ) : w.type === 'browser' ? (
                  <FakeBrowser key={w.id} allMachines={props.allMachines}
                    onClose={() => closeWindow(w.id)}
                    onMinimize={() => minimizeWindow(w.id)}
                    onMaximizeToggle={() => toggleMaximize(w.id)}
                    onMissionComplete={props.onMissionComplete}
                    onCredentialsFound={props.onCredentialsFound}
                    onVerifyCredentials={props.onVerifyCredentials ?? (() => {})}
                    scenarioHasWeb={currentScenario?.category === 'Web'}
                    wpDiscoveryLevel={wpDiscoveryLevel}
                    mission3Already={mission3Already}
                    onSetPossibleUsers={setPossibleUsers}
                    onReportVulnerability={reportVulnerability}
                    checkMissionCompletion={checkMissionCompletion}
                  />
                ) : w.type === 'burpsuite' ? (
                  <BurpSuite key={w.id}
                    allMachines={props.allMachines}
                    onClose={() => closeWindow(w.id)}
                    onReportVulnerability={reportVulnerability}
                    onCredentialsFound={props.onCredentialsFound}
                    checkMissionCompletion={checkMissionCompletion}
                  />
                ) : w.type === 'guide' ? (
                  <PdfReader key={w.id} isEs={isEs} />
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

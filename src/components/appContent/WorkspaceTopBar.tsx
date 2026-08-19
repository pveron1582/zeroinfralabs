// ── components/appContent/WorkspaceTopBar.tsx ───────────────────
// Barra superior del workspace: logo, nombre del escenario y tabs de apps

interface Props {
  scenarioName: string;
  uiMode: string;
  scenarioCategory: string;
  activeApp: string;
  onGoHome: () => void;
  onSetActiveApp: (app: 'terminal' | 'browser' | 'burpsuite') => void;
  onRefreshBrowser: () => void;
}

export function WorkspaceTopBar({ scenarioName, uiMode, scenarioCategory, activeApp, onGoHome, onSetActiveApp, onRefreshBrowser }: Props) {
  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-gray-800 flex-shrink-0 select-none"
      style={{ background: '#0d1117' }}>

      <button onClick={onGoHome} className="flex items-center gap-1.5 mr-2 group">
        <div className="w-5 h-5 rounded flex items-center justify-center bg-emerald-500 group-hover:bg-emerald-400 transition-colors">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
            <polyline points="8 10 12 14 8 18"/><rect x="2" y="3" width="20" height="18" rx="2"/>
          </svg>
        </div>
        <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">ZI Labs</span>
        <span className="text-[10px] text-gray-600">v4.5</span>
      </button>
      <div className="w-px h-4 bg-gray-800 mx-1" />
      <div className="flex items-center gap-1.5 mr-3">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span className="text-xs text-gray-400 font-mono">{scenarioName}</span>
      </div>

      {uiMode === 'classic' && (
      <button onClick={() => onSetActiveApp('terminal')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${activeApp === 'terminal' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
        </svg>
        <span style={{ fontFamily: 'sans-serif' }}>Terminal</span>
        {activeApp === 'terminal' && <div className="w-1 h-1 rounded-full bg-emerald-400 ml-0.5" />}
      </button>
      )}

      {uiMode === 'classic' && scenarioCategory === 'Web' && (
      <button onClick={() => { onRefreshBrowser(); onSetActiveApp('browser'); }}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${activeApp === 'browser' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/>
        </svg>
        <span style={{ fontFamily: 'sans-serif' }}>Chrome</span>
        {activeApp === 'browser' && <div className="w-1 h-1 rounded-full bg-emerald-400 ml-0.5" />}
      </button>
      )}

      {uiMode === 'classic' && scenarioCategory === 'Web' && (
      <button onClick={() => onSetActiveApp('burpsuite')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${activeApp === 'burpsuite' ? 'bg-orange-900 text-orange-300' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20"/>
        </svg>
        <span style={{ fontFamily: 'sans-serif' }}>Burp</span>
        {activeApp === 'burpsuite' && <div className="w-1 h-1 rounded-full bg-orange-400 ml-0.5" />}
      </button>
      )}

    </div>
  );
}

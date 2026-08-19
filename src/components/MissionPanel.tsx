// ── components/MissionPanel.tsx ───────────────────────────────────
import type { Mission, Machine } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import { useT, useLanguage } from '../i18n/translations';
import { StepCarousel } from './missionPanel/StepCarousel';
import { AttackerCredentials } from './missionPanel/AttackerCredentials';

interface Props {
  missions: Mission[];
  allMachines: Machine[];
  networkRange: string;
  onOpenBrowser: () => void;
  onOpenNetworkMap: () => void;
  onExit: () => void;
}

export function MissionPanel({ missions, allMachines, networkRange, onOpenNetworkMap, onExit }: Props) {
  const hasNewNetworkInfo = useScenarioStore(s => s.hasNewNetworkInfo);
  const t = useT();
  const language = useLanguage();

  const completed = missions.filter(m => m.status === 'completed').length;
  const total     = missions.length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  const resolve = (text: string, targetId?: string) => {
    let resolved = text.replace(/<network\/cidr>/g, networkRange);
    if (targetId) {
      const m = allMachines.find(m => m.id === targetId);
      resolved = resolved.replace(/<IP>/g, (m?.discovery_level || 0) > 0 ? m!.machine_info.ip : '???');
      resolved = resolved.replace(/<target-ip>/g, (m?.discovery_level || 0) > 0 ? m!.machine_info.ip : '???');
    }
    return resolved;
  };

  return (
    <div className="flex flex-col w-72 flex-shrink-0 bg-gray-900 border-l border-gray-800" data-tour="mission-panel">
      {/* Header - solo botón de red, más grande */}
      <div className="px-4 py-3 border-b border-gray-800 flex flex-col items-center gap-3">
        <button onClick={onOpenNetworkMap} data-tour="network-map-btn" className={`flex items-center justify-center gap-3 px-6 py-3 rounded-lg text-sm font-medium border transition-all w-full max-w-xs ${hasNewNetworkInfo ? 'animate-pulse border-violet-400 text-violet-400 bg-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200 hover:border-gray-600'}`} title="Network Map">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="2" width="6" height="6"/><rect x="2" y="16" width="6" height="6"/><rect x="16" y="16" width="6" height="6"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="5" y1="14" x2="12" y2="14"/><line x1="19" y1="14" x2="12" y2="14"/></svg>
          <span>{t('viewNetwork')}</span>
        </button>
        <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50 w-full max-w-xs">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span className="text-xs font-mono text-emerald-300 font-semibold">{networkRange}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 py-3 border-b border-gray-800">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-500 uppercase tracking-wider">{t('progress')}</span>
          <span className={`text-xs font-bold font-mono ${pct === 100 ? 'text-emerald-400' : 'text-emerald-400'}`}>
            {pct === 100 ? t('compromised') : `${pct}%`}
          </span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: '#10b981' }} />
        </div>
        <div className="mt-1 text-xs text-gray-600">{completed}/{total} completed</div>
      </div>

      {/* Credenciales de la máquina atacante */}
      <AttackerCredentials allMachines={allMachines} />

      {/* Mission carousel - siempre visible */}
      <StepCarousel missions={missions} resolve={resolve} language={language} />

      {/* Botón de salir — siempre visible en el panel */}
      <div className="px-4 py-4 border-t border-gray-800 mt-auto">
        <button
          onClick={onExit}
          title={language === 'es' ? 'Salir del simulador' : 'Exit simulator'}
          className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-red-600/90 hover:bg-red-500 active:scale-95 text-white font-bold text-sm tracking-wide shadow-lg shadow-red-950/40 border border-red-400/30 transition-all hover:scale-[1.02]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/>
          </svg>
          {language === 'es' ? 'Salir del Simulador' : 'Exit Simulator'}
        </button>
      </div>

      {/* Styles for animations */}
      <style>{`
        @keyframes slideInFromRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInFromLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutLeft {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-100%); opacity: 0; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideInFromRight {
          animation: slideInFromRight 0.3s ease-out forwards;
        }
        .animate-slideInFromLeft {
          animation: slideInFromLeft 0.3s ease-out forwards;
        }
        .animate-slideOutLeft {
          animation: slideOutLeft 0.3s ease-out forwards;
        }
        .animate-slideOutRight {
          animation: slideOutRight 0.3s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// ── components/MissionPanel.tsx ───────────────────────────────────
import React, { useState, useEffect } from "react"
import type { Mission, Machine } from '../types';
import { useScenarioStore } from '../store/scenarioStore';

interface Props {
  missions: Mission[];
  allMachines: Machine[];
  networkRange: string;
  onOpenBrowser: () => void;
  onOpenNetworkMap: () => void;
}

function AnimatedMission({ mission, fullText, done, active, index }: { mission: Mission, fullText: string, done: boolean, active: boolean, index: number }) {
  const [slideStatus, setSlideStatus] = useState<'waiting'|'sliding'|'done'>('waiting');
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    // Delay cascading slide animations based on index
    const t = setTimeout(() => {
      setSlideStatus('sliding');
      setTimeout(() => setSlideStatus('done'), 400); // 400ms duration of slideInRight
    }, index * 150);
    return () => clearTimeout(t);
  }, [index]);

  useEffect(() => {
    if (slideStatus !== 'done') return;
    if (done) {
      setTypedText(fullText);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(prev => fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [slideStatus, fullText, done]);

  if (slideStatus === 'waiting') return null;

  return (
    <div 
      className={`rounded-lg border p-3 transition-colors ${done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/40 bg-amber-500/5'}`}
      style={{ animation: slideStatus === 'sliding' ? 'slideInRight 0.4s ease-out forwards' : 'none' }}
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex-shrink-0">
          {done ? (
            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-amber-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-mono text-gray-600">{String(mission.id).padStart(2, '0')}</span>
            <h4 className={`text-xs font-semibold leading-tight ${done ? 'text-emerald-400' : 'text-amber-300'}`}>{mission.title}</h4>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed font-mono mt-1 break-all">
            {typedText}
            {slideStatus === 'done' && !done && typedText.length < fullText.length && (
              <span className="animate-pulse inline-block w-1.5 h-3 bg-gray-400 ml-0.5 translate-y-0.5" />
            )}
            {slideStatus === 'sliding' && <span className="animate-pulse inline-block w-1.5 h-3 bg-gray-400 ml-0.5 translate-y-0.5" />}
          </p>
        </div>
      </div>
    </div>
  );
}

export function MissionPanel({ missions, allMachines, networkRange, onOpenBrowser, onOpenNetworkMap }: Props) {
  const hasNewNetworkInfo = useScenarioStore(s => s.hasNewNetworkInfo);
  const [showHelp, setShowHelp] = useState(false);

  const completed = missions.filter(m => m.status === 'completed').length;
  const total     = missions.length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  const resolve = (text: string, targetId?: string) => {
    let t = text.replace(/<network\/cidr>/g, networkRange);
    if (targetId) {
      const m = allMachines.find(m => m.id === targetId);
      t = t.replace(/<IP>/g, (m?.discovery_level || 0) > 0 ? m!.machine_info.ip : '???');
      t = t.replace(/<target-ip>/g, (m?.discovery_level || 0) > 0 ? m!.machine_info.ip : '???');
    }
    return t;
  };

  const visibleMissions = missions.filter(m => m.status !== 'pending');

  return (
    <div className="flex flex-col w-72 flex-shrink-0 bg-gray-900 border-l border-gray-800">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Misiones</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowHelp(!showHelp)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${showHelp ? 'border-amber-500/50 text-amber-400 bg-amber-900/20' : 'border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600'}`} title={showHelp ? 'Ocultar ayuda' : 'Habilitar ayuda'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
          
          <button onClick={onOpenNetworkMap} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${hasNewNetworkInfo ? 'animate-pulse border-emerald-400 text-emerald-400 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200 hover:border-gray-600'}`} title="Mapa de red">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="2" width="6" height="6"/><rect x="2" y="16" width="6" height="6"/><rect x="16" y="16" width="6" height="6"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="5" y1="14" x2="12" y2="14"/><line x1="19" y1="14" x2="12" y2="14"/></svg>
            <span>Ver red</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 py-3 border-b border-gray-800">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-600 uppercase tracking-wider">Progreso</span>
          <span className={`text-xs font-bold font-mono ${pct === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {pct === 100 ? '● COMPROMETIDA' : `${pct}%`}
          </span>
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: pct === 100 ? '#10b981' : '#f59e0b' }} />
        </div>
        <div className="mt-1 text-xs text-gray-700">{completed}/{total} completadas</div>
      </div>

      {/* Mission list */}
      {showHelp ? (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 overflow-x-hidden" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
          {visibleMissions.map((m, idx) => (
            <AnimatedMission 
              key={m.id} 
              mission={m} 
              fullText={resolve(m.description, m.targetMachineId)} 
              done={m.status === 'completed'} 
              active={m.status === 'active'} 
              index={idx}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center opacity-50">
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 text-gray-500"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
           <p className="text-xs text-gray-400 font-mono">Modo sin ayuda.</p>
           <p className="text-[10px] text-gray-600 mt-2">Haz clic en el icono de interrogación para revelar los objetivos.</p>
        </div>
      )}

      {/* Styles for animations */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

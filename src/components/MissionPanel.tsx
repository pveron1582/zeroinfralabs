// ── components/MissionPanel.tsx ───────────────────────────────────
import React from "react"
import type { Mission, Machine } from '../types';

interface Props {
  missions: Mission[];
  allMachines: Machine[];
  networkRange: string;
  onOpenBrowser: () => void;
  onOpenNetworkMap: () => void;
}

export function MissionPanel({ missions, allMachines, networkRange, onOpenBrowser, onOpenNetworkMap }: Props) {
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

  const activeMission = missions.find(m => m.status === 'active');

  return (
    <div className="flex flex-col w-72 flex-shrink-0 bg-gray-900 border-l border-gray-800">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Misiones</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onOpenNetworkMap} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-gray-800 hover:text-gray-200 hover:border-gray-600"
            style={{ borderColor: '#374151', color: '#6b7280' }} title="Mapa de red">
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
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
        {missions.map(m => {
          const done    = m.status === 'completed';
          const active  = m.status === 'active';
          const pending = m.status === 'pending';
          return (
            <div key={m.id} className={`rounded-lg border p-3 transition-all duration-300 ${done ? 'border-emerald-500/30 bg-emerald-500/5' : active ? 'border-amber-500/40 bg-amber-500/5' : 'border-gray-800 bg-gray-900/30 opacity-40'}`}>
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex-shrink-0">
                  {done ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  ) : active ? (
                    <div className="w-4 h-4 rounded-full border-2 border-amber-400 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-700" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-mono text-gray-600">{String(m.id).padStart(2, '0')}</span>
                    <h4 className={`text-xs font-semibold leading-tight ${done ? 'text-emerald-400' : active ? 'text-amber-300' : 'text-gray-600'}`}>{m.title}</h4>
                  </div>
                  {!pending && <p className="text-xs text-gray-500 leading-relaxed font-mono mt-1 break-all">{resolve(m.description, m.targetMachineId)}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active mission hint */}
      {activeMission && (
        <div className="px-4 py-3 border-t border-gray-800">
          <div className="flex items-start gap-2 p-2.5 rounded bg-gray-800/50 border border-gray-700/50">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" className="mt-0.5 flex-shrink-0"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <p className="text-xs text-gray-500 leading-relaxed font-mono">{resolve(activeMission.description, activeMission.targetMachineId)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

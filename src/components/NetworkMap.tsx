// ── components/NetworkMap.tsx ─────────────────────────────────────
import { useState } from 'react';
import { useScenarioStore } from '../store/scenarioStore';
import { EnumerationPanel } from './EnumerationPanel';
import type { Machine, Scenario } from '../types';
import type { MsfState } from '../commands';
import type { FtpSessionState } from '../store/types';

const LEVEL_COLORS = ['#374151', '#3b82f6', '#eab308', '#a855f7', '#ef4444'];

interface Props {
  scenario: Scenario & { machines: Machine[] };
  activeMachineId: string;
  msfState?: MsfState | null;
  ftpSession?: FtpSessionState | null;
  onClose: () => void;
  compact?: boolean;
}

export function NetworkMap({ scenario, activeMachineId, msfState, ftpSession, onClose, compact = false }: Props) {
  const [selected, setSelected] = useState<Machine | null>(() => {
    // Default select first non-attacker target machine for the side panel
    return scenario.machines.find(m => !m.id.includes('attacker') && (m.discovery_level ?? 0) > 0) || null;
  });
  const [showLegend, setShowLegend] = useState(false);
  const language = useScenarioStore(state => state.language);
  const openWindowsDesktop = useScenarioStore(state => state.openWindowsDesktop);
  
  const LEVEL_LABELS = language === 'es'
    ? ['Desconocido', 'Descubierto', 'Escaneado', 'Enumerado', 'Comprometido']
    : ['Unknown', 'Discovered', 'Scanned', 'Enumerated', 'Compromised'];
  const unknownLabel = language === 'es' ? 'Desconocido' : 'Unknown';
  const unknownTargetLabel = language === 'es' ? 'Objetivo Desconocido' : 'Unknown Target';

  const activeTerminals = useScenarioStore(state => state.activeTerminals) ?? {};
  const hasHadTerminals = useScenarioStore(state => state.hasHadTerminals) ?? false;
  const terminalsList = Object.values(activeTerminals);

  // Orden móvil: víctima arriba, atacante abajo
  const sortedMachines = compact
    ? [...scenario.machines].sort((a, b) => {
        const aAtk = a.id.includes('attacker') ? 1 : 0;
        const bAtk = b.id.includes('attacker') ? 1 : 0;
        return aAtk - bAtk;
      })
    : scenario.machines;

  return (
    <div className={`${compact ? 'relative' : 'absolute inset-0 z-50 bg-gray-950/95 backdrop-blur-sm'} flex flex-col h-full w-full`} style={{ animation: 'fadeInMap 0.2s' }} data-tour="network-map">
      {/* Header */}
      <div className={`flex items-center justify-between ${compact ? 'px-4 py-3' : 'px-7 py-5'} border-b border-gray-800 flex-shrink-0`}>
        <div>
          <h2 className={`${compact ? 'text-sm' : 'text-base'} font-bold text-gray-100 flex items-center gap-2.5`}>
            <svg width={compact ? 14 : 16} height={compact ? 14 : 16} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><rect x="9" y="2" width="6" height="6"/><rect x="2" y="16" width="6" height="6"/><rect x="16" y="16" width="6" height="6"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="5" y1="14" x2="12" y2="14"/><line x1="19" y1="14" x2="12" y2="14"/></svg>
            {scenario.name}
          </h2>
          <p className={`${compact ? 'text-[11px]' : 'text-xs'} text-gray-600 font-mono mt-0.5`}>{scenario.network_range}</p>
        </div>
        <button onClick={onClose} data-tour="network-map-close" className="p-2 rounded-full hover:bg-gray-800 text-gray-500 hover:text-gray-200 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div className={`flex-1 flex ${compact ? 'flex-col' : ''} overflow-hidden`}>
        {/* Topología */}
        <div className="flex-1 flex flex-col relative h-full min-h-0">
          <div className={`flex-1 flex ${compact ? 'flex-col items-center p-4 gap-4' : 'items-center justify-center p-8'} overflow-y-auto`} data-tour="network-map-topology">
            <div className={`flex ${compact ? 'flex-col gap-4 items-center' : 'flex-wrap gap-6 justify-center items-center'}`}>
              {sortedMachines.map(machine => {
                const level        = machine.discovery_level ?? 0;
                const isAttacker   = machine.id.includes('attacker');
                // Comprometida solo después de escalada de privilegios (discovery_level >= 4)
                const isCompromised = (machine.discovery_level ?? 0) >= 4 && !isAttacker;
                const hidden       = level === 0 && !isAttacker;

                // MSF vulnerability state for this machine
                const machineIp    = machine.machine_info.ip;
                const isTarget     = msfState?.options?.RHOSTS === machineIp;
                const isExploited  = isTarget && (msfState?.uidChecked ?? false);
                const exploited    = isExploited || isCompromised;

                // FTP session state for this machine
                const isFtpTarget = ftpSession?.active && ftpSession.targetId === machine.id;
                const isFtpSession = isFtpTarget && !isAttacker;

                // Terminales conectadas a esta máquina
                const machineTerminals = terminalsList
                  .filter(t => t.machineId === machine.id)
                  .sort((a, b) => a.termNumber - b.termNumber);

                // Marco verde si hay al menos una terminal conectada (o fallback legacy si no se han abierto terminales)
                const isCurrentLocation = hasHadTerminals
                  ? machineTerminals.length > 0
                  : terminalsList.length > 0
                    ? machineTerminals.length > 0
                    : (isFtpSession ? true : machine.id === activeMachineId && !ftpSession?.active);

                const isActive    = isCurrentLocation;
                const borderColor = isCurrentLocation ? '#10b981' : '#374151';
                const glowColor   = isCurrentLocation ? '#10b981' : null;

                const topBadge = isCurrentLocation
                  ? {
                      label: ftpSession?.active && isFtpTarget ? 'FTP Active Session' : 'Active Session',
                      bg: '#10b981',
                      fg: '#000',
                      terminals: machineTerminals,
                    }
                  : null;

                // Badge nivel 3 usa el nombre del step 3 de la máquina (dinámico por escenario)
                const step3Label = machine.learning_steps?.find(s => s.id === 3)?.task?.split(' ')[0] || 'Enum';
                // Verificar si tiene vulnerabilidades detectadas
                const hasVulnDetected = machine.vulnerabilities?.some(v => v.status === 'detected' || v.status === 'confirmed');
                const vulnLabel = hasVulnDetected ? 'LFI' : step3Label;
                const allBadges = [
                  { lvl: 1, label: 'ARP-Scan',  color: '#3b82f6', svgPath: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></> },
                  { lvl: 2, label: 'Nmap',      color: '#eab308', svgPath: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></> },
                  { lvl: 3, label: vulnLabel,   color: hasVulnDetected ? '#10b981' : '#a855f7', svgPath: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></> },
                  { lvl: 4, label: 'Acceso',    color: '#10b981', svgPath: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></> },
                ];
                const visibleBadges = allBadges.filter(b => level >= b.lvl);

                return (
                  <div key={machine.id} onClick={() => level > 0 && setSelected(machine)}
                    className={`relative flex flex-col items-center rounded-2xl border-2 overflow-hidden transition-all ${compact ? 'w-[170px]' : 'w-52'} ${hidden ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-105'} ${selected?.id === machine.id ? 'ring-4 ring-gray-700/50' : ''}`}
                    style={{ borderColor, background: '#111827', boxShadow: glowColor ? `0 0 28px ${glowColor}40` : 'none' }}>

                    {topBadge && (
                      <div className="absolute top-0 left-0 right-0 flex justify-center z-10">
                        <div className="px-3 py-0.5 text-xs font-bold uppercase whitespace-nowrap rounded-b-lg flex items-center gap-1.5 shadow-sm"
                          style={{ background: topBadge.bg, color: topBadge.fg }}>
                          <span>{topBadge.label}</span>
                          {topBadge.terminals && topBadge.terminals.length > 0 && (
                            <div className="flex items-center gap-1 ml-0.5">
                              {topBadge.terminals.map(t => (
                                <span
                                  key={t.id}
                                  className="px-1.5 py-0.2 rounded bg-black/25 text-black font-mono font-black text-[11px] flex items-center gap-0.5"
                                  title={`Terminal ${t.termNumber}`}
                                >
                                  <span className="opacity-60 text-[9px]">&gt;_</span>{t.termNumber}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className={`flex flex-col items-center ${compact ? 'gap-2 p-4' : 'gap-3 p-6'} w-full ${topBadge ? 'pt-8' : ''}`}>
                      <div className={`${compact ? 'p-3' : 'p-4'} rounded-2xl`} style={{ background: isActive ? '#10b98115' : '#37415120', color: isActive ? '#10b981' : '#9ca3af' }}>
                        {isAttacker
                          ? /* Laptop Kali */
                            <svg width={compact ? 26 : 36} height={compact ? 26 : 36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                            : hidden
                            ? /* Objetivo desconocido */
                              <svg width={compact ? 26 : 36} height={compact ? 26 : 36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            : machine.machine_info.family === 'windows' || machine.machine_info.type === 'workstation'
                              ? /* Monitor PC (Windows / workstation) */
                                <svg width={compact ? 26 : 36} height={compact ? 26 : 36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="22" height="15" rx="2"/><polyline points="8 21 12 17 16 21"/><line x1="7" y1="21" x2="17" y2="21"/></svg>
                              : /* Rack servidor */
                                <svg width={compact ? 26 : 36} height={compact ? 26 : 36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
                        }
                      </div>

                      <div className="text-center w-full">
                        <p className="font-bold text-gray-200 truncate text-sm">{hidden ? unknownTargetLabel : machine.machine_info.hostname}</p>
                        <p className="text-xs font-mono mt-1" style={{ color: isActive ? '#10b981' : '#6b7280' }}>{hidden ? '?.?.?.?' : machine.machine_info.ip}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {machine.id.includes('attacker') 
                            ? machine.machine_info.os 
                            : (machine.discovery_level ?? 0) >= 1 ? machine.machine_info.os : `System: ${unknownLabel}`
                          }
                        </p>
                      </div>

                      {!isAttacker && visibleBadges.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap justify-center">
                          {visibleBadges.map(b => (
                            <div key={b.lvl} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
                              style={{ background: `${b.color}20`, color: b.color, border: `1px solid ${b.color}40` }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">{b.svgPath}</svg>
                              <span>{b.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Vulnerability status banner */}
                    {!isAttacker && !hidden && exploited && (
                      <div className="w-full flex items-center justify-center gap-2 py-2"
                        style={{ background: '#10b98120', borderTop: '1px solid #10b98140' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#10b981' }}>Compromised</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend — desktop barra, móvil popup vía botón */}
          {!compact ? (
            <div className="px-7 py-4 border-t border-gray-800 flex flex-wrap gap-5 text-xs text-gray-500 bg-gray-900/50">
              {LEVEL_LABELS.map((label, i) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: LEVEL_COLORS[i] }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowLegend(v => !v)}
                className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center shadow-lg active:scale-95 text-sm font-bold text-gray-300"
                aria-label="Referencias"
              >
                ?
              </button>
              {showLegend && (
                <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowLegend(false)}>
                  <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 w-full max-w-[280px] shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-white">Referencias</span>
                      <button onClick={() => setShowLegend(false)} className="w-6 h-6 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 flex items-center justify-center">×</button>
                    </div>
                    <div className="space-y-2">
                      {LEVEL_LABELS.map((label, i) => (
                        <div key={label} className="flex items-center gap-2 text-xs text-gray-400">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: LEVEL_COLORS[i] }} />
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Lado derecho: EnumerationPanel — solo desktop, en móvil va en ventana aparte */}
        {!compact && selected && !selected.id.includes('attacker') && (
          <div className="w-[380px] border-l border-gray-800 bg-gray-900 flex flex-col h-full flex-shrink-0 relative overflow-hidden" data-tour="network-map-enum">
            {selected.machine_info.family === 'windows' && (selected.discovery_level ?? 0) > 0 && (
              <button
                type="button"
                data-testid="open-rdp-desktop"
                onClick={() => {
                  openWindowsDesktop(selected.id);
                  onClose();
                }}
                className="m-3 px-3 py-2 rounded-lg bg-[#0078d4] hover:bg-[#1a86e0] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                {language === 'es' ? 'Abrir escritorio (RDP)' : 'Open desktop (RDP)'}
              </button>
            )}
            <EnumerationPanel
              machine={scenario.machines.find(m => m.id === selected.id) || selected}
              onClose={() => setSelected(null)}
              msfState={msfState}
              inline={true}
            />
          </div>
        )}
      </div>
      <style>{`@keyframes fadeInMap{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
}

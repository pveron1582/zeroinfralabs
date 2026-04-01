// ── components/NetworkMap.tsx ─────────────────────────────────────
import React, { useState } from 'react';
import { useScenarioStore } from '../store/scenarioStore';
import { useT } from '../i18n/translations';
import { EnumerationPanel } from './EnumerationPanel';
import type { Machine, Scenario } from '../types';
import type { MsfState } from '../commands';
import type { FtpSessionState } from '../store/scenarioStore';

const LEVEL_COLORS = ['#374151', '#3b82f6', '#eab308', '#a855f7', '#ef4444'];

interface Props {
  scenario: Scenario & { machines: Machine[] };
  activeMachineId: string;
  msfState?: MsfState | null;
  ftpSession?: FtpSessionState | null;
  onClose: () => void;
}

export function NetworkMap({ scenario, activeMachineId, msfState, ftpSession, onClose }: Props) {
  const [selected, setSelected] = useState<Machine | null>(() => {
    // Default select first non-attacker target machine for the side panel
    return scenario.machines.find(m => !m.id.includes('attacker') && (m.discovery_level ?? 0) > 0) || null;
  });
  const t = useT();
  const language = useScenarioStore(state => state.language);
  
  const LEVEL_LABELS = language === 'es'
    ? ['Desconocido', 'Descubierto', 'Escaneado', 'Enumerado', 'Comprometido']
    : ['Unknown', 'Discovered', 'Scanned', 'Enumerated', 'Compromised'];
  const unknownLabel = language === 'es' ? 'Desconocido' : 'Unknown';
  const unknownTargetLabel = language === 'es' ? 'Objetivo Desconocido' : 'Unknown Target';

  return (
    <div className="absolute inset-0 z-50 bg-gray-950/95 backdrop-blur-sm flex flex-col" style={{ animation: 'fadeInMap 0.2s' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-7 py-5 border-b border-gray-800">
        <div>
          <h2 className="text-base font-bold text-gray-100 flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><rect x="9" y="2" width="6" height="6"/><rect x="2" y="16" width="6" height="6"/><rect x="16" y="16" width="6" height="6"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="5" y1="14" x2="12" y2="14"/><line x1="19" y1="14" x2="12" y2="14"/></svg>
            {scenario.name}
          </h2>
          <p className="text-xs text-gray-600 font-mono mt-0.5">{scenario.network_range}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800 text-gray-500 hover:text-gray-200 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Lado izquierdo: Topología */}
        <div className="flex-1 flex flex-col relative h-full">
          <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
            <div className="flex flex-wrap gap-6 justify-center items-center">
              {scenario.machines.map(machine => {
                const level        = machine.discovery_level ?? 0;
                const isActive     = machine.id === activeMachineId;
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

                // Green border for active machine
                // During FTP: only victim shows green (not Kali), during normal: activeMachineId shows green
                const isCurrentLocation = isFtpSession 
                  ? true  // Victim machine with FTP session
                  : machine.id === activeMachineId && !ftpSession?.active; // Normal active machine, but not during FTP
                const borderColor = isCurrentLocation ? '#10b981'
                                  : '#374151';
                const glowColor   = isCurrentLocation ? '#10b981' : null;

                const topBadge = isCurrentLocation
                  ? { label: ftpSession?.active && isFtpTarget ? 'FTP Active Session' : 'Active Session', bg: '#10b981', fg: '#000' }
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
                    className={`relative flex flex-col items-center rounded-2xl border-2 overflow-hidden transition-all w-52 ${hidden ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-105'} ${selected?.id === machine.id ? 'ring-4 ring-gray-700/50' : ''}`}
                    style={{ borderColor, background: '#111827', boxShadow: glowColor ? `0 0 28px ${glowColor}40` : 'none' }}>

                    {topBadge && (
                      <div className="absolute top-0 left-0 right-0 flex justify-center">
                        <div className="px-3 py-0.5 text-xs font-bold uppercase whitespace-nowrap rounded-b-lg"
                          style={{ background: topBadge.bg, color: topBadge.fg }}>
                          {topBadge.label}
                        </div>
                      </div>
                    )}

                    <div className={`flex flex-col items-center gap-3 p-6 w-full ${topBadge ? 'pt-8' : ''}`}>
                      <div className="p-4 rounded-2xl" style={{ background: isActive ? '#10b98115' : '#37415120', color: isActive ? '#10b981' : '#9ca3af' }}>
                        {isAttacker
                          ? /* Laptop Kali */
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                          : hidden
                            ? /* Objetivo desconocido */
                              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            : machine.machine_info.type === 'workstation'
                              ? /* Monitor PC (Windows workstation) */
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="22" height="15" rx="2"/><polyline points="8 21 12 17 16 21"/><line x1="7" y1="21" x2="17" y2="21"/></svg>
                              : /* Rack servidor */
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
                        }
                      </div>

                      <div className="text-center w-full">
                        <p className="font-bold text-gray-200 truncate text-sm">{hidden ? unknownTargetLabel : machine.machine_info.hostname}</p>
                        <p className="text-xs font-mono mt-1" style={{ color: isActive ? '#10b981' : '#6b7280' }}>{hidden ? '?.?.?.?' : machine.machine_info.ip}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {machine.id.includes('attacker') 
                            ? 'Kali Linux 2023.4' 
                            : (machine.discovery_level ?? 0) >= 2 ? machine.machine_info.os : `System: ${unknownLabel}`
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

          {/* Legend */}
          <div className="px-7 py-4 border-t border-gray-800 flex flex-wrap gap-5 text-xs text-gray-500 bg-gray-900/50">
            {LEVEL_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: LEVEL_COLORS[i] }} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lado derecho: EnumerationPanel en línea */}
        {selected && !selected.id.includes('attacker') && (
          <div className="w-[380px] border-l border-gray-800 bg-gray-900 flex flex-col h-full flex-shrink-0 relative overflow-hidden">
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

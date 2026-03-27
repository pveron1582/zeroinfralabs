// ── components/NetworkMap.tsx ─────────────────────────────────────
import React, { useState } from 'react';
import type { Machine, Scenario } from '../types';
import type { MsfState } from '../commands';

const LEVEL_COLORS = ['#374151', '#3b82f6', '#eab308', '#a855f7', '#ef4444'];
const LEVEL_LABELS = ['Desconocido', 'Descubierto', 'Escaneado', 'Enumerado', 'Comprometido'];

interface Props {
  scenario: Scenario & { machines: Machine[] };
  activeMachineId: string;
  msfState?: MsfState | null;
  onClose: () => void;
}

export function NetworkMap({ scenario, activeMachineId, msfState, onClose }: Props) {
  const [selected, setSelected] = useState<Machine | null>(null);

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

      {/* Machine cards */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div className="flex flex-wrap gap-6 justify-center items-center">
          {scenario.machines.map(machine => {
            const level        = machine.discovery_level ?? 0;
            const isActive     = machine.id === activeMachineId;
            const isAttacker   = machine.id.includes('attacker');
            // Comprometida solo si hay credenciales SSH verificadas (no solo WP-Admin)
            const hasVerifiedSsh = machine.found_credentials?.some(
              c => c.service === 'ssh' && c.verified
            ) ?? false;
            const isCompromised = hasVerifiedSsh && !isAttacker;
            const hidden       = level === 0 && !isAttacker;

            // MSF vulnerability state for this machine
            const machineIp    = machine.machine_info.ip;
            const isRhosts     = msfState?.options?.RHOSTS === machineIp;
            const auxChecked   = isRhosts && (msfState?.auxChecked ?? false);
            const exploited    = isRhosts && (msfState?.sessionOpen ?? false) || isCompromised;

            // Green border only follows the active machine (where the user IS)
            // Attacker always green when no session, target gets it when session open
            const isCurrentLocation = machine.id === activeMachineId;
            const borderColor = isCurrentLocation ? '#10b981'
                              : '#374151';
            const glowColor   = isCurrentLocation ? '#10b981' : null;

            const topBadge = isCurrentLocation
              ? { label: 'Sesión Activa', bg: '#10b981', fg: '#000' }
              : null;

            // Badge nivel 3 usa el nombre del step 3 de la máquina (dinámico por escenario)
            const step3Label = machine.learning_steps?.find(s => s.id === 3)?.task?.split(' ')[0] || 'Enum';
            const allBadges = [
              { lvl: 1, label: 'ARP-Scan',  color: '#3b82f6', svgPath: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></> },
              { lvl: 2, label: 'Nmap',      color: '#eab308', svgPath: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></> },
              { lvl: 3, label: step3Label,  color: '#a855f7', svgPath: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></> },
              { lvl: 4, label: 'Acceso',    color: '#10b981', svgPath: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></> },
            ];
            const visibleBadges = allBadges.filter(b => level >= b.lvl);

            return (
              <div key={machine.id} onClick={() => level > 0 && setSelected(machine)}
                className={`relative flex flex-col items-center rounded-2xl border-2 overflow-hidden transition-all w-52 ${hidden ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
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
                    <p className="font-bold text-gray-200 truncate text-sm">{hidden ? 'Objetivo Desconocido' : machine.machine_info.hostname}</p>
                    <p className="text-xs font-mono mt-1" style={{ color: isActive ? '#10b981' : '#6b7280' }}>{hidden ? '?.?.?.?' : machine.machine_info.ip}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {machine.id.includes('attacker') 
                        ? 'Kali Linux 2023.4' 
                        : (machine.discovery_level ?? 0) >= 2 ? machine.machine_info.os : 'Sistema: Desconocido'
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
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#10b981' }}>Comprometida</span>
                  </div>
                )}
                {!isAttacker && !hidden && auxChecked && !exploited && (
                  <div className="w-full flex items-center justify-center gap-2 py-2"
                    style={{ background: '#f59e0b15', borderTop: '1px solid #f59e0b40' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#f59e0b' }}>Posiblemente Vulnerable</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-7 py-4 border-t border-gray-800 flex flex-wrap gap-5 text-xs text-gray-500">
        {LEVEL_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: LEVEL_COLORS[i] }} />
            <span>{label}</span>
          </div>
        ))}
        <span className="ml-auto italic text-gray-700">Clic en una máquina para detalles</span>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="absolute inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div>
                <p className="font-bold text-gray-100">{selected.machine_info.hostname}</p>
                <p className="text-xs font-mono text-gray-500">{selected.machine_info.ip} · {selected.machine_info.os}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-600 hover:text-gray-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
              {(selected.discovery_level ?? 0) >= 2 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-600 font-bold mb-2">Puertos</p>
                  {selected.scan_results.ports.map(p => (
                    <div key={p.port} className="flex gap-2 p-2 bg-gray-800/60 rounded text-xs font-mono mb-1">
                      <span className="text-emerald-400 w-16">{p.port}/{p.protocol}</span>
                      <span className="text-gray-400 w-14">{p.service}</span>
                      <span className="text-gray-600 truncate">{p.version}</span>
                    </div>
                  ))}
                </div>
              )}
              {(selected.discovery_level ?? 0) >= 3 && (selected.web_enumeration?.directories?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-600 font-bold mb-2">Directorios Web</p>
                  {selected.web_enumeration.directories.map(d => (
                    <div key={d.path} className="flex justify-between p-2 bg-gray-800/60 rounded text-xs font-mono mb-1">
                      <span className="text-gray-400"><span className="text-emerald-400">/</span>{d.path.replace('/', '')}</span>
                      <span className={d.status === 200 ? 'text-emerald-400' : 'text-red-400'}>{d.status}</span>
                    </div>
                  ))}
                </div>
              )}
              {(selected.discovery_level ?? 0) >= 2 && (() => {
                const selIp    = selected.machine_info.ip;
                const isTarget = msfState?.options?.RHOSTS === selIp;
                const vulnConfirmed = isTarget && (msfState?.sessionOpen || (selected.discovery_level ?? 0) >= 4);
                const vulnSuspected = isTarget && msfState?.auxChecked && !vulnConfirmed;
                const hasStaticVulns = (selected.vulnerabilities?.length ?? 0) > 0 && (selected.discovery_level ?? 0) >= 3;
                if (!vulnConfirmed && !vulnSuspected && !hasStaticVulns) return null;
                return (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-600 font-bold mb-2">Vulnerabilidades</p>
                    {/* Static vulns from machine data */}
                    {hasStaticVulns && selected.vulnerabilities!.map(v => (
                      <div key={v.id} className="flex items-center gap-2 p-2 bg-red-950/40 border border-red-800/30 rounded text-xs font-mono mb-1">
                        <span className="text-red-400 font-bold">{v.id}</span>
                        <span className="text-gray-500">{v.name || ''}</span>
                      </div>
                    ))}
                    {/* MSF runtime vuln status */}
                    {(vulnSuspected || vulnConfirmed) && (() => {
                      const accent = vulnConfirmed ? '#10b981' : '#f59e0b';
                      const bg     = vulnConfirmed ? '#10b98115' : '#f59e0b15';
                      const border = vulnConfirmed ? '#10b98140' : '#f59e0b40';
                      const icon   = vulnConfirmed
                        ? <polyline points="20 6 9 17 4 12"/>
                        : <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>;
                      const label  = vulnConfirmed ? 'MS17-010 — Explotada con éxito ✓' : 'MS17-010 — Posiblemente Vulnerable';
                      return (
                        <div className="flex items-center gap-2 p-2 rounded text-xs font-mono mb-1"
                          style={{ background: bg, border: `1px solid ${border}` }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5">{icon}</svg>
                          <span style={{ color: accent }} className="font-semibold">{label}</span>
                        </div>
                      );
                    })()}
                  </div>
                );
              })()}
              {selected.found_credentials && selected.found_credentials.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-600 font-bold mb-2">Credenciales Encontradas</p>
                  <div className="space-y-3">
                    {selected.found_credentials.map((cred, idx) => {
                      const verified = cred.verified === true;
                      const accent = verified ? '#10b981' : '#f59e0b';
                      const bgAlpha = verified ? '#10b98115' : '#f59e0b15';
                      const borderAlpha = verified ? '#10b98140' : '#f59e0b40';
                      const serviceLabel = cred.service === 'wp-admin' ? 'WordPress Admin' :
                                           cred.service === 'ssh' ? 'SSH' :
                                           cred.service === 'ftp' ? 'FTP' :
                                           cred.service || 'Desconocido';
                      return (
                        <div key={idx} className="rounded-lg font-mono text-xs overflow-hidden"
                          style={{ border: `1px solid ${borderAlpha}`, background: bgAlpha }}>
                          <div className="px-3 py-1.5 flex items-center justify-between border-b"
                            style={{ borderColor: borderAlpha, background: '#0000002a' }}>
                            <div className="flex items-center gap-1.5">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                              </svg>
                              <span style={{ color: accent }} className="text-xs">{cred.file}</span>
                            </div>
                            <span className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: bgAlpha, color: accent }}>
                              {serviceLabel}
                            </span>
                          </div>
                          <div className="p-3 space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">usuario</span>
                              <span className="text-gray-200 font-semibold">{cred.user}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">password</span>
                              <span style={{ color: accent }} className="font-semibold">{cred.pass}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 mt-1 border-t"
                              style={{ borderColor: borderAlpha }}>
                              <span className="text-gray-500">estado</span>
                              <span className="flex items-center gap-1" style={{ color: accent }}>
                                {verified ? (
                                  <><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg> Verificado</>
                                ) : (
                                  <><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                  </svg> Sin verificar</>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeInMap{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
}

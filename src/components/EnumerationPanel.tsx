import React from 'react';
import type { Machine } from '../types';

interface EnumerationPanelProps {
  machine: Machine;
  onClose: () => void;
  msfState?: any;
}

export const EnumerationPanel: React.FC<EnumerationPanelProps> = ({ machine, onClose, msfState }) => {
  const discoveryLevel = machine.discovery_level ?? 0;
  const isScenario04 = machine.id.includes('lfi');

  // Función interna para parsear credenciales si existen
  const getDynamicCredentials = (m: Machine) => {
    const configFile = m.files.find(f => f.path.includes('config.bak') || f.path.includes('wp-config.php'));
    if (!configFile) return null;

    const content = configFile.content;
    const lines = content.split('\n');
    let user = '';
    let pass = '';
    
    lines.forEach(line => {
      if (line.includes('DB_USER') || line.includes('USER') || line.includes('user')) {
        const parts = line.split('=');
        if (parts.length > 1) user = parts[1].trim().replace(/['"]/g, '').replace(';', '');
      }
      if (line.includes('DB_PASS') || line.includes('PASS') || line.includes('pass')) {
        const parts = line.split('=');
        if (parts.length > 1) pass = parts[1].trim().replace(/['"]/g, '').replace(';', '');
      }
    });

    return (user && pass) ? { user, pass } : null;
  };

  const dynamicCreds = getDynamicCredentials(machine);
  
  // Clonamos y actualizamos las credenciales encontradas
  const displayCredentials = [...(machine.found_credentials || [])].map(cred => {
    if (cred.service === 'wp-admin' && dynamicCreds) {
      return { ...cred, user: dynamicCreds.user, pass: dynamicCreds.pass };
    }
    return cred;
  });

  // Detective de RCE (específico para Lab 04)
  const rceSession = displayCredentials.find(c => c.service === 'reverse-shell');

  return (
    <div className="absolute inset-0 z-60 bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 bg-gray-900/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${machine.machine_info.status === 'up' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-gray-600'}`} />
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Enumeración de Objetivo</p>
            </div>
            <p className="text-xl font-black text-gray-100 tracking-tight">{machine.machine_info.hostname}</p>
            <p className="text-xs font-mono text-gray-500">{machine.machine_info.ip} · {machine.machine_info.os}</p>
          </div>
          <button onClick={onClose} className="p-2 transition-transform hover:scale-110 active:scale-95 text-gray-600 hover:text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Contenido Scrollable */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar bg-gradient-to-b from-gray-900 to-black">
          
          {/* Listado de Puertos */}
          {discoveryLevel >= 2 && (
            <div className="animate-in slide-in-from-bottom-2 duration-300 delay-100">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-emerald-500 rounded-full" />
                Puertos y Servicios
              </p>
              <div className="grid gap-2">
                {machine.scan_results.ports.map(p => (
                  <div key={p.port} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl text-[11px] font-mono border border-gray-800/50 hover:border-emerald-500/30 transition-all group">
                    <span className="text-emerald-400 font-black w-14">{p.port}/{p.protocol}</span>
                    <span className="text-gray-200 font-bold uppercase w-14">{p.service}</span>
                    <span className="text-gray-500 truncate group-hover:text-gray-300">{p.version}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Directorios Web (Navegación Interactiva) */}
          {(machine.web_enumeration?.directories?.length ?? 0) > 0 && (
            <div className="animate-in slide-in-from-bottom-2 duration-300 delay-200">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-blue-500 rounded-full" />
                Directorios Identificados
              </p>
              <div className="grid gap-1.5">
                {machine.web_enumeration.directories.map(d => (
                  <div key={d.path} className="flex justify-between items-center p-2.5 bg-blue-950/10 rounded-lg text-[11px] font-mono border border-blue-900/10 hover:border-blue-500/20 transition-all">
                    <span className="text-gray-400 truncate pr-2">
                      <span className="text-blue-500 font-bold">/</span>{d.path.replace(/^\//, '')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${d.status === 200 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Método de Acceso / Explotación (NUEVA SECCIÓN) */}
          {rceSession && (
            <div className="animate-in zoom-in duration-500">
               <p className="text-[10px] uppercase tracking-[0.2em] text-red-500 font-black mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-red-500 rounded-full" />
                Control Remoto Establecido
              </p>
              <div className="bg-red-950/20 border-2 border-red-900/30 rounded-2xl p-4 shadow-xl shadow-red-900/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-red-400 uppercase tracking-wider">Acceso vía RCE</p>
                    <p className="text-xs text-gray-300 font-mono">Payload: {rceSession.file.split('/').pop()}</p>
                  </div>
                </div>
                <div className="bg-black/40 rounded-xl p-3 space-y-2 border border-red-900/20">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500 font-bold uppercase">Usuario</span>
                    <span className="text-white font-black font-mono">{rceSession.user}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500 font-bold uppercase">Conexión</span>
                    <span className="text-emerald-400 font-black font-mono">nc -nlvp 4444</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vulnerabilidades (Lógica fija para evitar EternalBlue fantasma) */}
          {machine.vulnerabilities && machine.vulnerabilities.length > 0 && (
            <div className="animate-in slide-in-from-bottom-2 duration-300 delay-300">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-red-500 rounded-full" />
                Vulnerabilidades Críticas
              </p>
              <div className="space-y-2">
                {machine.vulnerabilities.map(v => (
                  <div key={v.id} className="flex items-center gap-3 p-3 bg-red-950/10 border border-red-900/20 rounded-xl">
                    <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-lg shadow-red-900/40">{v.id}</span>
                    <span className="text-[11px] text-red-300 font-bold">{v.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credenciales Comprometidas */}
          {displayCredentials.filter(c => c.service !== 'reverse-shell').length > 0 && (
            <div className="animate-in slide-in-from-bottom-2 duration-300 delay-400">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-amber-500 rounded-full" />
                Credenciales
              </p>
              <div className="space-y-3">
                {displayCredentials.filter(c => c.service !== 'reverse-shell').map((cred, idx) => (
                  <div key={idx} className="bg-gray-800/20 border border-gray-800 rounded-xl overflow-hidden shadow-inner font-mono">
                    <div className="bg-black/30 px-3 py-2 border-b border-gray-800 flex justify-between items-center">
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{cred.service}</span>
                      <span className="text-[10px] text-gray-600">{cred.verified ? 'VERIFICADA' : 'PENDIENTE'}</span>
                    </div>
                    <div className="p-3 text-[11px] space-y-1">
                      <div className="flex justify-between"><span className="text-gray-500">USER:</span><span className="text-gray-200 font-bold">{cred.user}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">PASS:</span><span className="text-amber-400 font-bold">{cred.pass}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

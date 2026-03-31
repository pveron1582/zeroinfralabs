import React from 'react';
import type { Machine } from '../types';

interface EnumerationPanelProps {
  machine: Machine;
  onClose?: () => void;
  msfState?: any;
  inline?: boolean;
}

export const EnumerationPanel: React.FC<EnumerationPanelProps> = ({ machine, onClose, msfState, inline }) => {
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

  const content = (
      <div className={`${inline ? 'w-full h-full border-0 rounded-none' : 'bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-sm shadow-2xl'} overflow-hidden flex flex-col h-full animate-in fade-in flex-1 bg-gradient-to-b from-gray-900 to-black`} onClick={e => e.stopPropagation()}>
        {/* Cabecera */}
        <div className="flex items-center justify-center px-6 py-5 border-b border-gray-800 bg-gray-900/50 flex-shrink-0 relative">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${machine.machine_info.status === 'up' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-gray-600'}`} />
              <p className="text-sm font-black text-emerald-500 uppercase tracking-[0.2em]">Target Enumeration</p>
            </div>
            <p className="text-2xl font-black text-gray-100 tracking-tight">{machine.machine_info.hostname}</p>
            <p className="text-sm font-mono text-gray-500 mt-2">{machine.machine_info.ip}</p>
          </div>
          {!inline && onClose && (
            <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 transition-transform hover:scale-110 active:scale-95 text-gray-600 hover:text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        {/* Contenido Scrollable */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Listado de Puertos */}
          {discoveryLevel >= 2 && (
            <div className="animate-in slide-in-from-bottom-2 duration-300 delay-100">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-black mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-emerald-500 rounded-full" />
                Ports and Services
              </p>
              <div className="grid gap-2">
                {machine.scan_results.ports.map(p => (
                  <div key={p.port} className="flex items-center px-6 py-4 bg-gray-800/30 rounded-xl text-sm font-mono border border-gray-800/50 hover:border-emerald-500/30 transition-all group">
                    <span className="text-emerald-400 font-black w-20 text-left">{p.port}/{p.protocol}</span>
                    <span className="text-gray-200 font-bold uppercase w-24 text-center">{p.service}</span>
                    <span className="text-gray-500 truncate group-hover:text-gray-300 flex-1 text-right">{p.version}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Possible SSH Users - Discovered from web enumeration */}
          {machine.possible_ssh_users && machine.possible_ssh_users.length > 0 && (
            <div className="animate-in slide-in-from-bottom-2 duration-300 delay-150">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-black mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-blue-500 rounded-full" />
                Possible SSH Users
              </p>
              <div className="grid gap-2">
                {machine.possible_ssh_users.map(user => {
                  // Check if user has verified credentials
                  const userCred = displayCredentials.find(c => c.user === user && c.service === 'ssh');
                  const failedUser = machine.failed_ssh_users?.includes(user);
                  let statusColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30'; // Default blue
                  let statusText = 'UNTESTED';
                  
                  if (userCred?.verified) {
                    statusColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                    statusText = 'VALID';
                  } else if (failedUser) {
                    statusColor = 'bg-red-500/20 text-red-400 border-red-500/30';
                    statusText = 'FAILED';
                  }
                  
                  return (
                    <div key={user} className={`flex justify-between items-center p-3 rounded-xl text-sm font-mono border ${statusColor}`}>
                      <span className="font-bold">{user}</span>
                      <span className="text-xs font-black">{statusText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Directorios Web (Navegación Interactiva) - Solo después de gobuster (discoveryLevel >= 4) */}
          {discoveryLevel >= 4 && (machine.web_enumeration?.directories?.length ?? 0) > 0 && (
            <div className="animate-in slide-in-from-bottom-2 duration-300 delay-200">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-black mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-blue-500 rounded-full" />
                Identified Directories
              </p>
              <div className="grid gap-1.5">
                {machine.web_enumeration.directories.map(d => (
                  <div key={d.path} className="flex justify-between items-center p-3 bg-blue-950/10 rounded-lg text-sm font-mono border border-blue-900/10 hover:border-blue-500/20 transition-all">
                    <span className="text-gray-400 truncate pr-2">
                      <span className="text-blue-500 font-bold">/</span>{d.path.replace(/^\//, '')}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black ${d.status === 200 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
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
               <p className="text-xs uppercase tracking-[0.2em] text-emerald-500 font-black mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-emerald-500 rounded-full" />
                Remote Access Established
              </p>
              <div className="bg-emerald-950/20 border-2 border-emerald-900/30 rounded-2xl p-5 shadow-xl shadow-emerald-900/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-black text-emerald-400 uppercase tracking-wider">RCE Access</p>
                    <p className="text-sm text-gray-300 font-mono">Payload: {rceSession.file.split('/').pop()}</p>
                  </div>
                </div>
                <div className="bg-black/40 rounded-xl p-4 space-y-3 border border-emerald-900/20">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-bold uppercase">User</span>
                    <span className="text-white font-black font-mono">{rceSession.user}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-bold uppercase">Connection</span>
                    <span className="text-emerald-400 font-black font-mono">nc -nlvp 4444</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sudo Privileges */}
          {machine.sudo_privileges && machine.sudo_privileges.canSudo && (
            <div className="animate-in slide-in-from-bottom-2 duration-300 delay-150">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-500 font-black mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-blue-500 rounded-full" />
                Sudo Privileges
              </p>
              <div className="bg-blue-950/20 border-2 border-blue-900/30 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-black text-blue-400 uppercase tracking-wider">User: {machine.sudo_privileges.user}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {machine.sudo_privileges.commands.map((cmd, idx) => (
                    <div key={idx} className="flex items-center justify-between px-6 py-4 bg-black/40 border-l-4 border-emerald-500 rounded-r-lg">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <span className="text-sm text-blue-300 font-mono">{cmd}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Vulnerabilidades (Lógica fija para evitar EternalBlue fantasma) */}
          {machine.vulnerabilities && machine.vulnerabilities.length > 0 && (
            <div className="animate-in slide-in-from-bottom-2 duration-300 delay-300">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-black mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-emerald-500 rounded-full" />
                Critical Vulnerabilities
              </p>
              <div className="space-y-2">
                {machine.vulnerabilities.map(v => (
                  <div key={v.id} className="flex items-center gap-3 p-3 bg-emerald-950/10 border border-emerald-900/20 rounded-xl">
                    <span className="bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded shadow-lg shadow-emerald-900/40">{v.id}</span>
                    <span className="text-sm text-emerald-300 font-bold">{v.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credenciales Comprometidas */}
          {displayCredentials.filter(c => c.service !== 'reverse-shell').length > 0 && (
            <div className="animate-in slide-in-from-bottom-2 duration-300 delay-400">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-black mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-amber-500 rounded-full" />
                Credentials
              </p>
              <div className="space-y-3">
                {displayCredentials.filter(c => c.service !== 'reverse-shell').map((cred, idx) => (
                  <div key={idx} className={`bg-gray-800/20 border rounded-xl overflow-hidden shadow-inner font-mono ${cred.verified ? 'border-emerald-500/30' : 'border-gray-800'}`}>
                    <div className={`bg-black/30 px-4 py-2.5 border-b flex justify-between items-center ${cred.verified ? 'border-emerald-500/20' : 'border-gray-800'}`}>
                      <span className={`text-xs font-black uppercase tracking-widest ${cred.verified ? 'text-emerald-500' : 'text-amber-500'}`}>{cred.service}</span>
                      <span className={`text-xs font-bold ${cred.verified ? 'text-emerald-400' : 'text-gray-600'}`}>{cred.verified ? 'VERIFIED' : 'PENDING'}</span>
                    </div>
                    <div className="p-4 text-sm space-y-2">
                      <div className="flex justify-between"><span className="text-gray-500">USER:</span><span className="text-gray-200 font-bold">{cred.user}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">PASS:</span><span className={`font-bold ${cred.verified ? 'text-emerald-400' : 'text-amber-400'}`}>{cred.pass}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="absolute inset-0 z-60 bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      {content}
    </div>
  );
};

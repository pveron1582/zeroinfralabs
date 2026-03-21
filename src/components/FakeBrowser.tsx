// ── components/FakeBrowser.tsx ────────────────────────────────────
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Machine } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import { WPIndex }     from './fakesites/wordpress/wp01/Index';
import { WPLogin }     from './fakesites/wordpress/wp01/Login';
import { WPDashboard } from './fakesites/wordpress/wp01/Dashboard';
import { WPUploads }   from './fakesites/wordpress/wp01/Uploads';
import { WPConfigBak } from './fakesites/wordpress/wp01/ConfigBak';
import { InclusionSite } from './fakesites/lfi_lab/InclusionSIte';

// ── Componentes de Soporte (Google, 404, etc) ──────────────────────

function GoogleHome({ onNavigate }: { onNavigate: (url: string) => void }) {
  const [query, setQuery] = useState('');
  const suggestions = ['nmap tutorial', 'wordpress exploit', 'gobuster wordlist', 'ssh brute force'];
  return (
    <div className="min-h-full bg-white flex flex-col items-center justify-center gap-6 px-4">
      <div className="flex items-center select-none" style={{ fontSize: '68px', fontFamily: 'Product Sans,Arial,sans-serif', fontWeight: 400 }}>
        <span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>o</span>
        <span style={{ color: '#FBBC05' }}>o</span><span style={{ color: '#4285F4' }}>g</span>
        <span style={{ color: '#34A853' }}>l</span><span style={{ color: '#EA4335' }}>e</span>
      </div>
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-3 px-4 py-3 rounded-full border border-gray-300 hover:shadow-md transition-shadow bg-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar en Google o escribir una URL"
            className="flex-1 outline-none text-sm text-gray-800 bg-transparent"
            onKeyDown={e => { if (e.key === 'Enter' && query.trim()) onNavigate(`https://www.google.com/search?q=${encodeURIComponent(query)}`); }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-2 justify-center">
          {suggestions.map(s => (
            <button key={s} onClick={() => setQuery(s)}
              className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors">{s}</button>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 px-6 py-3 flex justify-between text-xs text-gray-500">
        <span>Argentina</span>
        <div className="flex gap-4">
          <span className="cursor-default hover:underline">Privacidad</span>
          <span className="cursor-default hover:underline">Términos</span>
        </div>
      </div>
    </div>
  );
}

function GoogleSearch({ url, onNavigate }: { url: string; onNavigate: (url: string) => void }) {
  const params = new URLSearchParams(url.split('?')[1] || '');
  const q = params.get('q') || '';
  const fakeResults = [
    { title: `${q} - Wikipedia`, url: 'https://es.wikipedia.org/wiki/...', desc: 'Artículo de Wikipedia sobre el tema solicitado.' },
    { title: `Tutorial: ${q} paso a paso`, url: 'https://www.hacktricks.xyz/...', desc: 'Guía completa con ejemplos prácticos.' },
  ];
  return (
    <div className="min-h-full bg-white">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <button onClick={() => onNavigate('https://www.google.com')} style={{ fontFamily: 'Product Sans,Arial,sans-serif', fontSize: '24px' }}>
          <span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>o</span>
        </button>
        <div className="flex-1 max-w-lg flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 text-sm">{q}</div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="space-y-5">
          {fakeResults.map((r, i) => (
            <div key={i}>
              <p className="text-xs text-gray-500">{r.url}</p>
              <button className="text-lg text-blue-700 hover:underline text-left">{r.title}</button>
              <p className="text-sm text-gray-700 mt-0.5">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageNotFound({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 bg-white">
      <div className="text-6xl font-bold text-gray-200">404</div>
      <div className="text-lg font-semibold text-gray-600">Not Found</div>
      <div className="text-sm text-gray-400 font-mono">{url}</div>
    </div>
  );
}

// ── Componente Principal FakeBrowser ────────────────────────────────

interface FakeBrowserProps {
  allMachines: Machine[];
  onClose: () => void;
  onMissionComplete: (id: number) => void;
  onCredentialsFound: (machineId: string, user: string, pass: string, file?: string) => void;
  onVerifyCredentials: (machineId: string) => void;
  scenarioHasWeb: boolean;
  wpDiscoveryLevel: number;
  mission3Already: boolean;
}

export function FakeBrowser({
  allMachines, onClose, onMissionComplete,
  onCredentialsFound, onVerifyCredentials,
  scenarioHasWeb, wpDiscoveryLevel, mission3Already
}: FakeBrowserProps) {
  
  const HOME_URL = 'https://www.google.com';

  // Store para persistencia
  const browserCurrentUrl = useScenarioStore(state => state.browserCurrentUrl);
  const browserIsLoggedIn = useScenarioStore(state => state.browserIsLoggedIn);
  const browserNavHistory = useScenarioStore(state => state.browserNavHistory);
  const browserNavIdx = useScenarioStore(state => state.browserNavIdx);
  
  const setBrowserUrl = useScenarioStore(state => state.setBrowserUrl);
  const setBrowserLoggedIn = useScenarioStore(state => state.setBrowserLoggedIn);
  const setBrowserNavHistory = useScenarioStore(state => state.setBrowserNavHistory);

  const [urlInput, setUrlInput] = useState(browserCurrentUrl);
  const [reloading, setReloading] = useState(false);
  const rceCompletedRef = useRef(false);

  // Máquinas de escenarios específicos
  const wpMachine = allMachines.find(m => m.web_enumeration?.cms?.toLowerCase().includes('wordpress'));
  const lfiMachine = allMachines.find(m => m.id.includes('lfi'));

  const reload = () => { 
    setReloading(true); 
    setTimeout(() => setReloading(false), 400); 
  };

  const navigate = (rawUrl: string) => {
    const withScheme = /^https?:\/\//i.test(rawUrl.trim()) ? rawUrl.trim() : `http://${rawUrl.trim()}`;
    const clean = withScheme.replace(/\/$/, '') || withScheme;

    const newHistory = [...browserNavHistory.slice(0, browserNavIdx + 1), clean];
    const newIdx = newHistory.length - 1;

    setBrowserUrl(clean);
    setBrowserNavHistory(newHistory, newIdx);
    setUrlInput(clean);

    // Lógica global de misión inicial de descubrimiento web
    if (scenarioHasWeb && !mission3Already && wpMachine && wpDiscoveryLevel >= 2 && clean.includes(wpMachine.machine_info.ip)) {
      onMissionComplete(3);
    }
    
    // Lógica LFI: detectar misión 3 (etc/passwd)
    if (lfiMachine && clean.includes(lfiMachine.machine_info.ip)) {
      const fullPath = clean.replace(`http://${lfiMachine.machine_info.ip}`, '');
      if (fullPath.includes('etc/passwd')) {
        onMissionComplete(3);
      }
    }
  };

  const goBack = () => {
    if (browserNavIdx > 0) {
      const i = browserNavIdx - 1;
      setBrowserNavHistory(browserNavHistory, i);
      setBrowserUrl(browserNavHistory[i]);
      setUrlInput(browserNavHistory[i]);
    }
  };
  
  const goForward = () => {
    if (browserNavIdx < browserNavHistory.length - 1) {
      const i = browserNavIdx + 1;
      setBrowserNavHistory(browserNavHistory, i);
      setBrowserUrl(browserNavHistory[i]);
      setUrlInput(browserNavHistory[i]);
    }
  };

  const doLogin = (id: number) => {
    setBrowserLoggedIn(true);
    onMissionComplete(id);
    onVerifyCredentials(wpMachine!.id);
    navigate(`http://${wpMachine!.machine_info.ip}/wp-admin/dashboard`);
  };

  // Efecto para completar misiones de LFI 6 (RCE) cuando se incluye un archivo
  // Usa ref guard para evitar múltiples llamadas y congelamiento del popup
  useEffect(() => {
    if (!lfiMachine || !browserCurrentUrl.includes(lfiMachine.machine_info.ip)) return;
    if (rceCompletedRef.current) return; // Guard: solo una vez
    
    const fullPath = browserCurrentUrl.replace(`http://${lfiMachine.machine_info.ip}`, '');
    
    // Misión 6: RCE (Incluir archivo subido en uploads con extensión .php)
    if (fullPath.includes('?page=uploads/') && fullPath.endsWith('.php')) {
      rceCompletedRef.current = true; // Marcar como completado para evitar repetición
      onMissionComplete(6);
      onVerifyCredentials(lfiMachine.id);
    }
  }, [browserCurrentUrl, lfiMachine, onMissionComplete, onVerifyCredentials]);

  const renderPage = () => {
    const currentUrl = browserCurrentUrl;
    if (currentUrl === HOME_URL || currentUrl === 'about:blank') return <GoogleHome onNavigate={navigate} />;
    if (currentUrl.startsWith('https://www.google.com/search'))   return <GoogleSearch url={currentUrl} onNavigate={navigate} />;

    // ── LÓGICA WORDPRESS (Escenario 01) ──
    if (wpMachine && currentUrl.includes(wpMachine.machine_info.ip)) {
      const ip = wpMachine.machine_info.ip;
      const path = currentUrl.replace(`http://${ip}`, '').split('?')[0] || '/';
      const sshCreds = wpMachine.scan_results.ports.find(p => p.service === 'ssh')?.credentials || null;
      const level = wpMachine.discovery_level ?? 0;

      if (path === '/' || path === '') return <WPIndex ip={ip} onNavigate={navigate} />;

      if (path === '/wp-admin' || path === '/wp-admin/dashboard') {
        if (level < 2) return <div className="flex flex-col items-center justify-center h-full p-10 text-center">⏳ Realizá un escaneo nmap -sV {ip} primero.</div>;
        return browserIsLoggedIn
          ? <WPDashboard ip={ip} onNavigate={navigate} />
          : <WPLogin ip={ip} credentials={sshCreds} onNavigate={navigate} onLoginSuccess={doLogin} />;
      }

      if (path === '/uploads' || path === '/uploads/config.bak') {
        if (level < 3) return <div className="flex flex-col items-center justify-center h-full p-10 text-center">🔒 Directorio no enumerado. Usá gobuster.</div>;
        if (path === '/uploads') return <WPUploads ip={ip} onNavigate={navigate} onCredentialsFound={(u, p) => onCredentialsFound(wpMachine.id, u, p)} />;
        return <WPConfigBak ip={ip} onNavigate={navigate} />;
      }
    }

    // ── LÓGICA LFI (Escenario 04) ──
    if (lfiMachine && currentUrl.includes(lfiMachine.machine_info.ip)) {
      const ip = lfiMachine.machine_info.ip;
      const fullPath = currentUrl.replace(`http://${ip}`, '');

      // Obtener la máquina atacante para sus archivos
      const attackerMachine = allMachines.find(m => m.machine_info.type === 'workstation' && m.machine_info.os?.includes('Kali'));
      const attackerFiles = attackerMachine?.files?.map(f => ({
        path: f.path,
        name: f.path.split('/').pop() || f.path,
      })) || [];

      return (
        <InclusionSite 
          ip={ip} 
          currentUrl={currentUrl} 
          onNavigate={navigate} 
          onUploadSuccess={() => onMissionComplete(5)}
          attackerFiles={attackerFiles}
        />
      );
    }

    return <PageNotFound url={currentUrl} />;
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-950">
      {/* Browser Chrome Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="flex gap-1.5">
          <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
        </div>
        <div className="flex gap-0.5">
          <button onClick={goBack} disabled={browserNavIdx === 0} className="p-1 rounded text-gray-400 disabled:opacity-30 hover:enabled:bg-gray-700 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={goForward} disabled={browserNavIdx >= browserNavHistory.length - 1} className="p-1 rounded text-gray-400 disabled:opacity-30 hover:enabled:bg-gray-700 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button onClick={reload} className={`p-1 rounded text-gray-400 hover:bg-gray-700 ${reloading ? 'animate-spin' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
        </div>
        <div className="flex-1 flex items-center gap-2 bg-gray-900 rounded-full px-3 py-1.5 border border-gray-700">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <input type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') navigate(urlInput); }}
            className="flex-1 bg-transparent text-gray-300 text-xs outline-none font-mono" spellCheck={false} />
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-700 rounded text-xs text-gray-400 font-mono">
          <span>CyberBrowser</span>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-white">
        {renderPage()}
      </div>
    </div>
  );
}
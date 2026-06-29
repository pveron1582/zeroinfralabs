// ── components/FakeBrowser.tsx ──────────────────────────────────────
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Machine } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import { WordPressSite } from './fakesites/WordPressSite';
import { InclusionSite } from './fakesites/lfi_lab/InclusionSIte';
import { ConsultancySite } from './fakesites/ConsultancySite';
import { SqlInjectionSite } from './fakesites/SqlInjectionSite';

function GoogleHome({ onNavigate }: { onNavigate: (url: string) => void }) {
  const [query, setQuery] = useState('');
  const suggestions = ['nmap tutorial', 'wordpress exploit', 'gobuster wordlist', 'ssh brute force'];
  const randomSearches = [
    'how to hack wifi', 'sql injection tutorial', 'metasploit guide',
    'kali linux tools', 'reverse shell payload', 'xss attack example',
    'password cracking methods', 'network scanning techniques',
    'privilege escalation linux', 'buffer overflow exploit'
  ];

  const handleSearch = () => {
    if (query.trim()) {
      onNavigate(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    } else {
      const randomQuery = randomSearches[Math.floor(Math.random() * randomSearches.length)];
      onNavigate(`https://www.google.com/search?q=${encodeURIComponent(randomQuery)}`);
    }
  };

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
            placeholder="Search Google or type a URL"
            className="flex-1 outline-none text-sm text-gray-800 bg-transparent"
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }} />
        </div>
        <div className="mt-4 flex gap-3 justify-center">
          <button onClick={handleSearch}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors">
            Google Search
          </button>
          <button onClick={() => onNavigate('chrome://dino')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors">
            I'm Feeling Lucky
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {suggestions.map(s => (
            <button key={s} onClick={() => setQuery(s)}
              className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors">{s}</button>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 px-6 py-3 flex justify-between text-xs text-gray-500">
        <span>United States</span>
        <div className="flex gap-4">
          <span className="cursor-default hover:underline">Privacy</span>
          <span className="cursor-default hover:underline">Terms</span>
        </div>
      </div>
    </div>
  );
}

function GoogleSearch({ url, onNavigate }: { url: string; onNavigate: (url: string) => void }) {
  const params = new URLSearchParams(url.split('?')[1] || '');
  const q = params.get('q') || '';
  const fakeResults = [
    { title: `${q} - Wikipedia`, url: 'https://en.wikipedia.org/wiki/...', desc: 'Wikipedia article about the requested topic.' },
    { title: `Tutorial: ${q} step by step`, url: 'https://www.hacktricks.xyz/...', desc: 'Complete guide with practical examples.' },
  ];
  return (
    <div className="min-h-full bg-white">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <button onClick={() => onNavigate('https://www.google.com')} style={{ fontFamily: 'Product Sans,Arial,sans-serif', fontSize: '20px', flexShrink: 0 }}>
          <span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>o</span>
          <span style={{ color: '#FBBC05' }}>o</span><span style={{ color: '#4285F4' }}>g</span>
          <span style={{ color: '#34A853' }}>l</span><span style={{ color: '#EA4335' }}>e</span>
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

function HttpSecurityError({ url, onNavigate }: { url: string; onNavigate: (url: string) => void }) {
  const secureUrl = url.replace(/^http:\/\//i, 'https://');
  return (
    <div className="min-h-full bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h1 className="text-2xl font-medium text-gray-800 mb-2">Your connection is not private</h1>
        <p className="text-gray-600 mb-2">
          Attackers might be trying to steal your information from <strong>{url.replace(/^http:\/\//i, '')}</strong>
        </p>
        <p className="text-gray-500 text-sm mb-6">
          (for example, passwords, messages, or credit cards).{' '}
          <a href="#" className="text-blue-600 hover:underline">Learn more</a>
        </p>
        <div className="text-red-600 text-sm mb-6 font-mono bg-red-50 p-3 rounded">
          NET::ERR_CERT_AUTHORITY_INVALID
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={() => onNavigate(secureUrl)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
            Use secure HTTPS
          </button>
          <button onClick={() => onNavigate('https://www.google.com')}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors">
            Back to Google (secure)
          </button>
        </div>
        <p className="mt-6 text-xs text-gray-400">The HTTP protocol is no longer secure. Modern sites use HTTPS.</p>
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

function DinoGame() {
  return (
    <div className="min-h-full bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl mb-6 select-none">🦖</div>
        <h1 className="text-2xl font-medium text-gray-700 mb-2">No hay conexión</h1>
        <p className="text-gray-500 text-sm mb-6">Esto es un simulador, no puedo mostrar nada muy útil desde acá. 😅</p>
        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
          <div className="w-4 h-4 border-2 border-gray-300 rounded-sm"></div>
          <span>Presiona espacio para jugar</span>
        </div>
        <div className="mt-8 flex gap-1 justify-center">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`w-3 h-8 ${i % 3 === 0 ? 'bg-gray-300' : 'bg-gray-200'} rounded-sm`}></div>
          ))}
        </div>
        <p className="mt-6 text-xs text-gray-400">ERR_INTERNET_SIMULATOR_MODE</p>
      </div>
    </div>
  );
}

// ── Componente Principal FakeBrowser ────────────────────────────────

interface FakeBrowserProps {
  allMachines: Machine[];
  onClose: () => void;
  onMinimize?: () => void;
  onMaximizeToggle?: () => void;
  onMissionComplete: (id: number) => void;
  onCredentialsFound: (machineId: string, user: string, pass: string, file?: string, service?: string) => void;
  onVerifyCredentials: (machineId: string, service?: string) => void;
  scenarioHasWeb: boolean;
  wpDiscoveryLevel: number;
  mission3Already: boolean;
  onSetPossibleUsers: (machineId: string, users: string[]) => void;
  onReportVulnerability?: (machineId: string, vulnId: string, status: 'detected' | 'confirmed') => void;
}

export function FakeBrowser({
  allMachines, onClose, onMinimize, onMaximizeToggle, onMissionComplete,
  onCredentialsFound, onVerifyCredentials,
  scenarioHasWeb, wpDiscoveryLevel, mission3Already,
  onSetPossibleUsers, onReportVulnerability
}: FakeBrowserProps) {

  const HOME_URL = 'https://www.google.com';

  const [currentUrl, setCurrentUrl] = useState(HOME_URL);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [navHistory, setNavHistory] = useState([HOME_URL]);
  const [navIdx, setNavIdx] = useState(0);
  const [urlInput, setUrlInput] = useState(HOME_URL);
  const [reloading, setReloading] = useState(false);
  const rceCompletedRef = useRef(false);

  const addFileToMachine = useScenarioStore(state => state.addFileToMachine);
  const confirmRCE = useScenarioStore(state => state.confirmRCE);
  const listeningPort = useScenarioStore(state => state.listeningPort);
  const setBlockingCommand = useScenarioStore(state => state.setBlockingCommand);

  const wpMachine = useMemo(() => allMachines.find(m => m.web_enumeration?.cms?.toLowerCase().includes('wordpress')), [allMachines]);
  const lfiMachine = useMemo(() => allMachines.find(m => m.id.includes('lfi')), [allMachines]);
  const sshMachine = useMemo(() => allMachines.find(m => m.id === 'lab-scenario-02-ssh'), [allMachines]);
  const sqliMachine = useMemo(() => {
    console.log('Available machines:', allMachines.map(m => ({ id: m.id, ip: m.machine_info.ip })));
    return allMachines.find(m => m.id.includes('sqli'));
  }, [allMachines]);

  const reload = () => {
    setReloading(true);
    setTimeout(() => setReloading(false), 400);
  };

  const handleViewTeam = useCallback((users: string[]) => {
    if (!sshMachine) return;
    onSetPossibleUsers(sshMachine.id, users);
  }, [sshMachine, onSetPossibleUsers]);

  const navigate = (rawUrl: string) => {
    const trimmed = rawUrl.trim();
    const isGoogleDomain = /google\.com/i.test(trimmed);
    let withScheme: string;
    if (/^(https?:\/\/|chrome:\/\/)/i.test(trimmed)) {
      withScheme = trimmed;
    } else {
      withScheme = isGoogleDomain ? `https://${trimmed}` : `http://${trimmed}`;
    }
    const clean = withScheme.replace(/\/$/, '') || withScheme;
    const newHistory = [...navHistory.slice(0, navIdx + 1), clean];
    const newIdx = newHistory.length - 1;
    setCurrentUrl(clean);
    setNavHistory(newHistory);
    setNavIdx(newIdx);
    setUrlInput(clean);

    if (scenarioHasWeb && !mission3Already && wpMachine && wpDiscoveryLevel >= 2 && clean.includes(wpMachine.machine_info.ip)) {
      onMissionComplete(3);
    }
    if (lfiMachine && clean.includes(lfiMachine.machine_info.ip)) {
      const fullPath = clean.replace(`http://${lfiMachine.machine_info.ip}`, '');
      if (fullPath.includes('etc/passwd')) {
        onMissionComplete(3);
        onReportVulnerability?.(lfiMachine.id, 'LFI', 'detected');
      }
    }
    if (sshMachine && clean.includes(sshMachine.machine_info.ip)) {
      onMissionComplete(3);
    }
  };

  const goBack = () => {
    if (navIdx > 0) {
      const i = navIdx - 1;
      setCurrentUrl(navHistory[i]);
      setNavIdx(i);
      setUrlInput(navHistory[i]);
    }
  };

  const goForward = () => {
    if (navIdx < navHistory.length - 1) {
      const i = navIdx + 1;
      setCurrentUrl(navHistory[i]);
      setNavIdx(i);
      setUrlInput(navHistory[i]);
    }
  };

  useEffect(() => {
    if (!lfiMachine) return;
    if (rceCompletedRef.current) return;
    if (!currentUrl.includes(lfiMachine.machine_info.ip)) return;
    const fullPath = currentUrl.replace(`http://${lfiMachine.machine_info.ip}`, '');
    if ((fullPath.includes('?page=uploads/') || fullPath.includes('?page=files/')) && fullPath.endsWith('.php')) {
      if (!listeningPort) return;
      rceCompletedRef.current = true;
      setBlockingCommand({
        message: '[*] Connection received from ' + lfiMachine.machine_info.ip + ' : shell opened!',
        listeningPort: 4444,
        connected: true
      });
      onMissionComplete(6);
      onVerifyCredentials(lfiMachine.id, 'lfi-rce');
    }
  }, [currentUrl, lfiMachine, onMissionComplete, onVerifyCredentials, setBlockingCommand, listeningPort]);

  useEffect(() => {
    rceCompletedRef.current = false;
  }, [allMachines]);

  const handleLFIUploadSuccess = useCallback((fileName: string) => {
    if (fileName === 'reverse_shell_triggered' || fileName === 'CHECKPOINT_RCE') {
      onMissionComplete(5);
      if (lfiMachine) {
        confirmRCE(lfiMachine.id, 'www-data', '/var/www/html/uploads/payload.php');
        onReportVulnerability?.(lfiMachine.id, 'LFI', 'confirmed');
      }
      return;
    }
    if (lfiMachine) {
      const attackerMachine = allMachines.find(m => m.machine_info?.type === 'workstation' && m.machine_info?.os?.includes('Kali'));
      const originalFile = attackerMachine?.files?.find(f => f.path.endsWith('/' + fileName) || f.path === fileName);
      if (originalFile) {
        addFileToMachine(lfiMachine.id, {
          path: `/var/www/html/uploads/${fileName}`,
          content: originalFile.content,
          type: originalFile.type
        });
      }
    }
  }, [lfiMachine, allMachines, addFileToMachine, onMissionComplete, confirmRCE, onReportVulnerability]);

  const renderPage = () => {

    if (currentUrl.startsWith('http://') && currentUrl.includes('google.com')) {
      return <HttpSecurityError url={currentUrl} onNavigate={navigate} />;
    }

    const normalizeForComparison = (url: string): string =>
      url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');

    const normalizedCurrent = normalizeForComparison(currentUrl);
    const normalizedHome = normalizeForComparison(HOME_URL);

    if (normalizedCurrent === normalizedHome || normalizedCurrent === 'google.com' || currentUrl === 'about:blank') {
      return <GoogleHome onNavigate={navigate} />;
    }
    if (currentUrl.startsWith('https://www.google.com/search') || currentUrl.startsWith('https://google.com/search')) {
      return <GoogleSearch url={currentUrl} onNavigate={navigate} />;
    }
    if (currentUrl === 'chrome://dino') return <DinoGame />;

    if (wpMachine && currentUrl.includes(wpMachine.machine_info.ip)) {
      return (
        <WordPressSite
          machine={wpMachine}
          currentUrl={currentUrl}
          browserIsLoggedIn={isLoggedIn}
          onNavigate={navigate}
          onLoginSuccess={(id) => {
            setIsLoggedIn(true);
            onMissionComplete(id);
          }}
          onLogout={() => {
            setIsLoggedIn(false);
            navigate(`http://${wpMachine.machine_info.ip}/wp-admin`);
          }}
          onCredentialsFound={onCredentialsFound}
          onVerifyCredentials={onVerifyCredentials}
          onMissionComplete={onMissionComplete}
        />
      );
    }

    if (lfiMachine && lfiMachine.machine_info?.ip && currentUrl.includes(lfiMachine.machine_info.ip)) {
      const ip = lfiMachine.machine_info.ip;
      const attackerMachine = allMachines.find(m => m.machine_info?.type === 'workstation' && m.machine_info?.os?.includes('Kali'));
      const attackerFiles = attackerMachine?.files?.map(f => ({
        path: f.path,
        name: f.path.split('/').pop() || f.path,
      })) || [];
      return (
        <InclusionSite
          ip={ip}
          currentUrl={currentUrl}
          onNavigate={navigate}
          onFileUpload={handleLFIUploadSuccess}
          attackerFiles={attackerFiles}
          listeningPort={listeningPort ?? undefined}
          victimFiles={lfiMachine.files || []}
        />
      );
    }

    if (sqliMachine && currentUrl.includes(sqliMachine.machine_info.ip)) {
      return (
        <SqlInjectionSite
          machine={sqliMachine}
          currentUrl={currentUrl}
          browserIsLoggedIn={isLoggedIn}
          onNavigate={navigate}
          onLoginSuccess={(id) => {
            setIsLoggedIn(true);
            onMissionComplete(id);
          }}
          onLogout={() => {
            setIsLoggedIn(false);
            navigate(`http://${sqliMachine.machine_info.ip}/`);
          }}
          onCredentialsFound={onCredentialsFound}
          onVerifyCredentials={onVerifyCredentials}
          onMissionComplete={onMissionComplete}
        />
      );
    }

    if (sshMachine && currentUrl.includes(sshMachine.machine_info.ip)) {
      return <ConsultancySite onViewTeam={handleViewTeam} />;
    }

    return <PageNotFound url={currentUrl} />;
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-950">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="flex gap-1.5">
          <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors" title="Cerrar" />
          <button onClick={onMaximizeToggle} className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors" title="Maximizar" />
          <button onClick={onMinimize} className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors" title="Minimizar" />
        </div>
        <div className="flex gap-0.5">
          <button onClick={goBack} disabled={navIdx === 0} className="p-1 rounded text-gray-400 disabled:opacity-30 hover:enabled:bg-gray-700 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={goForward} disabled={navIdx >= navHistory.length - 1} className="p-1 rounded text-gray-400 disabled:opacity-30 hover:enabled:bg-gray-700 transition-colors">
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
      <div className="flex-1 overflow-auto bg-white select-text">
        {renderPage()}
      </div>
    </div>
  );
}

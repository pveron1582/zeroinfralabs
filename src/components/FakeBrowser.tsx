// ── components/FakeBrowser.tsx ────────────────────────────────────
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Machine } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import { WPIndex }     from './fakesites/wordpress/wp01/Index';
import { WPLogin }     from './fakesites/wordpress/wp01/Login';
import { WPDashboard } from './fakesites/wordpress/wp01/Dashboard';
import { WPUploads }   from './fakesites/wordpress/wp01/Uploads';
import { WPConfigBak } from './fakesites/wordpress/wp01/ConfigBak';

// Utilidad para extraer credenciales dinámicas de un archivo de configuración
const parseWPConfig = (content: string) => {
  const lines = content.split('\n');
  let user = 'admin';
  let pass = 'P@ssw0rd123!';
  
  lines.forEach(line => {
    const cleanLine = line.trim();
    if (cleanLine.startsWith('#') || !cleanLine.includes('=')) return;

    const parts = cleanLine.split('=');
    const key = parts[0].trim().toUpperCase();
    const value = parts[1].trim().replace(/['"]/g, '');

    if (key.includes('USER') || key.includes('DB_USER')) user = value;
    if (key.includes('PASS') || key.includes('DB_PASS')) pass = value;
  });
  return { user, pass };
};
import { InclusionSite } from './fakesites/lfi_lab/InclusionSIte';
import { ConsultancySite } from './fakesites/ConsultancySite';

// ── Componentes de Soporte (Google, 404, etc) ──────────────────────

function GoogleHome({ onNavigate }: { onNavigate: (url: string) => void }) {
  const [query, setQuery] = useState('');
  const suggestions = ['nmap tutorial', 'wordpress exploit', 'gobuster wordlist', 'ssh brute force'];
  
  const randomSearches = [
    'how to hack wifi',
    'sql injection tutorial',
    'metasploit guide',
    'kali linux tools',
    'reverse shell payload',
    'xss attack example',
    'password cracking methods',
    'network scanning techniques',
    'privilege escalation linux',
    'buffer overflow exploit'
  ];

  const handleSearch = () => {
    if (query.trim()) {
      onNavigate(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    } else {
      const randomQuery = randomSearches[Math.floor(Math.random() * randomSearches.length)];
      onNavigate(`https://www.google.com/search?q=${encodeURIComponent(randomQuery)}`);
    }
  };

  const handleLucky = () => {
    onNavigate('chrome://dino');
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
            placeholder="Buscar en Google o escribir una URL"
            className="flex-1 outline-none text-sm text-gray-800 bg-transparent"
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }} />
        </div>
        <div className="mt-4 flex gap-3 justify-center">
          <button onClick={handleSearch}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors">
            Buscar con Google
          </button>
          <button onClick={handleLucky}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors">
            Voy a tener suerte
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
        <h1 className="text-2xl font-medium text-gray-800 mb-2">Tu conexión no es privada</h1>
        <p className="text-gray-600 mb-2">
          Los atacantes podrían estar intentando robar tu información de <strong>{url.replace(/^http:\/\//i, '')}</strong>
        </p>
        <p className="text-gray-500 text-sm mb-6">
          (por ejemplo, contraseñas, mensajes o tarjetas de crédito).{' '}
          <a href="#" className="text-blue-600 hover:underline">Más información</a>
        </p>
        <div className="text-red-600 text-sm mb-6 font-mono bg-red-50 p-3 rounded">
          NET::ERR_CERT_AUTHORITY_INVALID
        </div>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => onNavigate(secureUrl)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            Usar HTTPS seguro
          </button>
          <button 
            onClick={() => onNavigate('https://www.google.com')}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors"
          >
            Volver a Google (seguro)
          </button>
        </div>
        <p className="mt-6 text-xs text-gray-400">
          El protocolo HTTP ya no es seguro. Los sitios modernos usan HTTPS.
        </p>
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
  onMissionComplete: (id: number) => void;
  onCredentialsFound: (machineId: string, user: string, pass: string, file?: string, service?: string) => void;
  onVerifyCredentials: (machineId: string, service?: string) => void;
  scenarioHasWeb: boolean;
  wpDiscoveryLevel: number;
  mission3Already: boolean;
  onSetPossibleUsers: (machineId: string, users: string[]) => void;
}

export function FakeBrowser({
  allMachines, onClose, onMissionComplete,
  onCredentialsFound, onVerifyCredentials,
  scenarioHasWeb, wpDiscoveryLevel, mission3Already,
  onSetPossibleUsers
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
  const addFileToMachine = useScenarioStore(state => state.addFileToMachine);
  const addExploredDirectory = useScenarioStore(state => state.addExploredDirectory);
  const confirmRCE = useScenarioStore(state => state.confirmRCE);

  const [urlInput, setUrlInput] = useState(browserCurrentUrl);
  const [reloading, setReloading] = useState(false);
  const rceCompletedRef = useRef(false);

  // Máquinas de escenarios específicos (memoizadas para evitar re-renders innecesarios)
  const wpMachine = useMemo(() => allMachines.find(m => m.web_enumeration?.cms?.toLowerCase().includes('wordpress')), [allMachines]);
  const lfiMachine = useMemo(() => allMachines.find(m => m.id.includes('lfi')), [allMachines]);
  const sshMachine = useMemo(() => allMachines.find(m => m.id === 'lab-scenario-02-ssh'), [allMachines]);

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
    
    // Para Google, siempre usar HTTPS - rechazar HTTP explícitamente
    const isGoogleDomain = /google\.com/i.test(trimmed);
    
    // Manejar URLs especiales como chrome://
    let withScheme: string;
    if (/^(https?:\/\/|chrome:\/\/)/i.test(trimmed)) {
      withScheme = trimmed;
    } else {
      // Sin esquema: usar https para Google, http para el resto
      withScheme = isGoogleDomain ? `https://${trimmed}` : `http://${trimmed}`;
    }
    
    // Forzar HTTPS para Google si viene como HTTP
    if (isGoogleDomain && withScheme.startsWith('http://')) {
      // Permitir la navegación HTTP para mostrar el error de seguridad
      // No redirigir automáticamente para que el usuario vea el mensaje
    }
    
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
    
    // Lógica LFI: detectar misión 3 (etc/passwd) y registrar directorios
    if (lfiMachine && clean.includes(lfiMachine.machine_info.ip)) {
      const fullPath = clean.replace(`http://${lfiMachine.machine_info.ip}`, '');
      if (fullPath.includes('etc/passwd')) {
        onMissionComplete(3);
      }
    }

    // Lógica Escenario 02: Descubrimiento Web
    if (sshMachine && clean.includes(sshMachine.machine_info.ip)) {
      onMissionComplete(3);
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
    onVerifyCredentials(wpMachine!.id, 'wp-admin');
    navigate(`http://${wpMachine!.machine_info.ip}/wp-admin/dashboard`);
  };

  // Store para obtener listeningPort
  const listeningPort = useScenarioStore(state => state.listeningPort);

  const setBlockingCommand = useScenarioStore(state => state.setBlockingCommand);

  // Efecto para completar misiones de LFI 6 (RCE) cuando se incluye un archivo
  // Usa ref guard para evitar múltiples llamadas y congelamiento del popup
  useEffect(() => {
    if (!lfiMachine) return;
    if (rceCompletedRef.current) return; // Guard: solo una vez
    if (!browserCurrentUrl.includes(lfiMachine.machine_info.ip)) return;
    
    const fullPath = browserCurrentUrl.replace(`http://${lfiMachine.machine_info.ip}`, '');
    
    // Misión 6: RCE (Incluir archivo subido en uploads/files con extensión .php)
    if ((fullPath.includes('?page=uploads/') || fullPath.includes('?page=files/')) && fullPath.endsWith('.php')) {
      // Validar que el puerto del listener esté configurado
      if (!listeningPort) {
        // No completar misión si no hay listener activo
        return;
      }
      rceCompletedRef.current = true; // Marcar como completado para evitar repetición
      
      // Notificar a la terminal que se recibió la conexión
      setBlockingCommand({
        message: '[*] Connection received from ' + lfiMachine.machine_info.ip + ' : shell opened!',
        listeningPort: 4444,
        connected: true
      });

      onMissionComplete(6);
      onVerifyCredentials(lfiMachine.id, 'lfi-rce');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browserCurrentUrl, lfiMachine, onMissionComplete, onVerifyCredentials, setBlockingCommand]);

  // Reset rceCompletedRef cuando cambia el escenario para evitar bloqueo al volver al LFI
  useEffect(() => {
    rceCompletedRef.current = false;
  }, [allMachines]);

  const handleLFIUploadSuccess = useCallback((fileName: string) => {
    if (fileName === 'reverse_shell_triggered' || fileName === 'CHECKPOINT_RCE') {
      onMissionComplete(5);
      if (lfiMachine) {
        confirmRCE(lfiMachine.id, 'www-data', '/var/www/html/uploads/payload.php');
      }
      return;
    }
    if (lfiMachine) {
      // Encontrar el contenido del archivo original en Kali (attacker-01)
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
  }, [lfiMachine, allMachines, addFileToMachine, onMissionComplete]);

  const renderPage = () => {
    const currentUrl = browserCurrentUrl;
    
    // Detectar HTTP inseguro para Google - mostrar error de seguridad
    if (currentUrl.startsWith('http://') && currentUrl.includes('google.com')) {
      return <HttpSecurityError url={currentUrl} onNavigate={navigate} />;
    }
    
    // Normalizar URL para comparación (manejar https, www, etc.)
    const normalizeForComparison = (url: string): string => {
      return url
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .replace(/\/$/, '');
    };
    
    const normalizedCurrent = normalizeForComparison(currentUrl);
    const normalizedHome = normalizeForComparison(HOME_URL);
    
    // Coincidir google.com con o sin www (solo HTTPS aceptado aquí)
    if (normalizedCurrent === normalizedHome || normalizedCurrent === 'google.com' || currentUrl === 'about:blank') {
      return <GoogleHome onNavigate={navigate} />;
    }
    if (currentUrl.startsWith('https://www.google.com/search') || currentUrl.startsWith('https://google.com/search')) {
      return <GoogleSearch url={currentUrl} onNavigate={navigate} />;
    }
    if (currentUrl === 'chrome://dino') return <DinoGame />;

    // ── LÓGICA WORDPRESS (Escenario 01) ──
    if (wpMachine && currentUrl.includes(wpMachine.machine_info.ip)) {
      const ip = wpMachine.machine_info.ip;
      const path = currentUrl.replace(`http://${ip}`, '').split('?')[0] || '/';
      const sshCreds = wpMachine.scan_results.ports.find(p => p.service === 'ssh')?.credentials || null;
      // Credenciales WP-Admin para login (no SSH)
      const wpCreds = { user: 'admin', pass: 'P@ssw0rd123!' };
      const level = wpMachine.discovery_level ?? 0;

      if (path === '/' || path === '') return <WPIndex ip={ip} onNavigate={navigate} />;

      // WordPress: /wp-admin, /dashboard
      if (path === '/wp-admin' || path === '/wp-admin/dashboard' || path === '/dashboard' || path === '/wp-login.php') {
        if (level < 2) return <div className="flex flex-col items-center justify-center h-full p-10 text-center">⏳ Realizá un escaneo nmap -sV {ip} primero.</div>;
        if (browserIsLoggedIn) return <WPDashboard ip={ip} onNavigate={navigate} onLogout={() => { setBrowserLoggedIn(false); navigate(`http://${ip}/wp-admin`); }} onCredentialsFound={(u, p, f, s) => onCredentialsFound(wpMachine.id, u, p, f || '/wp-admin/wp-config.php', s || 'ssh')} />;
        
        // Si intenta acceder a dashboard sin estar logueado, redirigir a login
        if (path.includes('dashboard')) {
          setTimeout(() => navigate(`http://${ip}/wp-admin`), 0);
          return null;
        }

        const configFile = wpMachine?.files.find(f => f.path === '/uploads/config.bak');
        const dynamicCreds = configFile ? parseWPConfig(configFile.content) : null;
        return <WPLogin ip={ip} credentials={dynamicCreds} onNavigate={navigate} onLoginSuccess={doLogin} />;
      }

      // WordPress: /uploads/config.bak
      if (path === '/uploads' || path === '/uploads/config.bak') {
        if (level < 3) return <div className="flex flex-col items-center justify-center h-full p-10 text-center">🔒 Directorio no enumerado. Usá gobuster.</div>;
        if (path === '/uploads') return <WPUploads ip={ip} onNavigate={navigate} onCredentialsFound={(u, p, f, s) => onCredentialsFound(wpMachine.id, u, p, f || '/uploads/config.bak', s || 'wp-admin')} />;
        return <WPConfigBak ip={ip} onNavigate={navigate} machine={wpMachine} />;
      }
    }

    // ── LÓGICA LFI (Escenario 04) ──
    if (lfiMachine && lfiMachine.machine_info?.ip && currentUrl.includes(lfiMachine.machine_info.ip)) {
      const ip = lfiMachine.machine_info.ip;
      
      // Obtener la máquina atacante para sus archivos (filtrado para /root/ en el componente)
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

    // ── LÓGICA CONSULTANCY (Escenario 02) ──
    if (sshMachine && currentUrl.includes(sshMachine.machine_info.ip)) {
      return (
        <ConsultancySite 
          onViewTeam={handleViewTeam} 
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
// ── components/FakeBrowser.tsx ──────────────────────────────────────
import { useState, useCallback, useMemo } from 'react';
import type { Machine, CommandResponse } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import { logger } from '../utils/logger';
import { isCasinoVeo } from '../frameworks/http/casinoveo';
import { parseUrl } from '../frameworks/http';
import { publishProxyRequest } from '../frameworks/proxy/ProxyBus';
import { WordPressSite } from './fakesites/WordPressSite';
import { InclusionSite } from './fakesites/lfi_lab/InclusionSIte';
import { ConsultancySite } from './fakesites/ConsultancySite';
import { SqlInjectionSite } from './fakesites/SqlInjectionSite';
import { CasinoVeoSite } from './fakesites/casinoveo/CasinoVeoSite';
import { ZeroInfraLabs } from './fakesites/ZeroInfraLabs';
import { GoogleHome, GoogleSearch, HttpSecurityError, PageNotFound, DinoGame } from './fakebrowser/pages';
import { useLfiRceEffect, useLfiUploadHandler } from './fakebrowser/lfiRce';

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
  // CasinoVeo (Lab 07): cada submit del login emite un CommandResponse tipo
  // 'http' que el validador de misiones evalúa igual que una request de Burp.
  checkMissionCompletion?: (result: CommandResponse) => void;
}

export function FakeBrowser({
  allMachines, onClose, onMinimize, onMaximizeToggle, onMissionComplete,
  onCredentialsFound, onVerifyCredentials,
  scenarioHasWeb, wpDiscoveryLevel, mission3Already,
  onSetPossibleUsers, onReportVulnerability, checkMissionCompletion
}: FakeBrowserProps) {

  const HOME_URL = 'https://www.google.com';

  const [currentUrl, setCurrentUrl] = useState(HOME_URL);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [navHistory, setNavHistory] = useState([HOME_URL]);
  const [navIdx, setNavIdx] = useState(0);
  const [urlInput, setUrlInput] = useState(HOME_URL);
  const [reloading, setReloading] = useState(false);

  const addFileToMachine = useScenarioStore(state => state.addFileToMachine);
  const confirmRCE = useScenarioStore(state => state.confirmRCE);

  const wpMachine = useMemo(() => allMachines.find(m => m.web_enumeration?.cms?.toLowerCase().includes('wordpress')), [allMachines]);
  const lfiMachine = useMemo(() => allMachines.find(m => m.id.includes('lfi')), [allMachines]);
  const sshMachine = useMemo(() => allMachines.find(m => m.id === 'lab-scenario-02-ssh'), [allMachines]);
  const sqliMachine = useMemo(() => {
    logger.debug('Available machines:', allMachines.map(m => ({ id: m.id, ip: m.machine_info.ip })));
    return allMachines.find(m => m.id.includes('sqli'));
  }, [allMachines]);
  const casinoMachine = useMemo(() => allMachines.find(m => isCasinoVeo(m)), [allMachines]);

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

    // Tráfico del navegador → Burp Proxy (item: browser→proxy conectado).
    // Solo URLs http(s) pasan por el proxy; chrome:// o about: no generan
    // tráfico real. Si BurpSuite está abierto, captura la request (respeta el
    // toggle de Intercept); si no, publish es un no-op.
    if (/^https?:\/\//i.test(clean)) {
      publishProxyRequest({
        method: 'GET',
        url: clean,
        headers: { Host: parseUrl(clean)?.host ?? '' },
        body: '',
      });
    }

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
    if (scenarioHasWeb && !mission3Already && casinoMachine && casinoMachine.discovery_level >= 2 && clean.includes(casinoMachine.machine_info.ip)) {
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

  useLfiRceEffect(allMachines, lfiMachine, currentUrl, onReportVulnerability);

  const handleLFIUploadSuccess = useLfiUploadHandler({
    lfiMachine,
    allMachines,
    addFileToMachine,
    onMissionComplete,
    confirmRCE,
    onReportVulnerability,
  });

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
    if (currentUrl.includes('zeroinfralabs.vercel.app')) return <ZeroInfraLabs />;
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

    if (casinoMachine && currentUrl.includes(casinoMachine.machine_info.ip)) {
      return (
        <CasinoVeoSite
          machine={casinoMachine}
          currentUrl={currentUrl}
          onNavigate={navigate}
          onReportVulnerability={onReportVulnerability}
          onCredentialsFound={onCredentialsFound}
          checkMissionCompletion={checkMissionCompletion}
        />
      );
    }

    if (sshMachine && currentUrl.includes(sshMachine.machine_info.ip)) {
      return <ConsultancySite onNavigate={navigate} onViewTeam={handleViewTeam} />;
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

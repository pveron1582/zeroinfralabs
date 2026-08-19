// ── components/burpsuite/BurpSuite.tsx ───────────────────────────────
// Burp Suite simulado: Proxy (Intercept + HTTP history) + Repeater sobre el
// motor HTTP sintético. Reutiliza frameworks/http (mismo motor que curl) para
// que vulnerabilidades detectadas/confirmadas emitan la misma metadata que
// LabValidator valida.

import { useState, useMemo, useEffect, useRef } from 'react';
import type { Machine, HttpRequestData, HttpResponseData, CommandResponse } from '../../types';
import { parseUrl } from '../../frameworks/http';
import { buildSyntheticResponse } from '../../frameworks/http/response';
import { subscribeProxy } from '../../frameworks/proxy/ProxyBus';
import { BurpRequestEditor } from './BurpRequestEditor';
import { BurpResponsePanel } from './BurpResponsePanel';
import { BurpProxyHistory } from './BurpProxyHistory';
import { BurpIntercept } from './BurpIntercept';
import { BurpTarget } from './BurpTarget';

export type BurpTab = 'proxy' | 'repeater' | 'target';
export type ProxySubTab = 'intercept' | 'history';

export interface BurpEntry {
  id: number;
  request: HttpRequestData;
  response: HttpResponseData;
  time: string;
}

interface BurpSuiteProps {
  allMachines: Machine[];
  onClose: () => void;
  onReportVulnerability?: (machineId: string, vulnId: string, status: 'detected' | 'confirmed') => void;
  onCredentialsFound?: (machineId: string, user: string, pass: string, file?: string, service?: string) => void;
  // Igual que los comandos de la terminal: cada request completada se convierte
  // en un CommandResponse para que las misiones (LabValidator) la validen.
  checkMissionCompletion?: (result: CommandResponse) => void;
}

export function BurpSuite({ allMachines, onClose, onReportVulnerability, onCredentialsFound, checkMissionCompletion }: BurpSuiteProps) {
  const [tab, setTab] = useState<BurpTab>('proxy');
  const [history, setHistory] = useState<BurpEntry[]>([]);
  const [repeaterRequest, setRepeaterRequest] = useState<HttpRequestData>({
    method: 'GET',
    url: '',
    headers: { Host: '' },
    body: '',
  });
  const [repeaterResponse, setRepeaterResponse] = useState<HttpResponseData | null>(null);
  const [entryIdCounter, setEntryIdCounter] = useState(1);

  // Flujo de Intercept del Proxy (como Burp real):
  // - interceptOn: si está ON, las requests quedan retenidas para editar
  //   antes de Forward/Drop; si está OFF, pasan directo al target.
  // - interceptedQueue: cola de requests retenidas (Forward/Drop saca la de
  //   la cabeza; las siguientes esperan, igual que el Intercept de Burp).
  // - proxySubTab: vista actual del Proxy (Intercept | HTTP history).
  const [interceptOn, setInterceptOn] = useState(true);
  const [interceptedQueue, setInterceptedQueue] = useState<HttpRequestData[]>([]);
  const [proxySubTab, setProxySubTab] = useState<ProxySubTab>('intercept');

  // Máquinas con servicio web (HTTP/HTTPS en web_enumeration)
  const webMachines = useMemo(
    () => allMachines.filter(m => m.web_enumeration && m.web_enumeration.directories.length >= 0),
    [allMachines]
  );

  // Ejecuta una request sintética y devuelve response + metadata de vuln/creds.
  const executeRequest = (req: HttpRequestData): HttpResponseData => {
    const parsed = parseUrl(req.url);
    if (!parsed) {
      return { status: 0, statusText: 'URL malformed', headers: {}, body: '' };
    }
    const target = allMachines.find(m => m.machine_info.ip === parsed.host);
    if (!target || !target.web_enumeration) {
      return {
        status: 0,
        statusText: `Failed to connect to ${parsed.host} port ${parsed.port}`,
        headers: {},
        body: `curl: (7) Failed to connect to ${parsed.host} port ${parsed.port}: Connection refused`,
      };
    }

    const synth = buildSyntheticResponse(target, req.method, parsed.path, req.body || undefined);
    const elapsed = Math.floor(Math.random() * 80 + 5);

    // Propaga metadata de vuln/creds al store (igual que curl).
    if (synth.foundVulnerability && onReportVulnerability) {
      onReportVulnerability(synth.foundVulnerability.machineId, synth.foundVulnerability.vulnId, synth.foundVulnerability.status);
    }
    if (synth.foundCredentials && onCredentialsFound) {
      onCredentialsFound(synth.foundCredentials.machineId, synth.foundCredentials.user, synth.foundCredentials.pass, synth.foundCredentials.file, synth.foundCredentials.service);
    }

    const response: HttpResponseData = {
      status: synth.status,
      statusText: synth.statusText,
      headers: { 'Content-Type': 'text/html' },
      body: synth.body,
      elapsedMs: elapsed,
    };

    // Cada request completada es una transacción HTTP validable por las misiones
    // (criterio 'httpRequest', y también vuln/creds/fileRead cuando hay SQLi).
    if (checkMissionCompletion) {
      const result: CommandResponse = {
        output: synth.body,
        type: 'http',
        httpRequest: req,
        httpResponse: response,
        foundVulnerability: synth.foundVulnerability,
        foundCredentials: synth.foundCredentials,
        fileRead: synth.fileRead,
      };
      checkMissionCompletion(result);
    }

    return response;
  };

  // Envía una request desde el Repeater (no pasa por Intercept ni agrega al
  // history del proxy — igual que Burp real).
  const sendRepeater = (req: HttpRequestData) => {
    setRepeaterRequest(req);
    const resp = executeRequest(req);
    setRepeaterResponse(resp);
  };

  // Ejecuta la request y la agrega al history del proxy (compartido por
  // captureRequest cuando Intercept está OFF y por Forward).
  const addToHistory = (req: HttpRequestData, resp: HttpResponseData) => {
    const entry: BurpEntry = {
      id: entryIdCounter,
      request: req,
      response: resp,
      time: new Date().toLocaleTimeString(),
    };
    setHistory(prev => [entry, ...prev]);
    setEntryIdCounter(c => c + 1);
  };

  // Captura una request del tráfico (form de captura, Target o FakeBrowser vía
  // ProxyBus). Intercept ON → la retiene en cola; OFF → la ejecuta directo.
  const captureRequest = (req: HttpRequestData) => {
    if (interceptOn) {
      setInterceptedQueue(prev => [...prev, req]);
      setProxySubTab('intercept');
      return;
    }
    const resp = executeRequest(req);
    addToHistory(req, resp);
  };

  // El navegador publica sus navegaciones en el ProxyBus; este proxy se
  // suscribe mientras está montado (siempre lo está en labs Web). Se usa un
  // ref para que la suscripción se cree una vez y siempre vea el último
  // captureRequest (con el interceptOn vigente).
  const captureRequestRef = useRef(captureRequest);
  useEffect(() => {
    captureRequestRef.current = captureRequest;
  });
  useEffect(() => {
    return subscribeProxy(req => captureRequestRef.current(req));
  }, []);

  const toggleIntercept = () => setInterceptOn(prev => !prev);

  // Forward: ejecuta la request (posiblemente editada en raw), la deja en
  // history y saca la cabeza de la cola.
  const forwardIntercepted = (req: HttpRequestData) => {
    const resp = executeRequest(req);
    addToHistory(req, resp);
    setInterceptedQueue(prev => prev.slice(1));
    setProxySubTab('history');
  };

  // Drop: descarta la request de la cabeza sin enviarla al target.
  const dropIntercepted = () => {
    setInterceptedQueue(prev => prev.slice(1));
    setProxySubTab('history');
  };

  // "Send to Repeater" desde el history.
  const sendToRepeater = (entry: BurpEntry) => {
    setRepeaterRequest(entry.request);
    setRepeaterResponse(entry.response);
    setTab('repeater');
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-200 select-none font-mono text-xs">
      {/* Header con logo + tabs */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-700 bg-orange-950/40 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center text-black font-bold text-[10px]">B</div>
          <span className="text-orange-400 font-bold">Burp Suite</span>
          <span className="text-[10px] text-gray-500">v2023.2 (simulado)</span>
        </div>
        <div className="flex items-center gap-1 ml-4">
          {(['proxy', 'repeater', 'target'] as BurpTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-2.5 py-1 rounded text-xs capitalize transition-all ${tab === t ? 'bg-gray-700 text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}>
              {t === 'proxy' ? 'Proxy' : t === 'repeater' ? 'Repeater' : 'Target'}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <button onClick={onClose} className="text-gray-500 hover:text-red-400 px-2 py-0.5 text-xs">✕</button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        {tab === 'proxy' && (
          <div className="h-full flex flex-col">
            {/* Sub-tabs del Proxy (Intercept | HTTP history) */}
            <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-700 bg-gray-800/40 flex-shrink-0">
              {(['intercept', 'history'] as ProxySubTab[]).map(st => (
                <button key={st} onClick={() => setProxySubTab(st)}
                  className={`px-2 py-0.5 rounded text-[11px] capitalize transition-all ${proxySubTab === st ? 'bg-gray-700 text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}>
                  {st === 'intercept' ? 'Intercept' : 'HTTP history'}
                </button>
              ))}
              {interceptedQueue.length > 0 && (
                <span className="ml-2 text-[10px] text-orange-400 animate-pulse">● {interceptedQueue.length} request{interceptedQueue.length > 1 ? 's' : ''} intercepted</span>
              )}
            </div>
            {proxySubTab === 'intercept' ? (
              <BurpIntercept
                interceptOn={interceptOn}
                interceptedRequest={interceptedQueue[0] ?? null}
                pendingCount={interceptedQueue.length}
                onToggleIntercept={toggleIntercept}
                onForward={forwardIntercepted}
                onDrop={dropIntercepted}
              />
            ) : (
              <BurpProxyHistory
                history={history}
                onSelect={sendToRepeater}
                webMachines={webMachines}
                onCapture={captureRequest}
              />
            )}
          </div>
        )}
        {tab === 'repeater' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 grid grid-cols-2 gap-px bg-gray-700 min-h-0">
              <BurpRequestEditor request={repeaterRequest} onSend={sendRepeater} />
              <BurpResponsePanel response={repeaterResponse} />
            </div>
          </div>
        )}
        {tab === 'target' && <BurpTarget webMachines={webMachines} onCapture={captureRequest} />}
      </div>
    </div>
  );
}

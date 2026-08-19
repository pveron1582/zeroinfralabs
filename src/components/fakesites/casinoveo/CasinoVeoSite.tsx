// ── components/fakesites/casinoveo/CasinoVeoSite.tsx ─────────────────
// Fake site del Lab 07: "CasinoVeo", parodia de una plataforma cloud para
// generar imágenes y videos con IA (el chiste es "casi no veo": los
// renders salen tan difusos que casi no se ven; no tiene nada de casino).
// El login usa el MISMO motor HTTP sintético que Burp/curl, por lo que
// los payloads `'` y `' OR '1'='1` emiten idéntica metadata de SQLi y las
// misiones se validan igual en el navegador que en el Repeater.

import { useEffect, useState } from 'react';
import type { CommandResponse, HttpRequestData, Machine } from '../../../types';
import { buildSyntheticResponse } from '../../../frameworks/http';
import type { SyntheticResponse } from '../../../frameworks/http/response';

type ViewState = 'form' | 'checking' | 'invalid' | 'error' | 'success' | 'dump';

export interface CasinoVeoSiteProps {
  machine: Machine;
  currentUrl: string;
  onNavigate: (url: string) => void;
  onReportVulnerability?: (machineId: string, vulnId: string, status: 'detected' | 'confirmed') => void;
  onCredentialsFound?: (machineId: string, user: string, pass: string, file?: string, service?: string) => void;
  checkMissionCompletion?: (result: CommandResponse) => void;
}

export function CasinoVeoSite({
  machine,
  currentUrl,
  onNavigate,
  onReportVulnerability,
  onCredentialsFound,
  checkMissionCompletion,
}: CasinoVeoSiteProps) {
  const ip = machine.machine_info.ip;
  const path = currentUrl.replace(`http://${ip}`, '').split('?')[0] || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState<ViewState>('form');
  const [pending, setPending] = useState<{ resp: SyntheticResponse; formUser: string } | null>(null);
  const [last, setLast] = useState<{ resp: SyntheticResponse; formUser: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'checking') return;
    const body = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const resp = buildSyntheticResponse(machine, 'POST', '/login', body);
    setView('checking');
    setPending({ resp, formUser: username });
  };

  useEffect(() => {
    if (view !== 'checking' || !pending) return;
    const t = setTimeout(() => {
      const { resp, formUser } = pending;
      if (resp.foundVulnerability && onReportVulnerability) {
        onReportVulnerability(resp.foundVulnerability.machineId, resp.foundVulnerability.vulnId, resp.foundVulnerability.status);
      }
      if (resp.foundCredentials && onCredentialsFound) {
        onCredentialsFound(resp.foundCredentials.machineId, resp.foundCredentials.user, resp.foundCredentials.pass, resp.foundCredentials.file, resp.foundCredentials.service);
      }
      const httpRequest: HttpRequestData = {
        method: 'POST',
        url: `http://${ip}/login`,
        headers: { Host: ip, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${formUser}&password=${password}`,
      };
      const result: CommandResponse = {
        output: resp.body,
        type: 'http',
        httpRequest,
        httpResponse: { status: resp.status, statusText: resp.statusText, headers: { 'Content-Type': 'text/html' }, body: resp.body },
        foundVulnerability: resp.foundVulnerability,
        foundCredentials: resp.foundCredentials,
        fileRead: resp.fileRead,
      };
      checkMissionCompletion?.(result);
      setLast(pending);
      setView(resp.status === 500 ? 'error' : resp.status === 200 ? (resp.foundCredentials ? 'dump' : 'success') : 'invalid');
      setPending(null);
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, pending, ip]);

  const resetForm = () => {
    setView('form');
    setUsername('');
    setPassword('');
  };

  if (path === '/login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-amber-950 flex items-center justify-center p-8">
        <div className="max-w-lg w-full">
          {view === 'form' && (
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-black text-amber-400">CasinoVeo</h1>
                <p className="text-purple-300 text-xs mt-1">Login Premium — Generador de imágenes y videos con IA</p>
                <p className="text-slate-500 text-[10px] mt-1">Modelo "Casi-No-Veo v2" incluido en tu plan</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="cv-username" className="block text-purple-200 text-sm font-bold mb-2">Usuario</label>
                  <input
                    type="text" id="cv-username" value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="usuario"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="cv-password" className="block text-purple-200 text-sm font-bold mb-2">Contraseña</label>
                  <input
                    type="password" id="cv-password" value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="********"
                  />
                </div>
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-2 px-4 rounded-md transition-colors">
                  Entrar a generar
                </button>
              </form>

              <div className="mt-6 text-center text-[10px] text-slate-500">
                v2.0 — hecho a las apuradas por el CTO. Prometemos IA ultra HD; sale render en 144p.
              </div>
            </div>
          )}

          {view === 'checking' && (
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl p-12 text-center">
              <p className="text-amber-400 font-bold animate-pulse">Consultando la nube...</p>
              <p className="text-slate-500 text-xs mt-2">Validando contra la base de datos (directamente, sin sanitizar)</p>
            </div>
          )}

          {view === 'invalid' && (
            <div className="bg-slate-900 border border-red-500/40 rounded-2xl shadow-2xl p-8 text-center">
              <div className="bg-red-500/10 border border-red-500/40 text-red-300 rounded-lg p-4 mb-4 text-sm">
                Credenciales inválidas. Casi no te vemos por aquí.
              </div>
              <button onClick={resetForm} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md text-sm">
                Volver a intentar
              </button>
            </div>
          )}

          {view === 'error' && last && (
            <div className="bg-white rounded-lg p-6 border-4 border-red-500">
              <h1 className="text-2xl font-bold text-red-700 mb-2">500 Internal Server Error</h1>
              <p className="text-gray-700 mb-3">CasinoVeo se quedó sin GPU en la nube.</p>
              <pre className="bg-gray-100 border rounded p-3 text-xs text-gray-800 whitespace-pre-wrap">{
`You have an error in your SQL syntax; check the manual that
corresponds to your MySQL server version for the right syntax to
use near '${last.formUser}' at line 1`
              }</pre>
              <p className="text-sm text-gray-700 mt-3">
                <strong>[!] Vulnerabilidad SQLi detectada:</strong> el input se interpola directamente en una consulta SQL sin sanitizar.
              </p>
              <p className="text-sm text-gray-700 mt-1">
                Next Step: Bypass the login with <code className="bg-gray-100 px-1">' OR '1'='1</code> or extract data with UNION SELECT.
              </p>
              <div className="mt-4">
                <button onClick={resetForm} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md text-sm">
                  Volver al login
                </button>
              </div>
            </div>
          )}

          {view === 'success' && last && (
            <div>
              <div className="bg-white rounded-lg p-6 border-4 border-emerald-500" dangerouslySetInnerHTML={{ __html: last.resp.body }} />
              <div className="text-center mt-4">
                <button onClick={resetForm} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md text-sm">
                  Volver al login
                </button>
              </div>
            </div>
          )}

          {view === 'dump' && last && (
            <div>
              <div className="bg-white rounded-lg p-6" dangerouslySetInnerHTML={{ __html: last.resp.body }} />
              <div className="text-center mt-4">
                <button onClick={resetForm} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md text-sm">
                  Volver al login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (path === '/admin') {
    const synth = buildSyntheticResponse(machine, 'GET', path, undefined);
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg p-6" dangerouslySetInnerHTML={{ __html: synth.body }} />
          <button onClick={() => onNavigate(`http://${ip}/login`)} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-amber-950 p-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl font-black text-amber-400 mb-2">CasinoVeo</h1>
        <p className="text-purple-300 text-lg mb-1">Imágenes y videos con IA en la nube. Tan buenos, que a veces casi no se ven.</p>
        <p className="text-slate-400 text-sm mb-8">Nuestro modelo "Casi-No-Veo v2": vos pedís 8K ultra HD, nosotros te entregamos lo que la GPU quiso.</p>

        <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-5">
            <h2 className="text-amber-400 font-bold mb-2">Plan Free</h2>
            <p className="text-slate-400 text-xs">1 imagen por día (con marca de agua gigante y render en 144p).</p>
          </div>
          <div className="bg-slate-900/80 border border-purple-500/40 rounded-xl p-5">
            <h2 className="text-purple-300 font-bold mb-2">Plan Premium</h2>
            <p className="text-slate-400 text-xs">Imágenes y videos ilimitados, sin agua y con "calidad cine" garantizada*.</p>
            <p className="text-slate-600 text-[10px] mt-1">*la garantía no está garantizada.</p>
          </div>
        </div>

        <div className="text-slate-400 text-xs mb-8">
          Prompts populares: "gato astronauta" · "empanada cyberpunk" · "abuela rankeando en CS:GO"
        </div>

        <button onClick={() => onNavigate(`http://${ip}/login`)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-3 px-10 rounded-md transition-colors">
          Ingresar a generar
        </button>
        <div className="mt-4">
          <button onClick={() => onNavigate(`http://${ip}/admin`)} className="text-purple-400 hover:text-purple-300 text-xs underline">
            Panel de administración (solo admins)
          </button>
        </div>
      </div>
    </div>
  );
}

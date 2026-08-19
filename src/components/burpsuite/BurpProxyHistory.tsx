// ── components/burpsuite/BurpProxyHistory.tsx ────────────────────────
// Pestaña Proxy → HTTP history: tabla de requests capturadas.
// El form de captura simula el tráfico del navegador; las requests pasan por
// la interceptación (onCapture decide si se retienen o pasan directo).

import { useState } from 'react';
import type { Machine, HttpRequestData } from '../../types';
import type { BurpEntry } from './BurpSuite';
import { parseUrl } from '../../frameworks/http';

interface Props {
  history: BurpEntry[];
  onSelect: (entry: BurpEntry) => void;
  webMachines: Machine[];
  onCapture: (req: HttpRequestData) => void;
}

// Columnas del HTTP history como Burp real:
// #, Host, Method, URL, Status, Length (bytes), MIME type, Time.
const hostOf = (url: string): string => parseUrl(url)?.host ?? url;
const mimeOf = (headers: Record<string, string>): string =>
  (headers['Content-Type'] ?? headers['content-type'] ?? '').split(';')[0] || '-';
const lengthOf = (body: string): number => body.length;

export function BurpProxyHistory({ history, onSelect, webMachines, onCapture }: Props) {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [body, setBody] = useState('');

  const capture = () => {
    if (!url) return;
    onCapture({ method, url, headers: { Host: url.replace(/^https?:\/\//, '').split('/')[0] }, body });
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 overflow-hidden">
      {/* Capture form */}
      <div className="flex items-center gap-1.5 p-2 border-b border-gray-700 bg-gray-800/40 flex-shrink-0">
        <select value={method} onChange={e => setMethod(e.target.value)}
          className="bg-gray-700 text-gray-200 text-xs px-1.5 py-0.5 rounded border border-gray-600">
          {['GET', 'POST'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input type="text" value={url} onChange={e => setUrl(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') capture(); }}
          placeholder="http://192.168.1.10/login"
          className="flex-1 bg-gray-800 text-gray-200 px-2 py-0.5 rounded border border-gray-700 text-xs font-mono focus:outline-none focus:border-orange-600" />
        <input type="text" value={body} onChange={e => setBody(e.target.value)}
          placeholder="body (opcional)"
          className="w-40 bg-gray-800 text-gray-300 px-2 py-0.5 rounded border border-gray-700 text-xs font-mono focus:outline-none focus:border-orange-600" />
        <button onClick={capture}
          className="px-2 py-0.5 bg-orange-600 hover:bg-orange-500 text-white text-xs rounded font-bold transition-colors">
          Capture
        </button>
      </div>

      {/* Hints de targets disponibles */}
      {webMachines.length > 0 && (
        <div className="px-2 py-1 border-b border-gray-800 text-[10px] text-gray-600 flex-shrink-0">
          Targets web: {webMachines.map(m => `http://${m.machine_info.ip}`).join(' · ')}
        </div>
      )}

      {/* History table */}
      <div className="flex-1 overflow-auto min-h-0">
        {history.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-600 text-xs">
            No history. Navigate the browser or capture a request to begin.
          </div>
        ) : (
          <table className="w-full text-[10px]">
            <thead className="bg-gray-800/60 text-gray-500 uppercase sticky top-0">
              <tr>
                <th className="text-left px-2 py-1">#</th>
                <th className="text-left px-2 py-1">Host</th>
                <th className="text-left px-2 py-1">Method</th>
                <th className="text-left px-2 py-1">URL</th>
                <th className="text-left px-2 py-1">Status</th>
                <th className="text-left px-2 py-1">Length</th>
                <th className="text-left px-2 py-1">MIME</th>
                <th className="text-left px-2 py-1">Time</th>
              </tr>
            </thead>
            <tbody>
              {history.map(e => (
                <tr key={e.id} onClick={() => onSelect(e)}
                  className="border-b border-gray-800 hover:bg-gray-800/40 cursor-pointer">
                  <td className="px-2 py-1 text-gray-600">{e.id}</td>
                  <td className="px-2 py-1 text-purple-400">{hostOf(e.request.url)}</td>
                  <td className="px-2 py-1 text-blue-400">{e.request.method}</td>
                  <td className="px-2 py-1 text-gray-300 truncate max-w-[220px]" title={e.request.url}>{e.request.url}</td>
                  <td className={`px-2 py-1 ${e.response.status === 0 ? 'text-gray-500' : e.response.status < 300 ? 'text-emerald-400' : e.response.status < 400 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {e.response.status === 0 ? 'ERR' : e.response.status}
                  </td>
                  <td className="px-2 py-1 text-gray-400">{lengthOf(e.response.body)}</td>
                  <td className="px-2 py-1 text-gray-500">{mimeOf(e.response.headers)}</td>
                  <td className="px-2 py-1 text-gray-600">{e.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="px-2 py-1 border-t border-gray-700 text-[10px] text-gray-600 flex-shrink-0">
        Click en una fila → Send to Repeater
      </div>
    </div>
  );
}

// ── components/burpsuite/BurpIntercept.tsx ─────────────────────────
// Pestaña Proxy → Intercept (como Burp real): toggle on/off, muestra la request
// interceptada en raw, y permite editarla antes de Forward o Drop. Cuando el
// toggle está ON y una request pasa por el proxy, queda retenida acá.

import { useState, useEffect } from 'react';
import type { HttpRequestData } from '../../types';
import { buildRawRequest, parseRawRequest } from '../../frameworks/http';

interface Props {
  interceptOn: boolean;
  interceptedRequest: HttpRequestData | null;
  pendingCount: number;
  onToggleIntercept: () => void;
  onForward: (req: HttpRequestData) => void;
  onDrop: () => void;
}

export function BurpIntercept({ interceptOn, interceptedRequest, pendingCount, onToggleIntercept, onForward, onDrop }: Props) {
  const [rawText, setRawText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (interceptedRequest) {
      setRawText(buildRawRequest(interceptedRequest.method, interceptedRequest.url, interceptedRequest.headers, interceptedRequest.body));
      setError('');
    }
  }, [interceptedRequest]);

  const forward = () => {
    const parsed = parseRawRequest(rawText);
    if (!parsed) {
      setError('Request inválida. Formato: METHOD /path HTTP/1.1\r\nHeader: value\r\n\r\nbody');
      return;
    }
    setError('');
    onForward(parsed);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 overflow-hidden">
      {/* Toggle de interceptación (Burp real: "Intercept is on/off") */}
      <div className="flex items-center gap-2 px-2 py-1.5 border-b border-gray-700 bg-gray-800/40 flex-shrink-0">
        <button onClick={onToggleIntercept}
          className={`relative w-8 h-[18px] rounded-full transition-colors ${interceptOn ? 'bg-orange-600' : 'bg-gray-600'}`}
          aria-pressed={interceptOn}>
          <span className={`absolute top-[2px] w-3.5 h-3.5 rounded-full bg-white transition-all ${interceptOn ? 'left-[18px]' : 'left-[2px]'}`} />
        </button>
        <span className={`text-xs font-bold ${interceptOn ? 'text-orange-400' : 'text-gray-500'}`}>
          Intercept is {interceptOn ? 'on' : 'off'}
        </span>
        <span className="text-[10px] text-gray-600 ml-auto">Proxy → Intercept</span>
      </div>

      {!interceptedRequest ? (
        <div className="flex-1 flex items-center justify-center text-gray-600 text-xs">
          {interceptOn
            ? 'Waiting for a request…'
            : 'Intercept off — requests pass straight to the target.'}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1.5 px-2 py-1 border-b border-gray-700 bg-gray-800/50 flex-shrink-0">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">Intercepted request</span>
            {pendingCount > 1 && (
              <span className="text-[10px] text-gray-500">
                · {pendingCount - 1} more queued
              </span>
            )}
            <div className="ml-auto flex items-center gap-1">
              <button onClick={forward}
                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded font-bold transition-colors">
                Forward ▶
              </button>
              <button onClick={onDrop}
                className="px-2 py-0.5 bg-red-700 hover:bg-red-600 text-white text-xs rounded font-bold transition-colors">
                Drop ✕
              </button>
            </div>
          </div>

          <textarea
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full bg-gray-800 text-gray-200 px-3 py-2 font-mono text-xs leading-relaxed resize-none focus:outline-none"
          />

          {error && (
            <div className="px-2 py-1 border-t border-red-800 text-red-400 text-[10px] flex-shrink-0">
              {error}
            </div>
          )}
          <div className="px-2 py-1 border-t border-gray-700 text-[10px] text-gray-600 flex-shrink-0">
            Editá la request antes de Forward (como en Burp real)
          </div>
        </>
      )}
    </div>
  );
}
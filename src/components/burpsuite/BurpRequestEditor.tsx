// ── components/burpsuite/BurpRequestEditor.tsx ──────────────────────
// Editor de requests HTTP raw (pane izquierdo del Repeater, estilo Burp real:
// request line + headers + body en un solo bloque de texto editable).
// El texto se serializa con buildRawRequest y al enviar se parsea con
// parseRawRequest → HttpRequestData.

import { useState, useEffect } from 'react';
import type { HttpRequestData } from '../../types';
import { buildRawRequest, parseRawRequest } from '../../frameworks/http';

interface Props {
  request: HttpRequestData;
  onSend: (req: HttpRequestData) => void;
}

export function BurpRequestEditor({ request, onSend }: Props) {
  const [rawText, setRawText] = useState(() =>
    buildRawRequest(request.method, request.url, request.headers, request.body)
  );
  const [error, setError] = useState('');

  // Sincroniza cuando llega una nueva request (history → Repeater, etc.).
  useEffect(() => {
    setRawText(buildRawRequest(request.method, request.url, request.headers, request.body));
    setError('');
  }, [request]);

  const send = () => {
    const parsed = parseRawRequest(rawText);
    if (!parsed) {
      setError('Request inválida. Formato: METHOD /path HTTP/1.1\r\nHeader: value\r\n\r\nbody');
      return;
    }
    setError('');
    onSend(parsed);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 overflow-hidden">
      <div className="flex items-center gap-1.5 px-2 py-1 border-b border-gray-700 bg-gray-800/50 flex-shrink-0">
        <span className="text-[10px] text-gray-500 uppercase tracking-wide">Request</span>
        <span className="text-[10px] text-gray-600">Raw</span>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={send}
            className="px-2 py-0.5 bg-orange-600 hover:bg-orange-500 text-white text-xs rounded font-bold transition-colors">
            Send ▶
          </button>
        </div>
      </div>

      <textarea
        value={rawText}
        onChange={e => setRawText(e.target.value)}
        onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') send(); }}
        spellCheck={false}
        className="flex-1 w-full bg-gray-800 text-gray-200 px-3 py-2 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:border-orange-600"
      />

      {error && (
        <div className="px-2 py-1 border-t border-red-800 text-red-400 text-[10px] flex-shrink-0">
          {error}
        </div>
      )}
      <div className="px-2 py-1 border-t border-gray-700 text-[10px] text-gray-600 flex-shrink-0">
        Ctrl+Enter para enviar · editá la request raw como en Burp real
      </div>
    </div>
  );
}
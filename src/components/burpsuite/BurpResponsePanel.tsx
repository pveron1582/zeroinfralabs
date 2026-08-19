// ── components/burpsuite/BurpResponsePanel.tsx ─────────────────────
// Panel de response HTTP (derecha del Repeater). Toggle Pretty/Raw como Burp
// real: Pretty renderiza status + headers + body; Raw muestra la response cruda.

import { useState } from 'react';
import type { HttpResponseData } from '../../types';
import { buildRawResponse } from '../../frameworks/http';

interface Props {
  response: HttpResponseData | null;
}

export function BurpResponsePanel({ response }: Props) {
  const [raw, setRaw] = useState(false);

  if (!response) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 text-gray-600 text-xs">
        <div className="text-center">
          <div className="mb-1 text-gray-700">—</div>
          <div>Waiting for response…</div>
        </div>
      </div>
    );
  }

  if (response.status === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 text-red-400 text-xs p-3 text-center">
        {response.statusText}<br/>
        <span className="text-gray-600 text-[10px] mt-1">{response.body}</span>
      </div>
    );
  }

  const statusColor =
    response.status < 200 ? 'text-blue-400' :
    response.status < 300 ? 'text-emerald-400' :
    response.status < 400 ? 'text-yellow-400' :
    response.status < 500 ? 'text-orange-400' :
    'text-red-500';

  return (
    <div className="h-full flex flex-col bg-gray-900 overflow-hidden">
      <div className="flex items-center gap-1.5 px-2 py-1 border-b border-gray-700 bg-gray-800/50 flex-shrink-0">
        <span className="text-[10px] text-gray-500 uppercase tracking-wide">Response</span>
        <div className="ml-auto flex items-center gap-0.5">
          <button onClick={() => setRaw(false)}
            className={`px-1.5 py-0.5 text-[10px] rounded ${!raw ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            Pretty
          </button>
          <button onClick={() => setRaw(true)}
            className={`px-1.5 py-0.5 text-[10px] rounded ${raw ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            Raw
          </button>
        </div>
        {response.elapsedMs !== undefined && (
          <span className="ml-2 text-[10px] text-gray-600">{response.elapsedMs} ms</span>
        )}
      </div>

      {raw ? (
        <pre className="flex-1 overflow-auto px-3 py-2 text-[10px] text-gray-300 whitespace-pre-wrap break-all leading-relaxed">
          {buildRawResponse(response.status, response.statusText, response.headers, response.body)}
        </pre>
      ) : (
        <div className="p-2 flex flex-col gap-1.5 flex-1 overflow-auto min-h-0">
          <div className={`text-sm font-bold ${statusColor}`}>
            {response.status} {response.statusText}
          </div>

          <div className="text-[10px] text-gray-500">
            {Object.entries(response.headers).map(([k, v]) => (
              <div key={k}><span className="text-gray-400">{k}:</span> {v}</div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-1.5 flex-1 overflow-auto min-h-0">
            <pre className="text-[10px] text-gray-300 whitespace-pre-wrap break-all leading-relaxed">
              {response.body}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
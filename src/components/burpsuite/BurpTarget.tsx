// ── components/burpsuite/BurpTarget.tsx ─────────────────────────────
// Pestaña Target: lista de máquinas con servicio web + sitios expuestos.

import type { Machine, HttpRequestData } from '../../types';

interface Props {
  webMachines: Machine[];
  onCapture: (req: HttpRequestData) => void;
}

export function BurpTarget({ webMachines, onCapture }: Props) {
  if (webMachines.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 text-gray-600 text-xs">
        No web targets available in this scenario.
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-900 p-3">
      <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Site map</div>
      <div className="space-y-3">
        {webMachines.map(m => (
          <div key={m.id} className="bg-gray-800/40 rounded border border-gray-700 p-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-orange-400 text-xs font-bold">🌐 {m.machine_info.hostname}</span>
              <span className="text-gray-500 text-[10px]">{m.machine_info.ip}</span>
              <span className="text-gray-600 text-[10px]">Apache/2.4</span>
            </div>
            <div className="mb-1.5 text-[10px] text-gray-500">
              web_server: {m.web_enumeration?.web_server ?? 'none'} · cms: {m.web_enumeration?.cms ?? 'none'}
            </div>
            <div className="space-y-0.5">
              {m.web_enumeration?.directories.map(d => {
                const url = `http://${m.machine_info.ip}${d.path}`;
                return (
                  <div key={d.path} className="flex items-center gap-2 pl-3 py-0.5 hover:bg-gray-800/40 rounded">
                    <span className={`text-[10px] font-mono ${d.status < 300 ? 'text-emerald-400' : d.status < 400 ? 'text-yellow-400' : 'text-red-400'}`}>
                      [{d.status}]
                    </span>
                    <span className="text-[10px] text-gray-300 font-mono">{d.path}</span>
                    <button onClick={() => onCapture({ method: 'GET', url, headers: { Host: m.machine_info.ip }, body: '' })}
                      className="ml-auto text-[10px] text-orange-400 hover:text-orange-300 px-1.5 py-0.5 rounded hover:bg-orange-950/40">
                      Intercept →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── components/appContent/MobileAddMenu.tsx ───────────────────────
// Botón + y modal para agregar terminal/navegador en el workspace móvil.

import { useState } from 'react';

export function MobileAddMenu({ onAddTerminal, onAddBrowser, showBrowser, canAddTerm, canAddBrowser }: {
  onAddTerminal: () => void; onAddBrowser: () => void; showBrowser: boolean; canAddTerm: boolean; canAddBrowser: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center text-lg leading-none"
        aria-label="Agregar ventana"
      >
        +
      </button>
      {open && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-[320px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-4">
            <h3 className="text-sm font-bold text-white text-center mb-1">Agregar ventana</h3>
            <p className="text-xs text-gray-500 text-center mb-4">Elegí qué querés abrir</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => { if (canAddTerm) onAddTerminal(); setOpen(false); }}
                disabled={!canAddTerm}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${canAddTerm ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-gray-800/50 border-gray-800 text-gray-500 cursor-not-allowed'}`}
              >
                <span className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg></span>
                <span className="flex-1 text-left">Nueva Terminal {!canAddTerm && '(límite 5)'}</span>
              </button>
              {showBrowser && (
                <button
                  type="button"
                  onClick={() => { if (canAddBrowser) onAddBrowser(); setOpen(false); }}
                  disabled={!canAddBrowser}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${canAddBrowser ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-gray-800/50 border-gray-800 text-gray-500 cursor-not-allowed'}`}
                >
                  <span className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><circle cx="12" cy="12" r="9"/><line x1="2" y1="12" x2="22" y2="12"/></svg></span>
                  <span className="flex-1 text-left">Nuevo Navegador {!canAddBrowser && '(límite 2)'}</span>
                </button>
              )}
            </div>
            <button type="button" onClick={() => setOpen(false)} className="w-full mt-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium">Cancelar</button>
          </div>
        </div>
      )}
    </>
  );
}

// ── components/appContent/MobileExperiencePopup.tsx ───────────────
// Popup de bienvenida "experiencia móvil" al cargar un lab: se cierra
// y no vuelve en la sesión (sessionStorage por scenarioId).

import { useState } from 'react';

export function MobileExperiencePopup({ scenarioId, isEs }: { scenarioId: string; isEs: boolean }) {
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem(`mobile-experience-dismissed-${scenarioId}`);
  });
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-[360px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v5"/><path d="M12 16h.01"/></svg>
        </div>
        <h3 className="text-sm font-bold text-white text-center mb-2">{isEs ? 'Experiencia en móvil' : 'Mobile experience'}</h3>
        <p className="text-xs leading-relaxed text-gray-400 text-center mb-4">
          {isEs
            ? 'La experiencia óptima es en desktop. En móvil podés usar terminal y navegador básicos; para labs completos (Burp, NetworkMap) recomendamos desktop.'
            : 'The best experience is on desktop. On mobile you can use a basic terminal and browser; for full labs (Burp, NetworkMap) use desktop.'}
        </p>
        <p className="text-[11px] text-gray-500 text-center mb-4">
          {isEs ? 'Tip: cada ventana conserva su estado (historial, nmap en curso).' : 'Tip: each window keeps its state (history, running nmap).'}
        </p>
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem(`mobile-experience-dismissed-${scenarioId}`, '1');
            setShow(false);
          }}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
        >
          {isEs ? 'Continuar' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

// ── components/ExitConfirm.tsx ─────────────────────────────────────
// Diálogo de confirmación para volver al menú principal (botón de
// apagado del escritorio + botón rojo de salida del panel de ayuda)

import { useLanguage } from '../i18n/translations';

interface ExitConfirmProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ExitConfirm({ open, onCancel, onConfirm }: ExitConfirmProps) {
  const language = useLanguage();
  const isEs = language === 'es';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center mb-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">{isEs ? '¿Volver al menú?' : 'Return to menu?'}</h2>
          <p className="text-sm text-gray-400 mt-1.5">
            {isEs
              ? '¿Seguro que quiere salir del simulador? El progreso de este laboratorio se perderá.'
              : 'Are you sure you want to exit the simulator? Progress on this lab will be lost.'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all"
          >
            {isEs ? 'Cancelar' : 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-500 transition-all shadow-lg shadow-red-950/40"
          >
            {isEs ? 'Sí, salir' : 'Yes, exit'}
          </button>
        </div>
      </div>
    </div>
  );
}

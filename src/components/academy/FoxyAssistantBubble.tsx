// ── components/academy/FoxyAssistantBubble.tsx ──────────────────────
// Burbuja flotante de Foxy para ejercicios prácticos de las lecciones.
// Estética: FoxyFox SVG animado + burbuja con el diseño del landing.

import { useState } from 'react';
import { FoxyFox } from '../tour/FoxyFox';
import { useColors, FONT_SANS } from '../landing/constants';

export function FoxyAssistantBubble({ task, taskEs, hint, hintEs, isEs }: {
  task: string;
  taskEs: string;
  hint: string;
  hintEs: string;
  isEs: boolean;
}) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentTask = isEs ? taskEs : task;
  const currentHint = isEs ? hintEs : hint;

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none" style={{ fontFamily: FONT_SANS }}>
      {/* Burbuja */}
      <div className={`mb-3 transition-all duration-300 ${expanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none absolute'}`}>
        <div className="relative rounded-xl p-4 max-w-xs shadow-2xl" style={{
          background: colors.sectionBg,
          border: `1px solid ${colors.emerald}40`,
          boxShadow: `0 0 30px ${colors.emerald}15, 0 8px 32px rgba(0,0,0,0.6)`,
        }}>
          {/* Flecha hacia el zorro */}
          <div className="absolute -bottom-2 right-10 w-4 h-4 rotate-45" style={{ background: colors.sectionBg, borderBottom: `1px solid ${colors.emerald}40`, borderRight: `1px solid ${colors.emerald}40` }} />

          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎯</span>
            <span className="text-xs font-bold" style={{ color: colors.emerald }}>
              {isEs ? 'EJERCICIO PRÁCTICO' : 'PRACTICAL EXERCISE'}
            </span>
            <button
              onClick={() => setExpanded(false)}
              className="ml-auto text-xs px-1 transition-colors"
              style={{ color: colors.textMuted, cursor: 'pointer' }}
              aria-label={isEs ? 'Cerrar' : 'Close'}
            >
              ✕
            </button>
          </div>

          <p className="text-sm leading-relaxed mb-3" style={{ color: colors.text }}>
            {currentTask}
          </p>

          {showHint ? (
            <div className="rounded-xl p-3 mb-2" style={{ background: `${colors.emerald}10`, border: `1px solid ${colors.emerald}30` }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs font-bold" style={{ color: colors.emerald }}>{isEs ? 'SI PEDISTE AYUDA...' : 'YOU ASKED FOR HELP...'}</span>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: colors.textMuted }}>
                {currentHint}
              </p>
            </div>
          ) : (
            <button
              onClick={() => setShowHint(true)}
              className="w-full text-xs px-3 py-2 rounded-xl transition-all"
              style={{ border: `1px solid ${colors.emerald}50`, color: colors.emerald, background: `${colors.emerald}0d`, cursor: 'pointer' }}
            >
              {isEs ? '¿Necesitás ayuda? Pedir pista a Foxy ▼' : 'Need help? Ask Foxy for a hint ▼'}
            </button>
          )}
        </div>
      </div>

      {/* Foxy (toca para abrir/cerrar) */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="block ml-auto transition-transform hover:scale-105 active:scale-95"
        aria-label={expanded ? (isEs ? 'Cerrar ayuda de Foxy' : 'Close Foxy help') : (isEs ? 'Abrir ayuda de Foxy' : 'Open Foxy help')}
      >
        <FoxyFox size={72} />
        {!expanded && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 animate-pulse" style={{ border: `2px solid ${colors.pageBg}` }} />
        )}
      </button>
    </div>
  );
}

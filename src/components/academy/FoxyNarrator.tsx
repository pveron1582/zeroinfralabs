// ── components/academy/FoxyNarrator.tsx ────────────────────────────
// Paso de narración con Foxy dentro de una lección. Muestra mensajes
// rotativos del zorro en estilo conversación — no bloquea el paso.

import { useState } from 'react';
import { FoxyFox } from '../tour/FoxyFox';
import { useColors, FONT_SANS } from '../landing/constants';

export function FoxyNarrator({ messages, isEs }: {
  messages: { en: string; es: string }[];
  isEs: boolean;
}) {
  const colors = useColors();
  const [idx, setIdx] = useState(0);
  const hasMore = messages.length > 1;

  const next = () => setIdx((idx + 1) % messages.length);

  const current = isEs ? messages[idx].es : messages[idx].en;

  return (
    <div className="flex gap-4" style={{ fontFamily: FONT_SANS }}>
      {/* Foxy a la izquierda */}
      <div className="flex-shrink-0">
        <FoxyFox size={56} />
      </div>

      {/* Burbuja */}
      <div className="flex-1 rounded-xl p-4" style={{
        background: colors.sectionBg,
        border: `1px solid ${colors.border}`,
      }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider"
            style={{ background: `${colors.emerald}14`, color: colors.emerald, border: `1px solid ${colors.emerald}30` }}>
            FOXY
          </span>
          <span className="text-xs" style={{ color: colors.textMuted }}>
            {isEs ? 'Dato / contexto' : 'Context / tip'}
          </span>
          {hasMore && (
            <span className="ml-auto text-[10px]" style={{ color: colors.textMuted }}>
              {idx + 1}/{messages.length}
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed mb-3" style={{ color: colors.text }}>
          {current}
        </p>

        {hasMore && (
          <button
            onClick={next}
            className="text-xs px-3 py-1.5 rounded-xl font-bold transition-all"
            style={{
              border: `1px solid ${colors.emerald}50`,
              color: colors.emerald,
              background: `${colors.emerald}0d`,
              cursor: 'pointer',
            }}
          >
            {isEs ? 'Siguiente →' : 'Next tip →'}
          </button>
        )}
      </div>
    </div>
  );
}

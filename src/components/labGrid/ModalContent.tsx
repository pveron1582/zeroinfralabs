// ── components/labGrid/ModalContent.tsx ─────────────────────────
// Contenido del modal de detalle de laboratorio

import { useState } from 'react';
import type { Scenario } from '../../types';
import { useT } from '../../i18n/translations';
import { useColors } from '../landing/constants';
import { useScenarioStore } from '../../store/scenarioStore';
import { LAB_IMAGES, diffColor, type ScenarioMeta } from './helpers';

export function ModalContent({
  index, scenario, meta, lang, t, diffLabel, onClose, onStart,
}: {
  index: number; scenario: Scenario; meta: ScenarioMeta | undefined;
  lang: string; t: ReturnType<typeof useT>;
  diffLabel: (d: string) => string;
  onClose: () => void; onStart: (id: string) => void;
}) {
  const description = lang === 'es' ? (meta?.descriptionEs ?? meta?.description ?? scenario.description) : (meta?.description ?? scenario.description);
  const tools = meta?.tools?.join(', ') ?? '';
  const colors = useColors();
  const isDark = useScenarioStore((s) => s.theme) === 'dark';
  const [closeHover, setCloseHover] = useState(false);

  return (
    <>
      <img
        src={LAB_IMAGES[scenario.id]}
        alt={scenario.name}
        className="w-full object-cover rounded-t-2xl"
        style={{ aspectRatio: '16/9', background: isDark ? '#0a0e14' : '#f1f5f9' }}
      />
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors"
        style={{
          background: isDark ? '#1e293b' : '#f8fafc',
          border: `1px solid ${closeHover ? '#ef444460' : isDark ? '#334155' : '#e2e8f0'}`,
          color: closeHover ? '#ef4444' : colors.textMuted,
        }}
        onMouseEnter={() => setCloseHover(true)}
        onMouseLeave={() => setCloseHover(false)}
        aria-label={t('close')}
      >
        ✕
      </button>
      <div className="p-5 md:p-6 flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-sm font-semibold" style={{ color: '#10b981' }}>
            0x0{index + 1}
          </span>
          <span className="mono text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: isDark ? '#1e293b' : '#f1f5f9', color: colors.textMuted }}>
            {scenario.category}
          </span>
          <span className="mono text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: `${diffColor(scenario.difficulty)}15`, color: diffColor(scenario.difficulty) }}>
            {diffLabel(scenario.difficulty)}
          </span>
        </div>

        <h2 className="text-xl font-bold leading-tight" style={{ color: colors.text }}>
          {scenario.name}
        </h2>

        <p className="text-sm leading-relaxed" style={{ color: colors.textMuted, lineHeight: 1.65 }}>
          {description}
        </p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 pt-1">
          <div>
            <span className="mono text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
              {t('tools')}
            </span>
            <p className="mono text-sm mt-0.5" style={{ color: colors.text }}>{tools}</p>
          </div>
          <div>
            <span className="mono text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
              {t('ipRange')}
            </span>
            <p className="mono text-sm mt-0.5" style={{ color: colors.text }}>{scenario.network_range}</p>
          </div>
          <div>
            <span className="mono text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
              {t('missionsTitle')}
            </span>
            <p className="text-sm mt-0.5 font-medium" style={{ color: colors.text }}>
              {scenario.missions?.length ?? 5} {t('missions')}
            </p>
          </div>
        </div>

        <button
          onClick={() => onStart(scenario.id)}
          className="self-start inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #10b981, #047857)', boxShadow: '0 6px 24px rgba(16,185,129,0.30)' }}
        >
          {t('startLab')}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </>
  );
}

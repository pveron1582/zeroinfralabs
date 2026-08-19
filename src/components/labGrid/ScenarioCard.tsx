// ── components/labGrid/ScenarioCard.tsx ─────────────────────────
// Tarjeta de laboratorio en la grilla de selección

import { useState } from 'react';
import type { Scenario } from '../../types';
import { useLanguage, useT } from '../../i18n/translations';
import { useColors, FONT_MONO } from '../landing/constants';
import { useScenarioStore } from '../../store/scenarioStore';
import { LAB_IMAGES, type ScenarioMeta } from './helpers';

export function ScenarioCard({
  scenario, index, meta, diffLabel, diffColor, accent, onOpen,
}: {
  scenario: Scenario; index: number; meta: ScenarioMeta | undefined;
  diffLabel: string; diffColor: string; accent: string; onOpen: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const language = useLanguage();
  const t = useT();
  const colors = useColors();
  const isDark = useScenarioStore((s) => s.theme) === 'dark';
  const descriptionText = language === 'es' ? (meta?.descriptionEs ?? meta?.description ?? scenario.description) : (meta?.description ?? scenario.description);

  return (
    <article
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col overflow-hidden select-none w-full cursor-pointer"
      style={{
        background: isDark ? '#11161f' : '#ffffff',
        border: `1px solid ${hovered ? `${accent}60` : colors.border}`,
        borderRadius: '12px',
        boxShadow: hovered
          ? `0 12px 40px ${accent}18, 0 0 0 1px ${accent}15`
          : '0 1px 3px rgba(15,23,42,0.04)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        animationDelay: `${index * 90}ms`,
        animation: 'cardIn 0.4s ease-out both',
      }}
      role="button" tabIndex={0}
    >
      <div className="relative overflow-hidden" style={{ height: '170px', background: isDark ? '#0a0e14' : '#f1f5f9' }}>
        <img
          src={LAB_IMAGES[scenario.id]}
          alt={scenario.name}
          className="w-full h-full object-cover"
          loading="lazy"
          style={{
            transform: hovered ? 'scale(1.28)' : 'scale(1)',
            transformOrigin: 'center center',
            transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        />
        <div className="absolute top-3 left-3 font-mono text-xs font-bold px-2 py-0.5 rounded"
          style={{ background: '#000000aa', color: accent, border: `1px solid ${accent}48`, zIndex: 2 }}>
          0x0{index + 1}
        </div>
        <div className="absolute top-3 right-3 font-mono text-xs font-bold px-2 py-0.5 rounded"
          style={{ background: '#000000aa', color: diffColor, border: `1px solid ${diffColor}48`, zIndex: 2 }}>
          {diffLabel}
        </div>
      </div>
      <div className="p-4 flex flex-col" style={{ minHeight: '200px' }}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{ fontFamily: FONT_MONO, background: `${accent}14`, color: accent, border: `1px solid ${accent}25` }}>
              {scenario.category}
            </span>
            <span className="text-xs" style={{ fontFamily: FONT_MONO, color: colors.textMuted }}>
              {scenario.network_range}
            </span>
          </div>
          <h3 className="text-sm font-bold leading-snug" style={{ color: colors.text }}>
            {scenario.name}
          </h3>
          <p className="text-xs mt-1 leading-relaxed line-clamp-2"
            style={{ color: colors.textMuted, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.5em' }}>
            {descriptionText}
          </p>
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between" style={{ borderTop: `1px solid ${colors.border}` }}>
          <span className="text-xs" style={{ fontFamily: FONT_MONO, color: colors.textMuted }}>
            {scenario.missions?.length ?? 5} {t('missions')}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: hovered ? accent : colors.textMuted }}>
            {t('startButton')}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transform: hovered ? 'translateX(2px)' : 'none', transition: 'transform 0.2s' }}>
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </div>
      </div>
    </article>
  );
}

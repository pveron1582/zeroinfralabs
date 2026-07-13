// Compact lab cards for landing preview

import React from 'react';
import { Link } from 'react-router-dom';
import { SCENARIOS, SCENARIOS_META } from '../../laboratorios/laboratorios';
import { useLanguage, useT } from '../../i18n/translations';
import { useColors, FONT_MONO, FONT_SANS } from './constants';
import { useScenarioStore } from '../../store/scenarioStore';

const PREVIEW_COUNT = 3;

export function LandingLabPreview({ language, labsLink }: { language: string; labsLink: string }) {
  const t = useT();
  const lang = useLanguage();
  const colors = useColors();
  const isDark = useScenarioStore((s) => s.theme) === 'dark';

  return (
    <section id="labs-preview" className="px-4 md:px-8 py-14 md:py-16" style={{ background: colors.pageBg, fontFamily: FONT_SANS }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: colors.text }}>{t('labsPreviewTitle')}</h2>
          <p className="text-sm md:text-base max-w-xl mx-auto" style={{ color: colors.textMuted }}>{t('labsPreviewSubtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {SCENARIOS.slice(0, PREVIEW_COUNT).map((scenario, i) => {
            const meta = SCENARIOS_META[i];
            const accent = meta?.accentColor ?? colors.emerald;
            const desc = lang === 'es' ? (meta?.descriptionEs || meta?.description) : meta?.description;
            const diff = scenario.difficulty === 'Easy' ? t('easy') : scenario.difficulty === 'Medium' ? t('medium') : t('hard');
            return (
              <Link key={scenario.id} to={`/${language}/scenario/${scenario.id}`}
                className={`group rounded-xl p-4 transition-all hover:-translate-y-0.5 ${isDark ? 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)]' : 'hover:shadow-md'}`}
                style={{ background: colors.sectionBg, border: `1px solid ${colors.border}` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ fontFamily: FONT_MONO, color: accent, background: `${accent}14`, border: `1px solid ${accent}30` }}>
                    Lab 0{i + 1}
                  </span>
                  <span className="text-xs" style={{ fontFamily: FONT_MONO, color: colors.textMuted }}>{diff}</span>
                </div>
                <h3 className={`text-sm font-semibold mb-1 transition-colors ${isDark ? 'group-hover:text-emerald-400' : 'group-hover:text-emerald-700'}`} style={{ color: colors.text }}>{scenario.name}</h3>
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: colors.textMuted }}>{desc || scenario.description}</p>
                <p className={`text-xs mt-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {t('startButton')} →
                </p>
              </Link>
            );
          })}
        </div>
        <div className="text-center">
          <Link to={labsLink}
            className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-800'}`}>
            {t('labsPreviewAll')} ({SCENARIOS.length})
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

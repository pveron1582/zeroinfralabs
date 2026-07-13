// ── components/LabGrid.tsx ──────────────────────────────────────
// Lab selection page with modal detail view

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Scenario } from '../types';
import { SCENARIOS } from '../laboratorios/laboratorios';
import { useLanguage, useSetLanguage, useT } from '../i18n/translations';
import { SCENARIOS_META } from '../laboratorios/laboratorios';
import { useColors, FONT_MONO, FONT_SANS } from './landing/constants';
import { useScenarioStore } from '../store/scenarioStore';
import { SiteHeader } from './landing/SiteHeader';
import { PageHero } from './landing/PageHero';
import { MarketingFooter } from './landing/MarketingFooter';

interface ScenarioMeta {
  tagline?: string;
  taglineEs?: string;
  tools?: string[];
  accentColor?: string;
  description?: string;
  descriptionEs?: string;
}

const LAB_IMAGES: Record<string, string> = {
  'scenario-01': '/lab_images/lab01.png',
  'scenario-02': '/lab_images/lab02.png',
  'scenario-03': '/lab_images/lab03.png',
  'scenario-04': '/lab_images/Lab04.png',
  'scenario-05': '/lab_images/Lab05.png',
};

function ScenarioCard({
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

export function LabGrid() {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const language = useLanguage();
  const setLanguage = useSetLanguage();
  const t = useT();
  const colors = useColors();
  const isDark = useScenarioStore((s) => s.theme) === 'dark';

  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [openAnim, setOpenAnim] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (lang && (lang === 'en' || lang === 'es')) {
      setLanguage(lang);
    }
  }, [lang, setLanguage]);

  useEffect(() => {
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSelect = (id: string) => {
    navigate(`/${lang || 'en'}/scenario/${id}`);
  };

  const openModal = useCallback((index: number) => {
    if (modalIndex !== null || closing) return;
    setModalIndex(index);
    requestAnimationFrame(() => requestAnimationFrame(() => setOpenAnim(true)));
    document.body.style.overflow = 'hidden';
  }, [modalIndex, closing]);

  const closeModal = useCallback(() => {
    if (modalIndex === null || closing) return;
    setClosing(true);
    setOpenAnim(false);
    setTimeout(() => {
      setModalIndex(null);
      setClosing(false);
      document.body.style.overflow = '';
    }, 210);
  }, [modalIndex, closing]);

  const goPrev = useCallback(() => {
    setModalIndex(i => i !== null && i > 0 ? i - 1 : i);
  }, []);

  const goNext = useCallback(() => {
    setModalIndex(i => i !== null && i < SCENARIOS.length - 1 ? i + 1 : i);
  }, []);

  useEffect(() => {
    if (modalIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modalIndex, closeModal, goPrev, goNext]);

  const diffColor = (difficulty: string) => {
    if (difficulty === 'Easy') return '#10b981';
    if (difficulty === 'Medium') return '#f59e0b';
    return '#f87171';
  };

  const diffLabel = (difficulty: string) => {
    if (difficulty === 'Easy') return t('easy');
    if (difficulty === 'Medium') return t('medium');
    return t('hard');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: colors.sectionBg, fontFamily: FONT_SANS }}>
      <SiteHeader activeNav="labs" showCta ctaLabel={t('backToLanding')} ctaTo={`/${language}`} />

      <PageHero
        eyebrow={t('pentestingLabSimulator')}
        title={t('labsPageTitle')}
        subtitle={t('labsPageSubtitle')}
      />

      <main className="relative z-10 flex-1 px-4 md:px-6 pb-14 -mt-2">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-[1200px] mx-auto">
          {SCENARIOS.map((s, i) => {
            const meta = SCENARIOS_META[i];
            const accent = meta?.accentColor ?? '#10b981';
            return (
              <ScenarioCard
                key={s.id}
                scenario={s}
                index={i}
                meta={meta}
                diffLabel={diffLabel(s.difficulty)}
                diffColor={diffColor(s.difficulty)}
                accent={accent}
                onOpen={() => openModal(i)}
              />
            );
          })}
        </div>
      </main>

      <MarketingFooter />

      {/* Modal */}
      {modalIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          style={{
            background: 'rgba(0,0,0,0.7)',
            opacity: openAnim ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: openAnim ? 'auto' : 'none',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          {/* Previous arrow */}
          <button
            onClick={goPrev}
            className="absolute top-1/2 -translate-y-1/2 left-2 md:left-6 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: 'rgba(15,23,42,0.8)',
              border: '1px solid #334155',
              color: modalIndex === 0 ? 'transparent' : '#94a3b8',
              pointerEvents: modalIndex === 0 ? 'none' : 'auto',
              cursor: modalIndex === 0 ? 'default' : 'pointer',
              backdropFilter: 'blur(6px)',
            }}
            onMouseEnter={(e) => { if (modalIndex > 0) { e.currentTarget.style.color = '#10b981'; e.currentTarget.style.borderColor = '#10b98160'; }}}
            onMouseLeave={(e) => { e.currentTarget.style.color = modalIndex === 0 ? 'transparent' : '#94a3b8'; e.currentTarget.style.borderColor = '#334155'; }}
            aria-label={t('previous')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          {/* Next arrow */}
          <button
            onClick={goNext}
            className="absolute top-1/2 -translate-y-1/2 right-2 md:right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: 'rgba(15,23,42,0.8)',
              border: '1px solid #334155',
              color: modalIndex === SCENARIOS.length - 1 ? 'transparent' : '#94a3b8',
              pointerEvents: modalIndex === SCENARIOS.length - 1 ? 'none' : 'auto',
              cursor: modalIndex === SCENARIOS.length - 1 ? 'default' : 'pointer',
              backdropFilter: 'blur(6px)',
            }}
            onMouseEnter={(e) => { if (modalIndex < SCENARIOS.length - 1) { e.currentTarget.style.color = '#10b981'; e.currentTarget.style.borderColor = '#10b98160'; }}}
            onMouseLeave={(e) => { e.currentTarget.style.color = modalIndex === SCENARIOS.length - 1 ? 'transparent' : '#94a3b8'; e.currentTarget.style.borderColor = '#334155'; }}
            aria-label={t('next')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          {/* Modal panel */}
          <div
            className="relative rounded-2xl w-full max-w-[620px] max-h-[90vh] overflow-y-auto"
            style={{
              background: isDark ? '#11161f' : '#ffffff',
              transform: openAnim ? 'scale(1)' : 'scale(0.85)',
              opacity: openAnim ? 1 : 0,
              transition: 'transform 0.22s cubic-bezier(0.22, 1, 0.36, 1.12), opacity 0.2s ease',
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
            }}
          >
            <ModalContent
              index={modalIndex}
              scenario={SCENARIOS[modalIndex]}
              meta={SCENARIOS_META[modalIndex]}
              lang={language}
              t={t}
              diffColor={diffColor}
              diffLabel={diffLabel}
              onClose={closeModal}
              onStart={handleSelect}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes cardIn { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

function ModalContent({
  index, scenario, meta, lang, t, diffColor, diffLabel, onClose, onStart,
}: {
  index: number; scenario: Scenario; meta: ScenarioMeta | undefined;
  lang: string; t: ReturnType<typeof useT>;
  diffColor: (d: string) => string; diffLabel: (d: string) => string;
  onClose: () => void; onStart: (id: string) => void;
}) {
  const description = lang === 'es' ? (meta?.descriptionEs ?? meta?.description ?? scenario.description) : (meta?.description ?? scenario.description);
  const tools = meta?.tools?.join(', ') ?? '';
  const colors = useColors();
  const isDark = useScenarioStore((s) => s.theme) === 'dark';

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
        style={{ background: isDark ? '#1e293b' : '#f8fafc', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, color: colors.textMuted }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef444460'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
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

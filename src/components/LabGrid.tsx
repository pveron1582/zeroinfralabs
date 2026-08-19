// ── components/LabGrid.tsx ──────────────────────────────────────
// Lab selection page with modal detail view

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SCENARIOS, SCENARIOS_META } from '../laboratorios/laboratorios';
import { useLanguage, useSetLanguage, useT } from '../i18n/translations';
import { useColors, FONT_SANS } from './landing/constants';
import { useScenarioStore } from '../store/scenarioStore';
import { SiteHeader } from './landing/SiteHeader';
import { PageHero } from './landing/PageHero';
import { MarketingFooter } from './landing/MarketingFooter';
import { diffColor } from './labGrid/helpers';
import { ScenarioCard } from './labGrid/ScenarioCard';
import { ModalContent } from './labGrid/ModalContent';

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
  const [prevHover, setPrevHover] = useState(false);
  const [nextHover, setNextHover] = useState(false);

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
              border: `1px solid ${modalIndex === 0 ? '#334155' : prevHover ? '#10b98160' : '#334155'}`,
              color: modalIndex === 0 ? 'transparent' : prevHover ? '#10b981' : '#94a3b8',
              pointerEvents: modalIndex === 0 ? 'none' : 'auto',
              cursor: modalIndex === 0 ? 'default' : 'pointer',
              backdropFilter: 'blur(6px)',
            }}
            onMouseEnter={() => setPrevHover(true)}
            onMouseLeave={() => setPrevHover(false)}
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
              border: `1px solid ${modalIndex === SCENARIOS.length - 1 ? '#334155' : nextHover ? '#10b98160' : '#334155'}`,
              color: modalIndex === SCENARIOS.length - 1 ? 'transparent' : nextHover ? '#10b981' : '#94a3b8',
              pointerEvents: modalIndex === SCENARIOS.length - 1 ? 'none' : 'auto',
              cursor: modalIndex === SCENARIOS.length - 1 ? 'default' : 'pointer',
              backdropFilter: 'blur(6px)',
            }}
            onMouseEnter={() => setNextHover(true)}
            onMouseLeave={() => setNextHover(false)}
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
              diffLabel={diffLabel}
              onClose={closeModal}
              onStart={handleSelect}
            />
          </div>
        </div>
      )}
    </div>
  );
}

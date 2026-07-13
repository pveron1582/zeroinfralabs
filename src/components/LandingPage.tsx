// ── components/LandingPage.tsx ──────────────────────────────────────
// Marketing landing — hybrid dark hero + light content sections

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage, useSetLanguage, useT } from '../i18n/translations';
import { FeedbackModal } from './FeedbackModal';
import { DonationModal } from './DonationModal';
import { AnimatedDesktop } from './AnimatedDesktop';
import { AnimatedBrowser } from './AnimatedBrowser';
import { AnimatedCompletion } from './AnimatedCompletion';
import { AnimatedLabSelect } from './AnimatedLabSelect';
import { SiteHeader } from './landing/SiteHeader';
import { MarketingFooter } from './landing/MarketingFooter';
import { LandingLabPreview } from './landing/LandingLabPreview';
import { useColors, FONT_MONO, FONT_SANS } from './landing/constants';
import { useScenarioStore } from '../store/scenarioStore';

export function LandingPage() {
  const { lang } = useParams<{ lang: string }>();
  const [ready, setReady] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const language = useLanguage();
  const setLanguage = useSetLanguage();
  const t = useT();
  const colors = useColors();
  const isDark = useScenarioStore((s) => s.theme) === 'dark';
  const labsLink = `/${language}/labs`;

  useEffect(() => {
    if (lang && (lang === 'en' || lang === 'es')) setLanguage(lang);
  }, [lang, setLanguage]);

  useEffect(() => { const timer = setTimeout(() => setReady(true), 50); return () => clearTimeout(timer); }, []);

  const features = [
    { icon: '🚀', title: t('whyInstallTitle'), desc: t('whyInstallDesc') },
    { icon: '⌨️', title: t('whyTerminalTitle'), desc: t('whyTerminalDesc') },
    { icon: '📈', title: t('whyGuidedTitle'), desc: t('whyGuidedDesc') },
    { icon: '🎓', title: t('whoStudents'), desc: t('whoStudentsDesc') },
  ];

  const howSteps = [
    { n: '01', title: t('howStep1Title'), desc: t('howStep1Desc'), visual: <AnimatedLabSelect /> },
    { n: '02', title: t('howStep2Title'), desc: t('howStep2Desc'), visual: <AnimatedDesktop isEs={language === 'es'} /> },
    { n: '03', title: t('howStep3Title'), desc: t('howStep3Desc'), visual: <AnimatedBrowser url="http://192.168.1.11/wp-admin" /> },
    { n: '04', title: t('howStep4Title'), desc: t('howStep4Desc'), visual: <AnimatedCompletion labName="WordPress Vulnerable Lab" missionsCompleted={8} totalMissions={8} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: FONT_SANS, background: colors.pageBg }}>
      <SiteHeader
        showCta
        ctaLabel={t('ctaButton')}
        ctaTo={labsLink}
        onFeedback={() => setShowFeedback(true)}
        onDonation={() => setShowDonation(true)}
      />

      {/* Hero — dark */}
      <section className="relative overflow-hidden px-4 md:px-8 pt-10 pb-10 md:pt-12 md:pb-12 text-center"
        style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.5s ease-out' }}>
        {/* Background image — full coverage */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(/back_hero.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
        {/* Subtle dark overlay for text readability */}
        <div className="absolute inset-0 pointer-events-none opacity-60"
          style={{ background: `linear-gradient(180deg, #0f172a 0%, #1e293b 100%)` }} />
        <div className="absolute inset-0 pointer-events-none opacity-25"
          style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '28px 28px' }}/>
        <div className="relative max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-5 text-emerald-400/90" style={{ fontFamily: FONT_MONO }}>
            {t('pentestingLabSimulator')}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-5 text-white" style={{ lineHeight: 1.15 }}>
            {t('heroValueProp')}
          </h1>
          <p className="text-base md:text-lg text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed">
            {t('introSubtitle')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <HeroBadge label={t('badgeNoDownloads')} />
            <HeroBadge label={t('badgeNoRegistration')} />
            <HeroBadge label={t('badgeSafeEnv')} />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={labsLink}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.98] shadow-lg"
              style={{ background: `linear-gradient(135deg, ${colors.emerald}, ${colors.emeraldDark})`, boxShadow: '0 8px 32px #10b98140' }}>
              {t('ctaButton')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
            <a href="#labs-preview"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-300 border border-slate-600 hover:border-emerald-500/50 hover:text-white transition-colors">
              {t('labsPreviewScroll')}
            </a>
          </div>
        </div>
      </section>

      {/* Intro + terminal demo */}
      <section className="px-4 md:px-8 py-14 md:py-16" style={{ background: colors.pageBg }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: colors.text }}>{t('introTitle')}</h2>
            <p className="text-sm md:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: colors.textMuted }}>{t('introSubtitle')}</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <AnimatedDesktop isEs={language === 'es'} />
            <p className="text-center text-xs mt-3" style={{ color: colors.textMuted, fontFamily: FONT_MONO }}>
              {t('introDesktopCaption')}
            </p>
          </div>
        </div>
      </section>

      <LandingLabPreview language={language} labsLink={labsLink} />

      {/* Merged features — 4 cards */}
      <section className="px-4 md:px-8 py-14 md:py-16" style={{ background: colors.sectionBg }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: colors.text }}>{t('featuresMergedTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map(f => (
              <div key={f.title} className={`rounded-xl p-5 border transition-shadow ${isDark ? 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)]' : 'hover:shadow-md'}`}
                style={{ background: colors.sectionBg, borderColor: colors.border }}>
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className={`text-sm font-bold mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm mt-6" style={{ color: colors.textMuted }}>
            {t('badgeNoTimeLimit')} · {t('whyNoRegDesc')}
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-4 md:px-8 py-14 md:py-20" style={{ background: colors.pageBg }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12" style={{ color: colors.text }}>{t('howTitle')}</h2>
          <div className="space-y-14">
            {howSteps.map((step, i) => (
              <div key={step.n} className={`flex flex-col gap-6 md:gap-10 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                <div className="flex-1 max-w-md w-full">
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold mb-4 border ${isDark ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}
                    style={{ fontFamily: FONT_MONO }}>{step.n}</span>
                  <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>{step.desc}</p>
                </div>
                <div className="flex-1 w-full max-w-lg rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: colors.border }}>
                  {step.visual}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — dark strip */}
      <section className="px-4 md:px-8 py-16 md:py-20 text-center" style={{ background: colors.heroBg }}>
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">{t('ctaTitle')}</h2>
          <p className="text-sm md:text-base text-slate-400 mb-8">{t('ctaSubtitle')}</p>
          <Link to={labsLink}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-xl text-lg font-bold text-white transition-all hover:scale-[1.03]"
            style={{ background: `linear-gradient(135deg, ${colors.emerald}, ${colors.emeraldDark})`, boxShadow: '0 12px 40px #10b98135' }}>
            {t('ctaButton')}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
      </section>

      {/* Legal */}
      <section className="px-4 md:px-8 py-12" style={{ background: colors.sectionAlt }}>
        <div className="max-w-2xl mx-auto text-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.emerald} strokeWidth="1.5" className="mx-auto mb-3 opacity-70">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <h2 className="text-lg font-bold mb-2" style={{ color: colors.text }}>{t('legalDisclaimerTitle')}</h2>
          <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>{t('legalDisclaimerText')}</p>
        </div>
      </section>

      <MarketingFooter />

      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />
    </div>
  );
}

function HeroBadge({ label }: { label: string }) {
  return (
    <span className="px-3 py-1.5 rounded-full text-xs font-medium text-emerald-100 border border-emerald-500/30 bg-emerald-500/10"
      style={{ fontFamily: FONT_MONO }}>
      {label}
    </span>
  );
}

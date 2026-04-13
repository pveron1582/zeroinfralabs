// ── components/LandingPage.tsx ──────────────────────────────────────
// Marketing landing page for ZI Labs — explains the product and links to /labs

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage, useSetLanguage, useT } from '../i18n/translations';
import { FeedbackModal } from './FeedbackModal';
import { DonationModal } from './DonationModal';
import { AnimatedTerminal } from './AnimatedTerminal';
import { AnimatedBrowser } from './AnimatedBrowser';
import { AnimatedCompletion } from './AnimatedCompletion';
import { AnimatedLabSelect } from './AnimatedLabSelect';

export function LandingPage() {
  const { lang } = useParams<{ lang: string }>();
  const [ready, setReady] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const language = useLanguage();
  const setLanguage = useSetLanguage();
  const t = useT();

  // Set language from URL if provided
  useEffect(() => {
    if (lang && (lang === 'en' || lang === 'es')) {
      setLanguage(lang);
    }
  }, [lang, setLanguage]);

  useEffect(() => { const timer = setTimeout(() => setReady(true), 50); return () => clearTimeout(timer); }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0b1015', fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace" }}>
      {/* Background grid pattern */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #243030 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.7 }}/>
      <div className="fixed pointer-events-none" style={{ inset: 0, background: 'radial-gradient(ellipse 55% 35% at 50% 42%, #10b98118 0%, transparent 70%)' }}/>

      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-8 py-4" style={{ borderBottom: '1px solid #1c2a2a' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #047857)', boxShadow: '0 0 14px #10b98138' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          </div>
          <span className="text-sm font-bold text-gray-200 tracking-tight">ZI Labs</span>
          <span className="text-xs text-gray-500">v4.5</span>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          {/* Language selector */}
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1 border border-gray-700">
            <button onClick={() => setLanguage('en')}
              className={`px-2.5 md:px-3 py-2 text-sm font-mono rounded transition-all flex items-center gap-1.5 ${language === 'en' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}>
              <span className="text-base leading-none">🇺🇸</span>EN
            </button>
            <button onClick={() => setLanguage('es')}
              className={`px-2.5 md:px-3 py-2 text-sm font-mono rounded transition-all flex items-center gap-1.5 ${language === 'es' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}>
              <span className="text-base leading-none">🇪🇸</span>ES
            </button>
          </div>
          <Link to={`/${language}/blog`}
            className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-mono rounded-lg border border-gray-700 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all"
            title={language === 'es' ? 'Ir al blog' : 'Go to blog'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Blog
          </Link>
          <button onClick={() => setShowFeedback(true)}
            className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-mono rounded-lg border border-gray-700 text-gray-400 hover:text-violet-400 hover:border-violet-500/50 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Feedback
          </button>
          <button onClick={() => setShowDonation(true)}
            className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-mono rounded-lg border border-gray-700 text-gray-400 hover:text-amber-400 hover:border-amber-500/50 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {language === 'es' ? 'Apoyar' : 'Support'}
          </button>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-8 pt-14 pb-8 text-center"
        style={{ opacity: ready ? 1 : 0, transform: ready ? 'none' : 'translateY(10px)', transition: 'opacity 0.5s ease-out, transform 0.5s ease-out' }}>
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-12 md:w-16" style={{ background: 'linear-gradient(90deg, transparent, #2d3f3f)' }}/>
          <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">{t('pentestingLabSimulator')}</span>
          <div className="h-px w-12 md:w-16" style={{ background: 'linear-gradient(90deg, #2d3f3f, transparent)' }}/>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6" style={{ lineHeight: 1.1 }}>
          <span style={{ background: 'linear-gradient(100deg, #10b981 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('heroValueProp')}</span>
        </h1>
        {/* Value badges */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-8 flex-wrap px-4">
          <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-sm font-medium" style={{ background: '#10b98112', color: '#10b981', border: '1px solid #10b98128' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/><line x1="4" y1="4" x2="20" y2="20" strokeWidth="2.5"/></svg>
            {t('badgeNoDownloads')}
          </div>
          <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-sm font-medium" style={{ background: '#22d3ee12', color: '#22d3ee', border: '1px solid #22d3ee28' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="4" y1="4" x2="20" y2="20" strokeWidth="2.5"/></svg>
            {t('badgeNoRegistration')}
          </div>
          <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-sm font-medium" style={{ background: '#a78bfa12', color: '#a78bfa', border: '1px solid #a78bfa28' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            {t('badgeSafeEnv')}
          </div>
          <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-sm font-medium" style={{ background: '#f59e0b12', color: '#f59e0b', border: '1px solid #f59e0b28' }}>
            {t('badgeNoTimeLimit')}
          </div>
        </div>
        {/* CTA button */}
        <Link to={`/${language}/labs`}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-base font-bold transition-all hover:scale-[1.03] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #10b981, #047857)', color: '#fff', boxShadow: '0 0 20px #10b98140, 0 8px 24px #00000040' }}>
          {t('ctaButton')}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </Link>
      </section>

      {/* ── Section: Te presentamos ZI Labs ───────────────────────── */}
      <section className="relative z-10 px-6 md:px-8 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#d1d5db' }}>{t('introTitle')}</h2>
            <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">{t('introSubtitle')}</p>
          </div>

          {/* Animated terminal mockup */}
          <div className="max-w-3xl mx-auto">
            <AnimatedTerminal
              title=""
              prompt="root@kali:~$"
              command="nmap -sV 192.168.1.11"
              outputLines={[
                'Starting Nmap 7.95 ( https://nmap.org )',
                'Nmap scan report for 192.168.1.11',
                'Host is up (0.0034s latency).',
                'PORT     STATE SERVICE     VERSION',
                '22/tcp   open  ssh         OpenSSH 8.2p1',
                '80/tcp   open  http        Apache 2.4.41',
                '3306/tcp filtered mysql',
                '',
                '➜  2 open ports discovered',
              ]}
              outputDelays={[250, 180, 200, 300, 150, 150, 150, 100, 400]}
              accentColor="#10b981"
            />
          </div>
        </div>
      </section>

      {/* ── Section: Why ZI Labs ──────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-8 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: '#d1d5db' }}>{t('whyTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            <FeatureCard
              icon="🚀"
              title={t('whyInstallTitle')}
              desc={t('whyInstallDesc')}
              accent="#10b981"
            />
            <FeatureCard
              icon="🔑"
              title={t('whyNoRegTitle')}
              desc={t('whyNoRegDesc')}
              accent="#22d3ee"
            />
            <FeatureCard
              icon="⌨️"
              title={t('whyTerminalTitle')}
              desc={t('whyTerminalDesc')}
              accent="#a78bfa"
            />
            <FeatureCard
              icon="🔒"
              title={t('whySafeTitle')}
              desc={t('whySafeDesc')}
              accent="#f87171"
            />
            <FeatureCard
              icon="📈"
              title={t('whyGuidedTitle')}
              desc={t('whyGuidedDesc')}
              accent="#f59e0b"
            />
            <FeatureCard
              icon="⏱️"
              title={t('whyEnumTitle')}
              desc={t('whyEnumDesc')}
              accent="#34d399"
            />
          </div>
        </div>
      </section>

      {/* ── Section: Who is this for? ─────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-8 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: '#d1d5db' }}>{t('whoTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AudienceCard
              icon="🎓"
              title={t('whoStudents')}
              desc={t('whoStudentsDesc')}
              accent="#22d3ee"
            />
            <AudienceCard
              icon="🧠"
              title={t('whoSelfTaught')}
              desc={t('whoSelfTaughtDesc')}
              accent="#10b981"
            />
            <AudienceCard
              icon="🖥️"
              title={t('whoNoVMs')}
              desc={t('whoNoVMsDesc')}
              accent="#f59e0b"
            />
            <AudienceCard
              icon="👀"
              title={t('whoCerts')}
              desc={t('whoCertsDesc')}
              accent="#f87171"
            />
          </div>
        </div>
      </section>

      {/* ── Section: How it works ─────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-14" style={{ color: '#d1d5db' }}>{t('howTitle')}</h2>

          {/* Step 01: Choose a lab — shifted left */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-16"
            style={{ transform: 'translateX(-6%)' }}>
            <div className="flex-1 max-w-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full text-base font-bold mb-4"
                style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98130' }}>
                01
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#d1d5db' }}>{t('howStep1Title')}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{t('howStep1Desc')}</p>
            </div>
            <div className="flex-1 w-full max-w-lg">
              <AnimatedLabSelect />
            </div>
          </div>

          {/* Step 02: Open the terminal — shifted slightly left */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-16"
            style={{ transform: 'translateX(-2%)' }}>
            <div className="flex-1 max-w-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full text-base font-bold mb-4"
                style={{ background: '#22d3ee20', color: '#22d3ee', border: '1px solid #22d3ee30' }}>
                02
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#d1d5db' }}>{t('howStep2Title')}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{t('howStep2Desc')}</p>
            </div>
            <div className="flex-1 w-full max-w-lg">
              <AnimatedTerminal
                title=""
                prompt="root@kali:~$"
                command="nmap -sV 192.168.1.11"
                outputLines={[
                  'Starting Nmap 7.95 ( https://nmap.org )',
                  'Nmap scan report for 192.168.1.11',
                  'Host is up (0.0034s latency).',
                  'PORT     STATE SERVICE     VERSION',
                  '22/tcp   open  ssh         OpenSSH 8.2p1',
                  '80/tcp   open  http        Apache 2.4.41',
                  '3306/tcp filtered mysql',
                  '',
                  '➜  2 open ports discovered',
                ]}
                outputDelays={[250, 180, 200, 300, 150, 150, 150, 100, 400]}
                accentColor="#22d3ee"
              />
            </div>
          </div>

          {/* Step 03: Start hacking — shifted slightly right */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-16"
            style={{ transform: 'translateX(2%)' }}>
            <div className="flex-1 max-w-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full text-base font-bold mb-4"
                style={{ background: '#a78bfa20', color: '#a78bfa', border: '1px solid #a78bfa30' }}>
                03
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#d1d5db' }}>{t('howStep3Title')}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{t('howStep3Desc')}</p>
            </div>
            <div className="flex-1 w-full max-w-lg">
              <AnimatedBrowser
                url="http://192.168.1.11/wp-admin"
              />
            </div>
          </div>

          {/* Step 04: Complete the labs — shifted further right */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10"
            style={{ transform: 'translateX(6%)' }}>
            <div className="flex-1 max-w-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full text-base font-bold mb-4"
                style={{ background: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b30' }}>
                04
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#d1d5db' }}>{t('howStep4Title')}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{t('howStep4Desc')}</p>
            </div>
            <div className="flex-1 w-full max-w-lg">
              <AnimatedCompletion
                labName="WordPress Vulnerable Lab"
                missionsCompleted={8}
                totalMissions={8}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA: View all labs ────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-8 py-14 md:py-20 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#d1d5db' }}>{t('ctaTitle')}</h2>
          <p className="text-sm md:text-base text-gray-400 mb-8">{t('ctaSubtitle')}</p>
          <Link to={`/${language}/labs`}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-xl text-lg font-bold transition-all hover:scale-[1.03] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #10b981, #047857)', color: '#fff', boxShadow: '0 0 30px #10b98140, 0 12px 32px #00000050' }}>
            {t('ctaButton')}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
      </section>

      {/* ── Legal Disclaimer ──────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-8 py-10 md:py-14"
        style={{ background: '#0d1117' }}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ opacity: 0.6 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h2 className="text-lg md:text-xl font-bold mb-3" style={{ color: '#d1d5db' }}>{t('legalDisclaimerTitle')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xl mx-auto">{t('legalDisclaimerText')}</p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="relative z-10 py-4 text-center text-xs text-gray-600" style={{ borderTop: '1px solid #1c2a2a' }}>
        <div className="mb-1 text-gray-500">{t('privacyNotice')}</div>
        ZI Labs · Controlled practice environment · All scenarios are fictional
        <div className="mt-1 text-gray-500">Designed &amp; Developed by <span className="text-violet-400">@pabloveron</span></div>
      </footer>

      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes trophyPop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 0.7; } 100% { transform: translateY(100px) rotate(360deg); opacity: 0; } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out both; }
      `}</style>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function FeatureCard({ icon, title, desc, accent }: { icon: string; title: string; desc: string; accent: string }) {
  return (
    <div className="rounded-xl p-5 transition-all hover:-translate-y-1"
      style={{ background: '#0d1117', border: `1px solid ${accent}20`, boxShadow: '0 4px 12px #00000030' }}>
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-sm font-bold mb-2" style={{ color: '#d1d5db' }}>{title}</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function AudienceCard({ icon, title, desc, accent }: { icon: string; title: string; desc: string; accent: string }) {
  return (
    <div className="rounded-xl p-5 transition-all hover:-translate-y-1"
      style={{ background: '#0d1117', border: `1px solid ${accent}20`, boxShadow: '0 4px 12px #00000030' }}>
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-sm font-bold mb-1" style={{ color: accent }}>{title}</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

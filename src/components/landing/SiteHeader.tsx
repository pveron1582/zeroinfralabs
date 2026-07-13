// Shared sticky header for landing, labs, and blog

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage, useSetLanguage } from '../../i18n/translations';
import { useColors, FONT_MONO, FONT_SANS } from './constants';
import { useScenarioStore } from '../../store/scenarioStore';

export type SiteNav = 'labs' | 'blog';

interface SiteHeaderProps {
  activeNav?: SiteNav | null;
  showCta?: boolean;
  ctaLabel?: string;
  ctaTo?: string;
  onFeedback?: () => void;
  onDonation?: () => void;
  getLangPath?: (lang: 'en' | 'es') => string;
}

export function SiteHeader({
  activeNav,
  showCta,
  ctaLabel,
  ctaTo,
  onFeedback,
  onDonation,
  getLangPath,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const language = useLanguage();
  const setLanguage = useSetLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const colors = useColors();
  const theme = useScenarioStore((s) => s.theme);
  const isDark = theme === 'dark';

  const switchLang = (lang: 'en' | 'es') => {
    setLanguage(lang);
    const target = getLangPath ? getLangPath(lang) : location.pathname.replace(/^\/(es|en)/, `/${lang}`);
    navigate(target, { replace: true });
    setMenuOpen(false);
  };

  const close = () => setMenuOpen(false);
  const linkClass = 'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors';
  const navClass = (nav: SiteNav) =>
    `${linkClass} ${activeNav === nav
      ? `${isDark ? 'text-emerald-400 bg-emerald-500/10' : 'text-emerald-700 bg-emerald-50'} font-semibold`
      : `${isDark ? 'text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'}`}`;

  const labsLink = `/${language}/labs`;
  const blogLink = `/${language}/blog`;

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{ background: isDark ? 'rgba(10,14,20,0.92)' : 'rgba(255,255,255,0.92)', borderColor: colors.border, fontFamily: FONT_SANS }}>
      <div className="flex items-center justify-between px-4 md:px-8 py-3 max-w-6xl mx-auto">
        <Link to={`/${language}`} className="flex items-center shrink-0" onClick={close}>
          <img src="/Logos/VEGA_1776091667535.jpg" alt="VEGA"
            className="h-8 w-auto object-contain" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to={labsLink} className={navClass('labs')}>Labs</Link>
          <Link to={blogLink} className={navClass('blog')}>Blog</Link>
          {onFeedback && (
            <button type="button" onClick={onFeedback}
              className={`${linkClass} ${isDark ? 'text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'}`}>
              Feedback
            </button>
          )}
          {onDonation && (
            <button type="button" onClick={onDonation}
              className={`${linkClass} ${isDark ? 'text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'}`}>
              {language === 'es' ? 'Apoyar' : 'Support'}
            </button>
          )}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <LangToggle language={language} onSwitch={switchLang} />
          {showCta && ctaTo && ctaLabel && (
            <Link to={ctaTo}
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${colors.emerald}, ${colors.emeraldDark})` }}>
              {ctaLabel}
            </Link>
          )}
          <button type="button" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: colors.textMuted }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t px-4 py-3 flex flex-col gap-1" style={{ borderColor: colors.border, background: colors.pageBg }}>
          <Link to={labsLink} onClick={close} className={navClass('labs')}>Labs</Link>
          <Link to={blogLink} onClick={close} className={navClass('blog')}>Blog</Link>
          {onFeedback && (
            <button type="button" onClick={() => { onFeedback(); close(); }}
              className={`${linkClass} ${isDark ? 'text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'}`}>
              Feedback
            </button>
          )}
          {onDonation && (
            <button type="button" onClick={() => { onDonation(); close(); }}
              className={`${linkClass} ${isDark ? 'text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'}`}>
              {language === 'es' ? 'Apoyar' : 'Support'}
            </button>
          )}
        </div>
      )}
    </header>
  );
}

function LangToggle({ language, onSwitch }: { language: string; onSwitch: (l: 'en' | 'es') => void }) {
  const colors = useColors();
  const theme = useScenarioStore((s) => s.theme);
  const isDark = theme === 'dark';
  return (
    <div className="flex items-center gap-0.5 rounded-lg p-0.5 border" style={{ borderColor: colors.border, fontFamily: FONT_MONO }}>
      {(['en', 'es'] as const).map(lang => (
        <button key={lang} type="button" onClick={() => onSwitch(lang)}
          className={`px-2 py-1.5 text-xs rounded-md transition-all ${language === lang
            ? `${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'} font-semibold`
            : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function ThemeToggle() {
  const theme = useScenarioStore((s) => s.theme);
  const setTheme = useScenarioStore((s) => s.setTheme);
  const colors = useColors();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-7 h-7 rounded-md flex items-center justify-center text-xs transition-colors border"
      style={{ borderColor: colors.border, color: isDark ? '#fbbf24' : colors.textMuted, background: isDark ? '#1e293b' : 'transparent' }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}

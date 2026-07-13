// Shared footer for marketing pages (landing, labs, blog)

import { useLanguage, useT } from '../../i18n/translations';
import { useColors, FONT_SANS } from './constants';

export function MarketingFooter() {
  const colors = useColors();  const language = useLanguage();
  const t = useT();

  return (
    <footer className="py-5 text-center text-xs border-t" style={{ borderColor: colors.border, color: colors.textMuted, background: colors.sectionBg, fontFamily: FONT_SANS }}>
      <div className="mb-1 max-w-lg mx-auto px-4">{t('privacyNotice')}</div>
      ZI Labs · Controlled practice environment · All scenarios are fictional
      <div className="mt-1">Designed &amp; Developed by <a href="https://www.linkedin.com/in/pablomarceloveron" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-medium hover:text-emerald-500">@pabloveron</a></div>

    </footer>
  );
}

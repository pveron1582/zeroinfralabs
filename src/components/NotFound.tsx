// ── components/NotFound.tsx ──────────────────────────────────────
// Fallback para rutas desconocidas (App.tsx → <Route path="*">).
// Antes de esto, una URL que no matcheaba ninguna ruta dejaba el documento vacío
// (Vercel reescribe todo lo que no sea asset a index.html). Ver docs/mejoras-deep.md §2.3.

import { Link } from 'react-router-dom';
import { useLanguage, useT } from '../i18n/translations';

export function NotFound() {
  const t = useT();
  const language = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';

  const linkBase = 'px-4 py-2 rounded-lg text-sm transition-colors';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-950 text-gray-200 px-6 text-center">
      <p className="text-6xl font-black font-mono text-emerald-500">404</p>
      <h1 className="text-xl font-bold font-mono">{t('notFoundTitle')}</h1>
      <p className="text-sm text-gray-400 max-w-md">{t('notFoundBody')}</p>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
        <Link
          to={`/${lang}/labs`}
          className={`${linkBase} bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400`}
        >
          {t('notFoundGoLabs')}
        </Link>
        <Link
          to={`/${lang}/academy`}
          className={`${linkBase} border border-slate-700 font-medium text-gray-300 hover:border-slate-500 hover:text-white`}
        >
          {t('notFoundGoAcademy')}
        </Link>
        <Link
          to={`/${lang}`}
          className={`${linkBase} font-medium text-gray-400 hover:text-white`}
        >
          {t('backToHome')}
        </Link>
      </div>
    </div>
  );
}
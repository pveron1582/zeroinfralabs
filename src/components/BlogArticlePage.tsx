// ── BlogArticlePage.tsx ──────────────────────────────────────────────
// Blog article page at /:lang/blog/:slug

import { Link, useParams, Navigate } from 'react-router-dom';
import { BLOG_ARTICLES } from '../blog/articles';
import { useT } from '../i18n/translations';
import type { Language } from '../i18n/translations';
import { useColors, FONT_MONO, FONT_SANS } from './landing/constants';
import { useScenarioStore } from '../store/scenarioStore';
import { SiteHeader } from './landing/SiteHeader';
import { MarketingFooter } from './landing/MarketingFooter';

function renderMarkdown(text: string, isDark: boolean, colors: ReturnType<typeof useColors>): string {
  const h2Color = isDark ? '#34d399' : '#065f46';
  const strongColor = isDark ? '#34d399' : '#047857';
  const bodyColor = isDark ? '#cbd5e1' : '#475569';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const mutedColor = isDark ? '#64748b' : '#94a3b8';
  return text
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) {
        return `<h2 class="text-xl font-bold mt-8 mb-3" style="color:${h2Color}">${trimmed.slice(3)}</h2>`;
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return `<p class="my-2"><strong style="color:${strongColor}">${trimmed.slice(2, -2)}</strong></p>`;
      }
      if (trimmed.startsWith('- ')) {
        return `<li class="ml-4 list-disc text-sm leading-relaxed" style="color:${bodyColor}">${trimmed.slice(2)}</li>`;
      }
      if (trimmed.startsWith('![')) {
        const match = trimmed.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (match) {
          return `<figure class="my-6"><img src="${match[2]}" alt="${match[1]}" class="w-full rounded-xl" style="border:1px solid ${borderColor}" /><figcaption class="text-center text-xs mt-2" style="color:${mutedColor};font-family:${FONT_MONO}">${match[1]}</figcaption></figure>`;
        }
      }
      if (trimmed === '') return '';
      return `<p class="text-sm leading-relaxed my-2" style="color:${bodyColor}">${trimmed}</p>`;
    })
    .join('\n');
}

export function BlogArticlePage() {
  const { lang, slug } = useParams<{ lang: string; slug: string }>();
  const t = useT();
  const colors = useColors();
  const isDark = useScenarioStore((s) => s.theme) === 'dark';
  const language = (lang === 'es' ? 'es' : 'en') as Language;

  const article = BLOG_ARTICLES.find(a => a.slug === slug || a.slugEs === slug);

  if (!article) {
    return <Navigate to={`/${language}/blog`} replace />;
  }

  const title = language === 'es' ? (article.titleEs || article.title) : article.title;
  const content = language === 'es' ? (article.contentEs || article.content) : article.content;
  const date = new Date(article.date).toLocaleDateString(language === 'es' ? 'es-AR' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const getLangPath = (targetLang: 'en' | 'es') => {
    const targetSlug = targetLang === 'es' ? (article.slugEs || article.slug) : article.slug;
    return `/${targetLang}/blog/${targetSlug}`;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: colors.pageBg, fontFamily: FONT_SANS }}>
      <SiteHeader activeNav="blog" showCta ctaLabel={t('backToLanding')} ctaTo={`/${language}`} getLangPath={getLangPath} />

      <main className="flex-1 px-4 md:px-8 py-10">
        <div className="max-w-3xl mx-auto">
          <Link to={`/${language}/blog`}
            className={`inline-flex items-center gap-2 text-sm transition-colors mb-8 ${isDark ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-500 hover:text-emerald-700'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            {language === 'es' ? 'Volver al blog' : 'Back to blog'}
          </Link>

          <header className="mb-8 pb-6 border-b" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-2 text-xs mb-4" style={{ fontFamily: FONT_MONO, color: colors.textMuted }}>
              <time>{date}</time>
              <span>·</span>
              <span>{article.author}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight" style={{ color: colors.text }}>{title}</h1>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {article.tags.map(tag => (
                <span key={tag} className={`text-xs px-2 py-0.5 rounded-full border ${isDark ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-emerald-700 bg-emerald-50 border-emerald-100'}`} style={{ fontFamily: FONT_MONO }}>
                  #{tag}
                </span>
              ))}
            </div>
          </header>

          <div className="article-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(content, isDark, colors) }} />

          <div className="mt-12 pt-6 rounded-xl p-5" style={{ background: colors.sectionBg, border: `1px solid ${colors.border}` }}>
            <p className="text-sm mb-3" style={{ color: colors.textMuted }}>
              {language === 'es' ? '¿Querés practicar en nuestro simulador ya mismo?' : 'Want to practice with our simulator yourself?'}
            </p>
            <Link to={`/${language}/labs`}
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg text-white transition-all hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${colors.emerald}, ${colors.emeraldDark})` }}>
              {language === 'es' ? 'Empezar gratis' : 'Start for free'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

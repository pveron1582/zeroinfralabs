// ── BlogListPage.tsx ─────────────────────────────────────────────────
// Blog list page at /:lang/blog

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BLOG_ARTICLES } from '../blog/articles';
import { useT } from '../i18n/translations';
import type { Language } from '../i18n/translations';
import { useColors, FONT_MONO, FONT_SANS } from './landing/constants';
import { useScenarioStore } from '../store/scenarioStore';
import { SiteHeader } from './landing/SiteHeader';
import { PageHero } from './landing/PageHero';
import { MarketingFooter } from './landing/MarketingFooter';

function ArticleCard({ article, lang }: { article: typeof BLOG_ARTICLES[0]; lang: Language }) {
  const [hovered, setHovered] = useState(false);
  const colors = useColors();
  const isDark = useScenarioStore((s) => s.theme) === 'dark';
  const title = lang === 'es' ? (article.titleEs || article.title) : article.title;
  const excerpt = lang === 'es' ? (article.excerptEs || article.excerpt) : article.excerpt;
  const date = new Date(article.date).toLocaleDateString(lang === 'es' ? 'es-AR' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <Link
      to={`/${lang}/blog/${lang === 'es' ? (article.slugEs || article.slug) : article.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col overflow-hidden select-none rounded-xl transition-all"
      style={{
        background: isDark ? '#11161f' : '#ffffff',
        border: `1px solid ${hovered ? colors.emerald + '50' : colors.border}`,
        boxShadow: hovered ? '0 12px 32px rgba(16,185,129,0.12)' : '0 2px 8px rgba(15,23,42,0.05)',
        transform: hovered ? 'translateY(-3px)' : 'none',
      }}
    >
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs" style={{ fontFamily: FONT_MONO, color: colors.textMuted }}>
          <time>{date}</time>
          <span>·</span>
          <span>{article.author}</span>
        </div>
        <h3 className="text-base font-bold leading-snug transition-colors" style={{ color: hovered ? colors.emeraldDark : colors.text }}>
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>{excerpt}</p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {article.tags.map(tag => (
            <span key={tag} className={`text-xs px-2 py-0.5 rounded-full border ${isDark ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-emerald-700 bg-emerald-50 border-emerald-100'}`} style={{ fontFamily: FONT_MONO }}>
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-end pt-2" style={{ borderTop: `1px solid ${colors.border}` }}>
          <span className="text-xs font-semibold transition-colors" style={{ color: hovered ? colors.emerald : colors.textMuted }}>
            {lang === 'es' ? 'Leer artículo →' : 'Read article →'}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function BlogListPage() {
  const { lang } = useParams<{ lang: string }>();
  const t = useT();
  const colors = useColors();
  const language = (lang === 'es' ? 'es' : 'en') as Language;

  const articles = BLOG_ARTICLES.filter(article => {
    if (language === 'es') return !!article.contentEs;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: colors.sectionBg, fontFamily: FONT_SANS }}>
      <SiteHeader activeNav="blog" showCta ctaLabel={t('backToLanding')} ctaTo={`/${language}`} />

      <PageHero
        eyebrow="ZI Labs Blog"
        title={language === 'es' ? 'Blog de Ciberseguridad' : 'Cybersecurity Blog'}
        subtitle={language === 'es'
          ? 'Notas, guías y recursos sobre hacking y seguridad informática'
          : 'Notes, guides and resources on hacking and information security'}
      />

      <main className="flex-1 px-4 md:px-8 py-10 -mt-2">
        {articles.length === 0 ? (
          <div className="max-w-3xl mx-auto text-center py-16">
            <p className="text-sm" style={{ color: colors.textMuted }}>
              {language === 'es' ? 'No hay artículos disponibles aún. ¡Volvé pronto!' : 'No articles available yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {articles.map(article => (
              <ArticleCard key={article.slug} article={article} lang={language} />
            ))}
          </div>
        )}
      </main>

      <MarketingFooter />
    </div>
  );
}

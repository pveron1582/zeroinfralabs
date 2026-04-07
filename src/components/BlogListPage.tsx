// ── BlogListPage.tsx ─────────────────────────────────────────────────
// Blog list page at /:lang/blog

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BLOG_ARTICLES } from '../blog/articles';
import { useT } from '../i18n/translations';
import type { Language } from '../i18n/translations';

function ArticleCard({ article, lang }: { article: typeof BLOG_ARTICLES[0]; lang: Language }) {
  const [hovered, setHovered] = useState(false);
  const title = lang === 'es' ? (article.titleEs || article.title) : article.title;
  const excerpt = lang === 'es' ? (article.excerptEs || article.excerpt) : article.excerpt;
  const date = new Date(article.date).toLocaleDateString(lang === 'es' ? 'es-AR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link
      to={`/${lang}/blog/${lang === 'es' ? (article.slugEs || article.slug) : article.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col overflow-hidden select-none"
      style={{
        background: '#0d1117',
        border: `1px solid ${hovered ? '#10b98170' : '#1e2d2d'}`,
        borderRadius: '10px',
        boxShadow: hovered ? '0 0 0 1px #10b98120, 0 16px 48px #10b98112, inset 0 1px 0 #10b98115' : '0 2px 10px #00000060',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
          <time>{date}</time>
          <span>·</span>
          <span>{article.author}</span>
        </div>
        <h3
          className="text-base font-bold font-mono leading-snug transition-colors duration-200"
          style={{ color: hovered ? '#10b981' : '#d1d5db' }}
        >
          {title}
        </h3>
        <p className="text-xs font-mono text-gray-500 leading-relaxed">{excerpt}</p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {article.tags.map(tag => (
            <span
              key={tag}
              className="text-xs font-mono px-2 py-0.5 rounded"
              style={{ background: '#10b98112', color: '#6b7280', border: '1px solid #243030' }}
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-end pt-2" style={{ borderTop: '1px solid #1e2d2d' }}>
          <span
            className="text-xs font-mono font-bold transition-colors duration-200"
            style={{ color: hovered ? '#10b981' : '#3d5050' }}
          >
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
  const language = (lang === 'es' ? 'es' : 'en') as Language;

  const articles = BLOG_ARTICLES.filter(article => {
    if (language === 'es') return !!article.contentEs;
    return true;
  });

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0b1015', fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace" }}
    >
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #243030 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.7 }}/>
      <div className="fixed pointer-events-none" style={{ inset: 0, background: 'radial-gradient(ellipse 55% 35% at 50% 42%, #10b98118 0%, transparent 70%)' }}/>

      <header className="relative z-10 flex items-center justify-between px-8 py-4" style={{ borderBottom: '1px solid #1c2a2a' }}>
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #047857)', boxShadow: '0 0 14px #10b98138' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-200 tracking-tight">ZI Labs</span>
          </Link>
          <span className="text-xs text-gray-500">Blog</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <Link
            to={language === 'es' ? '/en/blog' : '/es/blog'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-gray-800 hover:text-gray-200 hover:border-gray-600"
            style={{ borderColor: '#374151', color: '#6b7280' }}
          >
            {language === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-gray-800 hover:text-gray-200 hover:border-gray-600"
            style={{ borderColor: '#374151', color: '#6b7280' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            {t('backToLabs')}
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-8 py-10">
        <div>
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold font-mono mb-3" style={{ background: 'linear-gradient(100deg, #10b981 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {language === 'es' ? 'Blog de Ciberseguridad' : 'Cybersecurity Blog'}
            </h1>
            <p className="text-sm font-mono text-gray-500">
              {language === 'es' ? 'Notas, guías y recursos sobre hacking y seguridad informática' : 'Notes, guides and resources on hacking and information security'}
            </p>
          </div>
          {articles.length === 0 ? (
            <div className="max-w-3xl mx-auto text-center py-16">
              <p className="text-gray-500 font-mono text-sm">
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
        </div>
      </main>

      <footer className="relative z-10 py-4 text-center text-xs text-gray-600" style={{ borderTop: '1px solid #1c2a2a' }}>
        ZI Labs · {language === 'es' ? 'Blog de Ciberseguridad' : 'Cybersecurity Blog'}
      </footer>
    </div>
  );
}

// ── BlogArticlePage.tsx ──────────────────────────────────────────────
// Blog article page at /:lang/blog/:slug

import { Link, useParams, Navigate } from 'react-router-dom';
import { BLOG_ARTICLES } from '../blog/articles';
import { useT } from '../i18n/translations';
import type { Language } from '../i18n/translations';

function renderMarkdown(text: string): string {
  return text
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) {
        return `<h2 class="text-xl font-bold font-mono mt-8 mb-3" style="color: #10b981">${trimmed.slice(3)}</h2>`;
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return `<p class="my-2"><strong style="color: #22d3ee">${trimmed.slice(2, -2)}</strong></p>`;
      }
      if (trimmed.startsWith('- ')) {
        return `<li class="ml-4 list-disc text-gray-300 font-mono text-sm leading-relaxed">${trimmed.slice(2)}</li>`;
      }
      if (trimmed.startsWith('![')) {
        const match = trimmed.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (match) {
          return `<figure class="my-6"><img src="${match[2]}" alt="${match[1]}" class="w-full rounded-xl border border-gray-800 shadow-2xl" /><figcaption class="text-center text-xs font-mono text-gray-500 mt-2">${match[1]}</figcaption></figure>`;
        }
      }
      if (trimmed === '') return '';
      return `<p class="text-gray-300 font-mono text-sm leading-relaxed my-1">${trimmed}</p>`;
    })
    .join('\n');
}

export function BlogArticlePage() {
  const { lang, slug } = useParams<{ lang: string; slug: string }>();
  const t = useT();
  const language = (lang === 'es' ? 'es' : 'en') as Language;

  const article = BLOG_ARTICLES.find(a => a.slug === slug || a.slugEs === slug);

  if (!article) {
    return <Navigate to={`/${language}/blog`} replace />;
  }

  const articleSlug = language === 'es' ? (article.slugEs || article.slug) : article.slug;

  const title = language === 'es' ? (article.titleEs || article.title) : article.title;
  const content = language === 'es' ? (article.contentEs || article.content) : article.content;
  const date = new Date(article.date).toLocaleDateString(language === 'es' ? 'es-AR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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
          <Link to={`/${language}/blog`} className="text-xs text-gray-500 hover:text-emerald-400 transition-colors">Blog</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/${language === 'es' ? 'en' : 'es'}/blog/${language === 'es' ? article.slug : (article.slugEs || article.slug)}`}
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
            {language === 'es' ? 'Volver a Labs' : 'Back to Labs'}
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-8 py-10">
        <div className="max-w-3xl mx-auto">
          <Link
            to={`/${language}/blog`}
            className="flex items-center gap-2 text-sm font-mono text-gray-400 hover:text-emerald-400 transition-colors mb-8"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            {language === 'es' ? 'Volver al blog' : 'Back to blog'}
          </Link>

          <header className="mb-8">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mb-4">
              <time>{date}</time>
              <span>·</span>
              <span>{article.author}</span>
            </div>
            <h1 className="text-2xl font-bold font-mono leading-tight" style={{ color: '#10b981' }}>
              {title}
            </h1>
            <div className="flex flex-wrap gap-1.5 mt-4">
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
          </header>

          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />

          <div className="mt-12 pt-6" style={{ borderTop: '1px solid #1e2d2d' }}>
            <p className="text-sm font-mono text-gray-500 mb-3">
              {language === 'es' ? '¿Querés practicar en nuestro simulador ya mismo?' : 'Want to practice with our simulator yourself?'}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-mono font-bold px-4 py-2 rounded-lg transition-all"
              style={{
                background: '#10b98118',
                color: '#10b981',
                border: '1px solid #10b98128',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
              </svg>
              {language === 'es' ? 'Ir a ZI Labs' : 'Go to ZI Labs'}
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-4 text-center text-xs text-gray-600" style={{ borderTop: '1px solid #1c2a2a' }}>
        ZI Labs · {language === 'es' ? 'Blog de Ciberseguridad' : 'Cybersecurity Blog'}
      </footer>
    </div>
  );
}

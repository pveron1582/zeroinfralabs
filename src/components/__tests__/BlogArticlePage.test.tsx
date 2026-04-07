// ── components/__tests__/BlogArticlePage.test.tsx ──────────────────
// Tests para el componente BlogArticlePage

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BlogArticlePage } from '../BlogArticlePage';
import { BLOG_ARTICLES } from '../../blog/articles';
import { useScenarioStore } from '../../store/scenarioStore';

function renderWithRoute(lang: string, slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/${lang}/blog/${slug}`]}>
      <Routes>
        <Route path="/:lang/blog/:slug" element={<BlogArticlePage />} />
        <Route path="/:lang/blog" element={<div>Blog List</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  useScenarioStore.setState((state) => ({
    ...state,
    language: 'en',
  }), true);
});

describe('BlogArticlePage en inglés', () => {
  it('debe mostrar el artículo con el slug correcto', () => {
    renderWithRoute('en', BLOG_ARTICLES[0].slug);

    expect(screen.getByText(BLOG_ARTICLES[0].title)).toBeInTheDocument();
  });

  it('debe mostrar la fecha y el autor', () => {
    renderWithRoute('en', BLOG_ARTICLES[0].slug);

    expect(screen.getByText(BLOG_ARTICLES[0].author)).toBeInTheDocument();
  });

  it('debe mostrar los tags del artículo', () => {
    renderWithRoute('en', BLOG_ARTICLES[0].slug);

    BLOG_ARTICLES[0].tags.forEach(tag => {
      expect(screen.getByText(`#${tag}`)).toBeInTheDocument();
    });
  });

  it('debe mostrar el botón "Back to blog"', () => {
    renderWithRoute('en', BLOG_ARTICLES[0].slug);

    expect(screen.getByText('Back to blog')).toBeInTheDocument();
  });

  it('debe mostrar el CTA "Go to ZI Labs"', () => {
    renderWithRoute('en', BLOG_ARTICLES[0].slug);

    expect(screen.getByText('Go to ZI Labs')).toBeInTheDocument();
  });

  it('debe mostrar el contenido del artículo con secciones', () => {
    renderWithRoute('en', BLOG_ARTICLES[0].slug);

    const content = BLOG_ARTICLES[0].content;
    const headings = content.split('\n').filter(line => line.trim().startsWith('## '));
    headings.forEach(heading => {
      expect(screen.getByText(heading.slice(3).trim())).toBeInTheDocument();
    });
  });

  it('debe redirigir a /en/blog si el slug no existe', () => {
    render(
      <MemoryRouter initialEntries={['/en/blog/non-existent-slug']}>
        <Routes>
          <Route path="/:lang/blog/:slug" element={<BlogArticlePage />} />
          <Route path="/:lang/blog" element={<div>Blog List</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Blog List')).toBeInTheDocument();
  });

  it('debe mostrar el link de cambio de idioma a ES', () => {
    renderWithRoute('en', BLOG_ARTICLES[0].slug);

    expect(screen.getByText(/🇪🇸 ES/)).toBeInTheDocument();
  });
});

describe('BlogArticlePage en español', () => {
  it('debe mostrar el título en español', () => {
    renderWithRoute('es', BLOG_ARTICLES[0].slugEs!);

    expect(screen.getByText(BLOG_ARTICLES[0].titleEs!)).toBeInTheDocument();
  });

  it('debe mostrar "Volver al blog"', () => {
    renderWithRoute('es', BLOG_ARTICLES[0].slugEs!);

    expect(screen.getByText('Volver al blog')).toBeInTheDocument();
  });

  it('debe mostrar "Volver a Labs"', () => {
    renderWithRoute('es', BLOG_ARTICLES[0].slugEs!);

    expect(screen.getByText('Volver a Labs')).toBeInTheDocument();
  });

  it('debe mostrar el link de cambio de idioma a EN', () => {
    renderWithRoute('es', BLOG_ARTICLES[0].slugEs!);

    expect(screen.getByText(/🇺🇸 EN/)).toBeInTheDocument();
  });

  it('debe mostrar el contenido en español', () => {
    renderWithRoute('es', BLOG_ARTICLES[0].slugEs!);

    const content = BLOG_ARTICLES[0].contentEs!;
    const headings = content.split('\n').filter(line => line.trim().startsWith('## '));
    headings.forEach(heading => {
      expect(screen.getByText(heading.slice(3).trim())).toBeInTheDocument();
    });
  });
});

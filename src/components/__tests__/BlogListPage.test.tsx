// ── components/__tests__/BlogListPage.test.tsx ─────────────────────
// Tests para el componente BlogListPage

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BlogListPage } from '../BlogListPage';
import { BLOG_ARTICLES } from '../../blog/articles';
import { useScenarioStore } from '../../store/scenarioStore';

function renderWithRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/:lang/blog" element={<BlogListPage />} />
        <Route path="/" element={<div>Home</div>} />
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

describe('BlogListPage en inglés', () => {
  it('debe renderizar el header con el logo y título del blog', () => {
    renderWithRoute('/en/blog');

    expect(screen.getByText('ZI Labs')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
  });

  it('debe mostrar el título de la página de blog en inglés', () => {
    renderWithRoute('/en/blog');

    expect(screen.getByText('Cybersecurity Blog')).toBeInTheDocument();
  });

  it('debe mostrar la descripción del blog en inglés', () => {
    renderWithRoute('/en/blog');

    expect(screen.getByText(/Notes, guides and resources/)).toBeInTheDocument();
  });

  it('debe mostrar las tarjetas de todos los artículos', () => {
    renderWithRoute('/en/blog');

    BLOG_ARTICLES.forEach(article => {
      expect(screen.getByText(article.title)).toBeInTheDocument();
    });
  });

  it('debe mostrar el excerpt de cada artículo', () => {
    renderWithRoute('/en/blog');

    BLOG_ARTICLES.forEach(article => {
      expect(screen.getByText(article.excerpt)).toBeInTheDocument();
    });
  });

  it('debe mostrar los tags de cada artículo', () => {
    renderWithRoute('/en/blog');

    BLOG_ARTICLES.forEach(article => {
      article.tags.forEach(tag => {
        expect(screen.getByText(`#${tag}`)).toBeInTheDocument();
      });
    });
  });

  it('debe mostrar el autor y fecha del artículo', () => {
    renderWithRoute('/en/blog');

    expect(screen.getByText(BLOG_ARTICLES[0].author)).toBeInTheDocument();
  });

  it('debe mostrar el link "Read article →" en cada tarjeta', () => {
    renderWithRoute('/en/blog');

    const readLinks = screen.getAllByText(/Read article →/);
    expect(readLinks.length).toBe(BLOG_ARTICLES.length);
  });

  it('debe mostrar el footer', () => {
    renderWithRoute('/en/blog');

    expect(screen.getByText(/ZI Labs · Cybersecurity Blog/)).toBeInTheDocument();
  });

  it('debe mostrar el link "Back to Labs" en el header', () => {
    renderWithRoute('/en/blog');

    expect(screen.getByText('Back to Labs')).toBeInTheDocument();
  });

  it('debe mostrar el link de cambio de idioma a ES', () => {
    renderWithRoute('/en/blog');

    expect(screen.getByText(/🇪🇸 ES/)).toBeInTheDocument();
  });
});

describe('BlogListPage en español', () => {
  it('debe mostrar el título en español', () => {
    renderWithRoute('/es/blog');

    expect(screen.getByText('Blog de Ciberseguridad')).toBeInTheDocument();
  });

  it('debe mostrar la descripción en español', () => {
    renderWithRoute('/es/blog');

    expect(screen.getByText(/Notas, guías y recursos/)).toBeInTheDocument();
  });

  it('debe mostrar "Leer artículo →" en las tarjetas', () => {
    renderWithRoute('/es/blog');

    expect(screen.getByText(/Leer artículo →/)).toBeInTheDocument();
  });

  it('debe mostrar "Volver a Labs" en el botón de regreso', () => {
    useScenarioStore.setState((state) => ({
      ...state,
      language: 'es',
    }), true);
    renderWithRoute('/es/blog');

    expect(screen.getByText('Volver a Labs')).toBeInTheDocument();
  });

  it('debe mostrar el link de cambio de idioma a EN', () => {
    renderWithRoute('/es/blog');

    expect(screen.getByText(/🇺🇸 EN/)).toBeInTheDocument();
  });

  it('debe mostrar el título del artículo en español', () => {
    renderWithRoute('/es/blog');

    expect(screen.getByText(BLOG_ARTICLES[0].titleEs!)).toBeInTheDocument();
  });
});

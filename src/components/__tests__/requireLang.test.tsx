// ── __tests__/requireLang.test.tsx ───────────────────────────────
// Gate de idioma de las rutas `/:lang/...` (mejoras-deep §2.3.2):
// un idioma no soportado tiene que responder 404, no la landing.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RequireLang, isValidLang } from '../RequireLang';

function renderRutaConLang(lang: string) {
  return render(
    <MemoryRouter initialEntries={[`/${lang}/labs`]}>
      <Routes>
        <Route
          path="/:lang/labs"
          element={
            <RequireLang>
              <h1>vista de labs</h1>
            </RequireLang>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('isValidLang', () => {
  it('debe aceptar sólo es y en', () => {
    expect(isValidLang('es')).toBe(true);
    expect(isValidLang('en')).toBe(true);
    expect(isValidLang('fr')).toBe(false);
    expect(isValidLang('ES')).toBe(false);
    expect(isValidLang('')).toBe(false);
    expect(isValidLang(undefined)).toBe(false);
  });
});

describe('RequireLang', () => {
  it('deja pasar las rutas en español', () => {
    renderRutaConLang('es');
    expect(screen.getByRole('heading', { name: 'vista de labs' })).toBeInTheDocument();
  });

  it('deja pasar las rutas en inglés', () => {
    renderRutaConLang('en');
    expect(screen.getByRole('heading', { name: 'vista de labs' })).toBeInTheDocument();
  });

  it('responde 404 con un idioma no soportado en lugar de la vista', () => {
    renderRutaConLang('fr');
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.queryByText('vista de labs')).not.toBeInTheDocument();
  });

  it('los links del 404 nunca apuntan a un :lang inválido', () => {
    renderRutaConLang('fr');
    const hrefs = screen.getAllByRole('link').map(a => a.getAttribute('href'));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toMatch(/^\/(es|en)(\/|$)/);
  });
});

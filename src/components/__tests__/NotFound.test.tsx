// ── components/__tests__/NotFound.test.tsx ───────────────────────
// Ruta catch-all: antes, una URL desconocida dejaba el documento vacío
// (Vercel reescribe todo a index.html y React Router no matcheaba nada).

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFound } from '../NotFound';
import { useScenarioStore } from '../../store/scenarioStore';

const renderNotFound = () => render(
  <MemoryRouter>
    <NotFound />
  </MemoryRouter>
);

describe('NotFound', () => {
  beforeEach(() => {
    useScenarioStore.setState({ language: 'es' });
  });

  it('debe mostrar el 404 en español con enlaces al lab y a la Academy', () => {
    renderNotFound();

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver a los labs' })).toHaveAttribute('href', '/es/labs');
    expect(screen.getByRole('link', { name: 'Ir a la Academy' })).toHaveAttribute('href', '/es/academy');
  });

  it('debe mostrar el 404 en inglés cuando el idioma es en', () => {
    useScenarioStore.setState({ language: 'en' });
    renderNotFound();

    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Labs' })).toHaveAttribute('href', '/en/labs');
    expect(screen.getByRole('link', { name: 'Go to Academy' })).toHaveAttribute('href', '/en/academy');
  });
});
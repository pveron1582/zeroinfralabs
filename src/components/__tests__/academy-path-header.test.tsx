// ── components/__tests__/academy-path-header.test.tsx ──────────────
// La página de módulo (todas las rutas /academy/:pathId y
// /academy/:pathId/module/:subId) debe mostrar la MISMA barra del sitio
// que el home del Academy y las lecciones: Labs / Academy / Blog, tema e
// selector de idioma. Antes sólo la renderizaban AcademyHome y
// LessonViewer: al entrar a un módulo desaparecía toda la navegación.
//
// Este archivo usa el SiteHeader REAL (en Academy.test.tsx está mockeado)
// para afirmar sobre los links de verdad y no sobre un doble.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AcademyPathPage } from '../academy/AcademyPath';
import { useScenarioStore } from '../../store/scenarioStore';

function renderModulo(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/:lang/academy" element={<div>home del academy</div>} />
        <Route path="/:lang/academy/:pathId" element={<AcademyPathPage />} />
        <Route path="/:lang/academy/:pathId/module/:subId" element={<AcademyPathPage />} />
        <Route path="/:lang/academy/:pathId/:lessonId" element={<div>lección</div>} />
      </Routes>
    </MemoryRouter>
  );
}

/** Barra completa: nav del sitio + tema + selector de idioma. */
function expectBarraDelSitio() {
  const barra = screen.getByRole('banner');
  const links = within(barra).getAllByRole('link');
  const etiquetas = links.map(l => l.textContent);
  expect(etiquetas).toContain('Labs');
  expect(etiquetas).toContain('Academy');
  expect(etiquetas).toContain('Blog');
  expect(links.find(l => l.textContent === 'Academy')).toHaveAttribute('href', '/es/academy');
  expect(within(barra).getByRole('button', { name: 'EN' })).toBeInTheDocument();
  expect(within(barra).getByRole('button', { name: 'ES' })).toBeInTheDocument();
  expect(within(barra).getByRole('button', { name: /Switch to (light|dark) mode/ })).toBeInTheDocument();
}

describe('AcademyPathPage — barra del sitio', () => {
  beforeEach(() => {
    useScenarioStore.setState({ language: 'es' });
  });

  // Una entrada por tipo de página de módulo: paths de SO nuevos, un path
  // de scripting (ahora de primer nivel) y las URLs legacy de SO/scripting.
  const paginas: Array<[ruta: string, titulo: string]> = [
    ['/es/academy/linux', 'Linux'],
    ['/es/academy/windows', 'Windows'],
    ['/es/academy/others', 'Otros sistemas operativos y hardware'],
    ['/es/academy/fundaments', 'Fundamentos de redes'],
    ['/es/academy/bash', 'Bash'],
    ['/es/academy/scripting/module/python', 'Python'], // legacy → /academy/python
    ['/es/academy/os', 'Linux'], // legacy: redirige a /academy/linux
  ];

  for (const [ruta, titulo] of paginas) {
    it(`la muestra en ${ruta}`, () => {
      renderModulo(ruta);
      expectBarraDelSitio();
      // Estamos en la página del módulo (no en un redirect al home)
      expect(screen.getByRole('heading', { name: titulo })).toBeInTheDocument();
      expect(screen.queryByText('home del academy')).not.toBeInTheDocument();
    });
  }
});

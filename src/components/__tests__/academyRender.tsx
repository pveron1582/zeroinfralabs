// ── components/__tests__/academyRender.tsx ─────────────────────────
// Helper compartido de los tests de Academy: rutas de la portada, de los
// módulos y de las lecciones, iguales a las de `App.tsx`. No es un test —
// los archivos de test se cuentan por `*.test.tsx` (docs-sync).
//
// Los `vi.mock` de SiteHeader/MarketingFooter viven en CADA archivo de
// test: los mocks son por módulo de test, no por helper.

import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AcademyHome } from '../academy/AcademyHome';
import { AcademyPathPage } from '../academy/AcademyPath';
import { LessonViewer } from '../academy/LessonViewer';

export function renderAcademy(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/:lang/academy" element={<AcademyHome />} />
        <Route path="/:lang/academy/:pathId" element={<AcademyPathPage />} />
        <Route path="/:lang/academy/:pathId/module/:subId" element={<AcademyPathPage />} />
        <Route path="/:lang/academy/:pathId/:lessonId" element={<LessonViewer />} />
      </Routes>
    </MemoryRouter>
  );
}

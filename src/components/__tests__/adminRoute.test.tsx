// ── components/__tests__/adminRoute.test.tsx ─────────────────────
// 3.9 — la ruta /:lang/zildeb (LabBuilder, LessonBuilder y DebugPanel)
// existe SÓLO en desarrollo: en producción cae en el catch-all 404 y el
// import del AdminPanel se elimina del bundle.
//
// Mismo patrón que utils/__tests__/logger.test.ts: stubEnv + resetModules
// + import dinámico (App.tsx decide la ruta en render y el import perezoso
// de AdminPanel se evalúa al cargar el módulo). Hay que re-importar también
// @testing-library/react: tras resetModules App.tsx usa una copia nueva de
// React y el renderer de la copia vieja no tiene el dispatcher de hooks.

import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function renderAt(path: string, dev: boolean) {
  vi.stubEnv('DEV', dev);
  vi.resetModules(); // App.tsx se re-evalúa con el DEV nuevo
  window.history.pushState({}, '', path);
  const [{ render, screen }, { default: App }] = await Promise.all([
    import('@testing-library/react'),
    import('../../App'),
  ]);
  render(<App />);
  return screen;
}

describe('Ruta del panel de admin (/zildeb)', () => {
  it('en desarrollo existe y muestra el login del panel', async () => {
    const screen = await renderAt('/es/zildeb', true);
    expect(await screen.findByText('Admin Panel', {}, { timeout: 8000 })).toBeInTheDocument();
    expect(screen.queryByText('404')).not.toBeInTheDocument();
  });

  it('en producción NO existe: cae en el 404 y no pinta el admin', async () => {
    const screen = await renderAt('/es/zildeb', false);
    expect(await screen.findByText('404', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('admin')).not.toBeInTheDocument();
  });
});

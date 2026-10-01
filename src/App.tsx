// ── App.tsx ───────────────────────────────────────────────────────
// Componente raíz: router + layout global
// Las vistas pesadas se cargan con React.lazy (code-splitting por ruta)

import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { LandingPage }  from './components/LandingPage';
import { LabGrid }      from './components/LabGrid';
import { NotFound }     from './components/NotFound';
import { RequireLang }  from './components/RequireLang';
import { ChunkErrorBoundary } from './components/ChunkErrorBoundary';
import { lazyWithRetry } from './utils/lazyRetry';

const BlogListPage = lazyWithRetry(() => import('./components/BlogListPage').then(m => ({ default: m.BlogListPage })));
const BlogArticlePage = lazyWithRetry(() => import('./components/BlogArticlePage').then(m => ({ default: m.BlogArticlePage })));
const AdminPanel = import.meta.env.DEV
  // Panel de admin (LabBuilder/LessonBuilder/DebugPanel): SÓLO en desarrollo
  // (3.9). En prod la ruta no existe y este import se elimina del bundle.
  ? lazyWithRetry(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })))
  : null;
const AcademyHome = lazyWithRetry(() => import('./components/academy/AcademyHome').then(m => ({ default: m.AcademyHome })));
const AcademyPathPage = lazyWithRetry(() => import('./components/academy/AcademyPath').then(m => ({ default: m.AcademyPathPage })));
const LessonViewer = lazyWithRetry(() => import('./components/academy/LessonViewer').then(m => ({ default: m.LessonViewer })));
const ScenarioLauncherWrapper = lazyWithRetry(() => import('./components/ScenarioLauncher').then(m => ({ default: m.ScenarioLauncherWrapper })));
const TestLab = lazyWithRetry(() => import('./components/ScenarioLauncher').then(m => ({ default: m.TestLab })));

import { ThemeSync, RootRedirect } from './components/AppBootstrap';

function RouteFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94a3b8', fontFamily: 'monospace' }}>
      cargando...
    </div>
  );
}

export default function App() {
  return (
    <ChunkErrorBoundary>
      <BrowserRouter>
        <ThemeSync />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            {/* Todas las rutas `/:lang/...` cuelgan de RequireLang: un idioma
                que no sea es/en responde 404 en vez de servir la landing
                (mejoras-deep §2.3.2). */}
            <Route path="/:lang" element={<RequireLang><Outlet /></RequireLang>}>
              <Route index element={<LandingPage />} />
              <Route path="labs" element={<LabGrid />} />
              <Route path="scenario/:id" element={<ScenarioLauncherWrapper />} />
              <Route path="blog" element={<BlogListPage />} />
              <Route path="blog/:slug" element={<BlogArticlePage />} />
              <Route path="academy" element={<AcademyHome />} />
              <Route path="academy/:pathId" element={<AcademyPathPage />} />
              <Route path="academy/:pathId/module/:subId" element={<AcademyPathPage />} />
              <Route path="academy/:pathId/:lessonId" element={<LessonViewer />} />
              {/* Panel de admin (builders + debug): sólo en desarrollo (3.9). */}
              {import.meta.env.DEV && AdminPanel &&
                <Route path="zildeb" element={<AdminPanel />} />}
            </Route>
            {/* Lab de pruebas: solo en desarrollo (borra el storage propio del lab). */}
            {import.meta.env.DEV && <Route path="/test" element={<TestLab />} />}
            {/* Catch-all: sin esto, una URL desconocida dejaba el documento vacío. */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ChunkErrorBoundary>
  );
}
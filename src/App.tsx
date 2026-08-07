// ── App.tsx ───────────────────────────────────────────────────────
// Componente raíz: router + layout global

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage }  from './components/LandingPage';
import { LabGrid }      from './components/LabGrid';
import { BlogListPage } from './components/BlogListPage';
import { BlogArticlePage } from './components/BlogArticlePage';
import { AdminPanel } from './components/AdminPanel';
import { ThemeSync, RootRedirect } from './components/AppContent';
import { ScenarioLauncherWrapper, TestLab } from './components/ScenarioLauncher';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeSync />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/:lang" element={<LandingPage />} />
        <Route path="/:lang/labs" element={<LabGrid />} />
        <Route path="/:lang/scenario/:id" element={<ScenarioLauncherWrapper />} />
        <Route path="/:lang/blog" element={<BlogListPage />} />
        <Route path="/:lang/blog/:slug" element={<BlogArticlePage />} />
        <Route path="/:lang/zildeb" element={<AdminPanel />} />
        <Route path="/test" element={<TestLab />} />
      </Routes>
    </BrowserRouter>
  );
}
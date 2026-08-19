// ── components/AppBootstrap.tsx ───────────────────────────────────
// Componentes livianos de arranque (theme sync + redirect de raíz).
// Viven separados de AppContent.tsx para no arrastrar el simulador
// completo al bundle inicial (code-splitting).

import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useScenarioStore } from '../store/scenarioStore';

export function ThemeSync() {
  const theme = useScenarioStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return null;
}

export function RootRedirect() {
  const storedLanguage = useScenarioStore(state => state.language);

  const detectedLang = (() => {
    if (storedLanguage && storedLanguage !== 'en') {
      return storedLanguage;
    }
    const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
    if (browserLang.toLowerCase().startsWith('es')) {
      return 'es';
    }
    return 'en';
  })();

  return <Navigate to={`/${detectedLang}`} replace />;
}

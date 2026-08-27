// ── i18n/translations.ts ─────────────────────────────────────────
// Simple translation system for ZeroInfra Labs - integrated with Zustand store.
// P2-15: los diccionarios viven en ./en.ts y ./es.ts; la interfaz de claves en
// ./types.ts. Este archivo queda como barrel de lógica (hooks + export final).

import { useScenarioStore } from '../store/scenarioStore';
import type { Language, Translations } from './types';
import { en } from './en';
import { es } from './es';

export type { Language, Translations } from './types';

const translations: Record<Language, Translations> = { en, es };

// Hook to get current language from store
export function useLanguage(): Language {
  return useScenarioStore((state) => state.language);
}

// Hook to get setLanguage function from store
export function useSetLanguage(): (lang: Language) => void {
  return useScenarioStore((state) => state.setLanguage);
}

// Hook to get translation function
export function useT(): (key: keyof Translations) => string {
  const language = useLanguage();
  return (key: keyof Translations) => {
    const lang = language || 'en';
    return translations[lang]?.[key] || translations['en'][key] || key;
  };
}

// Legacy function for non-component usage (returns English by default)
export function t(key: keyof Translations): string {
  return translations['en'][key];
}

// Export translations object for direct access
export { translations };

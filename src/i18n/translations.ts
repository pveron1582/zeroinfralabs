// ── i18n/translations.ts ─────────────────────────────────────────
// Simple translation system for ZeroInfra Labs - now integrated with Zustand store

import { useScenarioStore } from '../store/scenarioStore';

export type Language = 'en' | 'es';

interface Translations {
  // Landing Page
  title: string;
  subtitle: string;
  chooseLab: string;
  hoverHint: string;
  pentestingLabSimulator: string;
  startButton: string;
  viewNetwork: string;
  // Difficulty levels
  easy: string;
  medium: string;
  hard: string;
  // Mission count
  missions: string;
  // Mission Panel
  missionsTitle: string;
  progress: string;
  compromised: string;
  hideHelp: string;
  enableHelp: string;
  // Common
  completed: string;
  // Network Map level labels
  levelUnknown: string;
  levelDiscovered: string;
  levelScanned: string;
  levelEnumerated: string;
  levelCompromised: string;
}

const translations: Record<Language, Translations> = {
  en: {
    title: 'ZeroInfra Labs',
    subtitle: 'Select a scenario to begin your cybersecurity training.',
    chooseLab: 'Choose a',
    hoverHint: 'Hover over each card to see what it\'s about. Click to start.',
    pentestingLabSimulator: 'Pentesting Lab Simulator',
    startButton: 'START',
    viewNetwork: 'View Network',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    missions: 'missions',
    missionsTitle: 'Missions',
    progress: 'Progress',
    compromised: '● COMPROMISED',
    hideHelp: 'Hide help',
    enableHelp: 'Enable help',
    completed: 'completed',
    levelUnknown: 'Unknown',
    levelDiscovered: 'Discovered',
    levelScanned: 'Scanned',
    levelEnumerated: 'Enumerated',
    levelCompromised: 'Compromised',
  },
  es: {
    title: 'ZeroInfra Labs',
    subtitle: 'Seleccioná un escenario para iniciar tu entrenamiento en ciberseguridad.',
    chooseLab: 'Elegí un',
    hoverHint: 'Pasá el mouse sobre cada tarjeta para ver de qué se trata. Hacé clic para comenzar.',
    pentestingLabSimulator: 'Simulador de Laboratorios de Pentesting',
    startButton: 'INICIAR',
    viewNetwork: 'Ver Red',
    easy: 'Fácil',
    medium: 'Medio',
    hard: 'Difícil',
    missions: 'misiones',
    missionsTitle: 'Misiones',
    progress: 'Progreso',
    compromised: '● COMPROMETIDA',
    hideHelp: 'Ocultar ayuda',
    enableHelp: 'Habilitar ayuda',
    completed: 'completadas',
    levelUnknown: 'Desconocido',
    levelDiscovered: 'Descubierto',
    levelScanned: 'Escaneado',
    levelEnumerated: 'Enumerado',
    levelCompromised: 'Comprometido',
  }
};

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

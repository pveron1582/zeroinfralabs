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
  showHint1: string;
  showHint2: string;
  // Common
  completed: string;
  // Network Map level labels
  levelUnknown: string;
  levelDiscovered: string;
  levelScanned: string;
  levelEnumerated: string;
  levelCompromised: string;
  // Survey
  surveyTitle: string;
  surveySubtitle: string;
  surveyOverall: string;
  surveyDifficulty: string;
  surveyRecommend: string;
  surveyComments: string;
  surveyCommentsPlaceholder: string;
  surveySubmit: string;
  surveySkip: string;
  surveyThanks: string;
  surveyEasy: string;
  surveyMedium: string;
  surveyHard: string;
  surveyVeryHard: string;
  surveyYes: string;
  surveyNo: string;
  // Privacy notice
  privacyNotice: string;
  // Hero / Value proposition
  heroValueProp: string;
  badgeNoDownloads: string;
  badgeNoRegistration: string;
  badgeSafeEnv: string;
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
    showHint1: 'Show hint 1',
    showHint2: 'Show hint 2',
    completed: 'completed',
    levelUnknown: 'Unknown',
    levelDiscovered: 'Discovered',
    levelScanned: 'Scanned',
    levelEnumerated: 'Enumerated',
    levelCompromised: 'Compromised',
    surveyTitle: 'Rate this Lab',
    surveySubtitle: 'Your feedback helps us improve',
    surveyOverall: 'Overall rating',
    surveyDifficulty: 'How difficult was it?',
    surveyRecommend: 'Would you recommend it?',
    surveyComments: 'Comments or suggestions',
    surveyCommentsPlaceholder: 'Write anything you want to share (optional)...',
    surveySubmit: 'Submit',
    surveySkip: 'Skip',
    surveyThanks: 'Thanks for your feedback!',
    surveyEasy: 'Easy',
    surveyMedium: 'Medium',
    surveyHard: 'Hard',
    surveyVeryHard: 'Very Hard',
    surveyYes: 'Yes',
    surveyNo: 'No',
    privacyNotice: 'Anonymous usage data (language, lab progress, surveys) is collected to improve the learning experience. No personal information is stored.',
    heroValueProp: 'Practice hacking techniques from your browser',
    badgeNoDownloads: 'No downloads',
    badgeNoRegistration: 'No registration',
    badgeSafeEnv: 'Safe & virtual',
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
    showHint1: 'Ver pista 1',
    showHint2: 'Ver pista 2',
    completed: 'completadas',
    levelUnknown: 'Desconocido',
    levelDiscovered: 'Descubierto',
    levelScanned: 'Escaneado',
    levelEnumerated: 'Enumerado',
    levelCompromised: 'Comprometido',
    surveyTitle: 'Calificá este Lab',
    surveySubtitle: 'Tu feedback nos ayuda a mejorar',
    surveyOverall: 'Puntuación general',
    surveyDifficulty: '¿Qué tan difícil fue?',
    surveyRecommend: '¿Lo recomendarías?',
    surveyComments: 'Comentarios o sugerencias',
    surveyCommentsPlaceholder: 'Escribí lo que quieras compartir (opcional)...',
    surveySubmit: 'Enviar',
    surveySkip: 'Omitir',
    surveyThanks: '¡Gracias por tu feedback!',
    surveyEasy: 'Fácil',
    surveyMedium: 'Medio',
    surveyHard: 'Difícil',
    surveyVeryHard: 'Muy difícil',
    surveyYes: 'Sí',
    surveyNo: 'No',
    privacyNotice: 'Se recopilan datos anónimos de uso (idioma, progreso en labs, encuestas) para mejorar la experiencia de aprendizaje. No se almacena información personal.',
    heroValueProp: 'Practicá técnicas de hacking desde tu navegador',
    badgeNoDownloads: 'Sin descargas',
    badgeNoRegistration: 'Sin registro',
    badgeSafeEnv: 'Entorno seguro',
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

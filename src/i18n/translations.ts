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
  badgeNoTimeLimit: string;
  // Landing sections
  introTitle: string;
  introSubtitle: string;
  whyTitle: string;
  whyInstallTitle: string;
  whyInstallDesc: string;
  whyNoRegTitle: string;
  whyNoRegDesc: string;
  whyTerminalTitle: string;
  whyTerminalDesc: string;
  whySafeTitle: string;
  whySafeDesc: string;
  whyGuidedTitle: string;
  whyGuidedDesc: string;
  whyEnumTitle: string;
  whyEnumDesc: string;
  whoTitle: string;
  whoStudents: string;
  whoStudentsDesc: string;
  whoSelfTaught: string;
  whoSelfTaughtDesc: string;
  whoNoVMs: string;
  whoNoVMsDesc: string;
  whoCerts: string;
  whoCertsDesc: string;
  howTitle: string;
  howStep1Title: string;
  howStep1Desc: string;
  howStep2Title: string;
  howStep2Desc: string;
  howStep3Title: string;
  howStep3Desc: string;
  howStep4Title: string;
  howStep4Desc: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  backToHome: string;
  labsPageTitle: string;
  labsPageSubtitle: string;
  backToLabs: string;
  // Legal disclaimer
  legalDisclaimerTitle: string;
  legalDisclaimerText: string;
}

const translations: Record<Language, Translations> = {
  en: {
    title: 'ZeroInfra Labs',
    subtitle: 'Select a scenario to begin your cybersecurity training.',
    chooseLab: 'Choose a',
    hoverHint: 'Hover over each card to see what it\'s about. Click to start.',
    pentestingLabSimulator: 'LEARN ETHICAL HACKING — RIGHT IN YOUR BROWSER',
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
    heroValueProp: 'Learn hacking from scratch — no installs needed',
    badgeNoDownloads: 'No prior knowledge',
    badgeNoRegistration: 'No registration',
    badgeSafeEnv: '100% safe & legal',
    badgeNoTimeLimit: '⏱️ No time limits',
    backToLabs: 'Back to Labs',
    // Landing sections
    introTitle: 'Never hacked anything? Perfect.',
    introSubtitle: 'Hack your first website in minutes. No setup, no VMs, no prior knowledge. Just open and start.',
    whyTitle: 'Why ZI Labs is different',
    whyInstallTitle: 'No installs · No VMs · No setup',
    whyInstallDesc: 'No VirtualBox, no Kali ISO, no configuration. Just open the page and start.',
    whyNoRegTitle: 'No registration',
    whyNoRegDesc: 'No account, no email, no personal data. You enter and start practicing immediately.',
    whyTerminalTitle: 'Realistic terminal',
    whyTerminalDesc: 'You type real commands while the lab explains what each one does. Learn by doing, not memorizing.',
    whySafeTitle: '100% safe',
    whySafeDesc: 'It\'s a simulation. You can\'t break anything, get detected, or touch real systems.',
    whyGuidedTitle: 'Guided learning',
    whyGuidedDesc: '5-8 missions per lab. Hints if you get stuck. Automatic step verification.',
    whyEnumTitle: 'No time limits',
    whyEnumDesc: 'Machines don\'t shut down, don\'t change IP, and don\'t charge by the hour. Take as long as you need — learn at your pace, not the server\'s.',
    whoTitle: 'Who is this for?',
    whoStudents: 'Cybersecurity students',
    whoStudentsDesc: 'Practice without needing a home lab or paid platforms.',
    whoSelfTaught: 'Self-taught learners',
    whoSelfTaughtDesc: 'Try your first tools without the pressure of a real system or a countdown timer.',
    whoNoVMs: 'Lovers of simplicity',
    whoNoVMsDesc: 'Skip VirtualBox and virtual machine setup entirely.',
    whoCerts: 'Hacking curious',
    whoCertsDesc: 'You saw hacking content online or in a show and want to know how it actually works. Start from zero, no prior knowledge needed.',
    howTitle: 'How it works',
    howStep1Title: 'Choose a lab',
    howStep1Desc: 'Labs ordered from easiest to hardest. Start from zero and progress at your own pace.',
    howStep2Title: 'Open the terminal',
    howStep2Desc: 'A Kali Linux environment loads in your browser in seconds.',
    howStep3Title: 'Start hacking',
    howStep3Desc: 'Type real commands, follow missions, and get hints when you need them.',
    howStep4Title: 'Complete the labs',
    howStep4Desc: 'Finish all missions to solve each lab and capture the flags.',
    ctaTitle: 'Ready for your first machine?',
    ctaSubtitle: 'Choose a lab and start practicing in less than 5 seconds.',
    ctaButton: 'Start for free now',
    backToHome: 'Home',
    labsPageTitle: 'Choose a Lab',
    labsPageSubtitle: 'Each scenario is a complete pentesting simulation. Pick one to get started.',
    legalDisclaimerTitle: 'Ethical hacking, always.',
    legalDisclaimerText: 'ZI Labs is an educational platform. All environments are simulated and controlled. We do not promote or support any illegal activity. Our goal is to help build cybersecurity professionals with ethical judgment and responsibility.',
  },
  es: {
    title: 'ZeroInfra Labs',
    subtitle: 'Seleccioná un escenario para iniciar tu entrenamiento en ciberseguridad.',
    chooseLab: 'Elegí un',
    hoverHint: 'Pasá el mouse sobre cada tarjeta para ver de qué se trata. Hacé clic para comenzar.',
    pentestingLabSimulator: 'LA PRIMERA PLATAFORMA DE HACKING ÉTICO EN ESPAÑOL — DIRECTO EN TU NAVEGADOR',
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
    heroValueProp: 'Aprendé hacking desde cero — sin instalar nada',
    badgeNoDownloads: 'Sin conocimientos previos',
    badgeNoRegistration: 'Sin registro',
    badgeSafeEnv: '100% seguro y legal',
    badgeNoTimeLimit: '⏱️ Sin límite de tiempo',
    backToLabs: 'Volver a Labs',
    // Landing sections
    introTitle: '¿Nunca hackeaste nada? Perfecto.',
    introSubtitle: 'Hackeá tu primer sitio web en minutos. Sin configuraciones, sin máquinas virtuales, sin conocimientos previos. Solo abrís y empezás.',
    whyTitle: '¿Por qué ZI Labs es diferente?',
    whyInstallTitle: 'Sin instalaciones · Sin VMs · Sin configuración',
    whyInstallDesc: 'Ni VirtualBox, ni ISO de Kali, ni configuración. Solo abrís la página y empezás.',
    whyNoRegTitle: 'Sin registro',
    whyNoRegDesc: 'Sin cuenta, sin email, sin datos personales. Entrás y empezás a practicar al toque.',
    whyTerminalTitle: 'Terminal realista',
    whyTerminalDesc: 'Escribís comandos reales mientras el lab te explica qué hace cada uno. Aprendés haciendo, no memorizando.',
    whySafeTitle: '100% seguro',
    whySafeDesc: 'Es una simulación. No podés romper nada, ser detectado ni tocar sistemas reales.',
    whyGuidedTitle: 'Aprendizaje guiado',
    whyGuidedDesc: '5 a 8 misiones por lab. Pistas si te trabás. Verificación automática de cada paso.',
    whyEnumTitle: 'Sin límite de tiempo',
    whyEnumDesc: 'Las máquinas no se apagan, no cambian de IP y no te cobran por hora. Tomá el tiempo que necesitás — aprendés a tu ritmo, no al ritmo del servidor.',
    whoTitle: '¿Para quién es?',
    whoStudents: 'Estudiantes de ciberseguridad',
    whoStudentsDesc: 'Practicá sin necesitar un laboratorio propio ni plataformas pagas.',
    whoSelfTaught: 'Autodidactas',
    whoSelfTaughtDesc: 'Probá tus primeras herramientas sin la presión de un sistema real ni un reloj corriendo en contra.',
    whoNoVMs: 'Amantes de lo simple',
    whoNoVMsDesc: 'Olvídate de VirtualBox y la configuración de máquinas virtuales.',
    whoCerts: 'Curiosos del hacking',
    whoCertsDesc: 'Viste hacking en redes o series y querés saber cómo funciona de verdad. Empezás desde cero, sin saber nada previo.',
    howTitle: '¿Cómo funciona?',
    howStep1Title: 'Elegí un lab',
    howStep1Desc: 'Labs ordenados de más fácil a más difícil. Empezás desde cero y avanzás a tu ritmo.',
    howStep2Title: 'Abrí la terminal',
    howStep2Desc: 'Un entorno Kali Linux carga en tu navegador en segundos.',
    howStep3Title: 'Empezá a hackear',
    howStep3Desc: 'Escribís comandos reales, seguís misiones y obtenés pistas cuando las necesitás.',
    howStep4Title: 'Completá los labs',
    howStep4Desc: 'Terminá todas las misiones para resolver cada lab y capturar las flags.',
    ctaTitle: '¿Listo para tu primera máquina?',
    ctaSubtitle: 'Elegí un lab y empezá a practicar en menos de 5 segundos.',
    ctaButton: 'Empezar gratis ahora',
    backToHome: 'Inicio',
    labsPageTitle: 'Elegí un Lab',
    labsPageSubtitle: 'Cada escenario es una simulación completa de pentesting. Elegí uno para empezar.',
    legalDisclaimerTitle: 'Hacking ético, siempre.',
    legalDisclaimerText: 'ZI Labs es una plataforma educativa. Todos los entornos son simulados y controlados. No promovemos ni apoyamos ninguna actividad ilícita. El objetivo es formar profesionales de ciberseguridad con criterio ético y responsabilidad.',
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

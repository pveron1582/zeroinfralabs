// ── i18n/types.ts ────────────────────────────────────────────────
// Fuente única de las claves de traducción (P2-15). Lo importan
// en.ts / es.ts para tipar los diccionarios, y translations.ts lo
// re-exporta para mantener la compatibilidad de imports.

export type Language = 'en' | 'es';

export interface Translations {
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
  labsPreviewTitle: string;
  labsPreviewSubtitle: string;
  labsPreviewAll: string;
  labsPreviewScroll: string;
  featuresMergedTitle: string;
  introDesktopCaption: string;
  backToHome: string;
  labsPageTitle: string;
  labsPageSubtitle: string;
  backToLabs: string;
  backToLanding: string;
  // Legal disclaimer
  legalDisclaimerTitle: string;
  legalDisclaimerText: string;
  // Lab grid modal
  tools: string;
  ipRange: string;
  startLab: string;
  previous: string;
  next: string;
  close: string;
  category: string;
  labName: string;
}

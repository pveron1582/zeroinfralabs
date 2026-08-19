// ── components/labGrid/helpers.ts ─────────────────────────────────
// Datos y helpers compartidos de la página de laboratorios

export interface ScenarioMeta {
  tagline?: string;
  taglineEs?: string;
  tools?: string[];
  accentColor?: string;
  description?: string;
  descriptionEs?: string;
}

export const LAB_IMAGES: Record<string, string> = {
  'scenario-01': '/lab_images/lab01.png',
  'scenario-02': '/lab_images/lab02.png',
  'scenario-03': '/lab_images/lab03.png',
  'scenario-04': '/lab_images/Lab04.png',
  'scenario-05': '/lab_images/Lab05.png',
  'scenario-06': '/lab_images/Lab06.png',
};

export function diffColor(difficulty: string): string {
  if (difficulty === 'Easy') return '#10b981';
  if (difficulty === 'Medium') return '#f59e0b';
  return '#f87171';
}

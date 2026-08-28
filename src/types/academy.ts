// ── types/academy.ts ──────────────────────────────────────────────
// Tipos de la Academy: contenido educativo guiado (Foxy Academy)
// Ver docs/PROYECTO_ACADEMY.md

export type AcademyPathId = 'os' | 'redes' | 'protocolos' | 'protocolos-ii' | 'ciberseguridad' | 'hacking' | 'hacking-web' | 'scripting';

/** Claves de ilustración por módulo (linux, windows, redes, bash, etc.). */
export type ModuleIllustrationKey =
  | 'linux' | 'windows' | 'others'
  | 'redes' | 'protocolos' | 'protocolos-ii'
  | 'ciberseguridad' | 'hacking' | 'hacking-web'
  | 'bash' | 'powershell' | 'python';

export type LessonStep =
  | {
      type: 'content';
      title: string;
      titleEs: string;
      body: string;
      bodyEs: string;
    }
  | {
      type: 'terminal-demo';
      command: string;
      output: string;
      explanation: string;
      explanationEs: string;
    }
  | {
      type: 'lab-challenge';
      labId: string;
      missionObjective: string;
      missionObjectiveEs: string;
    }
  | {
      type: 'quiz';
      question: string;
      questionEs: string;
      options: { es: string; en: string }[];
      correctIndex: number;
    }
  | {
      type: 'practical-exercise';
      task: string;
      taskEs: string;
      hint: string;
      hintEs: string;
      labId?: string;
    }
  | {
      type: 'foxy-narrator';
      messages: { en: string; es: string }[];
    }
  | {
      type: 'video';
      src: string;              // ej: '/videos/li01-linux-history.mp4'
      poster?: string;          // opcional, preview image
      durationSec: number;
      caption?: string;         // texto que aparece durante el video
      captionEs?: string;
    }
  | {
      type: 'interactive-demo';
      demoKind: 'network-home' | 'network-dmz' | 'network-mitm' | 'network-topology';
      instructions: string;
      instructionsEs: string;
    }
  | {
      // Ejercicio de emparejar: tocar un término y su definición (clics en pares).
      type: 'matching';
      title: string;
      titleEs: string;
      instructions: string;
      instructionsEs: string;
      pairs: {
        left: string;
        leftEs: string;
        right: string;
        rightEs: string;
      }[];
    };

export interface Lesson {
  id: string;
  pathId: AcademyPathId;
  order: number;
  title: string;
  titleEs: string;
  readingMinutes: number;
  steps: LessonStep[];
  labRef?: string;
}

export interface AcademyPath {
  id: AcademyPathId;
  title: string;
  titleEs: string;
  description: string;
  descriptionEs: string;
  icon: string;
  accentColor: string;
  /** Clave de la ilustración del módulo (renderizada por ModuleIllustration). */
  illustration?: ModuleIllustrationKey;
  /** Subsecciones con lecciones agrupadas. Si `lessons` está presente, legacy-flat. */
  subSections?: AcademySubSection[];
  /** Compat: lecciones flat cuando no hay subsecciones */
  lessons: Lesson[];
}

export interface AcademySubSection {
  id: string;
  title: string;
  titleEs: string;
  icon: string;
  /** Clave de la ilustración del módulo (renderizada por ModuleIllustration). */
  illustration?: ModuleIllustrationKey;
  lessons: Lesson[];
}

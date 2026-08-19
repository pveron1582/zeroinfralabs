// ── store/slices/academySlice.ts ────────────────────────────────────
// Progreso del Academy: lecciones completadas + resultados de quizzes.
// Todo se persiste en localStorage vía partialize() del scenarioStore.
// Ver docs/PROYECTO_ACADEMY.md (Fase B).

import type { StateCreator } from 'zustand';
import type { ScenarioState } from '../types';

export interface QuizResult {
  lessonId: string;
  answeredAt: string;      // ISO timestamp
  firstTryCorrect: boolean; // si el primer intento fue correcto
}

export interface AcademySlice {
  /** IDs de lecciones completadas, ej. ["os-01", "network-02"] */
  completedLessons: string[];
  /** Resultados de quizzes, para analytics/metricas futuras */
  quizResults: Record<string, QuizResult>; // key = quiz identifier (lessonId+quizIdx)
  markLessonCompleted: (lessonId: string) => void;
  isLessonCompleted: (lessonId: string) => boolean;
  recordQuizResult: (lessonId: string, quizIdx: number, firstTryCorrect: boolean) => void;
  resetAcademyProgress: () => void;
}

export const createAcademySlice: StateCreator<ScenarioState, [], [], AcademySlice> = (set, get) => ({
  completedLessons: [],
  quizResults: {},

  markLessonCompleted: (lessonId) => set(state => (
    state.completedLessons.includes(lessonId)
      ? state
      : { completedLessons: [...state.completedLessons, lessonId] }
  )),

  isLessonCompleted: (lessonId) => get().completedLessons.includes(lessonId),

  recordQuizResult: (lessonId, quizIdx, firstTryCorrect) => set(state => {
    const key = `${lessonId}-q${quizIdx}`;
    if (state.quizResults[key]) return state; // ya existe, no sobreescribir
    return {
      quizResults: {
        ...state.quizResults,
        [key]: { lessonId, answeredAt: new Date().toISOString(), firstTryCorrect },
      },
    };
  }),

  resetAcademyProgress: () => set({ completedLessons: [], quizResults: {} }),
});

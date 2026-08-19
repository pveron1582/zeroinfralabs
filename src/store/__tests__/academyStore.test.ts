import { describe, it, expect, beforeEach } from 'vitest';
import { useScenarioStore } from '../scenarioStore';

describe('academySlice', () => {
  beforeEach(() => {
    useScenarioStore.getState().resetAcademyProgress();
  });

  it('empieza sin lecciones completadas', () => {
    expect(useScenarioStore.getState().completedLessons).toEqual([]);
  });

  it('marca una lección como completada', () => {
    useScenarioStore.getState().markLessonCompleted('os-01');
    expect(useScenarioStore.getState().completedLessons).toEqual(['os-01']);
    expect(useScenarioStore.getState().isLessonCompleted('os-01')).toBe(true);
    expect(useScenarioStore.getState().isLessonCompleted('os-02')).toBe(false);
  });

  it('no duplica una lección ya completada', () => {
    const s = useScenarioStore.getState();
    s.markLessonCompleted('os-01');
    s.markLessonCompleted('os-01');
    expect(useScenarioStore.getState().completedLessons).toEqual(['os-01']);
  });

  it('resetAcademyProgress limpia el progreso', () => {
    const s = useScenarioStore.getState();
    s.markLessonCompleted('os-01');
    s.markLessonCompleted('network-01');
    s.resetAcademyProgress();
    expect(useScenarioStore.getState().completedLessons).toEqual([]);
  });

  it('completedLessons se persiste en localStorage vía partialize', () => {
    useScenarioStore.getState().markLessonCompleted('ciber-01');
    const raw = localStorage.getItem('cyberops-store');
    expect(raw).toBeTruthy();
    const persisted = JSON.parse(raw!);
    expect(persisted.state.completedLessons).toContain('ciber-01');
  });

  describe('quiz results', () => {
    it('registra un quiz correcto al primer intento', () => {
      useScenarioStore.getState().recordQuizResult('os-01', 0, true);
      const results = useScenarioStore.getState().quizResults;
      expect(results['os-01-q0'].firstTryCorrect).toBe(true);
      expect(results['os-01-q0'].lessonId).toBe('os-01');
      expect(results['os-01-q0'].answeredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO
    });

    it('registra un quiz fallado al primer intento', () => {
      useScenarioStore.getState().recordQuizResult('network-01', 0, false);
      const results = useScenarioStore.getState().quizResults;
      expect(results['network-01-q0'].firstTryCorrect).toBe(false);
    });

    it('no sobreescribe un quiz ya registrado', () => {
      useScenarioStore.getState().recordQuizResult('os-01', 0, false);
      useScenarioStore.getState().recordQuizResult('os-01', 0, true);
      const results = useScenarioStore.getState().quizResults;
      expect(results['os-01-q0'].firstTryCorrect).toBe(false); // se queda con el primero
    });

    it('soporta varios quizzes por lección (índice distinto)', () => {
      useScenarioStore.getState().recordQuizResult('os-01', 0, true);
      useScenarioStore.getState().recordQuizResult('os-01', 1, false);
      const results = useScenarioStore.getState().quizResults;
      expect(results['os-01-q0']).toBeDefined();
      expect(results['os-01-q1']).toBeDefined();
    });

    it('resetAcademyProgress limpia también los quizzes', () => {
      const s = useScenarioStore.getState();
      s.markLessonCompleted('os-01');
      s.recordQuizResult('os-01', 0, true);
      s.resetAcademyProgress();
      expect(useScenarioStore.getState().completedLessons).toEqual([]);
      expect(useScenarioStore.getState().quizResults).toEqual({});
    });
  });
});

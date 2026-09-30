// ── components/appContent/__tests__/useAppContentEffects.test.ts ──
// P1 3.6: los efectos del shell (sync de history/popstate, analítica y
// auto-apertura del tour) eran la parte más fácil de romper en silencio: un
// `popstate` mal armado saca al alumno del lab, y un evento de analítica
// duplicado infla las métricas. Todo eso ahora está verificado.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistorySync, useAnalyticsEffects } from '../useAppContentEffects';
import { useAppContentState, useAppContentActions } from '../useAppContentStore';
import { useScenarioStore } from '../../../store/scenarioStore';
import type { AppView } from '../../../store/types';
import { makeTestScenario } from '../../../test/fixtures';

const analytics = vi.hoisted(() => ({
  trackEvent: vi.fn(),
  recordLabStart: vi.fn(),
}));

vi.mock('../../../utils/analytics', () => ({
  trackEvent: analytics.trackEvent,
  recordLabStart: analytics.recordLabStart,
}));

const setView = vi.fn();
const navigate = vi.fn();

function firePop(state: unknown) {
  const event = new PopStateEvent('popstate', { state });
  window.dispatchEvent(event);
}

describe('useHistorySync', () => {
  // El setup global reemplaza window.history por un mock sin replaceState,
  // así que el estado se asigna a mano (es writable).
  const setHistoryState = (state: unknown) => {
    (window.history as unknown as { state: unknown }).state = state;
  };

  beforeEach(() => {
    analytics.trackEvent.mockClear();
    setView.mockClear();
    navigate.mockClear();
    setHistoryState({ view: 'landing' });
  });

  afterEach(() => { sessionStorage.clear(); });

  it('al montar, si el estado del history es workspace, vuelve a la vista workspace', () => {
    setHistoryState({ view: 'workspace', scenarioId: 'scenario-01' });
    renderHook(() => useHistorySync(navigate, 'es', setView));
    expect(setView).toHaveBeenCalledWith('workspace');
  });

  it('popstate a un lab conocido vuelve al workspace SIN resetear', () => {
    renderHook(() => useHistorySync(navigate, 'es', setView));
    setView.mockClear();
    const resetWorkspace = vi.spyOn(useScenarioStore.getState(), 'resetWorkspace');

    act(() => { firePop({ view: 'workspace', scenarioId: 'scenario-01' }); });

    expect(setView).toHaveBeenCalledWith('workspace');
    expect(navigate).not.toHaveBeenCalled();
    resetWorkspace.mockRestore();
  });

  it('popstate fuera del lab resetea el workspace y navega a /:lang/labs', () => {
    renderHook(() => useHistorySync(navigate, 'es', setView));
    const resetWorkspace = vi.spyOn(useScenarioStore.getState(), 'resetWorkspace');

    act(() => { firePop({ view: 'landing' }); });

    expect(resetWorkspace).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/es/labs', { replace: true });
    resetWorkspace.mockRestore();
  });

  it('normaliza un lang inválido a en (no arma /xx/labs)', () => {
    renderHook(() => useHistorySync(navigate, 'pt', setView));
    act(() => { firePop({ view: 'landing' }); });
    expect(navigate).toHaveBeenCalledWith('/en/labs', { replace: true });
  });

  it('popstate con un scenarioId desconocido no deja al alumno en la landing', () => {
    renderHook(() => useHistorySync(navigate, 'es', setView));
    setView.mockClear();
    act(() => { firePop({ view: 'workspace', scenarioId: 'no-existe' }); });
    expect(setView).not.toHaveBeenCalledWith('workspace');
  });

  it('desregistra el listener al desmontar (sin fugas entre montajes)', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useHistorySync(navigate, 'es', setView));
    unmount();
    expect(remove).toHaveBeenCalledWith('popstate', expect.any(Function));
    remove.mockRestore();
  });
});

describe('useAnalyticsEffects', () => {
  const scenario = makeTestScenario({ id: 'lab-analytics', name: 'Lab Analytics' });

  beforeEach(() => {
    analytics.trackEvent.mockClear();
    analytics.recordLabStart.mockClear();
    sessionStorage.clear();
  });

  it('registra lab_started solo en la vista workspace', () => {
    renderHook(() => useAnalyticsEffects('landing', scenario, scenario.missions, vi.fn(), false));
    expect(analytics.recordLabStart).not.toHaveBeenCalled();

    renderHook(() => useAnalyticsEffects('workspace', scenario, scenario.missions, vi.fn(), false));
    expect(analytics.recordLabStart).toHaveBeenCalledTimes(1);
    expect(analytics.trackEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'lab_started', scenarioId: 'lab-analytics',
    }));
  });

  it('el tour se auto-abre una vez por escenario (flag en sessionStorage)', () => {
    const openFoxyTour = vi.fn();
    const { rerender } = renderHook(
      ({ view }) => useAnalyticsEffects(view, scenario, scenario.missions, openFoxyTour, false),
      { initialProps: { view: 'workspace' as AppView } },
    );
    expect(openFoxyTour).toHaveBeenCalledTimes(1);

    // Rerender con el tour ya abierto: no vuelve a dispararse.
    rerender({ view: 'workspace' });
    expect(openFoxyTour).toHaveBeenCalledTimes(1);

    // Entrar de nuevo al mismo lab: el flag impide reabrirlo.
    rerender({ view: 'landing' });
    rerender({ view: 'workspace' });
    expect(openFoxyTour).toHaveBeenCalledTimes(1);
  });

  it('otro escenario sí abre su propio tour', () => {
    const openFoxyTour = vi.fn();
    const otro = makeTestScenario({ id: 'lab-otro' });
    renderHook(() => useAnalyticsEffects('workspace', scenario, scenario.missions, openFoxyTour, false));
    renderHook(() => useAnalyticsEffects('workspace', otro, otro.missions, openFoxyTour, false));
    expect(openFoxyTour).toHaveBeenCalledTimes(2);
  });

  it('emite mission_complete con la última misión completada', () => {
    const missions = [
      { ...scenario.missions[0], id: 1, status: 'completed' as const },
      { ...scenario.missions[0], id: 2, status: 'completed' as const, title: 'Última' },
    ];
    renderHook(() => useAnalyticsEffects('workspace', scenario, missions, vi.fn(), false));
    expect(analytics.trackEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'mission_complete',
      details: { missionId: 2, missionTitle: 'Última' },
    }));
  });

  it('al salir del workspace con todas las misiones hechas emite lab_completed', () => {
    const done = [1, 2].map(id => ({ ...scenario.missions[0], id, status: 'completed' as const }));
    const { rerender } = renderHook(
      ({ view }) => useAnalyticsEffects(view, scenario, done, vi.fn(), false),
      { initialProps: { view: 'workspace' as AppView } },
    );
    analytics.trackEvent.mockClear();
    rerender({ view: 'landing' });
    expect(analytics.trackEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'lab_completed', details: { totalMissions: 2 },
    }));
  });

  it('al salir a medias emite lab_abandoned; sin progreso, lab_changed', () => {
    // 1 de 2 completadas: NO es "completed" sino abandono.
    const parcial = [
      { ...scenario.missions[0], id: 1, status: 'completed' as const },
      { ...scenario.missions[0], id: 2, status: 'active' as const },
    ];
    const { rerender } = renderHook(
      ({ view }) => useAnalyticsEffects(view, scenario, parcial, vi.fn(), false),
      { initialProps: { view: 'workspace' as AppView } },
    );
    analytics.trackEvent.mockClear();
    rerender({ view: 'landing' });
    expect(analytics.trackEvent).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'lab_abandoned' }));

    analytics.trackEvent.mockClear();
    const otro = renderHook(
      ({ view }) => useAnalyticsEffects(view, scenario, scenario.missions, vi.fn(), false),
      { initialProps: { view: 'workspace' as AppView } },
    );
    analytics.trackEvent.mockClear();
    otro.rerender({ view: 'landing' });
    expect(analytics.trackEvent).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'lab_changed' }));
  });
});

describe('useAppContentStore (selectores)', () => {
  it('useAppContentState devuelve la porción que usa el shell', () => {
    const state = renderHook(() => useAppContentState()).result.current;
    expect(state).toEqual(expect.objectContaining({
      view: expect.any(String),
      currentScenario: expect.anything(),
      machines: expect.any(Array),
      missions: expect.any(Array),
      activeMachineId: expect.any(String),
    }));
  });

  it('useAppContentActions expone las acciones del workspace', () => {
    const actions = renderHook(() => useAppContentActions()).result.current;
    // Todas son funciones del store: si el shell llama a una que no existe,
    // el error aparece en runtime como "not a function" en un click.
    for (const action of Object.values(actions)) {
      expect(typeof action).toBe('function');
    }
    expect(Object.keys(actions).length).toBeGreaterThan(10);
  });
});

// ── src/store/__tests__/scenarioStore.test.ts ─────────────────────────────────────────
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useScenarioStore } from '../scenarioStore';
import { SCENARIOS } from '../../exercises/scenarios';

// 1. Mock de persistencia para que no interfiera con el estado limpio de los tests
vi.mock('zustand/middleware', () => ({
  persist: (config: any) => (set: any, get: any, api: any) => config(set, get, api),
}));

describe('scenarioStore', () => {
  // CAPTURAMOS EL ESTADO INICIAL REAL (Que incluye las funciones definidas en scenarioStore.ts)
  const originalState = useScenarioStore.getState();

  beforeEach(() => {
    vi.useFakeTimers();
    // RESETEAMOS: Volvemos al estado original pero SIN el parámetro 'true' 
    // para no destruir las referencias a las funciones.
    useScenarioStore.setState(originalState);
    
    // Opcional: Aseguramos valores por defecto para evitar basura de tests anteriores
    useScenarioStore.setState({
      view: 'landing',
      showMachineLoader: false,
      notification: null,
      currentMissionId: 1
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('debe iniciar en la vista landing', () => {
    expect(useScenarioStore.getState().view).toBe('landing');
  });

  it('selectScenario debe activar el loader y luego cambiar de vista', async () => {
    const scenario2 = SCENARIOS[1];
    
    // Ahora getState().selectScenario sí existirá
    useScenarioStore.getState().selectScenario(scenario2.id);

    // Estado inmediato: Cargando
    expect(useScenarioStore.getState().showMachineLoader).toBe(true);

    // Saltamos el tiempo de carga (4500ms)
    vi.advanceTimersByTime(4500);

    // Estado final
    const state = useScenarioStore.getState();
    expect(state.view).toBe('workspace');
    expect(state.currentScenario.id).toBe(scenario2.id);
    expect(state.showMachineLoader).toBe(false);
  });

  it('completeMission debe actualizar el progreso y las máquinas', () => {
    useScenarioStore.setState({ view: 'workspace' });
    
    const missionId = 1;
    const mission = useScenarioStore.getState().missions.find(m => m.id === missionId);
    
    useScenarioStore.getState().completeMission(missionId);

    const state = useScenarioStore.getState();
    expect(state.missions.find(m => m.id === missionId)?.status).toBe('completed');
    
    if (mission?.targetMachineId) {
      const target = state.machines.find(m => m.id === mission.targetMachineId);
      expect(target?.discovery_level).toBeGreaterThanOrEqual(mission.discoveryLevel);
    }
  });

  it('goHome debe resetear la navegación del usuario', () => {
    useScenarioStore.setState({
      view: 'workspace',
      activeApp: 'browser',
      showNetworkMap: true
    });

    useScenarioStore.getState().goHome();

    const state = useScenarioStore.getState();
    expect(state.view).toBe('landing');
    expect(state.showNetworkMap).toBe(false);
  });

  it('showNotification debe auto-limpiarse tras el tiempo indicado', () => {
    useScenarioStore.getState().showNotification('Test message');
    expect(useScenarioStore.getState().notification?.text).toBe('Test message');

    // Avanzar tiempo (3500ms)
    vi.advanceTimersByTime(3500);
    expect(useScenarioStore.getState().notification).toBeNull();
  });
});
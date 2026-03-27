// ── src/store/__tests__/scenarioStore.test.ts ─────────────────────────────────────────
// Tests para el store de Zustand que maneja el estado global de la aplicación
// Verifica que todas las acciones del store funcionen correctamente

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useScenarioStore } from '../scenarioStore';
import { SCENARIOS } from '../../exercises/scenarios';

// Mock de persistencia para que no interfiera con el estado limpio de los tests
// Esto evita que Zustand persista el estado entre tests
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

  // Verifica que el estado inicial sea correcto
  it('debe iniciar en la vista landing', () => {
    expect(useScenarioStore.getState().view).toBe('landing');
  });

  // Verifica que al seleccionar un escenario se muestre el loader y luego cambie la vista
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

  // Verifica que al completar una misión se actualice el progreso y las máquinas
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

  // Verifica que goHome resetee la navegación del usuario
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

  // Verifica que las notificaciones se auto-limpien después de 3500ms
  it('showNotification debe auto-limpiarse tras el tiempo indicado', () => {
    useScenarioStore.getState().showNotification('Test message');
    expect(useScenarioStore.getState().notification?.text).toBe('Test message');

    // Avanzar tiempo (3500ms)
    vi.advanceTimersByTime(3500);
    expect(useScenarioStore.getState().notification).toBeNull();
  });

  // Verifica que clearNotification limpie la notificación inmediatamente
  it('clearNotification debe limpiar la notificación', () => {
    useScenarioStore.getState().showNotification('Test');
    expect(useScenarioStore.getState().notification).not.toBeNull();
    
    useScenarioStore.getState().clearNotification();
    expect(useScenarioStore.getState().notification).toBeNull();
  });

  // Verifica que setView cambie la vista correctamente
  it('setView debe cambiar la vista', () => {
    useScenarioStore.getState().setView('workspace');
    expect(useScenarioStore.getState().view).toBe('workspace');
    
    useScenarioStore.getState().setView('landing');
    expect(useScenarioStore.getState().view).toBe('landing');
  });

  // Verifica que setActiveApp cambie la aplicación activa
  it('setActiveApp debe cambiar la aplicación activa', () => {
    useScenarioStore.getState().setActiveApp('browser');
    expect(useScenarioStore.getState().activeApp).toBe('browser');
    
    useScenarioStore.getState().setActiveApp('terminal');
    expect(useScenarioStore.getState().activeApp).toBe('terminal');
  });

  // Verifica que setTermColor cambie el color del terminal
  it('setTermColor debe cambiar el color del terminal', () => {
    useScenarioStore.getState().setTermColor('#ff0000');
    expect(useScenarioStore.getState().termColor).toBe('#ff0000');
  });

  // Verifica que toggleNetworkMap alterne la visibilidad del mapa
  it('toggleNetworkMap debe alternar la visibilidad del mapa', () => {
    expect(useScenarioStore.getState().showNetworkMap).toBe(false);
    
    useScenarioStore.getState().toggleNetworkMap();
    expect(useScenarioStore.getState().showNetworkMap).toBe(true);
    
    useScenarioStore.getState().toggleNetworkMap();
    expect(useScenarioStore.getState().showNetworkMap).toBe(false);
  });

  // Verifica que toggleNetworkMap con parámetro fuerce el estado específico
  it('toggleNetworkMap con parámetro debe forzar el estado', () => {
    useScenarioStore.getState().toggleNetworkMap(true);
    expect(useScenarioStore.getState().showNetworkMap).toBe(true);
    
    useScenarioStore.getState().toggleNetworkMap(false);
    expect(useScenarioStore.getState().showNetworkMap).toBe(false);
  });

  // Verifica que changeMachine cambie la máquina activa
  it('changeMachine debe cambiar la máquina activa', () => {
    const machineId = 'lab-scenario-01-wp';
    useScenarioStore.getState().changeMachine(machineId);
    expect(useScenarioStore.getState().activeMachineId).toBe(machineId);
  });

  // Verifica que findCredentials agregue credenciales a la máquina
  it('findCredentials debe agregar credenciales a la máquina', () => {
    const machineId = 'lab-scenario-01-wp';
    useScenarioStore.getState().findCredentials(machineId, 'admin', 'password123', '/etc/passwd', 'ssh');
    
    const machine = useScenarioStore.getState().machines.find(m => m.id === machineId);
    expect(machine?.found_credentials).toEqual([{
      file: '/etc/passwd',
      user: 'admin',
      pass: 'password123',
      verified: false,
      service: 'ssh'
    }]);
  });

  // Verifica que verifyCredentials marque las credenciales como verificadas
  it('verifyCredentials debe marcar credenciales como verificadas', () => {
    const machineId = 'lab-scenario-01-wp';
    useScenarioStore.getState().findCredentials(machineId, 'admin', 'pass', '/etc/passwd', 'ssh');
    useScenarioStore.getState().verifyCredentials(machineId, 'ssh');
    
    const machine = useScenarioStore.getState().machines.find(m => m.id === machineId);
    expect(machine?.found_credentials?.[0]?.verified).toBe(true);
  });

  // Verifica que setCurrentDir cambie el directorio actual
  it('setCurrentDir debe cambiar el directorio actual', () => {
    useScenarioStore.getState().setCurrentDir('/var/www/html');
    expect(useScenarioStore.getState().currentDir).toBe('/var/www/html');
  });

  // Verifica que setListeningPort establezca el puerto de escucha
  it('setListeningPort debe establecer el puerto de escucha', () => {
    useScenarioStore.getState().setListeningPort(4444);
    expect(useScenarioStore.getState().listeningPort).toBe(4444);
    
    useScenarioStore.getState().setListeningPort(null);
    expect(useScenarioStore.getState().listeningPort).toBeNull();
  });

  // Verifica que setMsfState actualice el estado de MSF
  it('setMsfState debe actualizar el estado de MSF', () => {
    const msfState = { active: true, module: 'exploit/test' };
    useScenarioStore.getState().setMsfState(msfState as any);
    expect(useScenarioStore.getState().msfState).toEqual(msfState);
  });

  // Verifica que getActiveMachine retorne la máquina activa
  it('getActiveMachine debe retornar la máquina activa', () => {
    const machine = useScenarioStore.getState().getActiveMachine();
    expect(machine).toBeDefined();
    expect(machine.id).toBe(useScenarioStore.getState().activeMachineId);
  });

  // Verifica que getScenarioMachines retorne las máquinas del escenario
  it('getScenarioMachines debe retornar las máquinas del escenario', () => {
    const machines = useScenarioStore.getState().getScenarioMachines();
    expect(machines.length).toBeGreaterThan(0);
  });

  // Verifica que refreshBrowser incremente la key del navegador
  it('refreshBrowser debe incrementar la key del navegador', () => {
    const initialKey = useScenarioStore.getState().browserKey;
    useScenarioStore.getState().refreshBrowser();
    expect(useScenarioStore.getState().browserKey).toBe(initialKey + 1);
  });

  // Verifica que setBrowserUrl actualice la URL del navegador
  it('setBrowserUrl debe actualizar la URL del navegador', () => {
    useScenarioStore.getState().setBrowserUrl('https://example.com');
    expect(useScenarioStore.getState().browserCurrentUrl).toBe('https://example.com');
  });

  // Verifica que setBrowserLoggedIn actualice el estado de login
  it('setBrowserLoggedIn debe actualizar el estado de login', () => {
    useScenarioStore.getState().setBrowserLoggedIn(true);
    expect(useScenarioStore.getState().browserIsLoggedIn).toBe(true);
  });

  // Verifica que setBrowserNavHistory actualice el historial de navegación
  it('setBrowserNavHistory debe actualizar el historial de navegación', () => {
    const history = ['https://google.com', 'https://example.com'];
    useScenarioStore.getState().setBrowserNavHistory(history, 1);
    expect(useScenarioStore.getState().browserNavHistory).toEqual(history);
    expect(useScenarioStore.getState().browserNavIdx).toBe(1);
  });
});

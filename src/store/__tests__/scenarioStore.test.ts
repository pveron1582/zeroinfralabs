// ── src/store/__tests__/scenarioStore.test.ts ─────────────────────────────────────────
// Tests para el store de Zustand que maneja el estado global de la aplicación
// Verifica que todas las acciones del store funcionen correctamente

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useScenarioStore } from '../scenarioStore';
import { SCENARIOS } from '../../laboratorios/laboratorios';

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

    // Saltamos el tiempo de carga (6500ms)
    vi.advanceTimersByTime(6500);

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

  // Verifica que setBlockingCommand establezca el comando bloqueante (línea 409)
  it('setBlockingCommand debe establecer el comando bloqueante', () => {
    const blockingCmd = { message: 'Listening on port 4444', listeningPort: 4444 };
    useScenarioStore.getState().setBlockingCommand(blockingCmd);
    expect(useScenarioStore.getState().blockingCommand).toEqual(blockingCmd);
    
    useScenarioStore.getState().setBlockingCommand(null);
    expect(useScenarioStore.getState().blockingCommand).toBeNull();
  });

  // Verifica que reportVulnerability reporte vulnerabilidades (líneas 424-444)
  it('reportVulnerability debe agregar nueva vulnerabilidad', () => {
    const machineId = 'lab-scenario-01-wp';
    useScenarioStore.getState().reportVulnerability(machineId, 'CVE-2021-44228', 'detected');
    
    const machine = useScenarioStore.getState().machines.find(m => m.id === machineId);
    expect(machine?.vulnerabilities).toContainEqual({
      id: 'CVE-2021-44228',
      name: 'CVE-2021-44228',
      status: 'detected'
    });
  });

  it('reportVulnerability debe actualizar vulnerabilidad existente', () => {
    const machineId = 'lab-scenario-01-wp';
    // Primero agregar una vulnerabilidad
    useScenarioStore.getState().reportVulnerability(machineId, 'CVE-2021-44228', 'detected');
    // Luego actualizarla
    useScenarioStore.getState().reportVulnerability(machineId, 'CVE-2021-44228', 'confirmed');

    const machine = useScenarioStore.getState().machines.find(m => m.id === machineId);
    const vuln = machine?.vulnerabilities?.find(v => v.id === 'CVE-2021-44228');
    expect(vuln?.status).toBe('confirmed');
  });

  // ── Additional store coverage ─────────────────────────────────────────

  it('setPossibleUsers debe agregar usuarios SSH a la máquina', () => {
    const machineId = 'lab-scenario-01-wp';
    useScenarioStore.getState().setPossibleUsers(machineId, ['admin', 'root']);

    const machine = useScenarioStore.getState().machines.find(m => m.id === machineId);
    expect(machine?.possible_ssh_users).toEqual(['admin', 'root']);
  });

  it('addFailedUser debe agregar usuarios fallidos', () => {
    const machineId = 'lab-scenario-01-wp';
    useScenarioStore.getState().addFailedUser(machineId, 'hacker');

    const machine = useScenarioStore.getState().machines.find(m => m.id === machineId);
    expect(machine?.failed_ssh_users).toContain('hacker');
  });

  it('setSudoPrivileges debe establecer privilegios sudo', () => {
    const machineId = 'lab-scenario-01-wp';
    useScenarioStore.getState().setSudoPrivileges(machineId, 'developer', ['vim', 'bash'], true);

    const machine = useScenarioStore.getState().machines.find(m => m.id === machineId);
    expect(machine?.sudo_privileges).toEqual({
      user: 'developer',
      commands: ['vim', 'bash'],
      canSudo: true,
    });
  });

  it('addFileToMachine debe agregar archivo a la máquina', () => {
    const machineId = 'lab-scenario-01-wp';
    useScenarioStore.getState().addFileToMachine(machineId, {
      path: '/tmp/test.txt',
      content: 'test content',
      type: 'text',
    });

    const machine = useScenarioStore.getState().machines.find(m => m.id === machineId);
    expect(machine?.files.some(f => f.path === '/tmp/test.txt')).toBe(true);
  });

  it('addFileToMachine debe reemplazar archivo existente', () => {
    const machineId = 'lab-scenario-01-wp';
    useScenarioStore.getState().addFileToMachine(machineId, {
      path: '/tmp/test.txt',
      content: 'old content',
      type: 'text',
    });
    useScenarioStore.getState().addFileToMachine(machineId, {
      path: '/tmp/test.txt',
      content: 'new content',
      type: 'text',
    });

    const machine = useScenarioStore.getState().machines.find(m => m.id === machineId);
    const file = machine?.files.find(f => f.path === '/tmp/test.txt');
    expect(file?.content).toBe('new content');
  });

  it('setPrivescCompleted debe marcar privesc como completado', () => {
    const machineId = 'lab-scenario-01-wp';
    useScenarioStore.getState().setPrivescCompleted(machineId);

    const machine = useScenarioStore.getState().machines.find(m => m.id === machineId);
    expect(machine?.privesc_completed).toBe(true);
  });

  it('triggerSurvey debe activar la encuesta', () => {
    const scenario = useScenarioStore.getState().currentScenario;
    useScenarioStore.getState().triggerSurvey(scenario);

    const state = useScenarioStore.getState();
    expect(state.showSurvey).toBe(true);
    expect(state.pendingSurveyScenario).toBe(scenario);
  });

  it('closeSurvey debe cerrar la encuesta', () => {
    useScenarioStore.getState().showSurvey = true;
    useScenarioStore.getState().pendingSurveyScenario = useScenarioStore.getState().currentScenario;
    useScenarioStore.getState().closeSurvey();

    const state = useScenarioStore.getState();
    expect(state.showSurvey).toBe(false);
    expect(state.pendingSurveyScenario).toBeNull();
  });

  it('confirmRCE debe agregar credenciales reverse-shell', () => {
    const machineId = 'lab-scenario-01-wp';
    useScenarioStore.getState().confirmRCE(machineId, 'www-data', '/var/www/html/uploads/shell.php');

    const machine = useScenarioStore.getState().machines.find(m => m.id === machineId);
    expect(machine?.found_credentials?.some(c => c.service === 'reverse-shell')).toBe(true);
  });

  it('confirmRCE no debe duplicar credenciales reverse-shell', () => {
    const machineId = 'lab-scenario-01-wp';
    useScenarioStore.getState().confirmRCE(machineId, 'www-data', '/var/www/html/uploads/shell.php');
    useScenarioStore.getState().confirmRCE(machineId, 'www-data', '/var/www/html/uploads/shell.php');

    const machine = useScenarioStore.getState().machines.find(m => m.id === machineId);
    const reverseShellCreds = machine?.found_credentials?.filter(c => c.service === 'reverse-shell');
    expect(reverseShellCreds?.length).toBe(1);
  });

  it('addExploredDirectory debe agregar directorio web', () => {
    const machineId = 'lab-scenario-01-wp';
    useScenarioStore.getState().addExploredDirectory(machineId, '/wp-content');

    const machine = useScenarioStore.getState().machines.find(m => m.id === machineId);
    expect(machine?.web_enumeration?.directories.some(d => d.path === '/wp-content')).toBe(true);
  });

  it('addExploredDirectory no debe duplicar directorios', () => {
    const machineId = 'lab-scenario-01-wp';
    useScenarioStore.getState().addExploredDirectory(machineId, '/wp-content');
    useScenarioStore.getState().addExploredDirectory(machineId, '/wp-content');

    const machine = useScenarioStore.getState().machines.find(m => m.id === machineId);
    const wpContentDirs = machine?.web_enumeration?.directories.filter(d => d.path === '/wp-content');
    expect(wpContentDirs?.length).toBe(1);
  });
});

it('setShowCompletionOverlay debe cambiar el estado del overlay', () => {
  useScenarioStore.getState().setShowCompletionOverlay(true);
  expect(useScenarioStore.getState().showCompletionOverlay).toBe(true);

  useScenarioStore.getState().setShowCompletionOverlay(false);
  expect(useScenarioStore.getState().showCompletionOverlay).toBe(false);
});

it('revealNextHint debe incrementar hintLevel si hay hints', () => {
  useScenarioStore.setState({
    missions: [{
      id: 999, title: 'Test', description: 'Test',
      status: 'active', targetMachineId: 'test', discoveryLevel: 1,
      hintLevel: 0,
      hints: { hint1: { en: 'test', es: 'test' }, hint2: { en: 'test2', es: 'test2' } },
    }],
  });
  useScenarioStore.getState().revealNextHint(999);
  expect(useScenarioStore.getState().missions.find(m => m.id === 999)?.hintLevel).toBe(1);
});

it('revealNextHint no debe exceder hintLevel máximo', () => {
  useScenarioStore.setState({
    missions: [{
      id: 999, title: 'Test', description: 'Test',
      status: 'active', targetMachineId: 'test', discoveryLevel: 1,
      hintLevel: 2,
      hints: { hint1: { en: 'test', es: 'test' }, hint2: { en: 'test2', es: 'test2' } },
    }],
  });
  useScenarioStore.getState().revealNextHint(999);
  expect(useScenarioStore.getState().missions.find(m => m.id === 999)?.hintLevel).toBe(2);
});

it('revealNextHint debe retornar si no hay hints', () => {
  useScenarioStore.setState({
    missions: [{
      id: 999, title: 'Test', description: 'Test',
      status: 'active', targetMachineId: 'test', discoveryLevel: 1,
      hintLevel: 0,
    }],
  });
  useScenarioStore.getState().revealNextHint(999);
  expect(useScenarioStore.getState().missions.find(m => m.id === 999)?.hintLevel).toBe(0);
});

it('goHome con history.state.view workspace debe llamar history.back', () => {
  const originalBack = window.history.back;
  const backMock = vi.fn();
  window.history.back = backMock;
  Object.defineProperty(window.history, 'state', { value: { view: 'workspace' }, writable: true });

  useScenarioStore.getState().goHome();
  expect(backMock).toHaveBeenCalled();

  window.history.back = originalBack;
});
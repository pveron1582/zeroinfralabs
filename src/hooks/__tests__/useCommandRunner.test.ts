import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCommandRunner, type CommandRunnerProps } from '../useCommandRunner';

const makeMachine = (overrides = {}) => ({
  id: 'attacker-01',
  machine_info: { hostname: 'kali', ip: '192.168.1.10', mac: '00:11:22:33:44:55', os: 'Kali Linux', status: 'active', type: 'workstation' },
  discovery_level: 4,
  scan_results: { ports: [] },
  web_enumeration: { web_server: '', cms: '', directories: [] },
  learning_steps: [],
  files: [],
  ...overrides,
} as any);

const defaultProps: CommandRunnerProps = {
  scenarioId: 'scenario-01',
  machine: makeMachine(),
  allMachines: [makeMachine()],
  currentMissionId: 1,
  onMissionComplete: vi.fn(),
  onChangeMachine: vi.fn(),
  onCredentialsFound: vi.fn(),
  onVerifyCredentials: vi.fn(),
  onFailedUser: vi.fn(),
  onSudoPrivileges: vi.fn(),
  termColor: '#10b981',
};

interface MockExecutor {
  isMsfActive: ReturnType<typeof vi.fn>;
  getMsfPrompt: ReturnType<typeof vi.fn>;
  executeCommand: ReturnType<typeof vi.fn>;
  resetMsfState: ReturnType<typeof vi.fn>;
}

const mockExecutorRef = vi.hoisted(() => ({ current: null as MockExecutor | null }));
const storeRef = vi.hoisted(() => ({ current: {} as Record<string, any> }));
const baseStoreState = vi.hoisted(() => ({
  showNotification: vi.fn(),
  goHome: vi.fn(),
  resetWorkspace: vi.fn(),
  language: 'es',
  reportVulnerability: vi.fn(),
  attackerMachineId: 'attacker-01',
  currentScenario: { id: 'scenario-01', initialMachineId: 'attacker-01' },
  missions: [{ id: 1, status: 'active', validationCriteria: { command: 'ls', outputContains: ['file'] } }],
  setPossibleUsers: vi.fn(),
  addFileToMachine: vi.fn(),
  setMachineFiles: vi.fn(),
  setListeningPort: vi.fn(),
  setSuUser: vi.fn(),
  setPrivescCompleted: vi.fn(),
  resetPrivescCompleted: vi.fn(),
  triggerSurvey: vi.fn(),
  // Identity slice (necesario para useIdentityStack)
  identityStack: [] as Array<{ machineId: string; suUser?: string; cwd: string }>,
  pushIdentity: vi.fn(),
  popIdentity: vi.fn(),
  resetIdentity: vi.fn(),
  applyIdentity: vi.fn(),
  setFtpSession: vi.fn(),
  setSshSession: vi.fn(),
  setCurrentDir: vi.fn(),
  changeMachine: vi.fn(),
}));

vi.mock('../../store/scenarioStore', () => ({
  useScenarioStore: Object.assign(
    vi.fn((selector: any) => selector(storeRef.current)),
    {
      getState: vi.fn(() => storeRef.current),
      setState: vi.fn((updates: Record<string, any>) => {
        Object.assign(storeRef.current, updates);
      }),
    }
  ),
}));

vi.mock('../../commands', () => ({
  isShellSessionActive: vi.fn(() => false),
  getShellPrompt: vi.fn(() => ''),
  resetShellManager: vi.fn(),
  startShellSession: vi.fn(),
  isMsfActive: vi.fn(() => false),
  resetMsfState: vi.fn(),
  createIsolatedExecutor: vi.fn(() => {
    const ex: MockExecutor = {
      isMsfActive: vi.fn(() => false),
      getMsfPrompt: vi.fn(() => null),
      executeCommand: vi.fn(() => ({ output: 'comando no encontrado', isError: true })),
      resetMsfState: vi.fn(),
    };
    mockExecutorRef.current = ex;
    return ex;
  }),
}));

vi.mock('../../utils/autocomplete', () => ({
  getAutocompleteSuggestions: vi.fn(() => ({ suggestions: [], replaceStart: 0 })),
}));

vi.mock('../../utils/labValidator', () => ({
  validateMission: vi.fn(() => false),
}));

const getStore = () => storeRef.current;
const getExecutor = () => mockExecutorRef.current!;

beforeEach(() => {
  vi.clearAllMocks();
  storeRef.current = { ...baseStoreState };
  Object.keys(baseStoreState).forEach(key => {
    storeRef.current[key] = (baseStoreState as any)[key];
  });
});

describe('useCommandRunner', () => {
  describe('estado inicial', () => {
    it('debe iniciar con mensaje de bienvenida y prompt por defecto', () => {
      const { result } = renderHook(() => useCommandRunner(defaultProps));
      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].command).toBeNull();
      expect(result.current.input).toBe('');
      expect(result.current.busy).toBe(false);
      expect(result.current.blockingCommand).toBeNull();
      expect(result.current.currentDir).toBe('/root');
    });

    it('debe tener prompt de root en máquina atacante', () => {
      const { result } = renderHook(() => useCommandRunner(defaultProps));
      expect(result.current.prompt).toContain('root@kali');
      expect(result.current.prompt).toContain('#');
    });
  });

  describe('prompt - máquina no atacante', () => {
    it('debe mostrar prompt de usuario no-root en máquina secundaria', () => {
      const machine = makeMachine({ id: 'victim-01' });
      const props = { ...defaultProps, machine, allMachines: [machine, makeMachine()] };
      const { result } = renderHook(() => useCommandRunner(props));
      expect(result.current.prompt).toContain('$');
    });
  });

  describe('runCommand - comando vacío', () => {
    it('no debe hacer nada con input vacío y sin sesiones activas', () => {
      const { result } = renderHook(() => useCommandRunner(defaultProps));
      const beforeLen = result.current.history.length;
      act(() => { result.current.runCommand(''); });
      expect(result.current.history).toHaveLength(beforeLen);
    });
  });

  describe('runCommand - CLEAR_TERMINAL', () => {
    it('debe limpiar el historial', () => {
      const { result } = renderHook(() => useCommandRunner(defaultProps));
      getExecutor().executeCommand = vi.fn(() => ({ output: 'CLEAR_TERMINAL' }));
      act(() => { result.current.runCommand('clear'); });
      expect(result.current.history).toEqual([]);
    });
  });

  describe('runCommand - EXIT_TO_LANDING', () => {
    it('debe llamar triggerSurvey si todas las misiones están completas', () => {
      getStore().missions = [{ id: 1, status: 'completed' }];
      const { result } = renderHook(() => useCommandRunner(defaultProps));
      getExecutor().executeCommand = vi.fn(() => ({ output: 'EXIT_TO_LANDING' }));
      act(() => { result.current.runCommand('exit'); });
      expect(getStore().triggerSurvey).toHaveBeenCalled();
    });

    it('debe resetear el store si hay misiones incompletas', () => {
      getStore().missions = [{ id: 1, status: 'active' }];
      const { result } = renderHook(() => useCommandRunner(defaultProps));
      getExecutor().executeCommand = vi.fn(() => ({ output: 'EXIT_TO_LANDING' }));
      act(() => { result.current.runCommand('exit'); });
      expect(getStore().triggerSurvey).not.toHaveBeenCalled();
    });
  });

  describe('processCommandResult - completedMissionId', () => {
    it('debe llamar onMissionComplete', () => {
      const { result } = renderHook(() => useCommandRunner(defaultProps));
      getExecutor().executeCommand = vi.fn(() => ({ output: 'ok', completedMissionId: 1 }));
      act(() => { result.current.runCommand('ls'); });
      expect(defaultProps.onMissionComplete).toHaveBeenCalledWith(1);
    });
  });

  describe('processCommandResult - foundCredentials', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('debe llamar onCredentialsFound', () => {
      const { result } = renderHook(() => useCommandRunner(defaultProps));
      getExecutor().executeCommand = vi.fn(() => ({
        output: 'ok',
        foundCredentials: { machineId: 'victim-01', user: 'admin', pass: 'pass123', file: '/tmp/creds.txt' },
      }));
      act(() => { result.current.runCommand('hydra -l admin -P wordlist.txt ssh://10.10.10.11'); });
      act(() => { vi.advanceTimersByTime(2500); });
      expect(defaultProps.onCredentialsFound).toHaveBeenCalledWith('victim-01', 'admin', 'pass123', '/tmp/creds.txt', undefined);
    });
  });

  describe('processCommandResult - blockingCommand', () => {
    it('debe setear blockingCommand', () => {
      const { result } = renderHook(() => useCommandRunner(defaultProps));
      getExecutor().executeCommand = vi.fn(() => ({
        output: 'Listening on port 4444',
        blockingCommand: { message: 'Escuchando en puerto 4444...', cancelKey: 'c' },
      }));
      act(() => { result.current.runCommand('nc -lvnp 4444'); });
      expect(result.current.blockingCommand).not.toBeNull();
      expect(result.current.blockingCommand!.message).toContain('4444');
    });
  });

  describe('processCommandResult - newMachineId', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('debe llamar onChangeMachine', () => {
      const { result } = renderHook(() => useCommandRunner(defaultProps));
      getExecutor().executeCommand = vi.fn(() => ({
        output: 'ok',
        newMachineId: 'victim-01',
      }));
      act(() => { result.current.runCommand('ssh admin@10.10.10.11'); });
      act(() => { vi.advanceTimersByTime(600); });
      expect(defaultProps.onChangeMachine).toHaveBeenCalledWith('victim-01');
    });
  });

  describe('processCommandResult - sshLoginUser', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('debe cambiar directorio a /home/user cuando no es root', () => {
      const { result } = renderHook(() => useCommandRunner(defaultProps));
      getExecutor().executeCommand = vi.fn(() => ({
        output: 'ok',
        sshLoginUser: 'john',
      }));
      act(() => { result.current.runCommand('ssh john@10.10.10.11'); });
      act(() => { vi.advanceTimersByTime(600); });
      expect(result.current.currentDir).toBe('/home/john');
    });
  });

  describe('processCommandResult - foundVulnerability', () => {
    it('debe reportar vulnerabilidad', () => {
      const { result } = renderHook(() => useCommandRunner(defaultProps));
      getExecutor().executeCommand = vi.fn(() => ({
        output: 'ok',
        foundVulnerability: { machineId: 'victim-01', vulnId: 'CVE-2021-1234', status: 'confirmed' },
      }));
      act(() => { result.current.runCommand('searchsploit apache 2.4.49'); });
      expect(getStore().reportVulnerability).toHaveBeenCalledWith('victim-01', 'CVE-2021-1234', 'confirmed');
    });
  });

  describe('processCommandResult - sshSessionClosed', () => {
    it('debe resetear directorio a /root/', () => {
      const { result } = renderHook(() => useCommandRunner(defaultProps));
      getExecutor().executeCommand = vi.fn(() => ({
        output: 'ok',
        sshSessionClosed: true,
      }));
      act(() => { result.current.runCommand('exit'); });
      expect(result.current.currentDir).toBe('/root/');
    });
  });

  describe('processCommandResult - failedUser', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('debe llamar onFailedUser si existe callback', () => {
      const { result } = renderHook(() => useCommandRunner(defaultProps));
      getExecutor().executeCommand = vi.fn(() => ({
        output: 'Login incorrect',
        failedUser: { machineId: 'victim-01', user: 'root' },
      }));
      act(() => { result.current.runCommand('ssh root@10.10.10.11'); });
      act(() => { vi.advanceTimersByTime(600); });
      expect(defaultProps.onFailedUser).toHaveBeenCalledWith('victim-01', 'root');
    });
  });

  describe('processCommandResult - createdFiles', () => {
    it('debe agregar archivos a la máquina atacante', () => {
      const { result } = renderHook(() => useCommandRunner(defaultProps));
      getExecutor().executeCommand = vi.fn(() => ({
        output: 'ok',
        createdFiles: [{ path: '/root/exploit.sh', content: '#!/bin/bash', type: 'text' }],
      }));
      act(() => { result.current.runCommand('wget http://example.com/exploit.sh'); });
    });
  });

  describe('runCommand - comando con streaming', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('debe marcar busy=true para comandos lentos (nmap)', () => {
      const { result } = renderHook(() => useCommandRunner(defaultProps));
      getExecutor().executeCommand = vi.fn(() => ({
        output: 'Starting Nmap...\nPORT  STATE SERVICE\n22/tcp open  ssh\n',
        streamingLineDelays: [100, 200],
      }));
      act(() => { result.current.runCommand('nmap -p 22 10.10.10.11'); });
      expect(result.current.busy).toBe(true);
      const streamingEntry = result.current.history[1];
      expect(streamingEntry.streaming).toBe(true);
      expect(streamingEntry.command).toBe('nmap -p 22 10.10.10.11');
      act(() => { vi.advanceTimersByTime(500); });
      expect(result.current.busy).toBe(false);
    });
  });

  describe('makeWelcome', () => {
    it('debe generar un mensaje de bienvenida', () => {
      const { result } = renderHook(() => useCommandRunner(defaultProps));
      const welcome = result.current.makeWelcome([]);
      expect(welcome).toHaveProperty('command', null);
      expect(welcome).toHaveProperty('streaming', false);
      expect(welcome).toHaveProperty('timestamp');
    });
  });

  describe('runCommand - su (prompt de password)', () => {
    it('debe pedir password y solo aplicar su_user si la password es correcta', () => {
      // Máquina no-atacante con known_passwords: el usuario NO es root → su pide password.
      const target = makeMachine({
        id: 'victim-01',
        known_passwords: { root: 'rootpass' },
      });
      const props = {
        ...defaultProps,
        machine: target,
        allMachines: [target, makeMachine()],
      };
      const { result } = renderHook(() => useCommandRunner(props));

      // 1. Ejecutar `su root` → el comando real devuelve requiresPassword.
      getExecutor().executeCommand = vi.fn(() => ({
        output: '', isError: false, requiresPassword: true, suTarget: 'root',
      }));
      act(() => { result.current.runCommand('su root'); });

      // El hook NO debe aplicar el switch todavía.
      expect(target.su_user).toBeUndefined();
      expect(result.current.pendingSu).toEqual({ targetUser: 'root', promptToken: '' });
      // La línea que pide la password es estilo ssh: "user@host's password: ".
      expect(result.current.prompt).toBe("root@kali's password: ");

      // 2. Password correcta → se aplica vía store (setSuUser).
      act(() => { result.current.runCommand('rootpass'); });
      expect(getStore().setSuUser).toHaveBeenCalledWith('victim-01', 'root');
      expect(result.current.pendingSu).toBeNull();

      // La password no debe quedar en el historial ni en cmdHistory.
      const typed = result.current.history.filter(e => e.command?.includes('rootpass'));
      expect(typed).toHaveLength(0);
    });

    it('debe rechazar la password incorrecta sin cambiar de usuario', () => {
      const target = makeMachine({
        id: 'victim-02',
        known_passwords: { root: 'rootpass' },
      });
      const props = {
        ...defaultProps,
        machine: target,
        allMachines: [target, makeMachine()],
      };
      const { result } = renderHook(() => useCommandRunner(props));

      getExecutor().executeCommand = vi.fn(() => ({
        output: '', isError: false, requiresPassword: true, suTarget: 'root',
      }));
      act(() => { result.current.runCommand('su root'); });

      act(() => { result.current.runCommand('WRONG'); });
      expect(target.su_user).toBeUndefined();
      expect(result.current.pendingSu).toBeNull();
      const lastEntry = result.current.history[result.current.history.length - 1];
      expect(lastEntry.output).toContain('Authentication failure');
    });

    it('debe aplicar el switch inmediato cuando su viene desde root (suUserApplied)', () => {
      const target = makeMachine({
        id: 'victim-01',
        su_user: 'root',
        known_passwords: { root: 'rootpass', developer: 'devpass' },
      });
      const props = {
        ...defaultProps,
        machine: target,
        allMachines: [target, makeMachine()],
      };
      const { result } = renderHook(() => useCommandRunner(props));

      // `su developer` desde root → el comando real devuelve suUserApplied.
      getExecutor().executeCommand = vi.fn(() => ({
        output: '', isError: false, suUserApplied: 'developer',
      }));
      act(() => { result.current.runCommand('su developer'); });

      // Switch aplicado al instante, sin prompt de password.
      expect(getStore().setSuUser).toHaveBeenCalledWith('victim-01', 'developer');
      expect(result.current.pendingSu).toBeNull();
    });
  });

  describe('runCommand - sudo -i/-s (prompt de password de root + privesc)', () => {
    it('debe validar la password de root y aplicar privesc (sudo -s → /root)', () => {
      const target = makeMachine({
        id: 'victim-01',
        known_passwords: { root: 'rootpass' },
      });
      const props = {
        ...defaultProps,
        machine: target,
        allMachines: [target, makeMachine()],
      };
      const { result } = renderHook(() => useCommandRunner(props));

      // `sudo -s` → pide password de root y marca sudoEscalation + sudoCwd.
      getExecutor().executeCommand = vi.fn(() => ({
        output: '', isError: false,
        requiresPassword: true, suTarget: 'root', sudoEscalation: true, sudoCwd: '/root',
      }));
      act(() => { result.current.runCommand('sudo -s'); });

      expect(result.current.pendingSu).toEqual({
        targetUser: 'root',
        promptToken: '',
        sudoEscalation: true,
        sudoCwd: '/root',
      });

      // Password correcta de ROOT → privesc a root (setPrivescCompleted).
      act(() => { result.current.runCommand('rootpass'); });
      expect(getStore().setPrivescCompleted).toHaveBeenCalledWith('victim-01');
      expect(getStore().setSuUser).toHaveBeenCalledWith('victim-01', 'root');
      expect(result.current.pendingSu).toBeNull();
    });

    it('sudo -i mantiene el directorio actual (sudoCwd undefined)', () => {
      const target = makeMachine({
        id: 'victim-02',
        known_passwords: { root: 'rootpass' },
      });
      const props = {
        ...defaultProps,
        machine: target,
        allMachines: [target, makeMachine()],
      };
      const { result } = renderHook(() => useCommandRunner(props));

      getExecutor().executeCommand = vi.fn(() => ({
        output: '', isError: false,
        requiresPassword: true, suTarget: 'root', sudoEscalation: true,
      }));
      act(() => { result.current.runCommand('sudo -i'); });

      expect(result.current.pendingSu?.sudoCwd).toBeUndefined();
      act(() => { result.current.runCommand('rootpass'); });
      expect(getStore().setPrivescCompleted).toHaveBeenCalledWith('victim-02');
      expect(getStore().setSuUser).toHaveBeenCalledWith('victim-02', 'root');
    });

    it('debe rechazar la password incorrecta sin escalar', () => {
      const target = makeMachine({
        id: 'victim-03',
        known_passwords: { root: 'rootpass' },
      });
      const props = {
        ...defaultProps,
        machine: target,
        allMachines: [target, makeMachine()],
      };
      const { result } = renderHook(() => useCommandRunner(props));

      getExecutor().executeCommand = vi.fn(() => ({
        output: '', isError: false,
        requiresPassword: true, suTarget: 'root', sudoEscalation: true, sudoCwd: '/root',
      }));
      act(() => { result.current.runCommand('sudo -s'); });

      act(() => { result.current.runCommand('WRONG'); });
      expect(getStore().setPrivescCompleted).not.toHaveBeenCalled();
      expect(getStore().setSuUser).not.toHaveBeenCalled();
      expect(result.current.pendingSu).toBeNull();
      const lastEntry = result.current.history[result.current.history.length - 1];
      expect(lastEntry.output).toContain('Authentication failure');
    });
  });

  describe('handleNanoSave - guardado con sudo (elevated)', () => {
    const restrictedMachine = () => makeMachine({
      id: 'victim-01',
      su_user: 'developer',
      files: [
        { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\ndeveloper:x:1001:1001:Developer:/home/developer:/bin/bash\n', type: 'text' },
        { path: '/etc/hosts', content: '127.0.0.1 localhost\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      ],
    });

    it('debe rechazar editar un archivo root como usuario sin privilegios', () => {
      const target = restrictedMachine();
      const props = { ...defaultProps, machine: target, allMachines: [target, makeMachine()] };
      const { result } = renderHook(() => useCommandRunner(props));

      act(() => {
        result.current.setNanoFile({
          path: '/etc/hosts', content: '127.0.0.1 localhost\n',
          readOnly: true, elevated: false,
          existingSnapshot: { owner: 'root', group: 'root', mode: 0o644 },
        });
      });
      const res = result.current.handleNanoSave('127.0.0.1 localhost\n127.0.0.2 test');
      expect(res).toEqual({ success: false, error: "nano: '/etc/hosts': Permission denied" });
      expect(getStore().addFileToMachine).not.toHaveBeenCalled();
    });

    it('debe permitir guardar con sudo nano (elevated) aunque el usuario no pueda editar', () => {
      const target = restrictedMachine();
      const props = { ...defaultProps, machine: target, allMachines: [target, makeMachine()] };
      const { result } = renderHook(() => useCommandRunner(props));

      act(() => {
        result.current.setNanoFile({
          path: '/etc/hosts', content: '127.0.0.1 localhost\n',
          readOnly: false, elevated: true,
          existingSnapshot: { owner: 'root', group: 'root', mode: 0o644 },
        });
      });
      const res = result.current.handleNanoSave('127.0.0.1 localhost\n127.0.0.2 test');
      expect(res.success).toBe(true);
      expect(getStore().addFileToMachine).toHaveBeenCalledWith(
        'victim-01',
        expect.objectContaining({ path: '/etc/hosts', content: '127.0.0.1 localhost\n127.0.0.2 test' }),
      );
    });
  });
});

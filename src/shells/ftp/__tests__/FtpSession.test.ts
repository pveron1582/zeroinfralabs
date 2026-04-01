// ── shells/ftp/__tests__/FtpSession.test.ts ───────────────────────
// Tests para la implementación modular del shell FTP

import { describe, it, expect, beforeEach } from 'vitest';
import { ftpSession, type FtpState } from '../FtpSession';
import type { ShellContext } from '../../ShellSession';

// ── Mock de máquinas ──────────────────────────────────────────────
const createMockMachines = () => [
  {
    id: 'attacker-01',
    machine_info: { hostname: 'kali', ip: '10.0.0.1', mac: '00:00:00:00:00:01', os: 'Kali Linux', status: 'up', type: 'attacker' },
    discovery_level: 5,
    scan_results: { ports: [] },
    web_enumeration: { web_server: '', cms: '', directories: [] },
    learning_steps: [],
    files: [],
  },
  {
    id: 'target-01',
    machine_info: { hostname: 'target', ip: '10.0.0.10', mac: '00:00:00:00:00:10', os: 'Ubuntu', status: 'up', type: 'target' },
    discovery_level: 0,
    scan_results: {
      ports: [
        { port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version: 'vsFTPd 3.0.3' },
      ],
    },
    web_enumeration: { web_server: '', cms: '', directories: [] },
    learning_steps: [],
    files: [
      { path: '/srv/ftp/flag.txt', content: 'FLAG{ftp_anonymous}', type: 'text' },
      { path: '/srv/ftp/readme.md', content: '# Welcome', type: 'text' },
    ],
  },
];

const createMockContext = (): ShellContext => ({
  machine: createMockMachines()[0] as any,
  allMachines: createMockMachines() as any,
  currentMissionId: 3,
  currentDir: '/root/',
  setCurrentDir: () => {},
});

// ── Tests ─────────────────────────────────────────────────────────
describe('FtpSession', () => {
  describe('createInitialState', () => {
    it('debe crear estado desconectado sin argumentos', () => {
      const ctx = createMockContext();
      const state = ftpSession.createInitialState([], ctx);

      expect(state.connected).toBe(false);
      expect(state.loggedIn).toBe(false);
      expect(state.step).toBe('connecting');
    });

    it('debe conectar a target con puerto FTP abierto', () => {
      const ctx = createMockContext();
      const state = ftpSession.createInitialState(['10.0.0.10'], ctx);

      expect(state.connected).toBe(true);
      expect(state.targetIp).toBe('10.0.0.10');
      expect(state.targetId).toBe('target-01');
      expect(state.step).toBe('username');
    });

    it('debe rechazar conexión a IP inexistente', () => {
      const ctx = createMockContext();
      const state = ftpSession.createInitialState(['192.168.1.99'], ctx);

      expect(state.connected).toBe(false);
    });
  });

  describe('getPrompt', () => {
    it('debe mostrar prompt de username', () => {
      const state: FtpState = { connected: true, targetIp: '10.0.0.10', loggedIn: false, step: 'username' };
      expect(ftpSession.getPrompt(state)).toBe('Name (10.0.0.10:root): ');
    });

    it('debe mostrar prompt de password', () => {
      const state: FtpState = { connected: true, targetIp: '10.0.0.10', username: 'anonymous', loggedIn: false, step: 'password' };
      expect(ftpSession.getPrompt(state)).toBe('Password: ');
    });

    it('debe mostrar prompt FTP conectado', () => {
      const state: FtpState = { connected: true, targetIp: '10.0.0.10', loggedIn: true, step: 'connected' };
      expect(ftpSession.getPrompt(state)).toBe('ftp> ');
    });
  });

  describe('Login flow', () => {
    it('debe pedir password para usuario anonymous', () => {
      const ctx = createMockContext();
      const initialState: FtpState = { connected: true, targetIp: '10.0.0.10', targetId: 'target-01', loggedIn: false, step: 'username' };

      const { result, newState } = ftpSession.executeCommand('anonymous', initialState, ctx);

      expect(result.output).toContain('331 Please specify the password');
      expect(newState.step).toBe('password');
      expect(newState.username).toBe('anonymous');
    });

    it('debe pedir password para usuarios no anonymous', () => {
      const ctx = createMockContext();
      const initialState: FtpState = { connected: true, targetIp: '10.0.0.10', targetId: 'target-01', loggedIn: false, step: 'username' };

      const { result, newState } = ftpSession.executeCommand('otheruser', initialState, ctx);

      expect(result.output).toContain('331');
      expect(newState.step).toBe('password');
      expect(newState.username).toBe('otheruser');
    });

    it('debe completar login con cualquier password', () => {
      const ctx = createMockContext();
      const initialState: FtpState = { connected: true, targetIp: '10.0.0.10', targetId: 'target-01', username: 'anonymous', loggedIn: false, step: 'password' };

      const { result, newState } = ftpSession.executeCommand('anything', initialState, ctx);

      expect(result.output).toContain('230 Login successful');
      expect(newState.loggedIn).toBe(true);
      expect(newState.step).toBe('connected');
    });
  });

  describe('Comandos FTP', () => {
    const connectedState: FtpState = { connected: true, targetIp: '10.0.0.10', targetId: 'target-01', username: 'anonymous', loggedIn: true, step: 'connected' };

    it('debe listar archivos con ls', () => {
      const ctx = createMockContext();
      const { result } = ftpSession.executeCommand('ls', connectedState, ctx);

      expect(result.output).toContain('flag.txt');
      expect(result.output).toContain('readme.md');
    });

    it('debe descargar archivo con get', () => {
      const ctx = createMockContext();
      const { result } = ftpSession.executeCommand('get flag.txt', connectedState, ctx);

      expect(result.output).toContain('226 Transfer complete');
      expect(result.downloadedFile).toBeDefined();
      expect(result.downloadedFile?.content).toBe('FLAG{ftp_anonymous}');
    });

    it('debe rechazar get sin archivo', () => {
      const ctx = createMockContext();
      const { result } = ftpSession.executeCommand('get', connectedState, ctx);

      expect(result.output).toContain('usage: get');
    });

    it('debe mostrar error para archivo inexistente', () => {
      const ctx = createMockContext();
      const { result } = ftpSession.executeCommand('get nonexistent.txt', connectedState, ctx);

      expect(result.output).toContain('No such file or directory');
    });

    it('debe mostrar help', () => {
      const ctx = createMockContext();
      const { result } = ftpSession.executeCommand('help', connectedState, ctx);

      expect(result.output).toContain('Commands available');
      expect(result.output).toContain('ls');
      expect(result.output).toContain('get');
    });

    it('debe cerrar sesión con exit', () => {
      const ctx = createMockContext();
      const { result, newState } = ftpSession.executeCommand('exit', connectedState, ctx);

      expect(result.output).toContain('Goodbye');
      expect(result.closeSession).toBe(true);
      expect(newState.connected).toBe(false);
    });

    it('debe salir con quit', () => {
      const ctx = createMockContext();
      const { result } = ftpSession.executeCommand('quit', connectedState, ctx);

      expect(result.closeSession).toBe(true);
    });

    it('debe rechazar comando inválido', () => {
      const ctx = createMockContext();
      const { result } = ftpSession.executeCommand('invalidcmd', connectedState, ctx);

      expect(result.output).toContain('Invalid command');
    });
  });

  describe('isActive', () => {
    it('debe retornar true cuando está conectado', () => {
      const state: FtpState = { connected: true, loggedIn: true, step: 'connected' };
      expect(ftpSession.isActive(state)).toBe(true);
    });

    it('debe retornar false cuando no está conectado', () => {
      const state: FtpState = { connected: false, loggedIn: false, step: 'connecting' };
      expect(ftpSession.isActive(state)).toBe(false);
    });
  });
});
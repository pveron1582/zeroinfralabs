// ── shells/nc/__tests__/NcSession.test.ts ──────────────────────────────
import { describe, it, expect } from 'vitest';
import { ncSession } from '../NcSession';
import type { ShellContext } from '../../ShellSession';
import type { Machine } from '../../../types';

describe('NcSession', () => {
  const createMockMachine = (ip: string, learningSteps: any[] = []): Machine => ({
    id: 'test-machine',
    machine_info: { hostname: 'test', ip, mac: '00:00:00:00:00:00', os: 'Linux', status: 'up', type: 'server' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: learningSteps,
    files: [],
  });

  const ctxNoListener: ShellContext = {
    machine: createMockMachine('192.168.1.10'),
    allMachines: [createMockMachine('192.168.1.10')],
    currentMissionId: 1,
    currentDir: '/',
    setCurrentDir: () => {},
  };

  const lfiTarget = createMockMachine('192.168.20.11', [
    { id: 4, task: 'Setup Listener', text: 'nc -nlvp 4444', targetMachineId: 'lab-scenario-04-lfi', discoveryLevel: 3 },
  ]);

  const ctxWithListener: ShellContext = {
    machine: createMockMachine('192.168.1.10'),
    allMachines: [createMockMachine('192.168.1.10'), lfiTarget],
    currentMissionId: 4,
    currentDir: '/',
    setCurrentDir: () => {},
  };

  describe('createInitialState', () => {
    it('debe crear estado inicial sin conexión', () => {
      const state = ncSession.createInitialState([], ctxNoListener);
      expect(state.listening).toBe(false);
      expect(state.connected).toBe(false);
    });
  });

  describe('getPrompt', () => {
    it('debe retornar string vacío (NC no usa prompt interactivo)', () => {
      const state = { listening: true, port: 4444, connected: false };
      expect(ncSession.getPrompt(state)).toBe('');
    });
  });

  describe('executeCommand', () => {
    it('debe mostrar ayuda si no hay argumentos', () => {
      const state = ncSession.createInitialState([], ctxNoListener);
      const { result } = ncSession.executeCommand('', state, ctxNoListener);
      expect(result.output).toContain('usage: nc');
      expect(result.closeSession).toBe(true);
    });

    it('debe activar listener y completar misión cuando hay step de listener activo', () => {
      const state = ncSession.createInitialState([], ctxWithListener);
      const { result, newState } = ncSession.executeCommand('-nlvp 4444', state, ctxWithListener);
      expect(result.output).toContain('listening on');
      expect(result.output).toContain('4444');
      expect(result.completedMissionId).toBe(4);
      expect(result.blockingCommand).toBeDefined();
      expect(newState.listening).toBe(true);
      expect(newState.port).toBe(4444);
    });

    it('nc sin step de listener activo no completa misión', () => {
      const state = ncSession.createInitialState([], ctxNoListener);
      const { result, newState } = ncSession.executeCommand('-nlvp 4444', state, ctxNoListener);
      expect(result.output).toContain('listening');
      expect(result.completedMissionId).toBeUndefined();
      expect(newState.listening).toBe(true);
    });

    it('debe rechazar puerto inválido (línea 57)', () => {
      // Este test usa -p para forzar el caso de "bad port" en la línea 57
      const state = ncSession.createInitialState([], ctxNoListener);
      const { result } = ncSession.executeCommand('-l -p invalid', state, ctxNoListener);
      expect(result.isError).toBe(true);
      expect(result.output).toContain('bad port');
      expect(result.closeSession).toBe(true);
    });

    it('debe rechazar puerto fuera de rango', () => {
      const state = ncSession.createInitialState([], ctxNoListener);
      const { result } = ncSession.executeCommand('-lvp 99999', state, ctxNoListener);
      expect(result.isError).toBe(true);
      expect(result.output).toContain('out of range');
    });

    it('debe rechazar conexión a host inexistente', () => {
      const state = ncSession.createInitialState([], ctxNoListener);
      const { result } = ncSession.executeCommand('example.com 80', state, ctxNoListener);
      expect(result.isError).toBe(true);
      expect(result.output).toContain('Connection refused');
      expect(result.closeSession).toBe(true);
    });

    it('debe mostrar error si falta puerto en modo conectar', () => {
      const state = ncSession.createInitialState([], ctxNoListener);
      const { result } = ncSession.executeCommand('example.com', state, ctxNoListener);
      expect(result.isError).toBe(true);
      expect(result.output).toContain('missing arguments');
      expect(result.closeSession).toBe(true);
    });
  });

  describe('isActive', () => {
    it('debe retornar true cuando está escuchando', () => {
      const state = { listening: true, port: 4444, connected: false };
      expect(ncSession.isActive(state)).toBe(true);
    });

    it('debe retornar true cuando está conectado', () => {
      const state = { listening: false, port: 80, connected: true };
      expect(ncSession.isActive(state)).toBe(true);
    });

    it('debe retornar false cuando no hay conexión', () => {
      const state = { listening: false, connected: false };
      expect(ncSession.isActive(state)).toBe(false);
    });
  });
});

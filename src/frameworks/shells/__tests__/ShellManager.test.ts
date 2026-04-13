// ── shells/__tests__/ShellManager.test.ts ─────────────────────────
// Tests para el ShellManager y sistema de stack

import { describe, it, expect, beforeEach } from 'vitest';
import { ShellManager } from '../ShellManager';
import type { ShellSession, ShellContext } from '../ShellSession';

// ── Mock shell simple para testing ────────────────────────────────
interface MockState {
  active: boolean;
  commandCount: number;
}

const mockShell: ShellSession<MockState> = {
  name: 'mock',

  getPrompt(state) {
    return state.active ? 'mock> ' : '';
  },

  createInitialState() {
    return { active: true, commandCount: 0 };
  },

  executeCommand(input, state) {
    const cmd = input.trim().toLowerCase();

    if (cmd === 'exit') {
      return {
        result: { output: 'Goodbye', closeSession: true },
        newState: { ...state, active: false },
      };
    }

    if (cmd === 'count') {
      const newState = { ...state, commandCount: state.commandCount + 1 };
      return {
        result: { output: `Count: ${newState.commandCount}` },
        newState,
      };
    }

    return {
      result: { output: `Unknown: ${cmd}` },
      newState: { ...state, commandCount: state.commandCount + 1 },
    };
  },

  isActive(state) {
    return state.active;
  },
};

// ── Mock shell anidado ────────────────────────────────────────────
const nestedShell: ShellSession<MockState> = {
  name: 'nested',

  getPrompt(state) {
    return state.active ? 'nested> ' : '';
  },

  createInitialState() {
    return { active: true, commandCount: 0 };
  },

  executeCommand(input, state) {
    if (input.trim() === 'exit') {
      return {
        result: { output: 'Exiting nested', closeSession: true },
        newState: { ...state, active: false },
      };
    }
    return {
      result: { output: `Nested: ${input}` },
      newState: state,
    };
  },

  isActive(state) {
    return state.active;
  },
};

// ── Contexto mock ─────────────────────────────────────────────────
const mockCtx: ShellContext = {
  machine: {} as any,
  allMachines: [],
  currentMissionId: 1,
  currentDir: '/',
  setCurrentDir: () => {},
};

// ── Tests ─────────────────────────────────────────────────────────
describe('ShellManager', () => {
  let manager: ShellManager;

  beforeEach(() => {
    manager = new ShellManager();
    manager.register(mockShell);
    manager.register(nestedShell);
  });

  describe('Registro', () => {
    it('debe registrar shells', () => {
      expect(manager.getRegisteredNames()).toContain('mock');
      expect(manager.getRegisteredNames()).toContain('nested');
    });
  });

  describe('Stack básico', () => {
    it('debe iniciar con stack vacío', () => {
      expect(manager.isActive()).toBe(false);
      expect(manager.getDepth()).toBe(0);
    });

    it('debe iniciar una sesión', () => {
      manager.startSession('mock', [], mockCtx);
      expect(manager.isActive()).toBe(true);
      expect(manager.getDepth()).toBe(1);
      expect(manager.getCurrentShellName()).toBe('mock');
      expect(manager.getPrompt()).toBe('mock> ');
    });

    it('debe ejecutar comandos en el shell activo', () => {
      manager.startSession('mock', [], mockCtx);
      const result = manager.execute('count', mockCtx);
      expect(result.output).toBe('Count: 1');
    });

    it('debe cerrar sesión con exit', () => {
      manager.startSession('mock', [], mockCtx);
      expect(manager.isActive()).toBe(true);

      const result = manager.execute('exit', mockCtx);
      expect(result.output).toBe('Goodbye');
      expect(manager.isActive()).toBe(false);
    });
  });

  describe('Stack anidado', () => {
    it('debe soportar shells anidados', () => {
      manager.startSession('mock', [], mockCtx);
      expect(manager.getDepth()).toBe(1);

      manager.startSession('nested', [], mockCtx);
      expect(manager.getDepth()).toBe(2);
      expect(manager.getCurrentShellName()).toBe('nested');
      expect(manager.getPrompt()).toBe('nested> ');
    });

    it('debe volver al shell anterior al cerrar el actual', () => {
      manager.startSession('mock', [], mockCtx);
      manager.startSession('nested', [], mockCtx);

      expect(manager.getCurrentShellName()).toBe('nested');

      // Cerrar nested
      manager.execute('exit', mockCtx);

      // Debe volver a mock
      expect(manager.isActive()).toBe(true);
      expect(manager.getCurrentShellName()).toBe('mock');
      expect(manager.getPrompt()).toBe('mock> ');
    });

    it('debe mostrar la ruta de shells', () => {
      manager.startSession('mock', [], mockCtx);
      manager.startSession('nested', [], mockCtx);

      expect(manager.getShellPath()).toEqual(['mock', 'nested']);
    });
  });

  describe('Reset', () => {
    it('debe limpiar todo el stack', () => {
      manager.startSession('mock', [], mockCtx);
      manager.startSession('nested', [], mockCtx);

      manager.reset();

      expect(manager.isActive()).toBe(false);
      expect(manager.getDepth()).toBe(0);
    });
  });

  describe('Errores', () => {
    it('debe manejar shell inexistente', () => {
      const result = manager.startSession('nonexistent', [], mockCtx);
      expect(result.isError).toBe(true);
    });

    it('debe manejar ejecución sin sesión activa', () => {
      const result = manager.execute('test', mockCtx);
      expect(result.isError).toBe(true);
    });
  });

  describe('Serialización', () => {
    it('debe serializar el stack', () => {
      manager.startSession('mock', [], mockCtx);
      manager.startSession('nested', [], mockCtx);

      const serialized = manager.serialize();
      expect(serialized).toHaveLength(2);
      expect(serialized[0].shellName).toBe('mock');
      expect(serialized[1].shellName).toBe('nested');
    });

    it('debe restaurar el stack', () => {
      const data = [
        { shellName: 'mock', state: { active: true, commandCount: 5 } },
        { shellName: 'nested', state: { active: true, commandCount: 3 } },
      ];

      const success = manager.deserialize(data, mockCtx);
      expect(success).toBe(true);
      expect(manager.getDepth()).toBe(2);
      expect(manager.getShellPath()).toEqual(['mock', 'nested']);
    });
  });
});
// ── commands/builtin/__tests__/cd.test.ts ─────────────────────────
import { describe, it, expect, vi } from 'vitest';
import { cmd_cd } from '../cd';
import type { Machine, CommandContext } from '../../../types';

describe('cmd_cd', () => {
  const createMockMachine = (files: { path: string; content: string; type: string }[] = []): Machine => ({
    id: 'test-machine',
    machine_info: {
      hostname: 'test-host',
      ip: '192.168.1.100',
      mac: '00:00:00:00:00:00',
      os: 'Linux',
      status: 'up',
      type: 'server',
    },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: files.length > 0 ? files : [
      { path: '/home/user/file.txt', content: 'test', type: 'text' },
      { path: '/etc/config.conf', content: 'config', type: 'text' },
    ],
  });

  const createMockContext = (
    machine: Machine,
    currentDir: string = '/',
    setCurrentDir?: (dir: string) => void
  ): CommandContext => ({
    machine,
    allMachines: [machine],
    currentMissionId: 1,
    currentDir,
    setCurrentDir,
  });

  describe('sin argumentos', () => {
    it('debe cambiar al directorio home cuando no hay argumentos', () => {
      const machine = createMockMachine();
      const setCurrentDir = vi.fn();
      const result = cmd_cd.execute([], createMockContext(machine, '/tmp', setCurrentDir));

      expect(setCurrentDir).toHaveBeenCalledWith('/home/user/');
    });

    it('debe retornar output vacío en éxito', () => {
      const machine = createMockMachine();
      const setCurrentDir = vi.fn();
      const result = cmd_cd.execute(['/etc'], createMockContext(machine, '/', setCurrentDir));

      expect(result.output).toBe('');
    });
  });

  describe('cd ..', () => {
    it('debe cambiar al directorio padre', () => {
      const machine = createMockMachine();
      const setCurrentDir = vi.fn();
      cmd_cd.execute(['..'], createMockContext(machine, '/home/user', setCurrentDir));

      expect(setCurrentDir).toHaveBeenCalledWith('/home/');
    });

    it('debe permanecer en raíz si ya está en /', () => {
      const machine = createMockMachine();
      const setCurrentDir = vi.fn();
      cmd_cd.execute(['..'], createMockContext(machine, '/', setCurrentDir));

      expect(setCurrentDir).toHaveBeenCalledWith('/');
    });

    it('debe manejar .. (subir un nivel)', () => {
      const machine = createMockMachine();
      const setCurrentDir = vi.fn();
      cmd_cd.execute(['..'], createMockContext(machine, '/home/user', setCurrentDir));

      expect(setCurrentDir).toHaveBeenCalledWith('/home/');
    });
  });

  describe('cd /path', () => {
    it('debe cambiar a ruta absoluta', () => {
      const machine = createMockMachine();
      const setCurrentDir = vi.fn();
      cmd_cd.execute(['/etc'], createMockContext(machine, '/', setCurrentDir));

      expect(setCurrentDir).toHaveBeenCalledWith('/etc/');
    });

    it('debe cambiar a ruta absoluta anidada conocida', () => {
      const machine = createMockMachine();
      const setCurrentDir = vi.fn();
      cmd_cd.execute(['/var/www/html'], createMockContext(machine, '/', setCurrentDir));

      expect(setCurrentDir).toHaveBeenCalledWith('/var/www/html/');
    });
  });

  describe('cd relative/path', () => {
    it('debe cambiar a ruta relativa existente', () => {
      const machine = createMockMachine([
        { path: '/home/user/docs/readme.txt', content: 'test', type: 'text' },
      ]);
      const setCurrentDir = vi.fn();
      const result = cmd_cd.execute(['..'], createMockContext(machine, '/home/user', setCurrentDir));

      expect(setCurrentDir).toHaveBeenCalledWith('/home/');
      expect(result.output).toBe('');
    });

    it('debe mostrar error para ruta relativa inexistente', () => {
      const machine = createMockMachine();
      const setCurrentDir = vi.fn();
      const result = cmd_cd.execute(['nonexistent'], createMockContext(machine, '/home/user', setCurrentDir));

      expect(result.isError).toBe(true);
      expect(result.output).toContain('No such file or directory');
    });
  });

  describe('cd ~', () => {
    it('debe cambiar al home del usuario', () => {
      const machine = createMockMachine();
      const setCurrentDir = vi.fn();
      cmd_cd.execute(['~'], createMockContext(machine, '/tmp', setCurrentDir));

      expect(setCurrentDir).toHaveBeenCalledWith('/home/user/');
    });
  });

  describe('cd -', () => {
    it('debe mostrar error ya que no hay directorio anterior', () => {
      const machine = createMockMachine();
      const setCurrentDir = vi.fn();
      const result = cmd_cd.execute(['-'], createMockContext(machine, '/', setCurrentDir));

      expect(result.isError).toBe(true);
      expect(result.output).toContain('No such file or directory');
    });
  });

  describe('sin setCurrentDir', () => {
    it('no debe fallar si setCurrentDir no está definido', () => {
      const machine = createMockMachine();
      const result = cmd_cd.execute(['/etc'], createMockContext(machine, '/'));

      expect(result.output).toBe('');
      expect(result.isError).toBeUndefined();
    });
  });
});
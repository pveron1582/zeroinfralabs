// ── fs-models/__tests__/index.test.ts ─────────────────────────────
// Tests para las exportaciones del módulo fs-models

import { describe, it, expect } from 'vitest';
import { createLinuxFileSystem, createWindowsFileSystem } from '../index';
import type { LinuxFileSystemConfig, WindowsFileSystemConfig } from '../index';

describe('fs-models index', () => {
  describe('createLinuxFileSystem', () => {
    it('debe estar exportada y ser una función', () => {
      expect(createLinuxFileSystem).toBeDefined();
      expect(typeof createLinuxFileSystem).toBe('function');
    });

    it('debe crear un sistema de archivos Linux al ser llamada', () => {
      const files = createLinuxFileSystem();
      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBeGreaterThan(0);
    });

    it('debe aceptar configuración opcional', () => {
      const config: LinuxFileSystemConfig = { username: 'testuser' };
      const files = createLinuxFileSystem(config);
      expect(Array.isArray(files)).toBe(true);
    });
  });

  describe('createWindowsFileSystem', () => {
    it('debe estar exportada y ser una función', () => {
      expect(createWindowsFileSystem).toBeDefined();
      expect(typeof createWindowsFileSystem).toBe('function');
    });

    it('debe crear un sistema de archivos Windows al ser llamada', () => {
      const files = createWindowsFileSystem();
      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBeGreaterThan(0);
    });

    it('debe aceptar configuración opcional', () => {
      const config: WindowsFileSystemConfig = { username: 'testuser', computerName: 'TEST-PC' };
      const files = createWindowsFileSystem(config);
      expect(Array.isArray(files)).toBe(true);
    });
  });

  describe('exportaciones de tipos', () => {
    it('debe permitir usar LinuxFileSystemConfig como tipo', () => {
      const config: LinuxFileSystemConfig = {
        username: 'admin',
        password: 'password123',
        shadowPassword: '$6$rounds=656000$salt$hash'
      };
      expect(config).toBeDefined();
      expect(config.username).toBe('admin');
    });

    it('debe permitir usar WindowsFileSystemConfig como tipo', () => {
      const config: WindowsFileSystemConfig = {
        username: 'Administrator',
        computerName: 'WIN-SERVER'
      };
      expect(config).toBeDefined();
      expect(config.username).toBe('Administrator');
    });
  });
});
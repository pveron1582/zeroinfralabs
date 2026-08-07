// ── commands/__tests__/fase3-suid-sticky.test.ts ───────────────────
// Tests for Fase 3: SUID, SGID, Sticky Bit permissions

import { describe, it, expect, beforeEach } from 'vitest';
import type { Machine } from '../../types';
import { formatMode, hasSuid, hasStickyBit } from '../../utils/permissions';
import { executeCommand } from '../index';

// ── Mocks ─────────────────────────────────────────────────────────
const createMachine = (overrides: Partial<Machine> = {}): Machine => ({
  id: 'test-machine',
  machine_info: {
    hostname: 'test',
    ip: '192.168.1.100',
    mac: '00:00:00:00:00:01',
    os: 'Linux',
    status: 'up',
    type: 'workstation',
  },
  discovery_level: 0,
  scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [
    { path: '/usr/bin/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/usr/bin/su', content: '[ELF binary]', type: 'binary', owner: 'root', group: 'root', mode: 0o4755 },
    { path: '/usr/bin/sudo', content: '[ELF binary]', type: 'binary', owner: 'root', group: 'root', mode: 0o4755 },
    { path: '/usr/bin/passwd', content: '[ELF binary]', type: 'binary', owner: 'root', group: 'root', mode: 0o4755 },
    { path: '/usr/bin/find', content: '[ELF binary]', type: 'binary', owner: 'root', group: 'root', mode: 0o4755 },
    { path: '/usr/bin/vim', content: '[ELF binary]', type: 'binary', owner: 'root', group: 'root', mode: 0o4755 },
    { path: '/usr/bin/normal', content: '[ELF binary]', type: 'binary', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/usr/bin/whoami', content: '[ELF binary]', type: 'binary', owner: 'root', group: 'root', mode: 0o4755 },
    { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
    { path: '/home/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/home/user/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 },
    { path: '/home/user/myfile.txt', content: 'hello', type: 'text', owner: 'user', group: 'user', mode: 0o644 },
    {
      path: '/etc/passwd',
      content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash',
      type: 'text',
      owner: 'root',
      group: 'root',
      mode: 0o644,
    },
    {
      path: '/etc/group',
      content: 'root:x:0:\nuser:x:1000:\nsudo:x:27:\nshadow:x:42:',
      type: 'text',
      owner: 'root',
      group: 'root',
      mode: 0o644,
    },
  ],
  ...overrides,
});

describe('Fase 3: SUID, SGID, Sticky Bit', () => {
  describe('3.1 SUID detection in command execution', () => {
    it('should detect SUID bit on sudo binary', () => {
      const sudoFile = createMachine().files.find(f => f.path === '/usr/bin/sudo');
      expect(sudoFile).toBeDefined();
      expect(hasSuid(sudoFile!.mode ?? 0o755)).toBe(true);
    });

    it('should detect SUID bit on su binary', () => {
      const suFile = createMachine().files.find(f => f.path === '/usr/bin/su');
      expect(suFile).toBeDefined();
      expect(hasSuid(suFile!.mode ?? 0o755)).toBe(true);
    });

    it('should detect SUID bit on passwd binary', () => {
      const passwdFile = createMachine().files.find(f => f.path === '/usr/bin/passwd');
      expect(passwdFile).toBeDefined();
      expect(hasSuid(passwdFile!.mode ?? 0o755)).toBe(true);
    });

    it('should detect SUID bit on find binary', () => {
      const findFile = createMachine().files.find(f => f.path === '/usr/bin/find');
      expect(findFile).toBeDefined();
      expect(hasSuid(findFile!.mode ?? 0o755)).toBe(true);
    });

    it('should NOT detect SUID on a normal binary (mode 755)', () => {
      const normalFile = createMachine().files.find(f => f.path === '/usr/bin/normal');
      expect(normalFile).toBeDefined();
      expect(hasSuid(normalFile!.mode ?? 0o755)).toBe(false);
    });
  });

  describe('3.2 Sticky bit detection', () => {
    it('should detect sticky bit on /tmp directory', () => {
      const tmpDir = createMachine().files.find(f => f.path === '/tmp/.dir');
      expect(tmpDir).toBeDefined();
      expect(hasStickyBit(tmpDir!.mode ?? 0o755)).toBe(true);
    });

    it('should NOT detect sticky bit on /home directory', () => {
      const homeDir = createMachine().files.find(f => f.path === '/home/.dir');
      expect(homeDir).toBeDefined();
      expect(hasStickyBit(homeDir!.mode ?? 0o755)).toBe(false);
    });
  });

  describe('3.3 SUID display in ls -l format', () => {
    it('should format SUID binary as -rwsr-xr-x', () => {
      const modeStr = formatMode(0o4755, false);
      expect(modeStr).toBe('-rwsr-xr-x');
    });

    it('should format sticky bit directory as drwxrwxrwt', () => {
      const modeStr = formatMode(0o1777, true);
      expect(modeStr).toBe('drwxrwxrwt');
    });

    it('should format normal file as -rwxr-xr-x', () => {
      const modeStr = formatMode(0o755, false);
      expect(modeStr).toBe('-rwxr-xr-x');
    });

    it('should format SUID without execute as -rwSr-xr-x', () => {
      const modeStr = formatMode(0o4655, false);
      expect(modeStr).toBe('-rwSr-xr-x');
    });
  });

  describe('3.4 Sticky bit prevents deletion of others files', () => {
    it('should have correct sticky bit mode (0o1777) on /tmp', () => {
      const tmpDir = createMachine().files.find(f => f.path === '/tmp/.dir');
      expect(tmpDir?.mode).toBe(0o1777);
    });

    it('should have correct normal mode (0o755) on /home', () => {
      const homeDir = createMachine().files.find(f => f.path === '/home/.dir');
      expect(homeDir?.mode).toBe(0o755);
    });
  });

  describe('3.5 SUID binaries in fs-linux model', () => {
    it('should have 5 SUID binaries in the standard fs-linux', async () => {
      const { createLinuxFileSystem } = await import('../../fs-models/fs-linux');
      const fs = createLinuxFileSystem();
      const suidBinaries = fs.filter(f => hasSuid(f.mode ?? 0o755));
      expect(suidBinaries.length).toBe(5);
      expect(suidBinaries.map(f => f.path)).toContain('/usr/bin/su');
      expect(suidBinaries.map(f => f.path)).toContain('/usr/bin/sudo');
      expect(suidBinaries.map(f => f.path)).toContain('/usr/bin/passwd');
      expect(suidBinaries.map(f => f.path)).toContain('/usr/bin/find');
      expect(suidBinaries.map(f => f.path)).toContain('/usr/bin/vim');
    });

    it('should have sticky bit on /tmp in fs-linux', async () => {
      const { createLinuxFileSystem } = await import('../../fs-models/fs-linux');
      const fs = createLinuxFileSystem();
      const tmpDir = fs.find(f => f.path === '/tmp/.dir');
      expect(tmpDir).toBeDefined();
      expect(hasStickyBit(tmpDir!.mode ?? 0o755)).toBe(true);
      expect(tmpDir!.mode).toBe(0o1777);
    });
  });

  describe('3.6 SUID execution changes effective identity', () => {
    const SUID_MACHINE: Machine = {
      id: 'target-01',
      machine_info: { hostname: 'target', ip: '192.168.1.101', mac: '00:00:00:00:00:02', os: 'Linux', status: 'up', type: 'workstation' },
      discovery_level: 4,
      scan_results: { ports: [] },
      web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
      learning_steps: [],
      files: [
        { path: '/usr/bin/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
        { path: '/usr/bin/whoami', content: '[ELF binary]', type: 'binary', owner: 'root', group: 'root', mode: 0o4755 },
        { path: '/usr/bin/normal', content: '[ELF binary]', type: 'binary', owner: 'root', group: 'root', mode: 0o755 },
        { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
        { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
        { path: '/etc/group', content: 'root:x:0:\nuser:x:1000:\nsudo:x:27:', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      ],
    };

    beforeEach(() => {
      SUID_MACHINE.files = SUID_MACHINE.files.filter(f => f.path !== '/tmp/user_file.txt');
    });

    it('debe cambiar identidad a root al ejecutar binario SUID de root', () => {
      const result = executeCommand('whoami', SUID_MACHINE, [SUID_MACHINE], 0, undefined, '/');
      expect(result.output).toContain('root');
    });

    it('debe emitir privescAttempted=true en respuesta SUID', () => {
      const result = executeCommand('whoami', SUID_MACHINE, [SUID_MACHINE], 0, undefined, '/');
      expect('privescAttempted' in result).toBe(true);
      expect(result.privescAttempted).toBe(true);
    });

    it('debe emitir privescTool y privescCompleted en respuesta SUID', () => {
      const result = executeCommand('whoami', SUID_MACHINE, [SUID_MACHINE], 0, undefined, '/');
      expect(result.privescTool).toBe('whoami');
      expect(result.privescCompleted).toBe('target-01');
    });

    it('NO debe emitir privesc para binario sin SUID', () => {
      const normalResult = executeCommand('whoami', {
        ...SUID_MACHINE,
        files: SUID_MACHINE.files.map(f =>
          f.path === '/usr/bin/whoami'
            ? { ...f, mode: 0o755 }
            : f
        ),
      }, [SUID_MACHINE], 0, undefined, '/');
      expect(normalResult.privescAttempted).toBeUndefined();
    });
  });

  describe('3.7 Sticky bit en /tmp — rmdir respeta dueño', () => {
    function makeStickyMachine(): Machine {
      return {
        id: 'target-05',
        machine_info: { hostname: 'target', ip: '192.168.1.105', mac: '00:00:00:00:00:05', os: 'Linux', status: 'up', type: 'workstation' },
        discovery_level: 4,
        scan_results: { ports: [{ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.9p1', credentials: { user: 'bob', pass: 'pass' } }] },
        web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
        learning_steps: [],
        files: [
          { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
          { path: '/tmp/alice_subdir/.dir', content: '', type: 'text', owner: 'alice', group: 'alice', mode: 0o755 },
          { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\nalice:x:1000:1000:alice:/home/alice:/bin/bash\nbob:x:1001:1001:bob:/home/bob:/bin/bash', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
          { path: '/etc/group', content: 'root:x:0:\nalice:x:1000:\nbob:x:1001:', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
        ],
      };
    }

    it('debe permitir a root borrar subdirectorio ajeno en /tmp', () => {
      const machine: Machine = {
        id: 'attacker-sticky',
        machine_info: { hostname: 'kali', ip: '192.168.1.10', mac: '00:00:00:00:00:01', os: 'Kali', status: 'up', type: 'workstation' },
        discovery_level: 4,
        scan_results: { ports: [] },
        web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
        learning_steps: [],
        files: [
          { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
          { path: '/tmp/alice_subdir/.dir', content: '', type: 'text', owner: 'alice', group: 'alice', mode: 0o755 },
          { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\nalice:x:1000:1000:alice:/home/alice:/bin/bash', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
          { path: '/etc/group', content: 'root:x:0:\nalice:x:1000:', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
        ],
      };
      const result = executeCommand('rmdir /tmp/alice_subdir', machine, [machine], 0, undefined, '/');
      expect(result.isError).not.toBe(true);
      expect(result.output).not.toContain('Operation not permitted');
    });

    it('debe denegar a bob borrar subdirectorio de alice en /tmp', () => {
      const machine = makeStickyMachine();
      const result = executeCommand('rmdir /tmp/alice_subdir', machine, [machine], 0, undefined, '/');
      expect(result.output).toContain('Operation not permitted');
    });

    it('debe permitir al dueño borrar su propio subdirectorio en /tmp', () => {
      const machine: Machine = {
        id: 'target-alice',
        machine_info: { hostname: 'target', ip: '192.168.1.105', mac: '00:00:00:00:00:05', os: 'Linux', status: 'up', type: 'workstation' },
        discovery_level: 4,
        scan_results: { ports: [{ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.9p1', credentials: { user: 'alice', pass: 'pass' } }] },
        web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
        learning_steps: [],
        files: [
          { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
          { path: '/tmp/alice_subdir/.dir', content: '', type: 'text', owner: 'alice', group: 'alice', mode: 0o755 },
          { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\nalice:x:1000:1000:alice:/home/alice:/bin/bash', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
          { path: '/etc/group', content: 'root:x:0:\nalice:x:1000:', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
        ],
      };
      const result = executeCommand('rmdir /tmp/alice_subdir', machine, [machine], 0, undefined, '/');
      expect(result.isError).not.toBe(true);
      expect(result.output).not.toContain('Operation not permitted');
    });
  });
});
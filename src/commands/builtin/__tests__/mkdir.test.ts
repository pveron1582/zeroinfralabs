// ── commands/builtin/__tests__/mkdir.test.ts ───────────────────────────────
// Tests para el comando mkdir

import { describe, it, expect, beforeEach } from 'vitest';
import { cmd_mkdir } from '../mkdir';
import type { Machine, CommandContext } from '../../../types';

describe('cmd_mkdir', () => {
  let mockMachine: Machine;
  let mockContext: CommandContext;

  beforeEach(() => {
    mockMachine = {
      id: 'test-machine',
      machine_info: { hostname: 'test', ip: '192.168.1.100', mac: '00:11:22:33:44:55', os: 'Linux', status: 'up', type: 'workstation' },
      discovery_level: 0,
      scan_results: { ports: [] },
      web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
      learning_steps: [],
      files: [
        { path: '/.dir', content: '', type: 'text' },
        { path: '/home/.dir', content: '', type: 'text' },
        { path: '/home/kali/.dir', content: '', type: 'text' },
        { path: '/tmp/.dir', content: '', type: 'text' },
        { path: '/var/.dir', content: '', type: 'text' },
        { path: '/var/www/.dir', content: '', type: 'text' },
        { path: '/var/www/html/.dir', content: '', type: 'text' },
        { path: '/bin/.dir', content: '', type: 'text' },
      ],
      found_credentials: { file: '', user: 'kali', pass: 'kali', verified: false }
    };

    mockContext = {
      machine: mockMachine,
      allMachines: [mockMachine],
      currentMissionId: 1,
      currentDir: '/home/kali/'
    };
  });

  it('debe mostrar ayuda si no hay argumentos', () => {
    const result = cmd_mkdir.execute([], mockContext);
    expect(result.output).toContain('usage: mkdir');
    expect(result.output).toContain('-p');
    expect(result.isError).toBe(true);
  });

  it('debe crear directorio simple en directorio actual', () => {
    const result = cmd_mkdir.execute(['micarpeta'], mockContext);
    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    expect(mockContext.machine.files).toContainEqual({
      path: '/home/kali/micarpeta/.dir',
      content: '',
      type: 'text'
    });
  });

  it('debe crear múltiples directorios en directorio actual', () => {
    const result = cmd_mkdir.execute(['dir1', 'dir2'], mockContext);
    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    expect(mockContext.machine.files).toContainEqual({
      path: '/home/kali/dir1/.dir',
      content: '',
      type: 'text'
    });
    expect(mockContext.machine.files).toContainEqual({
      path: '/home/kali/dir2/.dir',
      content: '',
      type: 'text'
    });
  });

  it('debe crear directorio en ruta absoluta con -p', () => {
    const result = cmd_mkdir.execute(['-p', '/tmp/newdir'], mockContext);
    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    expect(mockContext.machine.files).toContainEqual({
      path: '/tmp/newdir/.dir',
      content: '',
      type: 'text'
    });
  });

  it('debe crear estructura completa con -p', () => {
    const result = cmd_mkdir.execute(['-p', '/tmp/deep/structure/test'], mockContext);
    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    expect(mockContext.machine.files).toContainEqual({
      path: '/tmp/deep/.dir',
      content: '',
      type: 'text'
    });
    expect(mockContext.machine.files).toContainEqual({
      path: '/tmp/deep/structure/.dir',
      content: '',
      type: 'text'
    });
    expect(mockContext.machine.files).toContainEqual({
      path: '/tmp/deep/structure/test/.dir',
      content: '',
      type: 'text'
    });
  });

  it('debe crear estructura relativa con -p', () => {
    const result = cmd_mkdir.execute(['-p', 'projects/web/app'], mockContext);
    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    expect(mockContext.machine.files).toContainEqual({
      path: '/home/kali/projects/.dir',
      content: '',
      type: 'text'
    });
    expect(mockContext.machine.files).toContainEqual({
      path: '/home/kali/projects/web/.dir',
      content: '',
      type: 'text'
    });
    expect(mockContext.machine.files).toContainEqual({
      path: '/home/kali/projects/web/app/.dir',
      content: '',
      type: 'text'
    });
  });

  it('debe crear directorio en ruta absoluta sin -p si padres existen', () => {
    const result = cmd_mkdir.execute(['/tmp/newdir'], mockContext);
    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    expect(mockContext.machine.files).toContainEqual({
      path: '/tmp/newdir/.dir',
      content: '',
      type: 'text'
    });
  });

  it('debe fallar si padres no existen sin -p', () => {
    const result = cmd_mkdir.execute(['/nonexistent/deep/dir'], mockContext);
    expect(result.output).toContain('cannot create directory');
    expect(result.output).toContain('No such file or directory');
    expect(result.isError).toBe(true);
  });

  it('debe fallar si directorio ya existe', () => {
    const result = cmd_mkdir.execute(['tmp'], { ...mockContext, currentDir: '/' });
    expect(result.output).toContain('cannot create directory');
    expect(result.output).toContain('File exists');
    expect(result.isError).toBe(true);
  });

  it('debe fallar con opción inválida', () => {
    const result = cmd_mkdir.execute(['-x', 'test'], mockContext);
    expect(result.output).toContain('invalid option');
    expect(result.output).toContain('--help');
    expect(result.isError).toBe(true);
  });

  it('debe fallar si falta operando con -p', () => {
    const result = cmd_mkdir.execute(['-p'], mockContext);
    expect(result.output).toContain('missing operand');
    expect(result.output).toContain('--help');
    expect(result.isError).toBe(true);
  });

  it('debe manejar paths relativos con ..', () => {
    const result = cmd_mkdir.execute(['-p', '../outside/test'], mockContext);
    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    expect(mockContext.machine.files).toContainEqual({
      path: '/home/outside/.dir',
      content: '',
      type: 'text'
    });
    expect(mockContext.machine.files).toContainEqual({
      path: '/home/outside/test/.dir',
      content: '',
      type: 'text'
    });
  });

  it('debe denegar permisos en directorios del sistema para usuario no-root', () => {
    const userContext = {
      ...mockContext,
      machine: {
        ...mockContext.machine,
        found_credentials: { file: '', user: 'regularuser', pass: 'pass', verified: false }
      }
    };
    
    const result = cmd_mkdir.execute(['/bin/test'], userContext);
    expect(result.output).toContain('cannot create directory');
    expect(result.output).toContain('Permission denied');
    expect(result.isError).toBe(true);
  });

  it('debe permitir creación en directorios del sistema para root', () => {
    const rootContext = {
      ...mockContext,
      machine: {
        ...mockContext.machine,
        id: 'attacker-01'
      }
    };
    
    const result = cmd_mkdir.execute(['/bin/test'], rootContext);
    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    expect(rootContext.machine.files).toContainEqual({
      path: '/bin/test/.dir',
      content: '',
      type: 'text'
    });
  });
});

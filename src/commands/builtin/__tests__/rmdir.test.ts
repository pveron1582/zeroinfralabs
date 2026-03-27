// ── commands/builtin/__tests__/rmdir.test.ts ───────────────────────────────
// Tests para el comando rmdir

import { describe, it, expect, beforeEach } from 'vitest';
import { cmd_rmdir } from '../rmdir';
import type { Machine, CommandContext } from '../../../types';

describe('cmd_rmdir', () => {
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
        { path: '/home/.dir', content: '', type: 'text' },
        { path: '/home/kali/.dir', content: '', type: 'text' },
        { path: '/home/kali/test/.dir', content: '', type: 'text' },
        { path: '/home/kali/test/file.txt', content: 'contenido', type: 'text' },
        { path: '/home/kali/empty/.dir', content: '', type: 'text' },
        { path: '/tmp/.dir', content: '', type: 'text' },
        { path: '/tmp/testdir/.dir', content: '', type: 'text' },
        { path: '/var/.dir', content: '', type: 'text' },
        { path: '/var/www/.dir', content: '', type: 'text' },
        { path: '/var/www/html/.dir', content: '', type: 'text' },
        { path: '/var/www/html/empty/.dir', content: '', type: 'text' },
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
    const result = cmd_rmdir.execute([], mockContext);
    expect(result.output).toContain('usage: rmdir');
    expect(result.output).toContain('-p');
    expect(result.isError).toBe(true);
  });

  it('debe eliminar directorio vacío simple', () => {
    const result = cmd_rmdir.execute(['empty'], mockContext);
    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    expect(mockContext.machine.files).not.toContainEqual({
      path: '/home/kali/empty/.dir',
      content: '',
      type: 'text'
    });
  });

  it('debe eliminar múltiples directorios vacíos', () => {
    const result = cmd_rmdir.execute(['empty', '/tmp/testdir'], mockContext);
    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    expect(mockContext.machine.files).not.toContainEqual({
      path: '/home/kali/empty/.dir',
      content: '',
      type: 'text'
    });
    expect(mockContext.machine.files).not.toContainEqual({
      path: '/tmp/testdir/.dir',
      content: '',
      type: 'text'
    });
  });

  it('debe fallar si directorio no existe', () => {
    const result = cmd_rmdir.execute(['nonexistent'], mockContext);
    expect(result.output).toContain('failed to remove');
    expect(result.output).toContain('No such file or directory');
    expect(result.isError).toBe(true);
  });

  it('debe fallar si directorio no está vacío', () => {
    const result = cmd_rmdir.execute(['test'], mockContext);
    expect(result.output).toContain('failed to remove');
    expect(result.output).toContain('Directory not empty');
    expect(result.isError).toBe(true);
  });

  it('debe fallar con opción inválida', () => {
    const result = cmd_rmdir.execute(['-x', 'test'], mockContext);
    expect(result.output).toContain('invalid option');
    expect(result.output).toContain('--help');
    expect(result.isError).toBe(true);
  });

  it('debe fallar si falta operando con -p', () => {
    const result = cmd_rmdir.execute(['-p'], mockContext);
    expect(result.output).toContain('missing operand');
    expect(result.output).toContain('--help');
    expect(result.isError).toBe(true);
  });

  it('debe eliminar estructura completa con -p', () => {
    // Agregar estructura completa incluyendo padres
    mockContext.machine.files.push(
      { path: '/.dir', content: '', type: 'text' },
      { path: '/tmp/.dir', content: '', type: 'text' },
      { path: '/tmp/deep/.dir', content: '', type: 'text' },
      { path: '/tmp/deep/structure/.dir', content: '', type: 'text' },
      { path: '/tmp/deep/structure/test/.dir', content: '', type: 'text' }
    );

    const result = cmd_rmdir.execute(['-p', '/tmp/deep/structure/test'], mockContext);
    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    
    // Todos los directorios deben ser eliminados
    expect(mockContext.machine.files).not.toContainEqual({
      path: '/tmp/deep/.dir',
      content: '',
      type: 'text'
    });
    expect(mockContext.machine.files).not.toContainEqual({
      path: '/tmp/deep/structure/.dir',
      content: '',
      type: 'text'
    });
    expect(mockContext.machine.files).not.toContainEqual({
      path: '/tmp/deep/structure/test/.dir',
      content: '',
      type: 'text'
    });
  });

  it('debe eliminar padres con -p si quedan vacíos', () => {
    // Agregar estructura completa incluyendo todos los padres necesarios
    mockContext.machine.files.push(
      { path: '/.dir', content: '', type: 'text' },
      { path: '/tmp/.dir', content: '', type: 'text' },
      { path: '/tmp/parent/.dir', content: '', type: 'text' },
      { path: '/tmp/parent/child/.dir', content: '', type: 'text' },
      { path: '/tmp/parent/child/grandchild/.dir', content: '', type: 'text' },
      { path: '/tmp/parent/other/.dir', content: '', type: 'text' }
    );

    const result = cmd_rmdir.execute(['-p', '/tmp/parent/child/grandchild'], mockContext);
    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    
    // Debe eliminar child y grandchild, pero no parent (tiene other/)
    expect(mockContext.machine.files).not.toContainEqual({
      path: '/tmp/parent/child/.dir',
      content: '',
      type: 'text'
    });
    expect(mockContext.machine.files).not.toContainEqual({
      path: '/tmp/parent/child/grandchild/.dir',
      content: '',
      type: 'text'
    });
    // Parent no debe ser eliminado porque tiene other/
    expect(mockContext.machine.files).toContainEqual({
      path: '/tmp/parent/.dir',
      content: '',
      type: 'text'
    });
    expect(mockContext.machine.files).toContainEqual({
      path: '/tmp/parent/other/.dir',
      content: '',
      type: 'text'
    });
  });

  it('debe fallar al intentar eliminar /', () => {
    const result = cmd_rmdir.execute(['/'], mockContext);
    expect(result.output).toContain('failed to remove');
    expect(result.output).toContain('Invalid argument');
    expect(result.isError).toBe(true);
  });

  it('debe manejar paths relativos con ..', () => {
    // Agregar estructura necesaria para el directorio padre
    mockContext.machine.files.push(
      { path: '/.dir', content: '', type: 'text' },
      { path: '/home/.dir', content: '', type: 'text' },
      { path: '/home/kali/.dir', content: '', type: 'text' },
      { path: '/home/empty/.dir', content: '', type: 'text' }
    );
    
    const result = cmd_rmdir.execute(['../empty'], mockContext);
    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    expect(mockContext.machine.files).not.toContainEqual({
      path: '/home/empty/.dir',
      content: '',
      type: 'text'
    });
  });

  it('debe denegar permisos en directorios del sistema para usuario no-root', () => {
    const userContext = {
      ...mockContext,
      machine: {
        ...mockMachine,
        found_credentials: { file: '', user: 'regularuser', pass: 'pass', verified: false }
      }
    };
    
    // Agregar directorio vacío en /bin para probar
    userContext.machine.files.push({ path: '/bin/test/.dir', content: '', type: 'text' });
    
    const result = cmd_rmdir.execute(['/bin/test'], userContext);
    expect(result.output).toContain('failed to remove');
    expect(result.output).toContain('Permission denied');
    expect(result.isError).toBe(true);
  });

  it('debe permitir eliminación en directorios del sistema para root', () => {
    const rootContext = {
      ...mockContext,
      machine: {
        ...mockMachine,
        id: 'attacker-01'
      }
    };
    
    // Agregar directorio vacío en /bin para probar
    rootContext.machine.files.push({ path: '/bin/test/.dir', content: '', type: 'text' });
    
    const result = cmd_rmdir.execute(['/bin/test'], rootContext);
    expect(result.output).toBe('');
    expect(result.isError).toBe(false);
    expect(rootContext.machine.files).not.toContainEqual({
      path: '/bin/test/.dir',
      content: '',
      type: 'text'
    });
  });
});

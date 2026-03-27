// ── commands/builtin/__tests__/help.test.ts ───────────────────────────────
// Tests para el comando help

import { describe, it, expect, beforeEach } from 'vitest';
import { cmd_help } from '../help';
import type { CommandContext } from '../../../types';

describe('cmd_help', () => {
  let mockContext: CommandContext;

  beforeEach(() => {
    mockContext = {
      machine: {
        id: 'test-machine',
        machine_info: { hostname: 'test', ip: '192.168.1.100', mac: '00:11:22:33:44:55', os: 'Linux', status: 'up', type: 'workstation' },
        discovery_level: 0,
        scan_results: { ports: [] },
        web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
        learning_steps: [],
        files: [],
        found_credentials: { file: '', user: 'kali', pass: 'kali', verified: false }
      },
      allMachines: [],
      currentMissionId: 1,
      currentDir: '/home/kali/'
    };
  });

  it('debe mostrar lista completa de comandos sin argumentos', () => {
    const result = cmd_help.execute([], mockContext);
    expect(result.output).toContain('Comandos disponibles:');
    expect(result.output).toContain('help');
    expect(result.output).toContain('clear');
    expect(result.output).toContain('whoami');
    expect(result.output).toContain('ifconfig');
    expect(result.output).toContain('ls');
    expect(result.output).toContain('cd');
    expect(result.output).toContain('cat');
    expect(result.output).toContain('mkdir');
    expect(result.output).toContain('rmdir');
    expect(result.output).toContain('nmap');
    expect(result.output).toContain('ssh');
    expect(result.output).toContain('msfconsole');
    expect(result.output).toContain('nc');
    expect(result.output).toContain('exit');
    expect(result.output).toContain('end');
    expect(result.output).toContain('Uso: help <comando>');
    expect(result.isError).toBe(false);
  });

  it('debe mostrar ayuda específica de mkdir', () => {
    const result = cmd_help.execute(['mkdir'], mockContext);
    expect(result.output).toContain('mkdir - Crear directorios');
    expect(result.output).toContain('Uso:');
    expect(result.output).toContain('mkdir [-p] directorio...');
    expect(result.output).toContain('Opciones:');
    expect(result.output).toContain('-p  Crear directorios padres si no existen');
    expect(result.output).toContain('Ejemplos:');
    expect(result.output).toContain('mkdir nueva_carpeta');
    expect(result.output).toContain('mkdir -p /var/www/html/nueva');
    expect(result.output).toContain('Descripción:');
    expect(result.isError).toBe(false);
  });

  it('debe mostrar ayuda específica de rmdir', () => {
    const result = cmd_help.execute(['rmdir'], mockContext);
    expect(result.output).toContain('rmdir - Eliminar directorios vacíos');
    expect(result.output).toContain('Uso:');
    expect(result.output).toContain('rmdir [-p] directorio...');
    expect(result.output).toContain('Opciones:');
    expect(result.output).toContain('-p  Eliminar directorios padres si quedan vacíos');
    expect(result.output).toContain('Ejemplos:');
    expect(result.output).toContain('rmdir carpeta_vacia');
    expect(result.output).toContain('rmdir -p /var/www/html/nueva');
    expect(result.output).toContain('Descripción:');
    expect(result.isError).toBe(false);
  });

  it('debe mostrar ayuda específica de ls', () => {
    const result = cmd_help.execute(['ls'], mockContext);
    expect(result.output).toContain('ls - Listar archivos y directorios');
    expect(result.output).toContain('Uso:');
    expect(result.output).toContain('ls [opciones] [directorio]');
    expect(result.output).toContain('Opciones:');
    expect(result.output).toContain('-l  Formato largo');
    expect(result.output).toContain('-a  Mostrar archivos ocultos');
    expect(result.output).toContain('-la Combinación de -l y -a');
    expect(result.output).toContain('Ejemplos:');
    expect(result.output).toContain('ls');
    expect(result.output).toContain('ls -l /etc');
    expect(result.output).toContain('ls -la ~');
    expect(result.isError).toBe(false);
  });

  it('debe mostrar ayuda específica de cd', () => {
    const result = cmd_help.execute(['cd'], mockContext);
    expect(result.output).toContain('cd - Cambiar directorio');
    expect(result.output).toContain('Uso:');
    expect(result.output).toContain('cd [directorio]');
    expect(result.output).toContain('Ejemplos:');
    expect(result.output).toContain('cd /etc');
    expect(result.output).toContain('cd ..');
    expect(result.output).toContain('cd ~');
    expect(result.output).toContain('Descripción:');
    expect(result.isError).toBe(false);
  });

  it('debe mostrar ayuda específica de cat', () => {
    const result = cmd_help.execute(['cat'], mockContext);
    expect(result.output).toContain('cat - Mostrar contenido de archivos');
    expect(result.output).toContain('Uso:');
    expect(result.output).toContain('cat archivo...');
    expect(result.output).toContain('Ejemplos:');
    expect(result.output).toContain('cat /etc/passwd');
    expect(result.output).toContain('cat log.txt');
    expect(result.output).toContain('Descripción:');
    expect(result.isError).toBe(false);
  });

  it('debe mostrar error para comando no existente', () => {
    const result = cmd_help.execute(['comando_inexistente'], mockContext);
    expect(result.output).toContain('No hay ayuda disponible para el comando: comando_inexistente');
    expect(result.output).toContain('Escribe \'help\' sin argumentos para ver la lista de comandos disponibles');
    expect(result.isError).toBe(true);
  });

  it('debe ser case insensitive', () => {
    const result = cmd_help.execute(['MKDIR'], mockContext);
    expect(result.output).toContain('mkdir - Crear directorios');
    expect(result.isError).toBe(false);
  });

  it('debe manejar comandos con espacios', () => {
    const result = cmd_help.execute(['ls', '-l'], mockContext);
    expect(result.output).toContain('ls - Listar archivos y directorios');
    expect(result.output).toContain('Uso:');
    expect(result.output).toContain('ls [opciones] [directorio]');
    expect(result.output).toContain('Opciones:');
    expect(result.output).toContain('-l  Formato largo');
    expect(result.output).toContain('-a  Mostrar archivos ocultos');
    expect(result.output).toContain('-la Combinación de -l y -a');
    expect(result.output).toContain('Ejemplos:');
    expect(result.output).toContain('ls                              # Listar directorio actual');
    expect(result.output).toContain('ls -l /etc                      # Formato largo de /etc');
    expect(result.output).toContain('ls -la ~                        # Ocultos + formato largo en home');
    expect(result.isError).toBe(false);  // El comando funciona, no es error
  });
});

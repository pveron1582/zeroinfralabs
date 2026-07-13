// ── commands/builtin/__tests__/ls.test.ts ────────────────────────
// Tests para el comando ls
// Verifica que el comando liste correctamente archivos y directorios

import { describe, it, expect } from 'vitest';
import { cmd_ls } from '../ls';
import type { Machine } from '../../../types';

// Helper para crear una máquina virtual de prueba
// Permite simular diferentes sistemas de archivos para los tests
const createMachine = (files: Array<{ path: string; content: string; type: 'text' }>): Machine => ({
  id: 'test-machine',
  machine_info: { hostname: 'test', ip: '10.0.0.1', mac: '00:00:00:00:00:00', os: 'Linux', status: 'up', type: 'server' },
  discovery_level: 4,
  scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files,
});

// Tests para el comando ls
// Verifica que el comando liste correctamente archivos y directorios
describe('cmd_ls', () => {
  // Verifica que ls liste archivos sin argumento (formato simple)
  it('debe listar archivos sin argumento', () => {
    const machine = createMachine([
      { path: '/root/file1.txt', content: 'test', type: 'text' },
      { path: '/root/file2.txt', content: 'test', type: 'text' },
    ]);
    const result = cmd_ls.execute([], { machine, currentDir: '/root/' } as any);
    expect(result.output).toContain('file1.txt');
    expect(result.output).toContain('file2.txt');
    // En formato simple, no muestra 'total'
    expect(result.output).not.toContain('total');
  });

  // Verifica que ls -l muestre 'total' en formato largo
  it('debe mostrar total con -l', () => {
    const machine = createMachine([
      { path: '/root/file1.txt', content: 'test', type: 'text' },
      { path: '/root/file2.txt', content: 'test', type: 'text' },
    ]);
    const result = cmd_ls.execute(['-l'], { machine, currentDir: '/root/' } as any);
    expect(result.output).toContain('total');
  });

  // Verifica que ls muestre cadena vacía si no hay archivos (formato simple)
  it('debe mostrar cadena vacía si no hay archivos', () => {
    const machine = createMachine([]);
    const result = cmd_ls.execute([], { machine, currentDir: '/' } as any);
    expect(result.output).toBe('');
  });

  // Verifica que ls -l muestre "total 0" si no hay archivos
  it('debe mostrar total 0 con -l si no hay archivos', () => {
    const machine = createMachine([]);
    const result = cmd_ls.execute(['-l'], { machine, currentDir: '/' } as any);
    expect(result.output).toBe('total 0');
  });

  // Verifica que ls liste archivos en un directorio específico
  it('debe listar archivos en directorio específico', () => {
    const machine = createMachine([
      { path: '/var/www/html/index.php', content: 'test', type: 'text' },
      { path: '/var/www/html/config.php', content: 'test', type: 'text' },
    ]);
    const result = cmd_ls.execute(['/var/www/html'], { machine, currentDir: '/' } as any);
    expect(result.output).toContain('index.php');
    expect(result.output).toContain('config.php');
  });

  it('debe mostrar subdirectorios sin /', () => {
    const machine = createMachine([
      { path: '/var/www/html/uploads/file.txt', content: 'test', type: 'text' },
      { path: '/var/www/html/index.php', content: 'test', type: 'text' },
    ]);
    const result = cmd_ls.execute(['/var/www/html'], { machine, currentDir: '/' } as any);
    expect(result.output).toContain('uploads');
    expect(result.output).toContain('index.php');
  });

  // Verifica que ls muestre cadena vacía para directorio vacío (formato simple)
  it('debe mostrar cadena vacía para directorio vacío', () => {
    const machine = createMachine([
      { path: '/root/file.txt', content: 'test', type: 'text' },
    ]);
    const result = cmd_ls.execute(['/var/empty'], { machine, currentDir: '/' } as any);
    expect(result.output).toBe('');
  });

  // Verifica que ls -l muestre "total 0" para directorio vacío
  it('debe mostrar total 0 con -l para directorio vacío', () => {
    const machine = createMachine([
      { path: '/root/file.txt', content: 'test', type: 'text' },
    ]);
    const result = cmd_ls.execute(['-l', '/var/empty'], { machine, currentDir: '/' } as any);
    expect(result.output).toBe('total 0');
  });

  // Verifica que ls muestre permisos de archivo con -l
  it('debe mostrar permisos de archivo con -l', () => {
    const machine = createMachine([
      { path: '/root/test.txt', content: 'test', type: 'text' },
    ]);
    const result = cmd_ls.execute(['-l'], { machine, currentDir: '/root/' } as any);
    expect(result.output).toContain('-rw-r--r--');
    expect(result.output).toContain('admin');
  });

  // Verifica que ls muestre permisos de directorio con -l
  it('debe mostrar permisos de directorio con -l', () => {
    const machine = createMachine([
      { path: '/var/www/html/uploads/file.txt', content: 'test', type: 'text' },
    ]);
    const result = cmd_ls.execute(['-l', '/var/www/html'], { machine, currentDir: '/' } as any);
    expect(result.output).toContain('drwxr-xr-x');
    expect(result.output).toContain('root');
  });

  // Verifica que ls liste múltiples archivos
  it('debe listar múltiples archivos', () => {
    const machine = createMachine([
      { path: '/root/zebra.txt', content: 'test', type: 'text' },
      { path: '/root/alpha.txt', content: 'test', type: 'text' },
      { path: '/root/middle.txt', content: 'test', type: 'text' },
    ]);
    const result = cmd_ls.execute([], { machine, currentDir: '/root/' } as any);
    expect(result.output).toContain('alpha.txt');
    expect(result.output).toContain('middle.txt');
    expect(result.output).toContain('zebra.txt');
  });

  // Tests para sistema de directorios con archivos .dir
  // Verifica que el sistema de directorios .dir funcione correctamente
  describe('sistema de directorios .dir', () => {
    // Verifica que ls reconozca directorios marcados con .dir
    it('debe reconocer directorios marcados con .dir', () => {
      const machine = createMachine([
        { path: '/etc/.dir', content: '', type: 'text' },
        { path: '/var/.dir', content: '', type: 'text' },
        { path: '/home/.dir', content: '', type: 'text' },
      ]);
      const result = cmd_ls.execute([], { machine, currentDir: '/' } as any);
      expect(result.output).toContain('etc');
      expect(result.output).toContain('var');
      expect(result.output).toContain('home');
    });

    // Verifica que ls -l muestre permisos de directorios marcados con .dir
    it('debe mostrar permisos de directorios con .dir usando -l', () => {
      const machine = createMachine([
        { path: '/etc/.dir', content: '', type: 'text' },
        { path: '/var/.dir', content: '', type: 'text' },
        { path: '/home/.dir', content: '', type: 'text' },
      ]);
      const result = cmd_ls.execute(['-l'], { machine, currentDir: '/' } as any);
      expect(result.output).toContain('drwxr-xr-x');
    });

    // Verifica que ls liste los directorios raíz de Linux
    it('debe listar directorios raíz de Linux', () => {
      const machine = createMachine([
        { path: '/bin/.dir', content: '', type: 'text' },
        { path: '/boot/.dir', content: '', type: 'text' },
        { path: '/dev/.dir', content: '', type: 'text' },
        { path: '/etc/.dir', content: '', type: 'text' },
        { path: '/home/.dir', content: '', type: 'text' },
        { path: '/lib/.dir', content: '', type: 'text' },
        { path: '/root/.dir', content: '', type: 'text' },
        { path: '/tmp/.dir', content: '', type: 'text' },
        { path: '/usr/.dir', content: '', type: 'text' },
        { path: '/var/.dir', content: '', type: 'text' },
      ]);
      const result = cmd_ls.execute([], { machine, currentDir: '/' } as any);
      expect(result.output).toContain('bin');
      expect(result.output).toContain('boot');
      expect(result.output).toContain('dev');
      expect(result.output).toContain('etc');
      expect(result.output).toContain('home');
      expect(result.output).toContain('lib');
      expect(result.output).toContain('root');
      expect(result.output).toContain('tmp');
      expect(result.output).toContain('usr');
      expect(result.output).toContain('var');
    });

    // Verifica que ls liste archivos dentro de /etc/
    it('debe listar archivos dentro de /etc/', () => {
      const machine = createMachine([
        { path: '/etc/.dir', content: '', type: 'text' },
        { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash', type: 'text' },
        { path: '/etc/shadow', content: 'root:$6$...:19400:0:99999:7:::', type: 'text' },
        { path: '/etc/hostname', content: 'target-server', type: 'text' },
      ]);
      const result = cmd_ls.execute(['/etc'], { machine, currentDir: '/' } as any);
      expect(result.output).toContain('passwd');
      expect(result.output).toContain('shadow');
      expect(result.output).toContain('hostname');
    });

    // Verifica que ls liste subdirectorios dentro de /etc/
    it('debe listar subdirectorios dentro de /etc/', () => {
      const machine = createMachine([
        { path: '/etc/.dir', content: '', type: 'text' },
        { path: '/etc/apache2/.dir', content: '', type: 'text' },
        { path: '/etc/ssh/.dir', content: '', type: 'text' },
        { path: '/etc/passwd', content: 'test', type: 'text' },
      ]);
      const result = cmd_ls.execute(['/etc'], { machine, currentDir: '/' } as any);
      expect(result.output).toContain('apache2');
      expect(result.output).toContain('ssh');
      expect(result.output).toContain('passwd');
    });

    // Verifica que ls liste archivos en /var/log/
    it('debe listar archivos en /var/log/', () => {
      const machine = createMachine([
        { path: '/var/.dir', content: '', type: 'text' },
        { path: '/var/log/.dir', content: '', type: 'text' },
        { path: '/var/log/syslog', content: 'log content', type: 'text' },
        { path: '/var/log/auth.log', content: 'auth log', type: 'text' },
      ]);
      const result = cmd_ls.execute(['/var/log'], { machine, currentDir: '/' } as any);
      expect(result.output).toContain('syslog');
      expect(result.output).toContain('auth.log');
    });

    // Verifica que ls liste directorios de usuario en /home/
    it('debe listar directorios de usuario en /home/', () => {
      const machine = createMachine([
        { path: '/home/.dir', content: '', type: 'text' },
        { path: '/home/admin/.dir', content: '', type: 'text' },
        { path: '/home/admin/.bashrc', content: 'export PATH=...', type: 'text' },
        { path: '/home/admin/user.txt', content: 'FLAG{...}', type: 'text' },
      ]);
      const result = cmd_ls.execute(['/home'], { machine, currentDir: '/' } as any);
      expect(result.output).toContain('admin');
    });

    // Verifica que ls liste archivos ocultos con ls -a
    it('debe listar archivos ocultos con ls -a', () => {
      const machine = createMachine([
        { path: '/root/.dir', content: '', type: 'text' },
        { path: '/root/.bashrc', content: 'export PATH=...', type: 'text' },
        { path: '/root/.profile', content: 'profile', type: 'text' },
        { path: '/root/flag.txt', content: 'FLAG{...}', type: 'text' },
      ]);
      const result = cmd_ls.execute(['-a'], { machine, currentDir: '/root/' } as any);
      expect(result.output).toContain('.bashrc');
      expect(result.output).toContain('.profile');
      expect(result.output).toContain('flag.txt');
    });

    // Verifica que ls -l muestre detalles de archivos
    it('debe mostrar ls -l con detalles', () => {
      const machine = createMachine([
        { path: '/etc/.dir', content: '', type: 'text' },
        { path: '/etc/passwd', content: 'root:x:0:0', type: 'text' },
      ]);
      const result = cmd_ls.execute(['-l'], { machine, currentDir: '/' } as any);
      expect(result.output).toContain('drwxr-xr-x');
      expect(result.output).toContain('root');
      expect(result.output).toContain('4096');
    });
  });
});

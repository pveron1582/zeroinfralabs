// ── fs-models/__tests__/fs-windows.test.ts ───────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Tests para el modelo de sistema de archivos Windows

import { describe, it, expect } from 'vitest';
import { createWindowsFileSystem } from '../fs-windows';

describe('createWindowsFileSystem', () => {
  it('debe crear un sistema de archivos Windows con configuración por defecto', () => {
    const files = createWindowsFileSystem();
    
    expect(files.length).toBeGreaterThan(0);
    
    // Verificar que existen directorios raíz
    const rootDirs = files.filter(f => f.path === '/C:/.dir');
    expect(rootDirs.length).toBe(1);
    
    // Verificar que existe el directorio Windows
    const windowsDir = files.find(f => f.path === '/C:/Windows/.dir');
    expect(windowsDir).toBeDefined();
    
    // Verificar que existe el directorio System32
    const system32Dir = files.find(f => f.path === '/C:/Windows/System32/.dir');
    expect(system32Dir).toBeDefined();
  });

  it('debe usar el nombre de usuario por defecto (Administrator)', () => {
    const files = createWindowsFileSystem();
    
    // Verificar que existe el directorio del usuario Administrator
    const userDir = files.find(f => f.path === '/C:/Users/Administrator/.dir');
    expect(userDir).toBeDefined();
    
    // Verificar que existe el directorio Desktop del usuario
    const desktopDir = files.find(f => f.path === '/C:/Users/Administrator/Desktop/.dir');
    expect(desktopDir).toBeDefined();
  });

  it('debe usar un nombre de usuario personalizado', () => {
    const files = createWindowsFileSystem({ username: 'JohnDoe' });
    
    // Verificar que existe el directorio del usuario personalizado
    const userDir = files.find(f => f.path === '/C:/Users/JohnDoe/.dir');
    expect(userDir).toBeDefined();
    
    // Verificar que existe el directorio Desktop del usuario personalizado
    const desktopDir = files.find(f => f.path === '/C:/Users/JohnDoe/Desktop/.dir');
    expect(desktopDir).toBeDefined();
    
    // Verificar que no existe el directorio del usuario por defecto
    const defaultUserDir = files.find(f => f.path === '/C:/Users/Administrator/.dir');
    expect(defaultUserDir).toBeUndefined();
  });

  it('debe usar el nombre de computadora por defecto (WIN-SERVER)', () => {
    const files = createWindowsFileSystem();
    
    // Verificar que el archivo hosts contiene el nombre de computadora por defecto
    const hostsFile = files.find(f => f.path === '/C:/Windows/System32/drivers/etc/hosts');
    expect(hostsFile).toBeDefined();
    expect(hostsFile?.content).toContain('WIN-SERVER');
  });

  it('debe usar un nombre de computadora personalizado', () => {
    const files = createWindowsFileSystem({ computerName: 'MY-PC' });
    
    // Verificar que el archivo hosts contiene el nombre de computadora personalizado
    const hostsFile = files.find(f => f.path === '/C:/Windows/System32/drivers/etc/hosts');
    expect(hostsFile).toBeDefined();
    expect(hostsFile?.content).toContain('MY-PC');
  });

  it('debe incluir archivos de configuración del sistema', () => {
    const files = createWindowsFileSystem();
    
    // Verificar que existe el archivo hosts
    const hostsFile = files.find(f => f.path === '/C:/Windows/System32/drivers/etc/hosts');
    expect(hostsFile).toBeDefined();
    expect(hostsFile?.type).toBe('text');
    
    // Verificar que existe el archivo SAM
    const samFile = files.find(f => f.path === '/C:/Windows/System32/config/SAM');
    expect(samFile).toBeDefined();
    
    // Verificar que existe el archivo win.ini
    const winIniFile = files.find(f => f.path === '/C:/Windows/win.ini');
    expect(winIniFile).toBeDefined();
  });

  it('debe incluir archivos de logs del sistema', () => {
    const files = createWindowsFileSystem();
    
    // Verificar que existe el archivo WindowsUpdate.log
    const updateLog = files.find(f => f.path === '/C:/Windows/WindowsUpdate.log');
    expect(updateLog).toBeDefined();
    expect(updateLog?.content).toContain('Windows Update');
    
    // Verificar que existe el archivo HTTPERR
    const httperrLog = files.find(f => f.path === '/C:/Windows/System32/LogFiles/HTTPERR/httperr1.log');
    expect(httperrLog).toBeDefined();
  });

  it('debe incluir archivos de registro simulados', () => {
    const files = createWindowsFileSystem();
    
    // Verificar que existe el archivo system (registro)
    const systemReg = files.find(f => f.path === '/C:/Windows/System32/config/system');
    expect(systemReg).toBeDefined();
    
    // Verificar que existe el archivo software (registro)
    const softwareReg = files.find(f => f.path === '/C:/Windows/System32/config/software');
    expect(softwareReg).toBeDefined();
  });

  it('debe ser neutral: no instala servicios web (IIS/XAMPP)', () => {
    const files = createWindowsFileSystem();
    const paths = files.map(f => f.path);

    // Ningún labo usa IIS/XAMPP: el admin de labo (o los fixtures de test)
    // agrega esos directorios si el escenario los necesita.
    expect(paths.some(p => p.startsWith('/C:/inetpub'))).toBe(false);
    expect(paths.some(p => p.startsWith('/C:/xampp'))).toBe(false);
  });

  it('debe ser neutral: sin archivos de usuario de escenario', () => {
    const files = createWindowsFileSystem();

    // Solo existen los .dir de usuario; el contenido lo aporta cada labo.
    const userFiles = files.filter(
      f => f.path.startsWith('/C:/Users/Administrator/Desktop/') ||
           f.path.startsWith('/C:/Users/Administrator/Documents/'),
    );
    expect(userFiles).toHaveLength(2);
    expect(userFiles.every(f => f.path.endsWith('.dir'))).toBe(true);

    // Sin flag, sin notas con credenciales, sin web.config
    expect(files.some(f => /flag\.txt|notes\.txt|web\.config/.test(f.path))).toBe(false);
    expect(files.some(f => f.content.includes('THM{'))).toBe(false);
    expect(files.some(f => f.content.includes('P@ssw0rd123!'))).toBe(false);
    expect(files.some(f => f.content.includes('Str0ngP@ss!'))).toBe(false);
  });

  it('debe dejar hosts sin IP ni hostname de laboratorio', () => {
    const files = createWindowsFileSystem();
    const hosts = files.find(f => f.path === '/C:/Windows/System32/drivers/etc/hosts');

    expect(hosts).toBeDefined();
    expect(hosts?.content).toContain('WIN-SERVER');
    expect(hosts?.content).not.toContain('192.168.1.10');
    expect(hosts?.content).not.toContain('target-server');
  });

  it('debe dejar httperr.log sin IPs de escenario', () => {
    const files = createWindowsFileSystem();
    const httperr = files.find(f => f.path === '/C:/Windows/System32/LogFiles/HTTPERR/httperr1.log');

    expect(httperr).toBeDefined();
    expect(httperr?.content).not.toContain('192.168.1.');
    // Rangos de documentación (RFC 5737) en lugar de las del laboratorio
    expect(httperr?.content).toContain('203.0.113.45');
    expect(httperr?.content).toContain('192.0.2.10');
  });

  it('debe incluir archivos de configuración de red', () => {
    const files = createWindowsFileSystem();
    
    // Verificar que existe el archivo protocol
    const protocolFile = files.find(f => f.path === '/C:/Windows/System32/drivers/etc/protocol');
    expect(protocolFile).toBeDefined();
    expect(protocolFile?.content).toContain('tcp');
    expect(protocolFile?.content).toContain('udp');
    
    // Verificar que existe el archivo services
    const servicesFile = files.find(f => f.path === '/C:/Windows/System32/drivers/etc/services');
    expect(servicesFile).toBeDefined();
    expect(servicesFile?.content).toContain('http');
    expect(servicesFile?.content).toContain('ssh');
  });

  it('debe retornar un array de FileEntry válido', () => {
    const files = createWindowsFileSystem();
    
    files.forEach(file => {
      expect(file).toHaveProperty('path');
      expect(file).toHaveProperty('content');
      expect(file).toHaveProperty('type');
      expect(typeof file.path).toBe('string');
      expect(typeof file.content).toBe('string');
      expect(['text', 'hash', 'binary']).toContain(file.type);
    });
  });
});
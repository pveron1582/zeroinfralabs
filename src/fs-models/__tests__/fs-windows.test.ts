// ── fs-models/__tests__/fs-windows.test.ts ───────────────────────
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

  it('debe incluir directorios de servicios web', () => {
    const files = createWindowsFileSystem();
    
    // Verificar que existe el directorio IIS
    const iisDir = files.find(f => f.path === '/C:/inetpub/.dir');
    expect(iisDir).toBeDefined();
    
    // Verificar que existe el directorio wwwroot de IIS
    const wwwrootDir = files.find(f => f.path === '/C:/inetpub/wwwroot/.dir');
    expect(wwwrootDir).toBeDefined();
    
    // Verificar que existe el directorio XAMPP
    const xamppDir = files.find(f => f.path === '/C:/xampp/.dir');
    expect(xamppDir).toBeDefined();
    
    // Verificar que existe el directorio htdocs de XAMPP
    const htdocsDir = files.find(f => f.path === '/C:/xampp/htdocs/.dir');
    expect(htdocsDir).toBeDefined();
  });

  it('debe incluir archivos de configuración de servicios web', () => {
    const files = createWindowsFileSystem();
    
    // Verificar que existe el archivo index.html de IIS
    const iisIndex = files.find(f => f.path === '/C:/inetpub/wwwroot/index.html');
    expect(iisIndex).toBeDefined();
    expect(iisIndex?.content).toContain('IIS Windows Server');
    
    // Verificar que existe el archivo web.config de IIS
    const webConfig = files.find(f => f.path === '/C:/inetpub/wwwroot/web.config');
    expect(webConfig).toBeDefined();
    
    // Verificar que existe el archivo index.php de XAMPP
    const xamppIndex = files.find(f => f.path === '/C:/xampp/htdocs/index.php');
    expect(xamppIndex).toBeDefined();
    
    // Verificar que existe el archivo config.php de XAMPP
    const xamppConfig = files.find(f => f.path === '/C:/xampp/htdocs/config.php');
    expect(xamppConfig).toBeDefined();
  });

  it('debe incluir archivos de usuario con credenciales', () => {
    const files = createWindowsFileSystem();
    
    // Verificar que existe el archivo notes.txt con credenciales
    const notesFile = files.find(f => f.path === '/C:/Users/Administrator/Documents/notes.txt');
    expect(notesFile).toBeDefined();
    expect(notesFile?.content).toContain('Administrator');
    expect(notesFile?.content).toContain('P@ssw0rd123!');
    
    // Verificar que existe el archivo web.config con credenciales de BD
    const webConfig = files.find(f => f.path === '/C:/Users/Administrator/Documents/web.config');
    expect(webConfig).toBeDefined();
    expect(webConfig?.content).toContain('Str0ngP@ss!');
  });

  it('debe incluir archivos de flags', () => {
    const files = createWindowsFileSystem();
    
    // Verificar que existe el archivo flag.txt en el Desktop
    const flagFile = files.find(f => f.path === '/C:/Users/Administrator/Desktop/flag.txt');
    expect(flagFile).toBeDefined();
    expect(flagFile?.content).toContain('THM{USER_ACCESS_GRANTED}');
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
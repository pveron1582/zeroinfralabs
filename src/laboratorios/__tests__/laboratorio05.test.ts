// ── laboratorios/__tests__/laboratorio05.test.ts ────────────────────
import { describe, it, expect } from 'vitest';
import { scenario_05, scenario05Data, SCENARIO_TEMPLATES, COMMON_PORTS } from '../laboratorio05';

describe('Laboratorio 05 - FTP Enumeration & Privilege Escalation', () => {
  it('debe exportar datos del escenario', () => {
    expect(scenario05Data).toBeDefined();
    expect(scenario05Data.id).toBe('scenario-05');
    expect(scenario05Data.name).toBe('FTP Enumeration & Privilege Escalation');
  });

  it('debe tener credenciales correctas', () => {
    expect(scenario05Data.credentials).toEqual({
      user: 'john',
      pass: 'ilovelinux',
    });
  });

  it('debe tener flags definidas', () => {
    expect(scenario05Data.flags.user).toBe('ZIL{FTP_ANON_ACCESS}');
    expect(scenario05Data.flags.root).toBe('ZIL{SUDO_VIM_PRIVESC_COMPLETE}');
  });

  it('debe tener rango de red correcto', () => {
    expect(scenario05Data.networkRange).toBe('10.10.20.0/24');
  });

  it('debe tener targetMachine con info correcta', () => {
    expect(scenario05Data.targetMachine.hostname).toBe('privesc-server');
    expect(scenario05Data.targetMachine.os).toBe('Debian 11 (Bullseye)');
    expect(scenario05Data.targetMachine.type).toBe('server');
  });

  it('debe tener puertos FTP y SSH abiertos', () => {
    const ports = scenario05Data.targetMachine.ports;
    expect(ports).toHaveLength(2);
    expect(ports[0].service).toBe('ftp');
    expect(ports[0].port).toBe(21);
    expect(ports[1].service).toBe('ssh');
    expect(ports[1].port).toBe(22);
  });

  it('debe tener nota FTP en español', () => {
    expect(scenario05Data.targetMachine.ftpNoteEs).toContain('john');
    expect(scenario05Data.targetMachine.ftpNoteEs).toContain('URGENTE');
    expect(scenario05Data.targetMachine.ftpNoteEs).toContain('fuerza bruta');
  });

  it('debe tener nota FTP en inglés', () => {
    expect(scenario05Data.targetMachine.ftpNoteEn).toContain('john');
    expect(scenario05Data.targetMachine.ftpNoteEn).toContain('URGENT');
    expect(scenario05Data.targetMachine.ftpNoteEn).toContain('brute force');
  });

  it('debe tener archivos del sistema configurados', () => {
    const files = scenario05Data.targetMachine.files;
    expect(files.some(f => f.path === '/etc/sudoers')).toBe(true);
    expect(files.some(f => f.path === '/root/flag2.txt')).toBe(true);
    expect(files.some(f => f.path === '/home/john/user.txt')).toBe(true);
  });

  it('debe tener 9 learning steps', () => {
    expect(scenario05Data.learningSteps).toHaveLength(9);
    
    // Verificar primer paso
    expect(scenario05Data.learningSteps[0].task).toBe('Host Discovery');
    expect(scenario05Data.learningSteps[0].discoveryLevel).toBe(1);
    
    // Verificar último paso
    expect(scenario05Data.learningSteps[8].task).toBe('Capture Root Flag');
    expect(scenario05Data.learningSteps[8].discoveryLevel).toBe(4);
  });

  it('debe tener hints en ambos idiomas', () => {
    const step = scenario05Data.learningSteps[2]; // FTP Enumeration
    expect(step.hints?.hint1?.en).toBeDefined();
    expect(step.hints?.hint1?.es).toBeDefined();
    expect(step.hints?.hint2?.en).toBeDefined();
    expect(step.hints?.hint2?.es).toBeDefined();
  });

  it('SCENARIO_TEMPLATES debe generar escenario válido', () => {
    const template = SCENARIO_TEMPLATES.ftpPrivesc();
    
    expect(template.id).toBe('scenario-05');
    expect(template.difficulty).toBe('Medium');
    expect(template.category).toBe('Network');
    expect(template.networkRange).toBe('10.10.20.0/24');
  });

  it('template debe tener targetMachine con puertos', () => {
    const template = SCENARIO_TEMPLATES.ftpPrivesc();
    
    expect(template.targetMachine.ports).toHaveLength(2);
    expect(template.targetMachine.ports[0].service).toBe('ftp');
    expect(template.targetMachine.ports[1].service).toBe('ssh');
    const sshPort = template.targetMachine.ports[1];
    expect('credentials' in sshPort ? sshPort.credentials : undefined).toEqual({
      user: 'john',
      pass: 'ilovelinux',
    });
  });

  it('template debe tener archivos correctos', () => {
    const template = SCENARIO_TEMPLATES.ftpPrivesc();
    const files = template.targetMachine.files;
    
    expect(files.some(f => f.path === '/srv/ftp/nota.txt')).toBe(true);
    expect(files.some(f => f.path === '/srv/ftp/note.txt')).toBe(true);
    expect(files.some(f => f.path === '/etc/sudoers')).toBe(true);
    expect(files.some(f => f.path === '/root/flag2.txt')).toBe(true);
  });

  it('scenario_05 debe estar construido correctamente', () => {
    expect(scenario_05).toBeDefined();
    expect(scenario_05.id).toBe('scenario-05');
    expect(scenario_05.machines).toBeDefined();
    expect(scenario_05.machines.length).toBeGreaterThan(0);
  });

  describe('COMMON_PORTS', () => {
    it('debe crear puerto SSH correctamente', () => {
      const sshPort = COMMON_PORTS.ssh();
      expect(sshPort.port).toBe(22);
      expect(sshPort.service).toBe('ssh');
      expect(sshPort.state).toBe('open');
    });

    it('debe crear puerto SSH con credenciales', () => {
      const creds = { user: 'admin', pass: 'secret' };
      const sshPort = COMMON_PORTS.ssh('OpenSSH 8.0', creds);
      expect(sshPort.credentials).toEqual(creds);
    });

    it('debe crear puerto FTP correctamente', () => {
      const ftpPort = COMMON_PORTS.ftp();
      expect(ftpPort.port).toBe(21);
      expect(ftpPort.service).toBe('ftp');
      expect(ftpPort.version).toBe('vsFTPd 3.0.3');
    });

    it('debe crear puerto HTTP correctamente', () => {
      const httpPort = COMMON_PORTS.http();
      expect(httpPort.port).toBe(80);
      expect(httpPort.service).toBe('http');
      expect(httpPort.version).toBe('Apache httpd 2.4.41');
    });
  });
});

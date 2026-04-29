import { describe, it, expect, beforeEach, vi } from 'vitest';
import { executeCommand, resetMsfState, isMsfActive, getMsfPrompt } from '../index';
import { SCENARIOS } from '../../laboratorios/laboratorios';

describe('Integración de Comandos y Lógica de Pentesting', () => {
  const scenario = SCENARIOS[0]; // WordPress Lab
  const attacker = scenario.machines.find(m => m.id.includes('attacker'))!;
  const target = scenario.machines.find(m => !m.id.includes('attacker'))!;

  beforeEach(() => {
    resetMsfState();
    vi.clearAllMocks();
  });

  describe('Flujo de Reconocimiento y Gating', () => {
    it('nmap debe funcionar sin reconocimiento previo (comando libre)', () => {
      // nmap ya no valida discovery_level - es un comando libre
      const hiddenTarget = { ...target, discovery_level: 0 };
      const result = executeCommand(`nmap -sV ${target.machine_info.ip}`, attacker, [attacker, hiddenTarget], 1);
      
      expect(result.isError).toBeUndefined();
      expect(result.output).toContain('Nmap scan report');
    });

    it('debe descubrir hosts con arp-scan y escanear con nmap', () => {
      const resArp = executeCommand(`arp-scan ${scenario.network_range}`, attacker, scenario.machines, 1);
      // arp-scan retorna discoveredHosts para que el lab valide
      expect(resArp.discoveredHosts).toBeDefined();

      // nmap funciona sin depender de arp-scan (comando libre)
      const resNmap = executeCommand(`nmap -sV ${target.machine_info.ip}`, attacker, scenario.machines, 1);
      
      expect(resNmap.isError).toBeUndefined();
      expect(resNmap.output).toContain('Nmap scan report');
      expect(resNmap.scanResults).toBeDefined();
    });
  });

  describe('Metasploit Framework (MSF) Stateful Flow', () => {
    it('debe mantener el estado del módulo y las opciones configuradas', () => {
      // 1. Iniciar msfconsole
      executeCommand('msfconsole', attacker, scenario.machines, 3);
      expect(isMsfActive()).toBe(true);
      
      // 2. Seleccionar módulo
      const resUse = executeCommand('use exploit/windows/smb/ms17_010_eternalblue', attacker, scenario.machines, 3);
      // CORRECCIÓN: El comando devuelve el mensaje del payload, el prompt se verifica con getMsfPrompt()
      expect(resUse.output).toContain('No payload configured');
      expect(getMsfPrompt()).toContain('exploit(smb/ms17_010_eternalblue)');

      // 3. Setear RHOSTS
      const resSet = executeCommand(`set RHOSTS ${target.machine_info.ip}`, attacker, scenario.machines, 3);
      expect(resSet.output).toContain(`RHOSTS => ${target.machine_info.ip}`);

      // 4. Verificar persistencia con 'show options'
      const resShow = executeCommand('show options', attacker, scenario.machines, 3);
      expect(resShow.output).toContain(target.machine_info.ip);
    });
  });

  describe('Acceso y Post-Explotación', () => {
    it('debe cambiar la máquina activa al loguearse por SSH exitosamente', () => {
      // Usamos el escenario 2 (Web OSINT & SSH Compromise) para este test específico
      const sshScenario = SCENARIOS[1];
      const sshTarget = sshScenario.machines.find(m => !m.id.includes('attacker'))!;
      const sshPort = sshTarget.scan_results.ports.find(p => p.service === 'ssh')!;
      const sshAttacker = sshScenario.machines.find(m => m.id.includes('attacker'))!;
      
      // Simular que ya se hizo el descubrimiento previo necesario para SSH
      const discoveredTarget = { ...sshTarget, discovery_level: 3 };
      
      // Paso 1: iniciar sesión SSH (pide contraseña)
      const result1 = executeCommand(
        `ssh ${sshPort.credentials!.user}@${sshTarget.machine_info.ip}`, 
        sshAttacker, 
        [sshAttacker, discoveredTarget], 
        4
      );
      expect(result1.sshSession?.active).toBe(true);
      
      // Paso 2: proporcionar contraseña
      const result2 = executeCommand(
        sshPort.credentials!.pass,
        sshAttacker,
        [sshAttacker, discoveredTarget],
        4
      );
      
      expect(result2.newMachineId).toBe(sshTarget.id);
      expect(result2.output).toContain('Welcome to');
    });
  });

  describe('Comandos Built-in', () => {
    it('whoami debe diferenciar entre atacante y objetivo', () => {
      const resAtk = executeCommand('whoami', attacker, scenario.machines, 1);
      expect(resAtk.output).toContain('root');

      // La máquina objetivo muestra el usuario de las credenciales SSH configuradas
      const resTarget = executeCommand('whoami', target, scenario.machines, 1);
      expect(resTarget.output.length).toBeGreaterThan(0);
    });
  });
});
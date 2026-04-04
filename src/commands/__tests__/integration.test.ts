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
    it('debe bloquear nmap si el host no ha sido descubierto (discovery_level 0)', () => {
      const hiddenTarget = { ...target, discovery_level: 0 };
      const result = executeCommand(`nmap -sV ${target.machine_info.ip}`, attacker, [attacker, hiddenTarget], 1);
      
      expect(result.isError).toBe(true);
      expect(result.output).toContain('Primero realiza el reconocimiento');
    });

    it('debe completar la misión de arp-scan y permitir nmap posteriormente', () => {
      const resArp = executeCommand(`arp-scan ${scenario.network_range}`, attacker, scenario.machines, 1);
      expect(resArp.completedMissionId).toBe(1);

      const discoveredTarget = { ...target, discovery_level: 1 };
      const resNmap = executeCommand(`nmap -sV ${target.machine_info.ip}`, attacker, [attacker, discoveredTarget], 2);
      
      expect(resNmap.isError).toBeUndefined();
      expect(resNmap.output).toContain('Nmap scan report');
      expect(resNmap.completedMissionId).toBe(2);
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
      
      // Simular que ya se hizo el descubrimiento previo necesario para SSH
      const discoveredTarget = { ...sshTarget, discovery_level: 3 };
      
      const result = executeCommand(
        `ssh ${sshPort.credentials!.user}@${sshTarget.machine_info.ip} ${sshPort.credentials!.pass}`, 
        attacker, 
        [attacker, discoveredTarget], 
        4
      );
      
      expect(result.newMachineId).toBe(sshTarget.id);
      expect(result.output).toContain('Welcome to');
    });
  });

  describe('Comandos Built-in', () => {
    it('whoami debe diferenciar entre atacante y objetivo', () => {
      const resAtk = executeCommand('whoami', attacker, scenario.machines, 1);
      expect(resAtk.output).toContain('root');

      // La máquina objetivo ahora usa credenciales root para SSH
      const resTarget = executeCommand('whoami', target, scenario.machines, 1);
      expect(resTarget.output).toContain('root');
    });
  });
});
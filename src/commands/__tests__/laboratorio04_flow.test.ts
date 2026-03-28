import { describe, it, expect, beforeEach, vi } from 'vitest';
import { executeCommand, resetMsfState } from '../index';
import { SCENARIOS } from '../../laboratorios/laboratorios';

describe('Laboratorio 04 - LFI Integration Test', () => {
  const scenario = SCENARIOS[3]; // LFI to RCE Lab
  const attacker = scenario.machines.find(m => m.id.includes('attacker'))!;
  const target = scenario.machines.find(m => !m.id.includes('attacker'))!;

  beforeEach(() => {
    resetMsfState();
    vi.clearAllMocks();
  });

  it('debe seguir el flujo correcto de misiones', () => {
    // 1. Recon (Mision 1)
    // Asegurar que el atacante tiene IP para que arp-scan funcione
    attacker.machine_info.ip = '192.168.20.10';
    const resArp = executeCommand(`arp-scan ${scenario.network_range}`, attacker, scenario.machines, 1);
    expect(resArp.completedMissionId).toBe(1);

    // 2. Escaneo (Mision 2)
    const discovered1 = { ...target, discovery_level: 1 };
    const resNmap = executeCommand(`nmap -sV ${target.machine_info.ip}`, attacker, [attacker, discovered1], 2);
    expect(resNmap.completedMissionId).toBe(2);

    // 3. LFI etc/passwd (Mision 3 - en este caso no hay comando de terminal, es manual en browser, 
    // pero podemos simular si hubiera un comando relacionado)
    
    // 4. Preparar Payload (Mision 4 - NUEVA)
    const discovered3 = { ...target, discovery_level: 3 };
    const resCat = executeCommand('cat /root/payload.php', attacker, [attacker, discovered3], 4);
    expect(resCat.completedMissionId).toBe(4);
    expect(resCat.output).toContain('fsockopen');

    // 5. Setup Listener (Mision 5 - MOVIDA)
    const resNc = executeCommand('nc -nlvp 4444', attacker, [attacker, discovered3], 5);
    expect(resNc.completedMissionId).toBe(5);
    expect(resNc.blockingCommand).toBeDefined();
    expect(resNc.blockingCommand?.listeningPort).toBe(4444);
  });
});

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
    // arp-scan ya no completa misiones - es un comando libre
    expect(resArp.discoveredHosts).toBeDefined();
    expect(resArp.discoveredHosts?.length).toBeGreaterThan(0);

    // 2. Escaneo (Mision 2)
    const discovered1 = { ...target, discovery_level: 1 };
    const resNmap = executeCommand(`nmap -sV ${target.machine_info.ip}`, attacker, [attacker, discovered1], 2);
    // nmap ya no completa misiones - es un comando libre
    expect(resNmap.scanResults).toBeDefined();
    expect(resNmap.scanResults?.targetIp).toBe(target.machine_info.ip);

    // 3. LFI etc/passwd (Mision 3 - en este caso no hay comando de terminal, es manual en browser, 
    // pero podemos simular si hubiera un comando relacionado)
    
    // 4. Preparar Payload (Mision 4 - NUEVA)
    const discovered3 = { ...target, discovery_level: 3 };
    const resCat = executeCommand('cat /root/payload.php', attacker, [attacker, discovered3], 4);
    // cat ya no completa misiones - es un comando libre. El lab debería detectar fileRead.isPayload
    expect(resCat.fileRead).toBeDefined();
    expect(resCat.fileRead?.isPayload).toBe(true);
    expect(resCat.output).toContain('fsockopen');

    // 5. Setup Listener (Mision 5 - MOVIDA)
    const resNc = executeCommand('nc -nlvp 4444', attacker, [attacker, discovered3], 5);
    // nc ya no completa misiones - es un comando libre
    expect(resNc.blockingCommand).toBeDefined();
    expect(resNc.blockingCommand?.listeningPort).toBe(4444);
  });
});

// ── commands/tools/ssh.ts ────────────────────────────────────────
// Simulador de conexión SSH

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_ssh = {
  name: 'ssh',
  execute: (args: string[], { allMachines, currentMissionId }: CommandContext): CommandResponse => {
    if (!args[0]) return { output: 'uso: ssh user@ip [password]', isError: true };
    const [user, ip] = args[0].split('@');
    if (!user || !ip) return { output: 'uso: ssh user@ip', isError: true };

    const target = allMachines.find(m => m.machine_info.ip === ip);
    if (!target) return { output: `ssh: connect to host ${ip} port 22: No route to host`, isError: true };

    const sshPort = target.scan_results.ports.find(p => p.service === 'ssh' && p.state === 'open');
    if (!sshPort) return { output: `ssh: connect to host ${ip} port 22: Connection refused`, isError: true };

    // BUG 3 FIX: validate that hydra was done first (discovery_level >= 3)
    if ((target.discovery_level ?? 0) < 3) {
      return {
        output: `Error: No se puede conectar por SSH a ${ip}.\nPrimero descubre credenciales con: hydra -l ${user} -P /usr/share/wordlists/rockyou.txt ${ip} ssh`,
        isError: true
      };
    }

    const pw = args[1];
    if (!pw) return {
      output: `${user}@${ip}'s password:\nPermission denied.\n(Tip: usa 'ssh user@ip password' en esta simulación)`,
      isError: true
    };

    if (sshPort.credentials?.user === user && sshPort.credentials?.pass === pw) {
      const atkIp = allMachines.find(m => m.id.includes('attacker'))?.machine_info.ip || '10.0.0.1';
      let output = `Warning: Permanently added '${ip}' (ECDSA) to list of known hosts.\n`;
      output += `Welcome to ${target.machine_info.os} (GNU/Linux 5.15.0 x86_64)\n\nLast login: ${new Date().toLocaleString()} from ${atkIp}`;

      // Completar siempre la misión activa (currentMissionId) cuando SSH es exitoso.
      // Reemplaza el Math.max anterior que asumía que SSH = último paso del escenario,
      // lo cual rompía Scenario 05 donde SSH es el paso 3 de 6.
      // El store ya garantiza que currentMissionId es el paso correcto — no necesitamos
      // validarlo de nuevo acá con keywords que son frágiles ante nombres de steps distintos.
      const canComplete = target.learning_steps.some(s => s.id === currentMissionId);
      // No mutar directamente el estado aquí; el discovery_level se actualiza en completeMission
      if (!canComplete) {
        output += `\n\n[!] Acceso concedido, pero aún hay pasos previos pendientes en el laboratorio.`;
      }

      return {
        output,
        completedMissionId: canComplete ? currentMissionId : undefined,
        newMachineId: target.id,
        // Marcar credenciales como verificadas después de SSH exitoso
        foundCredentials: {
          machineId: target.id,
          user: user,
          pass: pw,
          file: '/etc/passwd',
          service: 'ssh'
        }
      };
    }

    return { output: `${user}@${ip}'s password:\nPermission denied, please try again.`, isError: true };
  }
};

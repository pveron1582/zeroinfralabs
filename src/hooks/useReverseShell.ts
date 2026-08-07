// ── hooks/useReverseShell.ts ───────────────────────────────────────
// Detecta cuando un listener (nc -lvnp) recibe una conexión de reverse
// shell: imprime la conexión, cambia a la máquina víctima y apila la
// identidad remota para que `exit` vuelva al atacante.

import { useEffect } from 'react';
import type { Machine, BlockingCommand } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import type { IdentityFrame } from './useIdentityStack';

interface UseReverseShellOptions {
  blockingCommand: BlockingCommand | null;
  busy: boolean;
  allMachines: Machine[];
  attackerMachineId: string;
  listeningPort: number | null;
  setBlockingCommand: (bc: BlockingCommand | null) => void;
  setBusy: (busy: boolean) => void;
  setListeningPort: (port: number | null) => void;
  setCurrentDir: (dir: string) => void;
  pushIdentity: (frame: IdentityFrame) => void;
  onChangeMachine: (id: string) => void;
  onMissionComplete: (id: number) => void;
  onVerifyCredentials?: (machineId: string, service?: string) => void;
  appendOutput: (output: string) => void;
}

export function useReverseShell({
  blockingCommand, busy, allMachines, attackerMachineId, listeningPort,
  setBlockingCommand, setBusy, setListeningPort, setCurrentDir,
  pushIdentity, onChangeMachine, onMissionComplete, onVerifyCredentials, appendOutput,
}: UseReverseShellOptions) {
  // prompt ya no se usa aquí: appendOutput lo inyecta desde el orquestador
  const storeBlockingCommand = useScenarioStore(state => state.blockingCommand);
  const storeSetBlockingCommand = useScenarioStore(state => state.setBlockingCommand);

  useEffect(() => {
    const isConnected = blockingCommand?.connected || storeBlockingCommand?.connected;
    if (!isConnected || !busy) return;

    const victimMachine = allMachines.find(m => m.id !== attackerMachineId);
    appendOutput([
      `connect to [${allMachines.find(m => m.id === attackerMachineId)?.machine_info.ip || '...'}] from (UNKNOWN) [${victimMachine?.machine_info.ip || '...'}] ${listeningPort}`,
      `/bin/sh: 0: can't access tty; job control turned off`,
      `${victimMachine?.id.includes('lfi') ? 'www-data' : 'admin'}@${victimMachine?.machine_info.hostname || 'target'}:/var/www/html$ `,
    ].join('\n'));

    setBlockingCommand(null);
    setBusy(false);
    setListeningPort(null);
    useScenarioStore.getState().setListeningPort(null);
    storeSetBlockingCommand(null);
    onMissionComplete(6);
    onVerifyCredentials?.(victimMachine?.id || '', 'lfi-rce');
    if (victimMachine) {
      onChangeMachine(victimMachine.id);
      setCurrentDir('/var/www/html/');
      // Registrar la identidad para que `exit` vuelva a la terminal del
      // atacante donde se ejecutó nc (sin cerrarla).
      const rceUser = victimMachine.id.includes('lfi') ? 'www-data' : 'admin';
      useScenarioStore.getState().setSuUser(victimMachine.id, rceUser);
      pushIdentity({ machineId: victimMachine.id, suUser: rceUser, cwd: '/var/www/html/' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockingCommand?.connected, storeBlockingCommand?.connected, busy]);
}

// ── hooks/processCommandResult.ts ──────────────────────────────────
// Dispatcher puro de los efectos secundarios de un CommandResponse:
// misiones, archivos, credenciales, identidades, sesiones, prompts.
// Extraído de useCommandRunner como función pura (sin React) para poder
// testearla y reutilizarla desde varios hooks.

import type { Machine, FileEntry, CommandResponse, BlockingCommand } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import { initialCwd } from '../utils/users';
import type { IdentityFrame } from './useIdentityStack';
import type { PendingSu } from './usePendingSu';
import type { PendingPython } from './usePendingPythonInput';

export interface HistoryEntry {
  command: string | null;
  output?: string;
  lines?: string[];
  streaming: boolean;
  prompt?: string;
  timestamp: number;
  result?: CommandResponse;
  lineDelays?: number[];
}

/** Entrada de bienvenida (historial vacío al montar / resetear). */
export const makeWelcome = (_machines: Machine[]): HistoryEntry => ({
  command: null, streaming: false,
  output: '',
  timestamp: Date.now(),
});

export interface ProcessDeps {
  machine: Machine;
  allMachines: Machine[];
  currentDir: string;
  setCurrentDir: (dir: string) => void;
  pushIdentity: (frame: IdentityFrame) => void;
  popIdentity: () => boolean;
  checkMissionCompletion: (result: CommandResponse) => void;
  onMissionComplete: (id: number) => void;
  onChangeMachine: (id: string) => void;
  onCredentialsFound: (machineId: string, user: string, pass: string, file?: string, service?: string) => void;
  onVerifyCredentials?: (machineId: string, service?: string) => void;
  onFailedUser?: (machineId: string, user: string) => void;
  onSudoPrivileges?: (machineId: string, user: string, commands: string[], canSudo: boolean) => void;
  setBlockingCommand: (bc: BlockingCommand | null) => void;
  setListeningPort: (port: number | null) => void;
  setNanoFile: (f: NonNullable<CommandResponse['nanoFile']> | null) => void;
  setBusy: (busy: boolean) => void;
  setHistory: React.Dispatch<React.SetStateAction<HistoryEntry[]>>;
  setPendingSu: React.Dispatch<React.SetStateAction<PendingSu | null>>;
  setPendingPython: React.Dispatch<React.SetStateAction<PendingPython | null>>;
  reportVulnerability: (machineId: string, vulnId: string, status: string) => void;
  // Con terminalId el su vive en el frame local: NO se escribe el
  // machine.su_user compartido (aislamiento por terminal — HIGH #2).
  terminalId?: string;
}

/**
 * Cwd correcto al cambiar de máquina: home del nuevo SO (`initialCwd`).
 * Si el mismo resultado trae `sshLoginUser`, manda el home del usuario
 * recién conectado (misma regla que useRunCommand en el paso de password).
 * Si la máquina no está en `allMachines`, se conserva la actual.
 */
function nextCwdFor(result: CommandResponse, allMachines: Machine[], currentDir: string): string {
  const sshUser = 'sshLoginUser' in result ? result.sshLoginUser : undefined;
  if (sshUser) return sshUser === 'root' ? '/root' : `/home/${sshUser}`;
  const machineId = 'newMachineId' in result ? result.newMachineId : undefined;
  const target = machineId ? allMachines.find(m => m.id === machineId) : undefined;
  return target ? initialCwd(target) : currentDir;
}

/** Aplica todos los side-effects declarados en un CommandResponse. */
export function processCommandResult(deps: ProcessDeps, result: CommandResponse, isStreaming: boolean) {
  const {
    machine, allMachines, currentDir, setCurrentDir,
    pushIdentity, popIdentity, checkMissionCompletion,
    onMissionComplete, onChangeMachine, onCredentialsFound,
    onVerifyCredentials, onFailedUser, onSudoPrivileges,
    setBlockingCommand, setListeningPort, setNanoFile, setBusy,
    setHistory, setPendingSu, setPendingPython, reportVulnerability,
    terminalId,
  } = deps;

  if ('completedMissionId' in result && result.completedMissionId) {
    onMissionComplete(result.completedMissionId);
  }

  if ('filesChanged' in result && result.filesChanged) {
    useScenarioStore.getState().setMachineFiles(machine.id, result.filesChanged);
  }

  checkMissionCompletion(result);

  const bc = 'blockingCommand' in result ? result.blockingCommand : undefined;
  if (bc) {
    setBlockingCommand(bc);
    if (bc.listeningPort) {
      setListeningPort(bc.listeningPort);
      useScenarioStore.getState().setListeningPort(bc.listeningPort);
    }
    if (bc.clearScreen) {
      setHistory([]);
    }
    if (!isStreaming) setBusy(true);
  }

  if ('desktopAction' in result && result.desktopAction) {
    const da = result.desktopAction;
    if (da.action === 'connect' && da.machineId) {
      useScenarioStore.getState().openWindowsDesktop(da.machineId);
      // Sesión RDP cerró el shell tras autenticar: limpiar estado de sesión.
      useScenarioStore.getState().setRdpSession(null);
      if ('foundCredentials' in result && result.foundCredentials && onVerifyCredentials) {
        onVerifyCredentials(result.foundCredentials.machineId, result.foundCredentials.service);
      }
    } else if (da.action === 'disconnect') {
      useScenarioStore.getState().closeWindowsDesktop();
      useScenarioStore.getState().setRdpSession(null);
    }
  }

  if ('nanoFile' in result && result.nanoFile) {
    setNanoFile(result.nanoFile);
    setBusy(true);
  }

  if ('foundCredentials' in result && result.foundCredentials) {
    onCredentialsFound(
      result.foundCredentials.machineId,
      result.foundCredentials.user,
      result.foundCredentials.pass,
      result.foundCredentials.file,
      result.foundCredentials.service,
    );
  }

  // `exit` de una identidad (su): volver al usuario anterior de la MISMA
  // máquina sin cerrar la terminal.
  if ('identityExit' in result && result.identityExit) {
    if (!popIdentity()) {
      useScenarioStore.getState().setSuUser(machine.id, undefined);
    }
  }

  if ('newMachineId' in result && result.newMachineId) {
    if ('sshSessionClosed' in result && result.sshSessionClosed) {
      // Salir de una sesión SSH/reverse shell: pop del stack (el frame
      // apilado fue la sesión remota) en vez de apilar uno nuevo.
      if (!popIdentity()) {
        onChangeMachine(result.newMachineId);
      }
    } else {
      onChangeMachine(result.newMachineId);
      // Cambio de máquina (exploit → víctima, fin de sesión → atacante):
      // el cwd debe ser el home del nuevo SO. Sin esto seguía apuntando al
      // directorio de la máquina saliente (p.ej. /root tras abrir una sesión
      // Windows) y ls/pwd/cd quedaban en el SO anterior.
      const nextCwd = nextCwdFor(result, allMachines, currentDir);
      setCurrentDir(nextCwd);
      pushIdentity({ machineId: result.newMachineId, cwd: nextCwd });
    }
  }

  if ('sshLoginUser' in result && result.sshLoginUser) {
    setCurrentDir(`/home/${result.sshLoginUser}`);
  }

  if ('privescCompleted' in result && result.privescCompleted) {
    const machineId = result.privescCompleted;
    useScenarioStore.getState().setPrivescCompleted(machineId);
    // Abrir una shell root (sudo su / sudo vim): registrar la identidad
    // para que `exit` vuelva al usuario anterior. privesc_completed y el
    // frame son compartidos/local respectivamente; el su_user compartido
    // solo en modo legacy (sin terminalId).
    if (!terminalId) useScenarioStore.getState().setSuUser(machineId, 'root');
    pushIdentity({ machineId, suUser: 'root', cwd: currentDir });
  }

  if ('failedUser' in result && result.failedUser && onFailedUser) {
    onFailedUser(result.failedUser.machineId, result.failedUser.user);
  }

  if ('sudoPrivileges' in result && result.sudoPrivileges && onSudoPrivileges) {
    onSudoPrivileges(
      result.sudoPrivileges.machineId,
      result.sudoPrivileges.user,
      result.sudoPrivileges.commands,
      result.sudoPrivileges.canSudo,
    );
  }

  if ('foundVulnerability' in result && result.foundVulnerability) {
    reportVulnerability(
      result.foundVulnerability.machineId,
      result.foundVulnerability.vulnId,
      result.foundVulnerability.status,
    );
  }

  if ('newMachineId' in result && result.newMachineId
      && 'foundCredentials' in result && result.foundCredentials && onVerifyCredentials) {
    onVerifyCredentials(result.foundCredentials.machineId, result.foundCredentials.service);
  }

  if ('sshSessionClosed' in result && result.sshSessionClosed) {
    setCurrentDir('/root/');
  }

  const pu = 'possibleUsers' in result ? result.possibleUsers : undefined;
  if (pu) {
    const target = allMachines.find(m => m.id === pu.machineId);
    if (target) {
      useScenarioStore.getState().setPossibleUsers(target.id, pu.users);
    }
  }

  if ('createdFiles' in result && result.createdFiles && result.createdFiles.length > 0) {
    const attacker = allMachines.find(
      m => m.machine_info.type === 'workstation' || m.machine_info.hostname?.toLowerCase().includes('kali')
    );
    if (attacker) {
      const { addFileToMachine } = useScenarioStore.getState();
      result.createdFiles.forEach((f: FileEntry) => addFileToMachine(attacker.id, f));
    }
  }

  // `su`/`sudo -i` devolvió pidiendo password.
  if ('requiresPassword' in result && result.requiresPassword && result.suTarget) {
    setPendingSu({
      targetUser: result.suTarget,
      promptToken: '',
      sudoEscalation: 'sudoEscalation' in result ? result.sudoEscalation : undefined,
      sudoCwd: 'sudoCwd' in result ? result.sudoCwd : undefined,
    });
  }

  // python3 quedó esperando input(): capturar la próxima línea del terminal.
  if ('pythonPendingInput' in result && result.pythonPendingInput) {
    setPendingPython({
      argv: result.pythonPendingInput.argv,
      sourceName: result.pythonPendingInput.sourceName,
      inputs: [],
      shownOutput: result.output,
    });
  }

  // `su` desde root cambió de usuario sin password (root authority).
  if ('suUserApplied' in result && result.suUserApplied) {
    if (!terminalId) useScenarioStore.getState().setSuUser(machine.id, result.suUserApplied);
    pushIdentity({ machineId: machine.id, suUser: result.suUserApplied, cwd: currentDir });
  }
}

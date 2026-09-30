// ── hooks/responseHandlers.ts ─────────────────────────────────────
// QUÉ hace cada campo de un CommandResponse: una tabla escrita en orden de
// ejecución, complemento de processCommandResult.ts (que solo la recorre e
// inyecta el pseudo-paso de validación de misiones).
//
// Antes eran 20 `if ('x' in result)` secuenciales, donde un campo nuevo del
// contrato era un no-op silencioso. El tipo de la tabla es un mapeo
// exhaustivo del contrato: agregar un campo a `CmdResponseBase` sin escribir
// su handler es un error de compilación.

import type { Machine, FileEntry, CommandResponse, CmdResponseBase } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import { initialCwd, homeDirFor } from '../utils/users';
import type { ProcessDeps } from './processCommandResult';

/**
 * Cwd correcto al cambiar de máquina: home del nuevo SO (`initialCwd`).
 * Si el mismo resultado trae `sshLoginUser`, manda el home del usuario
 * recién conectado (misma regla que useRunCommand en el paso de password).
 * Si la máquina no está en `allMachines`, se conserva la actual.
 */
function nextCwdFor(result: CommandResponse, allMachines: Machine[], currentDir: string): string {
  const sshUser = 'sshLoginUser' in result ? result.sshLoginUser : undefined;
  if (sshUser) return homeDirFor(sshUser);
  const machineId = 'newMachineId' in result ? result.newMachineId : undefined;
  const target = machineId ? allMachines.find(m => m.id === machineId) : undefined;
  return target ? initialCwd(target) : currentDir;
}

export interface DispatchCtx {
  deps: ProcessDeps;
  result: CommandResponse;
  isStreaming: boolean;
  /** Estado del store leído UNA vez: de acá solo se llaman acciones (refs estables en zustand). */
  store: ReturnType<typeof useScenarioStore.getState>;
  /** Cwd del snapshot de deps, NO el ya mutado por setCurrentDir. */
  currentDir: string;
  machine: Machine;
  allMachines: Machine[];
}

/**
 * Campos de las variantes del contrato (`CommandResponse` = base & unión de
 * 16 variantes), que no viven en `CmdResponseBase`. Una clave mal escrita acá
 * es excess property contra el tipo de la tabla → error de compilación.
 * Ojo: si una VARIANTE pierde un campo, esto no se detecta; el handler queda
 * inerte (no hace nada) y el snapshot de `contract.test.ts` sigue en pie.
 */
type VariantField =
  | 'type' | 'scanResults' | 'discoveredPorts' | 'createdFiles' | 'discoveredHosts'
  | 'networkScanned' | 'foundDirectories' | 'foundCredentials' | 'failedUser'
  | 'sudoPrivileges' | 'privescViaSudo' | 'blockingCommand' | 'ftpSession'
  | 'sshSession' | 'newMachineId' | 'sshLoginUser' | 'sshSessionClosed'
  | 'uidChecked' | 'currentUser' | 'isSystem' | 'foundVulnerability'
  | 'exitTerminal' | 'rdpSession';

/**
 * Un handler por campo del contrato. `-?` obliga a que existan TODOS: el
 * mapeo es exhaustivo y por eso el contrato no puede crecer en silencio.
 * Se ejecuta en el orden de escritura de las claves (mismo orden que la
 * versión anterior de la cadena de `if`, que estaba testeada).
 */
/** Tipo real del campo en la variante que lo declara (no `unknown`). */
type VariantValue<K extends string> =
  Extract<CommandResponse, Partial<Record<K, unknown>>> extends infer M ? M[K & keyof M] : never;

export type FieldHandlers =
  & { [K in keyof CmdResponseBase]-?: (value: CmdResponseBase[K], ctx: DispatchCtx) => void }
  & { [K in VariantField]-?: (value: VariantValue<K>, ctx: DispatchCtx) => void };

/**
 * La tabla, en orden de ejecución. Cuatro cosas NO son reordenables:
 *  - `filesChanged` va antes de la validación de misiones (el validador
 *    puede leer el FS ya actualizado).
 *  - `foundCredentials` va antes de la verificación de credenciales.
 *  - `newMachineId` va antes de `sshSessionClosed`: el cwd se recalcula al
 *    cambiar de máquina y el cierre de sesión lo pisa a `/root/`.
 *  - `privescCompleted`/`suUserApplied` apilan con el cwd del SNAPSHOT, no con
 *    el ya cambiado por `setCurrentDir`.
 */
export const handlers: FieldHandlers = {
  // ── Misiones ─────────────────────────────────────────────────────
  completedMissionId: (id, { deps }) => { if (id) deps.onMissionComplete(id); },

  // ── Filesystem ───────────────────────────────────────────────────
  // Antes de la validación: el validador puede leer el estado del FS.
  filesChanged: (files, { store, machine }) => { if (files) store.setMachineFiles(machine.id, files); },

  createdFiles: (files, { store, allMachines }) => {
    if (!files || files.length === 0) return;
    const attacker = allMachines.find(
      m => m.machine_info.type === 'workstation' || m.machine_info.hostname?.toLowerCase().includes('kali')
    );
    if (attacker) files.forEach((f: FileEntry) => store.addFileToMachine(attacker.id, f));
  },

  // ── Sesión bloqueante (nc -l, msfconsole, tails) ──────────────────
  blockingCommand: (bc, { deps, isStreaming, store }) => {
    if (!bc) return;
    deps.setBlockingCommand(bc);
    if (bc.listeningPort) {
      deps.setListeningPort(bc.listeningPort);
      store.setListeningPort(bc.listeningPort);
    }
    if (bc.clearScreen) deps.setHistory([]);
    if (!isStreaming) deps.setBusy(true);
  },

  // ── Escritorio Windows / RDP ─────────────────────────────────────
  desktopAction: (da, { deps, result, store }) => {
    if (!da) return;
    if (da.action === 'connect' && da.machineId) {
      store.openWindowsDesktop(da.machineId);
      // Sesión RDP cerró el shell tras autenticar: limpiar estado de sesión.
      store.setRdpSession(null);
      if ('foundCredentials' in result && result.foundCredentials && deps.onVerifyCredentials) {
        deps.onVerifyCredentials(result.foundCredentials.machineId, result.foundCredentials.service);
      }
    } else if (da.action === 'disconnect') {
      store.closeWindowsDesktop();
      store.setRdpSession(null);
    }
  },

  // ── Credenciales ─────────────────────────────────────────────────
  foundCredentials: (creds, { deps, result }) => {
    if (!creds) return;
    deps.onCredentialsFound(creds.machineId, creds.user, creds.pass, creds.file, creds.service);
    // Condición CRUZADA con `newMachineId` (por eso vive acá y no en un
    // if aparte): login por SSH/exploit con credenciales → verificarlas en la
    // topología. `desktopAction` connect tiene su propio camino (RDP).
    const machineId = 'newMachineId' in result ? result.newMachineId : undefined;
    if (machineId && deps.onVerifyCredentials) {
      deps.onVerifyCredentials(creds.machineId, creds.service);
    }
  },

  failedUser: (failed, { deps }) => { if (failed) deps.onFailedUser?.(failed.machineId, failed.user); },

  sudoPrivileges: (sudo, { deps }) => {
    if (sudo) deps.onSudoPrivileges?.(sudo.machineId, sudo.user, sudo.commands, sudo.canSudo);
  },

  // ── Identidades y máquinas ───────────────────────────────────────
  // `exit` de una identidad (su): volver al usuario anterior de la MISMA
  // máquina sin cerrar la terminal.
  identityExit: (isExit, { deps, store, machine }) => {
    if (!isExit) return;
    if (!deps.popIdentity()) store.setSuUser(machine.id, undefined);
  },

  newMachineId: (id, { deps, result, allMachines, currentDir }) => {
    if (!id) return;
    if ('sshSessionClosed' in result && result.sshSessionClosed) {
      // Salir de una sesión SSH/reverse shell: pop del stack (el frame
      // apilado fue la sesión remota) en vez de apilar uno nuevo.
      if (!deps.popIdentity()) deps.onChangeMachine(id);
      return;
    }
    deps.onChangeMachine(id);
    // Cambio de máquina (exploit → víctima, fin de sesión → atacante):
    // el cwd debe ser el home del nuevo SO. Sin esto seguía apuntando al
    // directorio de la máquina saliente (p.ej. /root tras abrir una sesión
    // Windows) y ls/pwd/cd quedaban en el SO anterior.
    const nextCwd = nextCwdFor(result, allMachines, currentDir);
    deps.setCurrentDir(nextCwd);
    deps.pushIdentity({ machineId: id, cwd: nextCwd });
  },

  // root vive en /root: con la interpolación directa el cwd quedaba
  // en /home/root tras un `ssh root@victim`.
  sshLoginUser: (user, { deps }) => { if (user) deps.setCurrentDir(homeDirFor(user)); },

  sshSessionClosed: (closed, { deps }) => { if (closed) deps.setCurrentDir('/root/'); },

  privescCompleted: (machineId, { deps, store, currentDir }) => {
    if (!machineId) return;
    store.setPrivescCompleted(machineId);
    // Abrir una shell root (sudo su / sudo vim): registrar la identidad
    // para que `exit` vuelva al usuario anterior. privesc_completed y el
    // frame son compartidos/local respectivamente; el su_user compartido
    // solo en modo legacy (sin terminalId).
    if (!deps.terminalId) store.setSuUser(machineId, 'root');
    deps.pushIdentity({ machineId, suUser: 'root', cwd: currentDir });
  },

  // `su` desde root cambió de usuario sin password (root authority).
  suUserApplied: (user, { deps, store, machine, currentDir }) => {
    if (!user) return;
    if (!deps.terminalId) store.setSuUser(machine.id, user);
    deps.pushIdentity({ machineId: machine.id, suUser: user, cwd: currentDir });
  },

  // `su`/`sudo -i` devolvió pidiendo password.
  requiresPassword: (needs, { deps, result }) => {
    if (!needs || !result.suTarget) return;
    deps.setPendingSu({
      targetUser: result.suTarget,
      promptToken: '',
      sudoEscalation: 'sudoEscalation' in result ? result.sudoEscalation : undefined,
      sudoCwd: 'sudoCwd' in result ? result.sudoCwd : undefined,
    });
  },

  possibleUsers: (pu, { store, allMachines }) => {
    if (!pu) return;
    const target = allMachines.find(m => m.id === pu.machineId);
    if (target) store.setPossibleUsers(target.id, pu.users);
  },

  // python3 quedó esperando input(): capturar la próxima línea del terminal.
  pythonPendingInput: (pending, { deps, result }) => {
    if (!pending) return;
    deps.setPendingPython({
      argv: pending.argv,
      sourceName: pending.sourceName,
      inputs: [],
      shownOutput: result.output,
    });
  },

  foundVulnerability: (vuln, { deps }) => {
    if (vuln) deps.reportVulnerability(vuln.machineId, vuln.vulnId, vuln.status);
  },

  nanoFile: (nano, { deps }) => {
    if (!nano) return;
    deps.setNanoFile(nano);
    deps.setBusy(true);
  },

  // ── Metadata que Consumen otros (handler vacío a propósito) ───────
  // Cada línea dice QUIÉN la consume, para que "vacío" signifique
  // "decidido", no "olvidado".
  output: () => {},            // lo pinta el Terminal; streaming lo usa
  isError: () => {},           // color de la línea en el Terminal
  streamingLineDelays: () => {}, // useRunCommand (ritmo del streaming)
  privescAttempted: () => {},  // LabValidator
  privescTool: () => {},       // LabValidator
  privescViaSudo: () => {},    // LabValidator
  fileRead: () => {},          // LabValidator (leer flags/notas valida misión)
  downloadedFile: () => {},    // useDownloadedFile
  scanResults: () => {},       // LabValidator + NetworkMap
  foundDirectories: () => {},  // LabValidator
  discoveredHosts: () => {},   // NetworkMap / topología
  discoveredPorts: () => {},   // NetworkMap
  networkScanned: () => {},    // NetworkMap
  sshSession: () => {},        // useFtpSession/ShellManager
  ftpSession: () => {},        // useFtpSession
  rdpSession: () => {},        // useRunCommand (escritorio)
  uidChecked: () => {},        // LabValidator (uid)
  currentUser: () => {},       // LabValidator (user actual)
  isSystem: () => {},          // LabValidator (SYSTEM)
  exitTerminal: () => {},      // useRunCommand (salida de terminal)
  suTarget: () => {},          // se consume con requiresPassword
  sudoEscalation: () => {},    // se consume con requiresPassword
  sudoCwd: () => {},           // se consume con requiresPassword
  msfStateUpdate: () => {},    // commands/executor (estado MSF)
  psStateUpdate: () => {},     // commands/executor (sesión PowerShell)
  browserAction: () => {},     // fakebrowser/browserMission
  httpRequest: () => {},       // BurpSuite (historial de proxy)
  httpResponse: () => {},      // BurpSuite
  clearScreen: () => {},       // useRunCommand (petición de UI, P0.4)
  exitToLanding: () => {},     // useRunCommand (petición de UI, P0.4)
  type: () => {},              // discriminante de la unión de variantes
};


// ── types/command.ts ──────────────────────────────────────────────
// Contrato de comandos: CommandResponse (unión discriminada con 16
// canales de metadata), CommandContext y datos de sesiones auxiliares

import type { FileEntry, Machine } from './machine';

export interface BlockingCommand {
  message: string;
  cancelKey?: string;
  listeningPort?: number;
  clearScreen?: boolean;
  connected?: boolean;
}

// ── Reusable response sub-types ───────────────────────────────────

interface SessionBase {
  active: boolean;
  targetIp?: string;
  targetId?: string;
  username?: string;
}

export interface FtpSessionData extends SessionBase {
  connected?: boolean;
  loggedIn?: boolean;
  currentDir?: string;
  step?: 'connecting' | 'username' | 'password' | 'connected';
}

export interface SshSessionData extends SessionBase {
  connected?: boolean;
  authenticated?: boolean;
  step?: 'connecting' | 'password' | 'connected';
}

export interface FoundCredentialsData {
  machineId: string;
  user: string;
  pass: string;
  file: string;
  service?: string;
  verified?: boolean;
}

export interface FailedUserData {
  machineId: string;
  user: string;
}

export interface FoundVulnerabilityData {
  machineId: string;
  vulnId: string;
  status: 'detected' | 'confirmed';
}

export interface ScanResultsData {
  targetId: string;
  targetIp: string;
  targetHostname: string;
  ports: Array<{
    port: number;
    protocol: string;
    state: string;
    service: string;
    version?: string;
  }>;
  osDetected?: string;
}

export interface FoundDirectoriesData {
  targetId: string;
  targetUrl: string;
  directories: Array<{path: string; status: number; size?: number}>;
}

export interface FileReadData {
  path: string;
  // Máquina donde ocurrió la lectura: permite al validador exigir que la
  // flag se lea en la máquina objetivo de la misión (C2).
  machineId?: string;
  isNote: boolean;
  isFlag: boolean;
  isPayload: boolean;
  content: string;
}

export interface SudoPrivilegesData {
  machineId: string;
  user: string;
  commands: string[];
  canSudo: boolean;
}

export interface PossibleUsersData {
  machineId: string;
  users: string[];
}

// ── HTTP request/response (Burp Suite) ────────────────────────────
// Modelo sintético de transacciones HTTP para el proxy/Repeater.
export interface HttpRequestData {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}

export interface HttpResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  elapsedMs?: number;
}

// ── Discriminated union ──────────────────────────────────────────
// Fields available on ALL variants
interface CmdResponseBase {
  output: string;
  isError?: boolean;
  completedMissionId?: number;
  streamingLineDelays?: number[];
  privescAttempted?: boolean;
  privescTool?: string;
  privescCompleted?: string;
  // Metadata de lectura de archivos. `cat` y los editores (nano, futuros
  // vim/vi) la emiten para que leer flags/notas/payloads con cualquier
  // herramienta valide la misión del laboratorio.
  fileRead?: FileReadData;
  possibleUsers?: PossibleUsersData;
  // elevated: editor abierto vía `sudo <editor>` → el save se hace como root
  // (handleNanoSave omite los checks de permisos y crea con owner root).
  nanoFile?: { path: string; content: string; readOnly?: boolean; elevated?: boolean; existingSnapshot?: { owner: string; group: string; mode: number } };
  // Resultado inmutable de operaciones sobre el filesystem (crear/editar/borrar/
  // cambiar permisos). El CommandRunner lo aplica al store vía setMachineFiles().
  filesChanged?: FileEntry[];
  // `su` pidió password y está esperando entrada. El Terminal muestra un prompt
  // tipo "Password:" y, al recibirla, la pasa a un suPasswordSubmit callback.
  requiresPassword?: boolean;
  suTarget?: string;
  // `su` desde root cambia a un usuario de menor privilegio sin password
  // (root authority). El CommandRunner aplica setSuUser + pushIdentity al
  // instante, sin pasar por el prompt de password.
  suUserApplied?: string;
  // `sudo -i`/`sudo -s` pidió la password del usuario invocante (no la de root)
  // para abrir una shell root. Al validarse, el CommandRunner aplica privesc
  // (setPrivescCompleted + setSuUser('root')) en vez de solo cambiar de usuario.
  sudoEscalation?: boolean;
  // Para `sudo -s`: directorio donde dejar la shell root (/root). `sudo -i`
  // mantiene el directorio actual (sin sudoCwd).
  sudoCwd?: string;
  // `exit` cierra una identidad (su_user) o una sesión remota (ssh/reverse
  // shell): el CommandRunner hace pop del stack de identidades y vuelve al
  // usuario/máquina anterior sin cerrar la terminal.
  identityExit?: boolean;
  // Estado actualizado de Metasploit (msfconsole y sus sub-comandos).
  // Reemplaza al antiguo prefijo `MSF_STATE:` en el output: los comandos MSF
  // lo emiten explícitamente y el dispatcher lo aplica al estado global.
  msfStateUpdate?: import('../frameworks/metasploit/core/msfTypes').MsfState | null;
  // Transacción HTTP sintética emitida por Burp Suite (Repeater/Proxy).
  // El store la usa para alimentar el historial del proxy y la pestaña Target.
  httpRequest?: HttpRequestData;
  httpResponse?: HttpResponseData;
}

export type CommandResponse = CmdResponseBase & (
  | { /* simple — no extra metadata */ }
  | { type: 'creds'; foundCredentials: FoundCredentialsData; failedUser?: FailedUserData }
  | { type: 'scan'; scanResults: ScanResultsData; discoveredPorts?: string; createdFiles?: FileEntry[]; discoveredHosts?: Array<{ip: string; mac: string; hostname: string}> }
  | { type: 'discovery'; discoveredHosts: Array<{ip: string; mac: string; hostname: string}>; networkScanned?: string }
  | { type: 'dirEnum'; foundDirectories: FoundDirectoriesData }
  | { type: 'fileRead'; fileRead: FileReadData; possibleUsers?: PossibleUsersData }
  | { type: 'sudo'; sudoPrivileges?: SudoPrivilegesData; privescViaSudo?: boolean }
  | { type: 'blocking'; blockingCommand: BlockingCommand }
  | { type: 'ftp'; ftpSession: FtpSessionData; downloadedFile?: FileEntry }
  | { type: 'ssh'; sshSession: SshSessionData; foundCredentials?: FoundCredentialsData; newMachineId?: string; sshLoginUser?: string; failedUser?: FailedUserData }
  | { type: 'meterpreter'; uidChecked?: boolean; currentUser?: string; isSystem?: boolean; newMachineId?: string }
  | { type: 'vuln'; foundVulnerability: FoundVulnerabilityData; newMachineId?: string }
  | { type: 'sshLogin'; newMachineId?: string; sshLoginUser: string; sshSessionClosed?: boolean; foundCredentials?: FoundCredentialsData }
  | { type: 'exit'; exitTerminal?: boolean; newMachineId?: string; sshSessionClosed?: boolean }
  | { type: 'hybrid'; newMachineId?: string; blockingCommand?: BlockingCommand; downloadedFile?: FileEntry; foundCredentials?: FoundCredentialsData; failedUser?: FailedUserData; foundVulnerability?: FoundVulnerabilityData; sshSessionClosed?: boolean; sshLoginUser?: string; ftpSession?: FtpSessionData; sshSession?: SshSessionData }
  | { type: 'http'; httpRequest: HttpRequestData; httpResponse: HttpResponseData; foundVulnerability?: FoundVulnerabilityData; foundCredentials?: FoundCredentialsData; foundDirectories?: FoundDirectoriesData }
);

export interface CommandContext {
  machine: Machine;
  allMachines: Machine[];
  currentMissionId: number;
  currentDir: string;
  setCurrentDir?: (dir: string) => void;
  listeningPort?: number | null;
  isSshSession?: boolean;
  language?: 'en' | 'es';
  ftpSession?: {
    active: boolean;
    targetIp?: string;
    targetId?: string;
    username?: string;
    loggedIn?: boolean;
    currentDir?: string;
    step: 'connecting' | 'username' | 'password' | 'connected';
  };
  sshSession?: {
    active: boolean;
    targetIp?: string;
    targetId?: string;
    username?: string;
    authenticated?: boolean;
    step: 'connecting' | 'password' | 'connected';
  };
  // Umask del terminal (por sesión, no persistente). ROADMAP 2.4.
  umask?: number;
  setUmask?: (mask: number) => void;
  // Variables de entorno del terminal (por sesión, no persistente). ROADMAP 7.4.
  env?: Record<string, string>;
  setEnv?: (env: Record<string, string>) => void;
  // Entrada recibida vía pipe (cmd1 | cmd2). Solo presente en el 2º comando.
  pipedInput?: string;
  // `sudo <editor>` marca el contexto como elevado: los editores (nano) usan
  // la identidad root para abrir/guardar archivos restringidos.
  elevatedEdit?: boolean;
}

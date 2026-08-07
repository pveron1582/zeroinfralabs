// ── types.ts ──────────────────────────────────────────────────────
// Central type definitions for ZeroInfra Labs Simulator

export interface Port {
  port: number;
  protocol: string;
  state: string;
  service: string;
  version: string;
  credentials?: { user: string; pass: string };
}

export interface Directory {
  path: string;
  status: number;
  description: string;
}

export interface User {
  username: string;
  uid: number;
  gid: number;
  home: string;
  shell: string;
  groups: number[];
}

export interface Group {
  name: string;
  gid: number;
  members: string[];
}

export interface FileEntry {
  path: string;
  content: string;
  type: string;
  owner?: string;
  group?: string;
  mode?: number;
  // Enlace simbólico: type === 'symlink', linkTarget apunta al destino (ROADMAP 9.3)
  linkTarget?: string;
}

export interface StepHint {
  hint1: { en: string; es: string };
  hint2: { en: string; es: string };
}

export interface LearningStep {
  id: number;
  task: string;
  text: string;
  // Translations for internationalization - stored modularly per lab
  taskEn?: string;
  textEn?: string;
  taskEs?: string;
  textEs?: string;
  targetMachineId: string;
  discoveryLevel: number;
  // Progressive hints (optional - labs can define them for harder challenges)
  hints?: StepHint;
}

export interface MachineInfo {
  hostname: string;
  ip: string;
  mac: string;
  os: string;
  status: string;
  type: string;
}

export interface Machine {
  id: string;
  machine_info: MachineInfo;
  discovery_level: number;
  scan_results: { ports: Port[] };
  web_enumeration: {
    web_server: string;
    cms: string;
    directories: Directory[];
  };
  learning_steps: LearningStep[];
  files: FileEntry[];
  vulnerabilities?: { id: string; name?: string; module_aux?: string; module_exploit?: string; status?: 'detected' | 'confirmed' }[];
  found_credentials?: {
    file: string;
    user: string;
    pass: string;
    verified: boolean;
    service?: string; // 'ssh', 'wp-admin', 'ftp', etc.
  }[];
  possible_ssh_users?: string[];
  failed_ssh_users?: string[];
  /** System passwords for `su` to validate against. Key = username, value = plaintext password.
   *  Only present on target machines; ignored on the attacker (the attacker is root). */
  known_passwords?: Record<string, string>;
  sudo_privileges?: {
    user: string;
    commands: string[];
    canSudo: boolean;
  };
  privesc_completed?: boolean;
  privesc_vulnerability?: {
    user: string;
    tool: string;
    description: string;
    descriptionEs: string;
  };
  su_user?: string;
}

// ── Mission Validation Criteria ───────────────────────────────────
// Defines what command result validates each mission
export type MissionCriteriaType =
  | 'discoveredHosts'      // arp-scan found hosts
  | 'scanResults'          // nmap scanned ports
  | 'foundCredentials'     // hydra found creds
  | 'foundDirectories'     // gobuster found dirs
  | 'fileRead'             // cat read a file
  | 'fileDownloaded'       // file downloaded (e.g. via ftp get)
  | 'privesc'              // sudo escalation
  | 'sshLogin'             // successful ssh
  | 'ftpLogin'             // successful ftp
  | 'vulnerabilityFound'   // msf vulnerability check
  | 'exploit'              // msf exploit ran
  | 'uidChecked'           // meterpreter getuid
  | 'ncListener'           // netcat listener started
  | 'blockingCommand'      // listener/payload active
  | 'sudoPrivileges'       // sudo -l enumerated allowed commands
  | 'browserAction';       // navegación web (validada por FakeBrowser, no por labValidator)

export interface ValidationCriteria {
  type: MissionCriteriaType;
  // Optional conditions to match
  targetIp?: string;              // IP must match
  port?: number;                  // Port must be present
  minHosts?: number;              // Minimum hosts discovered
  fileType?: 'flag' | 'payload' | 'note' | 'any';
  user?: string;                  // User must match
  verified?: boolean;             // Credentials verified
  isSystem?: boolean;             // UID is SYSTEM/root
  vulnId?: string;                // Vulnerability ID
  status?: 'detected' | 'confirmed'; // Vulnerability status to match
  directories?: string[];         // Directories that must be found
  command?: string;               // Command substring that must appear in sudoers rules
  service?: string;               // Service to match (e.g. 'ssh', 'ftp', 'wp-admin')
  // Browser action criteria (FakeBrowser navigation)
  url?: string;                   // URL that must be visited
  action?: 'navigate' | 'login' | 'viewPage'; // Type of browser interaction
  // For complex conditions
  conditions?: Record<string, any>;
}

export interface Mission {
  id: number;
  title: string;
  titleEs?: string;
  description: string;
  descriptionEs?: string;
  status: 'active' | 'pending' | 'completed';
  targetMachineId: string;
  discoveryLevel: number;
  // Progressive hints support
  hints?: StepHint;
  hintLevel: number; // 0 = no hints revealed, 1 = hint1 revealed, 2 = all hints revealed
  // Validation criteria for automatic mission completion
  validationCriteria?: ValidationCriteria;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  category: string;
  network_range: string;
  initialMachineId: string;
  machines: Machine[];
  missions: Mission[];
}

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
  // Reemplaza al antiguo prefijo `MSF_STATE:` en el output: los comandos
  // MSF lo emiten explícitamente y el dispatcher lo aplica al estado global.
  msfStateUpdate?: import('./frameworks/metasploit/core/msfTypes').MsfState | null;
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

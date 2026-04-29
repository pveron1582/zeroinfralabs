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

export interface FileEntry {
  path: string;
  content: string;
  type: string;
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
}

// ── Mission Validation Criteria ───────────────────────────────────
// Defines what command result validates each mission
export type MissionCriteriaType =
  | 'discoveredHosts'      // arp-scan found hosts
  | 'scanResults'          // nmap scanned ports
  | 'foundCredentials'     // hydra found creds
  | 'foundDirectories'     // gobuster found dirs
  | 'fileRead'             // cat read a file
  | 'privesc'              // sudo escalation
  | 'sshLogin'             // successful ssh
  | 'ftpLogin'             // successful ftp
  | 'vulnerabilityFound'   // msf vulnerability check
  | 'exploit'              // msf exploit ran
  | 'uidChecked'           // meterpreter getuid
  | 'ncListener'           // netcat listener started
  | 'blockingCommand'      // listener/payload active
  | 'custom';              // special cases

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
  directories?: string[];         // Directories that must be found
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

export interface CommandResponse {
  output: string;
  isError?: boolean;
  newMachineId?: string;
  blockingCommand?: BlockingCommand;
  ftpSession?: {
    active: boolean;
    connected?: boolean;
    targetIp?: string;
    targetId?: string;
    username?: string;
    loggedIn?: boolean;
    currentDir?: string;
    step?: 'connecting' | 'username' | 'password' | 'connected';
  };
  downloadedFile?: FileEntry;
  foundCredentials?: {
    machineId: string;
    user: string;
    pass: string;
    file: string;
    service?: string; // 'ssh', 'wp-admin', 'ftp', etc.
    verified?: boolean; // true if credentials have been verified (e.g., successful SSH login)
  };
  sudoPrivileges?: {
    machineId: string;
    user: string;
    commands: string[];
    canSudo: boolean;
  };
  failedUser?: {
    machineId: string;
    user: string;
  };
  foundVulnerability?: {
    machineId: string;
    vulnId: string;
    status: 'detected' | 'confirmed';
  };
  privescCompleted?: string; // machineId that was privesc'd
  privescAttempted?: boolean; // privesc command was executed (lab validates if it completes mission)
  privescTool?: string; // tool used for privesc (vim, su, bash, etc.)
  privescViaSudo?: boolean; // privesc was attempted via sudo
  // File reading metadata (for lab validation)
  fileRead?: {
    path: string;
    isNote: boolean;
    isFlag: boolean;
    isPayload: boolean;
    content: string;
  };
  mentionedUsers?: { machineId: string; users: string[] }; // users discovered from file content
  // Network discovery (for lab validation)
  discoveredHosts?: Array<{ip: string; mac: string; hostname: string}>;
  networkScanned?: string;
  // Meterpreter session info (for lab validation)
  uidChecked?: boolean; // getuid was executed
  currentUser?: string; // current user in meterpreter session
  isSystem?: boolean; // user is SYSTEM/root
  sshLoginUser?: string; // username used for SSH login
  // Nmap scan results (for lab validation)
  scanResults?: {
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
  };
  streamingLineDelays?: number[]; // ms delay before each line (for realistic streaming)
  discoveredPorts?: string; // machineId whose ports were discovered - triggers network map pulse
  sshSessionClosed?: boolean; // SSH session was closed (reset dir to /root/)
  createdFiles?: FileEntry[]; // files created by command (e.g. nmap -oN)
  // Gobuster directory enumeration results (for lab validation)
  foundDirectories?: {
    targetId: string;
    targetUrl: string;
    directories: Array<{path: string; status: number; size?: number}>;
  };
  possibleUsers?: { machineId: string; users: string[] }; // users discovered from notes/files
  // SSH session state (returned by ssh command)
  sshSession?: {
    active: boolean;
    connected?: boolean;
    targetIp?: string;
    targetId?: string;
    username?: string;
    authenticated?: boolean;
    step?: 'connecting' | 'password' | 'connected';
  };
}

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
}

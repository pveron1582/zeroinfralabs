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
  connected?: boolean;
}

export interface CommandResponse {
  output: string;
  isError?: boolean;
  completedMissionId?: number;
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
}

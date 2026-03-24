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
  vulnerabilities?: { id: string; name?: string; module_aux?: string; module_exploit?: string }[];
  found_credentials?: {
    file: string;
    user: string;
    pass: string;
    verified: boolean;
  };
}

export interface Mission {
  id: number;
  title: string;
  description: string;
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

export interface CommandResponse {
  output: string;
  isError?: boolean;
  completedMissionId?: number;
  newMachineId?: string;
  blockingCommand?: {
    message: string;  // Mensaje de estado (ej: "Escuchando en puerto 4444...")
    cancelKey: string; // Tecla para cancelar (ej: 'c')
    listeningPort?: number; // Puerto en el que nc está escuchando (para validar payload)
  };
  foundCredentials?: {
    machineId: string;
    user: string;
    pass: string;
    file: string;
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
}

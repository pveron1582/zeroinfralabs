// ── types/machine.ts ──────────────────────────────────────────────
// Tipos de máquina objetivo, usuarios y filesystem virtual

import type { LearningStep } from './mission';

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
  /** Flags del escenario declaradas en la máquina (si existen). Las usa el motor
   *  HTTP sintético (UNION-based SQLi) para incluir la flag en el volcado y emitir
   *  metadata `fileRead` cuando la respuesta la contiene. */
  flags?: { user?: string; root?: string };
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

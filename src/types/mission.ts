// ── types/mission.ts ──────────────────────────────────────────────
// Misiones, pasos de aprendizaje, criterios de validación y escenarios

import type { Machine } from './machine';

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
  | 'browserAction'        // navegación web (validada por FakeBrowser, no por labValidator)
  | 'httpRequest';         // transacción HTTP capturada (Burp Suite / motor HTTP)

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
